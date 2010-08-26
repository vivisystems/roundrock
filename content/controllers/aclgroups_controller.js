(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }
    
    var __controller__ = {
        
        name: 'AclGroups',
	
        _listObj: null,
        _rolelistObj: null,
        _roles: null,
        _selectedIndex: -1,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('aclgroupscrollablepanel');
            }
            return this._listObj;
        },

        getRoleListObj: function() {
            if(this._rolelistObj == null) {
                this._rolelistObj = document.getElementById("rolelistscrollablepanel");
            }
            return this._rolelistObj;
        },
		
	
        getInputData: function () {
	
            return GeckoJS.FormHelper.serializeToObject('aclgroupForm');
        
        },

        setInputData: function (valObj) {
            var selroles = this.Acl.getRoleListInGroup(valObj.name);
            var selrolesarray = GeckoJS.Array.objectExtract(selroles, '{n}.name');
            var selrolesstr = selrolesarray.sort(function(a,b) {if (a < b) return -1; if (a > b) return 1; return 0}).join(",");

            valObj.role_group = selrolesstr;

            GeckoJS.FormHelper.unserializeFromObject('aclgroupForm', valObj);
        },
 
        add: function () {

            if (!this.confirmChangeAclGroup()) {
                return;
            }

            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300";
            var inputObj = {input0:null, require0:true};

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New ACL Group'), features,
                                       _('New ACL Group'), '', _('Group Name'), '', inputObj);
            if (inputObj.ok && inputObj.input0) {

                // check for duplicate group name
                var group = inputObj.input0;
                var groups = this.Acl.getGroupList('name="' + group +'"') || [];
                if (groups.length > 0) {
                    NotifyUtils.warn(_('ACL Group [%S] already exists; ACL group not added.', [group]));
                }
                else {
                    if (this.Acl.addGroup(group)) {
                        this._selectedIndex = -1;
                        this.load(group);

                        OsdUtils.info(_('ACL Group [%S] added successfully', [group]));
                    }
                    else {
                        NotifyUtils.error(_('An error occurred while adding ACL Group [%S]; the ACL group may not have been added successfully', [group]));
                    }
                }
            }
        },

        remove: function() {
            var group = $('#aclgroup_name').val();
            if (!group && group.length <= 0) return;

            var users = this.Acl.getUserListInGroup(group);
            
            if (users && users.length > 0) {
                var userlist = GeckoJS.Array.objectExtract(users, '{n}.description').join(", ");
                userlist = [group].concat(userlist);
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Remove User'),
                                      _('The ACL group [%S] has been assigned to one or more users [%S] and cannot be removed.', userlist));
            } else if (GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete %S', [group]), _('Are you sure?'))) {

                if (this.Acl.removeGroup(group)) {

                    var listObj = this.getListObj();
                    var view = listObj.datasource;
                    var index = listObj.selectedIndex;
                    var groups = this.Acl.getGroupList();

                    view.data = new GeckoJS.ArrayQuery(groups).orderBy('name asc');
                    if (index > groups.length - 1) index = groups.length - 1;
                    listObj.selectedItems = [index];
                    listObj.selectedIndex = index;

                    this._selectedIndex = -1;
                    this.select();

                    OsdUtils.info(_('ACL Group [%S] removed successfully', [group]));
                }
                else {
                    NotifyUtils.error(_('An error occurred while removing ACL Group [%S]; the ACL group may not have been removed successfully', [group]));
                }
            }
        },
        
        modify: function () {

            var self = this;
            var group = $('#aclgroup_name').val();
            var ds = GeckoJS.ConnectionManager.getDataSource('acl');

            try {

                var r = ds.begin();
                if(!r) throw new Exception('database is locked');

                // first remove roles
                var roles = this.Acl.getRoleListInGroup(group);
                roles.forEach(function(o) {
                    self.Acl.removeRoleFromGroup(group, o);
                });
                
                // next add roles
                var selectedItems = this.getRoleListObj().selectedItems;
                roles = this.getRoleListObj().datasource.data;
                selectedItems.forEach(function(idx){
                    self.Acl.addRoleToGroup(group, roles[idx].name);
                });

                r = ds.commit();
                if(!r) throw new Exception('database is locked');

                this._selectedIndex = -1;
                this.select();
                
                OsdUtils.info(_('ACL Group [%S] modified successfully', [group]));
            }
            catch (e) {
                ds.rollback();
                NotifyUtils.error(_('An error occurred while modifying ACL Group [%S]; the ACL group may not have been modified successfully', [group]));
            }
        },

        createRoleList: function () {

            var roleNames = this.Acl.getRoleList();
            var roles = [];
            if (roleNames) {
                roles = roleNames.map(function(roleName) {
                    var role = {};
                    role.name = roleName;
                    role.description = _(roleName);
                    return role;
                });
                roles = roles.sort(function(r1, r2) {
                    if (r1.description > r2.description) return 1;
                    else if (r1.description < r2.description) return -1;
                    else return 0;
                });
            }
            var panelView =  new NSIRolesView(roles);
            this.getRoleListObj().datasource = panelView;

            this.roles = roles;
        },
        
        load: function (data) {
            var listObj = this.getListObj();
            var groups = new GeckoJS.ArrayQuery(this.Acl.getGroupList()).orderBy('name asc');
            var panelView = this.getListObj().datasource;

            if (panelView) {
                panelView =  new NSIRoleGroupsView(groups);
                this.getListObj().datasource = panelView;
            }

            if (data) {
                listObj.value = data;
            } else {
                listObj.selectedItems = [];
                listObj.selectedIndex = -1;
            };
            this.select();
        },
	
        select: function() {
		
            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;

            if (selectedIndex == this._selectedIndex && this._selectedIndex != -1) return;
            
            if (!this.confirmChangeAclGroup(selectedIndex)) {
                listObj.selectedItems = [this._selectedIndex];
                return;
            }

            if (selectedIndex > -1) {
                var rolegroup = listObj.datasource.data[selectedIndex];
                var panelView =  new NSIRolesView(this.roles);
                this.getRoleListObj().datasource = panelView;
                this.setInputData(rolegroup);
            }
            else {
                GeckoJS.FormHelper.reset('aclgroupForm');
            }
            listObj.ensureIndexIsVisible(selectedIndex);

            this._selectedIndex = selectedIndex;
            
            this.validateForm();
        },

        exit: function() {
            // check if ACL group form has been modified
            if (this._selectedIndex != -1 && GeckoJS.FormHelper.isFormModified('aclgroupForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),
                                               _('You have made changes to the current access group. Save changes before exiting?'),
                                               flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    this.modify();
                }
            }
            window.close();
        },

        confirmChangeAclGroup: function(index) {
            // check if ACL group form has been modified
            if (this._selectedIndex != -1 && (index == null || (index != -1 && index != this._selectedIndex))
                && GeckoJS.FormHelper.isFormModified('aclgroupForm')) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                             _('Discard Changes'),
                                             _('You have made changes to the current access group. Are you sure you want to discard the changes?'))) {
                    return false;
                }
            }
            return true;
        },

        validateForm: function() {
            var listObj = this.getListObj();
            var modifyBtn = document.getElementById('modify_acl_group');
            var deleteBtn = document.getElementById('delete_acl_group');
            var selectAllBtn = document.getElementById('select_all');
            var deselectAllBtn = document.getElementById('deselect_all');
            
            var btnpanel = this.getRoleListObj().vivibuttonpanel;
            if (listObj.selectedIndex == -1) {
                modifyBtn.setAttribute('disabled', true);
                deleteBtn.setAttribute('disabled', true);
                selectAllBtn.setAttribute('disabled', true);
                deselectAllBtn.setAttribute('disabled', true);
                btnpanel.seltype = 'none';
            }
            else {
                var group = $('#aclgroup_name').val();

                modifyBtn.setAttribute('disabled', group == 'admin');
                deleteBtn.setAttribute('disabled', group == 'admin');
                selectAllBtn.setAttribute('disabled', false);
                deselectAllBtn.setAttribute('disabled', false);
                btnpanel.seltype = 'multiple';
            }
        }
	
    };

    AppController.extend(__controller__);

})();

