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

            if (users) {
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

            var index = 0;
            if (data) {
                listObj.value = data;            
            } else if (groups) {
                listObj.selectedItems = [0];
                listObj.selectedIndex = 0;
            };
            this.select();


        },
	
        select: function(){
		
            var listObj = this.getListObj();
            selectedIndex = listObj.selectedIndex;
            var rolegroup = this._listDatas[selectedIndex];
            this.setInputData(rolegroup);

        }
	
    });

})();

