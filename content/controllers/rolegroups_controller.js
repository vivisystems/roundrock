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
        
        delete: function (evt) {
            alert('delete');
        },
        
        update: function (evt) {

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
            var roles = this.Acl.getRoleList();
<<<<<<< HEAD:content/controllers/rolegroups_controller.js
            if (rolelist && roles && roles.length > 0) {
                roles.forEach(function(o) {
                    var checkbox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:checkbox");
                    checkbox.setAttribute('label', o.description);
                    checkbox.setAttribute('id', 'role_' + o.name);
                    rolelist.appendChild(checkbox);
                });
            }
        },
        
        resetRoleList: function (rolegroup) {

            // var rolelist = document.getElementById("rolescrollablepanel");
            var self = this;
            var roles = this.Acl.getRoleList();
            roles.forEach(function(o) {
                $('#role_' + o.name)[0].checked = false;
            });
                  
            roles = this.Acl.getRoleListInGroup(rolegroup.name);
            roles.forEach(function(o) {
                // self.log(rolegroup.name + ':' + o.name);
                $('#role_' + o.name)[0].checked = true;
            });
=======
            var panelView =  new NSIRolesView(roles);
            this.getRoleListObj().datasource = panelView;
            
>>>>>>> df7d674fc25754880fffb17bb5d44819a81a6176:content/controllers/rolegroups_controller.js
        },
        
        load: function (data) {
            var listObj = this.getListObj();
            var groups = this.Acl.getGroupList();

            // var panelView =  new GeckoJS.NSITreeViewArray(groups);
            var panelView =  new NSIRoleGroupsView(groups);
            this.getListObj().datasource = panelView;

            this._listDatas = groups;

<<<<<<< HEAD:content/controllers/rolegroups_controller.js
            GeckoJS.FormHelper.clearItems($('#user_grouplist')[0]);
            /* TODO: restore to FormHelper once Array bug is fixed
            GeckoJS.FormHelper.appendItems($('#user_grouplist')[0], groups, function(){
                return {
                    // label: this.name + " - " + this.description,
                    label: this.description,
                    value: this.name
                };
            });
            */
           var groupListObj = document.getElementById('user_grouplist');
           if (groupListObj) {
               groupListObj.removeAllItems();
               if (groups) {
                   groups.forEach(function(group) {
                       groupListObj.insertItemAt(groupListObj.itemCount, group.description, group.name);
                   })
               }
           }
            var i = 0;
            var j = 0;
=======
            var index = 0;
>>>>>>> df7d674fc25754880fffb17bb5d44819a81a6176:content/controllers/rolegroups_controller.js
            if (data) {
<<<<<<< HEAD:content/controllers/rolegroups_controller.js
                if ((typeof data) == 'object' ) {
                    users.forEach(function(o) {
                        if (o.no == data.no) {
                            j = i;
                        }
                        i++;
                    });
                }
            }
            if (this._listObj) {
                listObj.selectedIndex = j;
                listObj.ensureIndexIsVisible(j);
            }
=======
                listObj.value = data;            
            } else if (groups) {
                listObj.selectedItems = [0];
                listObj.selectedIndex = 0;
            };
            this.select();


>>>>>>> df7d674fc25754880fffb17bb5d44819a81a6176:content/controllers/rolegroups_controller.js
        },
	
        select: function(){
		
            var listObj = this.getListObj();
            selectedIndex = listObj.selectedIndex;
            var rolegroup = this._listDatas[selectedIndex];
            this.setInputData(rolegroup);

        }
	
    });

})();

