(function(){

    GeckoJS.Controller.extend( {
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
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {input0:null, require0:true};

            window.openDialog(aURL, _('Add New ACL Group'), features, _('New ACL Group'), '', _('Group Name'), '', inputObj);
            if (inputObj.ok && inputObj.input0) {

                // check for duplicate group name
                var group = inputObj.input0;
                var groups = this.Acl.getGroupList('name="' + group +'"') || [];
                if (groups.length > 0) {
                    OsdUtils.warn(_('ACL Group [%S] already exists; ACL group not added.', [group]));
                }
                else {
                    try {
                        this.Acl.addGroup(group);
                        this.load(group);

                        // @todo OSD
                        OsdUtils.info(_('ACL Group [%S] added successfully', [group]));
                    }
                    catch (e) {
                        // @todo OSD
                        OsdUtils.error(_('An error occurred while adding ACL Group [%S]; the ACL group may not have been added successfully', [group]));
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
                alert(_('The ACL group [%S] has been assigned to one or more users [%S] and cannot be removed.', userlist));
            } else if (GREUtils.Dialog.confirm(null, _('confirm delete %S', [group]), _('Are you sure?'))) {

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

                    // @todo OSD.text to be replaced by OSD.info
                    OsdUtils.info(_('ACL Group [%S] removed successfully', [group]));
                }
                catch (e) {
                    // @todo OSD
                    OsdUtils.error(_('An error occurred while removing ACL Group [%S]; the ACL group may not have been removed successfully', [group]));
                }
            }
        },
        
        modify: function () {

            var self = this;
            var group = $('#aclgroup_name').val();

            try {
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

                // @todo OSD.text to be replaced by OSD.info
                OsdUtils.info(_('ACL Group [%S] modified successfully', [group]));
            }
            catch (e) {
                // @todo OSD
                OsdUtils.error(_('An error occurred while modifying ACL Group [%S]; the ACL group may not have been modified successfully', [group]));
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
/*
            this.Acl.addRole('acl_user_override_default_price_level');
            this.Acl.addRole('acl_change_price_level');
            this.Acl.addRole('acl_set_price_level_1');
            this.Acl.addRole('acl_set_price_level_2');
            this.Acl.addRole('acl_set_price_level_3');
            this.Acl.addRole('acl_set_price_level_4');
            this.Acl.addRole('acl_set_price_level_5');
            this.Acl.addRole('acl_set_price_level_6');
            this.Acl.addRole('acl_set_price_level_7');
            this.Acl.addRole('acl_set_price_level_8');
            this.Acl.addRole('acl_set_price_level_9');
            this.Acl.addRole('acl_revert_price_level');
            this.Acl.addRole('acl_override_halo');
            this.Acl.addRole('acl_override_lalo');
            this.Acl.addRole('acl_queue_order');
            this.Acl.addRole('acl_pull_queue');
            this.Acl.addRole('acl_open_control_panel');
            this.Acl.addRole('acl_modify_cart_item');
            this.Acl.addRole('acl_void_cart_item');
            this.Acl.addRole('acl_cancel_order');
            this.Acl.addRole('acl_plu_search');
            this.Acl.addRole('acl_open_cash');
            this.Acl.addRole('acl_toggle_numpad');
            this.Acl.addRole('acl_public_access');
            this.Acl.addRole('acl_manage_condiments');
            this.Acl.addRole('acl_manage_currency');
            this.Acl.addRole('acl_manage_departments');
            this.Acl.addRole('acl_manage_employees');
            this.Acl.addRole('acl_manage_function_panel');
            this.Acl.addRole('acl_shift_item_tax');
            this.Acl.addRole('acl_register_discount');
            this.Acl.addRole('acl_register_reduction');
            this.Acl.addRole('acl_register_surcharge');
            this.Acl.addRole('acl_register_addition');
            this.Acl.addRole('acl_send_keypress');
            this.Acl.addRole('acl_register_quantity');
            this.Acl.addRole('acl_register_enter');
            this.Acl.addRole('acl_register_sub_total');
            this.Acl.addRole('acl_register_tray_marker');
            this.Acl.addRole('acl_register_housebon');
            this.Acl.addRole('acl_register_currency_exchange');
            this.Acl.addRole('acl_manage_jobs');
            this.Acl.addRole('acl_manage_plu_groups');
            this.Acl.addRole('acl_manage_price_level_schedule');
            this.Acl.addRole('acl_manage_acl_roles');
            this.Acl.addRole('acl_register_plus');
            this.Acl.addRole('acl_manage_stock');
            this.Acl.addRole('acl_manage_system_options');
            this.Acl.addRole('acl_manage_taxes');
            this.Acl.addRole('acl_manage_products');
*/
        },
	
        select: function() {
		
            var listObj = this.getListObj();
            var roleListObj = this.getRoleListObj();
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
            this.validateForm();
        },

        validateForm: function() {
            var listObj = this.getListObj();
            var modifyBtn = document.getElementById('modify_acl_group');
            var deleteBtn = document.getElementById('delete_acl_group');

            if (listObj.selectedIndex == -1) {
                modifyBtn.setAttribute('disabled', true);
                deleteBtn.setAttribute('disabled', true);
            }
            else {
                var group = $('#aclgroup_name').val();

                modifyBtn.setAttribute('disabled', group == '#admin');
                deleteBtn.setAttribute('disabled', group == '#admin');
            }
        }
	
    });

})();

