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
        _selectedIndex: null,

        getListObj: function() {
            if(this._listObj == null) {
                // this._listObj = this.query("#userscrollablepanel")[0];
                this._listObj = document.getElementById('userscrollablepanel');
            }
            return this._listObj;
        },
        /*
        beforeScaffold: function(evt) {
            
        },
        */
       
        afterScaffoldSave: function(evt) {
            // maintain Acl...
            this.Acl.addUser(evt.data.username, evt.data.password, evt.data.username);
            this.Acl.changeUserPassword(evt.data.username, evt.data.password);
            this.Acl.addUserToGroup(evt.data.username, evt.data.group);

// this.log("evt.data:" + this.dump(evt.data));
            this.load(evt.data);

            // this.load(this.getListObj().selectedIndex);
            
        },

        beforeScaffoldDelete: function(evt) {
            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?") == false) {
                evt.preventDefault();
            }
        },

        afterScaffoldDelete: function() {
            this.load();
        },

        beforeScaffoldAdd: function (evt) {
            var user = evt.data;

            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {input0:null, input1:null};
            window.openDialog(aURL, "prompt_additem", features, "New User", "Please input:", "User Name", "", inputObj);
            if (inputObj.ok && inputObj.input0) {
                user.username = inputObj.input0;
            } else {
                evt.preventDefault();
                return ;
            }

            var userModel = new ViviPOS.UserModel();

            var user_name = userModel.findByIndex('all', {
                index: "username",
                value: user.username
            });

            if (user_name != null) {
                alert('Duplicate user name...' + user.username);
                evt.preventDefault();
                return ;
            }

            $("#user_id").val('');
            $("#user_password").val('');
            $("#user_group").val('');
            $("#user_group").val('');

            
        },
        /*
        beforeScaffoldEdit: function (evt) {

        },
        */
        afterScaffoldIndex: function(evt) {
            this._listDatas = evt.data;
            var panelView =  new GeckoJS.NSITreeViewArray(evt.data);
            this.getListObj().datasource = panelView;
        },

        getRoleGroup: function () {
            var rolegroup = $("#user_group").val();
            var aURL = "chrome://viviecr/content/select_rolegroup.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=800,height=600";
            var inputObj = {
                rolegroup: rolegroup
            };
            window.openDialog(aURL, "select_rolegroup", features, inputObj);

            if (inputObj.ok && inputObj.rolegroup) {
                $("#user_group").val(inputObj.rolegroup);

            }
        },
        
        load: function (data) {
		
            var listObj = this.getListObj();
            this.requestCommand('list');

            var index = this._selectedIndex;

            if (data) {
                this.requestCommand('view', data.id);
                listObj.selectedItems = [index];
                listObj.selectedIndex = index;
            } else {
                listObj.selectedItems = [0];
                listObj.selectedIndex = 0;
            };

            
        },

        select: function(){
		
            this.getListObj();
            this._selectedIndex = this._listObj.selectedIndex;

            if (this._selectedIndex >= 0) {
                GeckoJS.FormHelper.reset('userForm');
                var user = this._listDatas[this._selectedIndex];
                this.requestCommand('view', user.id);
            }

        },
        
        setDefaultUser: function() {
            this._selectedIndex = this._listObj.selectedIndex;
            if (this._selectedIndex >= 0) {
                var user = this._listDatas[this._selectedIndex];
                if (user) {
                    GeckoJS.Configure.write('vivipos.fec.settings.DefaultUser', user.id);
                }
            }
        },
        
        initUser: function(userid) {
            
            var listObj = this.getListObj();
            var users = this._listDatas;

            if (users) {
                for (var i = 0; i < users.length; i++) {
                    if (users[i].id == userid) {
                        listObj.selectedItems = [i];
                        listObj.selectedIndex = i;
                        break;
                    }
                }
            }
        }
    });


})();

