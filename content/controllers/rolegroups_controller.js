(function(){

    GeckoJS.Controller.extend( {
        name: 'RoleGroups',
	
        _listObj: null,
        _listDatas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = this.query("#simpleListBoxRoleGroups")[0];
            }
            return this._listObj;
        },
		
	
        getInputData: function () {
	
            return GeckoJS.FormHelper.serializeToObject('rolegroupForm');
        
        },

        resetInputData: function () {
            var varObj = {
                name:''
            };
            GeckoJS.FormHelper.unserializeFromObject('rolegroupForm', varObj);
        },

        setInputData: function (valObj) {
            GeckoJS.FormHelper.unserializeFromObject('rolegroupForm', valObj);
        },
 
        add: function (evt) {
            var self = this;
            var group = $('#rolegroup_name').val();
            this.Acl.addGroup(group);
            this.load();
        },
        
        delete: function (evt) {
            alert('delete');
        },
        
        update: function (evt) {
            // alert('update');
            var self = this;
            var group = $('#rolegroup_name').val();
            var roles = this.Acl.getRoleListInGroup(group);
            roles.forEach(function(o) {
                self.Acl.removeRoleFromGroup(group, o.name);
            });
            
            roles = this.Acl.getRoleList();
            roles.forEach(function(o) {
                if ($('#role_' + o.name)[0].checked) {
                    self.Acl.addRoleToGroup(group, o.name);
                }
            });
        },

        createRoleList: function () {

            var rolelist = document.getElementById("rolescrollablepanel");
            var self = this;
            var roles = this.Acl.getRoleList();
            roles.forEach(function(o) {
                var checkbox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:checkbox");
                checkbox.setAttribute('label', o.description);
                checkbox.setAttribute('id', 'role_' + o.name);
                rolelist.appendChild(checkbox);
            });
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
        },
        
        load: function (data) {
            var listObj = this.getListObj();
            var groups = this.Acl.getGroupList();
            this._listObj.loadData(groups);
            this._listDatas = groups;
/*
            GeckoJS.FormHelper.clearItems($('#user_grouplist')[0]);
            GeckoJS.FormHelper.appendItems($('#user_grouplist')[0], groups, function(){
                return {
                    // label: this.name + " - " + this.description,
                    label: this.description,
                    value: this.name
                };
            });
*/
            var i = 0;
            var j = 0;
            if (data) {
                if ((typeof data) == 'object' ) {
                    users.forEach(function(o) {
                        if (o.no == data.no) {
                            j = i;
                        }
                        i++;
                    });
                }
            }
            listObj.selectedIndex = j;
            listObj.ensureIndexIsVisible(j);
        },
	
        select: function(){
		
            var listObj = this.getListObj();
            selectedIndex = listObj.selectedIndex;
            var rolegroup = this._listDatas[selectedIndex];
            this.setInputData(rolegroup);

            this.resetRoleList(rolegroup);

        }
	
    });

})();

