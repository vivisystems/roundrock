(function(){

    /**
     * Class ViviPOS.UsersController
     */
    // GeckoJS.define('ViviPOS.UsersController');

    GeckoJS.Controller.extend( {
        name: 'Users',
        scaffold: true,
	
        _listObj: null,
        _selectedIndex: null,

        _userAdded: false,
        _userModified: false,

        getListObj: function() {
            if(this._listObj == null) {
                // this._listObj = this.query('#userscrollablepanel')[0];
                this._listObj = document.getElementById('userscrollablepanel');
            }
            return this._listObj;
        },
        /*
        beforeScaffold: function(evt) {
            
        },
        */
        beforeScaffoldAdd: function (evt) {
            var user = evt.data;
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250';
            var inputObj = {input0:null, require0:true, alphaOnly0: true,
                            input1:null, require1:true, type1:'password'};

            this._userAdded = false;

            window.openDialog(aURL, _('Add New Employee'), features, _('New Employee'), '', _('Name'), _('Password'), inputObj);
            if (inputObj.ok && inputObj.input0 && inputObj.input1) {
                user.username = inputObj.input0;
                user.password = inputObj.input1;
                user.displayname = inputObj.input0;
            } else {
                evt.preventDefault();
                return ;
            }

            // check for duplicate username
            var userModel = new UserModel();

            var user_name = userModel.findByIndex('all', {
                index: 'username',
                value: user.username
            });

            // check for duplicate display name
            var display_name = userModel.findByIndex('all', {
                index: 'displayname',
                value: user.displayname
            });

            if (user_name != null && user_name.length > 0) {
                // @todo OSD
                OsdUtils.warn(_('Duplicate user name [%S]; user not added.', [user.username]));
                evt.preventDefault();
                return ;
            }

            if (display_name != null && display_name.length > 0) {
                // @todo OSD
                OsdUtils.warn(_('Duplicate display name [%S]; user not added.', [user.displayname]));
                evt.preventDefault();
                return ;
            }
            
            var newUser = GeckoJS.FormHelper.serializeToObject('userForm');
            newUser.username = user.username;
            newUser.password = user.password;
            newUser.displayname = user.displayname;
            newUser.id = '';
            GREUtils.extend(evt.data, newUser);

            this._userAdded = true;
        },

        afterScaffoldAdd: function (evt) {
            // if new user exists, set selectedIndex to last item

            if (this._userAdded) {
                var panel = this.getListObj();
                var data = panel.datasource.data;
                var newIndex = data.length;

                this.requestCommand('list', newIndex);

                panel.selectedIndex = newIndex;
                panel.selectedItems = [newIndex];

                this.validateForm(true);

                document.getElementById('display_name').focus();

                // @todo OSD
                OsdUtils.info(_('Employee [%S] added successfully', [evt.data.displayname]));
            }
        },

        beforeScaffoldEdit: function (evt) {
            // check for duplicate display name
            this._userModified = true;
            var userModel = new UserModel();
            var display_name = userModel.findByIndex('all', {
                index: 'displayname',
                value: evt.data.displayname.replace(/^\s*/, '').replace(/\s*$/, '')
            });

            if (display_name != null && display_name.length > 0) {
                if ((display_name.length > 1) || (display_name[0].id != $('#user_id').val())) {
                    evt.preventDefault();
                    this._userModified = false;
                        
                    // @todo OSD
                    OsdUtils.warn(_('Duplicate display name [%S]; user not modified.', [evt.data.displayname]));
                }
            }

        },

        afterScaffoldEdit: function (evt) {

            if (this._userModified) {
                var panel = this.getListObj();
                var index = panel.selectedIndex;

                this.requestCommand('list', index);

                panel.selectedIndex = index;
                panel.selectedItems = [index];

                // @todo OSD
                OsdUtils.info(_('Employee [%S] modified successfully', [evt.data.displayname]));
            }
        },

        beforeScaffoldSave: function(evt) {
            // make sure displayname is not empty
            var displayname = evt.data.displayname.replace(/^\s*/, '').replace(/\s*$/, '');
            if (displayname.length == 0) displayname = evt.data.username;
            evt.data.displayname = displayname;
        },

        afterScaffoldSave: function(evt) {
            // make sure displayname is not empty
            var displayname = evt.data.displayname.replace(/^\s*/, '').replace(/\s*$/, '');
            if (displayname.length == 0) displayname = evt.data.username;

            // maintain Acl...
            this.Acl.addUser(evt.data.username, evt.data.password, displayname);
            this.Acl.changeUserPassword(evt.data.username, evt.data.password);
            this.Acl.addUserToGroup(evt.data.username, evt.data.group);
        },

        beforeScaffoldDelete: function(evt) {
            if (GREUtils.Dialog.confirm(null, _('confirm delete %S', [evt.data.username]), _('Are you sure?')) == false) {
                evt.preventDefault();
            }
        },

        afterScaffoldDelete: function(evt) {
            // maintain ACL...
            this.Acl.removeUser(evt.data.username);
            var panel = this.getListObj();
            var view = panel.datasource;
            var index = panel.selectedIndex;

            if (index >= view.data.length - 1) {
                index = view.data.length - 2;
            }

            this.requestCommand('list', index);
            
            panel.selectedIndex = index;
            panel.selectedItems = [index];

            this.validateForm(true);

            // @todo OSD
            OsdUtils.info(_('Employee [%S] removed successfully', [evt.data.displayname]));
        },

        afterScaffoldIndex: function(evt) {
            var panelView = this.getListObj().datasource;
            if (panelView == null) {
                panelView =  new GeckoJS.NSITreeViewArray(evt.data);
                this.getListObj().datasource = panelView;
            }
            panelView.data = evt.data;

            this.validateForm(true);
        },

        getRoleGroup: function () {
            var screenwidth = GeckoJS.Session.get('screenwidth') || 800;
            var screenheight = GeckoJS.Session.get('screenheight') || 600;
            var rolegroup = $('#user_group').val();
            var aURL = 'chrome://viviecr/content/select_rolegroup.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                rolegroup: rolegroup
            };
            window.openDialog(aURL, _('Select Access Group'), features, inputObj);

            if (inputObj.ok && inputObj.rolegroup) {
                $('#user_group').val(inputObj.rolegroup);
            }
        },
        
        load: function () {

            var panel = this.getListObj();

            this.requestCommand('list', -1);

            panel.selectedItems = [-1];
            panel.selectedIndex = -1;

            GeckoJS.FormHelper.reset('userForm');

            this.validateForm();
        },

        select: function(){
		
            var panel = this.getListObj();
            var index = panel.selectedIndex;

            this.requestCommand('list', index);

        },
        
        setDefaultUser: function() {
            var panel = this.getListObj();
            var view = panel.datasource;

            if (panel) {
                if (panel.selectedIndex >= 0) {
                    var user = view.data[panel.selectedIndex];
                    if (user) {
                        GeckoJS.Configure.write('vivipos.fec.settings.DefaultUser', user.username);
                    }
                }
            }
        },

        // initialize selected user to userid
        initUser: function(username) {
            
            var panel = this.getListObj();
            var users = panel.datasource.data;

            if (users) {
                for (var i = 0; i < users.length; i++) {
                    if (users[i].username == username) {
                        panel.selectedItems = [i];
                        panel.selectedIndex = i;
                        break;
                    }
                }
            }
        },

        validateForm: function(resetTabs) {

            // return if not in form
            var addBtn = document.getElementById('add_user');
            if (addBtn == null) return;
            
            var modBtn = document.getElementById('modify_user');
            var delBtn = document.getElementById('delete_user');
            var roleTextbox = document.getElementById('user_group');

            if (resetTabs) document.getElementById('tabs').selectedIndex = 0;

            if (!(addBtn && modBtn && delBtn)) return;

            var panel = this.getListObj();
            var user = panel.datasource.data[panel.selectedIndex];
            if (user) {

                var password = document.getElementById('user_password').value.replace(/^\s*/, '').replace(/\s*$/, '');
                var displayname = document.getElementById('display_name').value.replace(/^\s*/, '').replace(/\s*$/, '');
                modBtn.setAttribute('disabled', password.length < 1 || displayname.length < 1);
                document.getElementById('tab1').removeAttribute('disabled');
                document.getElementById('tab2').removeAttribute('disabled');
                document.getElementById('tab3').removeAttribute('disabled');

                var textboxes = document.getElementsByTagName('textbox');
                if (textboxes) {
                    for (var i = 0; i < textboxes.length; i++) {
                        textboxes[i].removeAttribute('disabled');
                    }
                }
                // check for root user
                if (user.username == 'superuser') {
                    delBtn.setAttribute('disabled', true);
                    roleTextbox.setAttribute('disabled', true);
                }
                else {
                    delBtn.setAttribute('disabled', false);
                }
            }
            else {
                modBtn.setAttribute('disabled', true);
                delBtn.setAttribute('disabled', true);
                document.getElementById('tab1').setAttribute('disabled', true);
                document.getElementById('tab2').setAttribute('disabled', true);
                document.getElementById('tab3').setAttribute('disabled', true);

                var textboxes = document.getElementsByTagName('textbox');
                if (textboxes) {
                    for (var i = 0; i < textboxes.length; i++) {
                        textboxes[i].disabled = true;
                    }
                }
            }
        }
    });


})();

