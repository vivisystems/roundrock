(function(){

    /**
     * Class ViviPOS.UsersController
     */
    // GeckoJS.define('ViviPOS.UsersController');

    GeckoJS.Controller.extend( {
        name: 'Users',
        scaffold: true,
	
        _listObj: null,
        _listDatas: null,
        _listGroups: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = this.query("#simpleListBoxUser")[0];
            }
            return this._listObj;
        },

        beforeScaffold: function(evt) {
            if (evt.data == 'delete') {
                if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?") == false) {
                    evt.preventDefault();
                }
            }
        },

        afterScaffoldSave: function(evt) {
            // maintain Acl...
            this.Acl.addUser(evt.data.username, evt.data.password, evt.data.username);
            this.Acl.changeUserPassword(evt.data.username, evt.data.password);
            this.Acl.addUserToGroup(evt.data.username, evt.data.group);
            this.load(evt.data);
        },
        /*
        beforeScaffoldDelete: function(evt) {
            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?") == false) {
                evt.preventDefault();
            }
        },
        */
        afterScaffoldDelete: function() {
            this.load();
        },

        beforeScaffoldAdd: function (evt) {
            var user = evt.data;
            if ((user.no == '') || (user.name == '')){
                alert('user no or user name is empty...');
                evt.preventDefault();
                return ;
            }
            var userModel = new ViviPOS.UserModel();

            var user_no = userModel.findByIndex('all', {
                index: "no",
                value: user.no
            });
            var user_name = userModel.findByIndex('all', {
                index: "name",
                value: user.name
            });

            if (user_no != null) {
                alert('Duplicate user no...' + user.no);
                evt.preventDefault();
            } else if (user_name != null) {
                alert('Duplicate user name...' + user.name);
                evt.preventDefault();
            }
            if (user.defaultuser) {
                this.clearDefaultUser();
            }
        },

        beforeScaffoldEdit: function (evt) {
            var user = evt.data;
            
            if ((user.no == '') || (user.name == '')){
                alert('user no or user name is empty...');
                evt.preventDefault();
                return ;
            }
            var userModel = new ViviPOS.UserModel();

            var user_no = userModel.findByIndex('all', {
                index: "no",
                value: user.no
            });
            var user_name = userModel.findByIndex('all', {
                index: "name",
                value: user.name
            });
            if ((user_no != null) && (user_no[0].id != this.Scaffold.currentData.id)) {
                alert('Duplicate user no...' + user.no);
                evt.preventDefault();
            } else if ((user_name != null) && (user_name[0].id != this.Scaffold.currentData.id)) {
                alert('Duplicate user name...' + user.name);
                evt.preventDefault();
            }

            if (user.defaultuser) {
                this.clearDefaultUser();
            }
        },
        
        load: function (data) {
		
            // var listObj = this.getListObj();
            this.getListObj();
            var userModel = new ViviPOS.UserModel();
            var users = userModel.find('all', {
                order: "no"
            });
            
            this._listDatas = users;
            this._listObj.loadData(users);

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
            this._listObj.selectedIndex = j;
            this._listObj.ensureIndexIsVisible(j);
        },

        select: function(){
		
            this.getListObj();
            selectedIndex = this._listObj.selectedIndex;
            if (selectedIndex >= 0) {
                var user = this._listDatas[selectedIndex];
                this.requestCommand('view', user.id);
            }

        },

        clearDefaultUser: function() {
            var userModel = new ViviPOS.UserModel();
            var users = userModel.findByIndex('all', {
                index: "defaultuser",
                value: 'true'
            });
            if (users && users.length > 0) {
                users.forEach(function(user) {
                    user.defaultuser = 'false';
                    user.defaultuser_checked = '';
                    userModel.id = user.id;
                    userModel.save(user);
                });
            }
        },
        
        setDefaultUser: function(state) {
            var label = document.getElementById('user_defaultuser_label');
            var checked = document.getElementById('user_defaultuser_checked');
            
            if (state) {
                checked.value = '***';
                label.value = 'true';
            }
            else {
                checked.value = '';
                label.value = 'false';
            }
        }
    });


})();

