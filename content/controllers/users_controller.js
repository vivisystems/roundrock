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

            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {input0:null, input1:null};
            window.openDialog(aURL, "prompt_additem", features, "New Job", "Please input:", "No", "Name", inputObj);
            if (inputObj.ok && inputObj.input0) {
                $("#job_id").val('');
                evt.data.jobname = inputObj.input0;
            } else {
                evt.preventDefault();
            }

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
            
            alert(GeckoJS.BaseObject.dump(user));
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
            alert(GeckoJS.BaseObject.dump(user));

        },

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

            var index = 0;
            if (data) {
                listObj.selectedItems = [data];
            } else {
                listObj.selectedItems = [0];
                listObj.selectedIndex = 0;
            };
        },

        select: function(){
		
            this.getListObj();
            selectedIndex = this._listObj.selectedIndex;
            if (selectedIndex >= 0) {
                GeckoJS.FormHelper.reset('taxForm');
                var user = this._listDatas[selectedIndex];
                this.requestCommand('view', user.id);
            }

        }
        	
    });


})();

