(function(){

    var __controller__ = {
        
        name: 'AclGroups',
	
        _listObj: null,
        _rolelistObj: null,
        _roles: null,

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
            var selrolesstr = selrolesarray.join(",");

            valObj.role_group = selrolesstr;

            GeckoJS.FormHelper.unserializeFromObject('aclgroupForm', valObj);
        },
 
        add: function () {

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
                    try {
                        this.Acl.addGroup(group);
                        this.load(group);

                        OsdUtils.info(_('ACL Group [%S] added successfully', [group]));
                    }
                    catch (e) {
                        NotifyUtils.error(_('An error occurred while adding ACL Group [%S]; the ACL group may not have been added successfully', [group]));
                    }
                }
            }
        },

        remove: function(evt) {
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

                try {
                    this.Acl.removeGroup(group);

                    var listObj = this.getListObj();
                    var view = listObj.datasource;
                    var index = listObj.selectedIndex;
                    var groups = this.Acl.getGroupList();

                    view.data = new GeckoJS.ArrayQuery(groups).orderBy('name asc');
                    if (index > groups.length - 1) index = groups.length - 1;
                    listObj.selectedItems = [index];
                    listObj.selectedIndex = index;

                    this.select();

                    OsdUtils.info(_('ACL Group [%S] removed successfully', [group]));
                }
                catch (e) {
                    NotifyUtils.error(_('An error occurred while removing ACL Group [%S]; the ACL group may not have been removed successfully', [group]));
                }
            }
        },
        
        modify: function () {

            var self = this;
            var group = $('#aclgroup_name').val();

            try {

                var ds = GeckoJS.ConnectionManager.getDataSource('acl');
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

                this.select();
                
                OsdUtils.info(_('ACL Group [%S] modified successfully', [group]));
            }
            catch (e) {
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
            
            this.validateForm();
        },

        validateForm: function() {
            var listObj = this.getListObj();
            var modifyBtn = document.getElementById('modify_acl_group');
            var deleteBtn = document.getElementById('delete_acl_group');

            var btnpanel = this.getRoleListObj().vivibuttonpanel;
            if (listObj.selectedIndex == -1) {
                modifyBtn.setAttribute('disabled', true);
                deleteBtn.setAttribute('disabled', true);
                btnpanel.seltype = 'none';
            }
            else {
                var group = $('#aclgroup_name').val();

                modifyBtn.setAttribute('disabled', group == 'admin');
                deleteBtn.setAttribute('disabled', group == 'admin');
                btnpanel.seltype = 'multiple';
            }
        }
	
    };

    GeckoJS.Controller.extend(__controller__);

})();

