(function(){

    GeckoJS.Controller.extend( {
        name: 'RoleGroups',
	
        _listObj: null,
        _listDatas: null,
        _rolelistObj: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('rolegroupscrollablepanel');
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
	
            return GeckoJS.FormHelper.serializeToObject('rolegroupForm');
        
        },

        setInputData: function (valObj) {
            var roles = this.Acl.getRoleList();
            var selroles = this.Acl.getRoleListInGroup(valObj.name);
            var selrolesarray = GeckoJS.Array.objectExtract(selroles, '{n}.name');
            var selrolesstr = selrolesarray.join(",");

            valObj.role_group = selrolesstr;

            GeckoJS.FormHelper.unserializeFromObject('rolegroupForm', valObj);
        },
 
        add: function (evt) {

            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {input0:null, input1:null};
            window.openDialog(aURL, "prompt_additem", features, "New Group", "Please input:", "Name:", "", inputObj);
            if (inputObj.ok && inputObj.input0) {
                var group = inputObj.input0;
                this.Acl.addGroup(group);
                this.load(group);
            }
        },

        remove: function(evt) {
            // @todo
            // must check if the group used by any user...
            var group = $('#rolegroup_name').val();
            if (!group && group.length <= 0) return;

            var userModel = new UserModel();
            var users = userModel.find('all', {
                conditions: "group='" + group + "'"
            });

            if (users && users.length > 0) {
                var userlist = GeckoJS.Array.objectExtract(users, '{n}.username').join("\n");;
                alert("the group:" + group + " is used by some user...\n\n" + userlist + "\n\ncan not be removed.");                
            } else if (GREUtils.Dialog.confirm(null, "confirm delete group:" + group, "Are you sure?")) {
                this.Acl.removeGroup(group);
                this.load();
            }
        },
        
        modify: function (evt) {

            var self = this;
            var group = $('#rolegroup_name').val();
            var roles = this.Acl.getRoleListInGroup(group);
            roles.forEach(function(o) {
                self.Acl.removeRoleFromGroup(group, o.name);
            });

            var selectedItems = this.getRoleListObj().selectedItems;
            roles = this.Acl.getRoleList();
            selectedItems.forEach(function(idx){
                self.Acl.addRoleToGroup(group, roles[idx].name);
            });

        },

        createRoleList: function () {

            var self = this;
/*
            this.Acl.addRole('department_add');
            this.Acl.addRole('department_delete');
            this.Acl.addRole('department_update');
            this.Acl.addRole('plu_add');
            this.Acl.addRole('plu_delete');
            this.Acl.addRole('plu_update');
            this.Acl.addRole('user_add');
            this.Acl.addRole('user_delete');
            this.Acl.addRole('user_update');
*/
            var roles = this.Acl.getRoleList();
            var panelView =  new NSIRolesView(roles);
            this.getRoleListObj().datasource = panelView;
        },
        
        load: function (data) {
            var listObj = this.getListObj();
            var groups = this.Acl.getGroupList();

            // var panelView =  new GeckoJS.NSITreeViewArray(groups);
            var panelView =  new NSIRoleGroupsView(groups);
            this.getListObj().datasource = panelView;

            this._listDatas = groups;

            if (data) {
                listObj.value = data;            
            } else if (groups) {
                listObj.selectedItems = [0];
                listObj.selectedIndex = 0;
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
            this.Acl.addRole('acl_register_clear');
            this.Acl.addRole('acl_register_quantity');
            this.Acl.addRole('acl_register_enter');
            this.Acl.addRole('acl_register_sub_total');
            this.Acl.addRole('acl_register_tray_marker');
            this.Acl.addRole('acl_register_housebon');
            this.Acl.addRole('acl_register_currency_exchange');
            this.Acl.addRole('acl_manage_jobs');
            this.Acl.addRole('acl_manage_plu_groups');
*/
        },
	
        select: function(){
		
            var listObj = this.getListObj();
            selectedIndex = listObj.selectedIndex;
            var rolegroup = this._listDatas[selectedIndex];
            this.setInputData(rolegroup);

        }
	
    });

})();

