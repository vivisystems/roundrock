(function(){

    var __controller__ = {

        name: 'Users',

        scaffold: true,
	
        _listObj: null,
        _selectedIndex: -1,
        _userAdded: false,
        _userModified: false,

        getListObj: function() {
            if(this._listObj == null) {
                // this._listObj = this.query('#userscrollablepanel')[0];
                this._listObj = document.getElementById('userscrollablepanel');
            }
            return this._listObj;
        },

        getInputDefault: function () {
            var valObj = {};
            this.query('[form=userForm]').each(function() {
                var n = this.name || this.getAttribute('name');
                if (!n) return;
                var v = this.getAttribute('default');

                if (typeof v != 'undefined') {
                    valObj[n] = v;
                }
            });
            return valObj;

        },

        /*
        beforeScaffold: function(evt) {
            
        },
        */
        beforeScaffoldAdd: function (evt) {

            if (!this.confirmChangeUser()) {
                evt.preventDefault();
                return;
            }

            var user = evt.data;
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=550';
            var inputObj = {input0:null, require0:true, alphaOnly0: true,
                            input1:null, require1:true, numericOnly1: true, type1:'password',
                            numpad: null};

            this._userAdded = false;

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Employee'), aFeatures,
                                       _('New Employee'), '', _('User Name'), _('Passcode (0-9 only)'), inputObj);
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

                NotifyUtils.warn(_('Duplicate user name [%S]; user not added.', [user.username]));
                evt.preventDefault();
                return ;
            }

            if (display_name != null && display_name.length > 0) {

                NotifyUtils.warn(_('Duplicate display name [%S]; user not added.', [user.displayname]));
                evt.preventDefault();
                return ;
            }
            
            var newUser = this.getInputDefault();
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

                this._selectedIndex = newIndex;
                panel.selectedIndex = newIndex;
                panel.selectedItems = [newIndex];
                panel.ensureIndexIsVisible(newIndex);
                
                this.validateForm(true);

                document.getElementById('display_name').focus();

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
                        
                    NotifyUtils.warn(_('Duplicate display name [%S]; user not modified.', [evt.data.displayname]));
                }
            }
        },

        afterScaffoldEdit: function (evt) {
            if (this._userModified) {
                var panel = this.getListObj();
                var index = panel.selectedIndex;

                this.requestCommand('list', index);

                this._selectedIndex = index;
                panel.selectedIndex = index;
                panel.selectedItems = [index];
                panel.ensureIndexIsVisible(index);

                OsdUtils.info(_('Employee [%S] modified successfully', [evt.data.displayname]));

                // if
                var currentUser = GeckoJS.Session.get('user');
                if (currentUser != null && currentUser.id == evt.data.id) {
                        GREUtils.Dialog.alert(this.topmostWindow,
                                              _('Modify Employee'),
                                              _('Changes to the current employee will take effect the next time the employee logs in'));
                }
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

            //
            var panel = this.getListObj();
            var index = panel.selectedIndex;
            panel.ensureIndexIsVisible(index);
            
            // check if assigned drawer, if any, is enabled
            var device;
            // use try just in case opener or opener.opener no longer exists
            try {
                device = opener.opener.GeckoJS.Controller.getInstanceByName('Devices');
            }
            catch(e) {}
            
            var drawer = evt.data.drawer;
            if (drawer != null) {
                drawer = GeckoJS.String.trim(drawer);
                if (drawer != '') {
                    var warn = true;
                    if (device) {
                        if (!(device.deviceExists('cashdrawer', drawer))) {
                            NotifyUtils.warn(_('The assigned drawer [%S] does not exist!', [drawer]));
                        }
                        else {
                            var enabledDrawers = device.getEnabledDevices('cashdrawer');
                            if (enabledDrawers == null || enabledDrawers.length == 0) {
                                warn = true;
                            }
                            else {
                                enabledDrawers.forEach(function(d) {
                                   if (d.number == drawer) {
                                       warn = false;
                                   }
                                });
                            }
                            if (warn) {
                                NotifyUtils.warn(_('The assigned drawer [%S] is not yet enabled!', [drawer]));
                            }
                        }
                    }
                    else {
                        NotifyUtils.error(_('Error detected in device manager; unable to verify cash drawer configuration'));
                        this.log('Devices controller returns null instance when checking user cash drawer assignment');
                    }
                }
            }
        },

        beforeScaffoldDelete: function(evt) {
            var panel = this.getListObj();
            var view = panel.datasource;
            var displayname = view.data[panel.selectedIndex].displayname;
            var defaultUserID = GeckoJS.Configure.read('vivipos.fec.settings.DefaultUser');
            var currentUser = GeckoJS.Session.get('user');

            if (defaultUserID == evt.data.id) {
                NotifyUtils.warn(_('[%S] is the default user and may not be deleted', [displayname]));
                evt.preventDefault();
            }
            else if (currentUser != null && currentUser.id == evt.data.id) {
                NotifyUtils.warn(_('[%S] is the current user and may not be deleted', [displayname]));
                evt.preventDefault();
            }
            else if (evt.data.username == 'superuser') {
                NotifyUtils.warn(_('[%S] may not be deleted', [displayname]));
                evt.preventDefault();
            }
            else if (GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete %S', [displayname]), _('Are you sure?')) == false) {
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

            this._selectedIndex = index;
            panel.selectedIndex = index;
            panel.selectedItems = [index];
            panel.ensureIndexIsVisible(index);

            this.validateForm(true);

            OsdUtils.info(_('Employee [%S] removed successfully', [evt.data.displayname]));
        },

        afterScaffoldView: function(evt) {
            evt.data.default_job_name = evt.data.Job.jobname;
        },

        afterScaffoldIndex: function(evt) {

            var panel = this.getListObj();

            panel.datasource = evt.data;
            panel.ensureIndexIsVisible(panel.selectedIndex);
            
        },

        getRoleGroup: function () {
            var screenwidth = GeckoJS.Session.get('screenwidth') || 800;
            var screenheight = GeckoJS.Session.get('screenheight') || 600;
            var rolegroup = $('#user_group').val();
            var aURL = 'chrome://viviecr/content/select_rolegroup.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                rolegroup: rolegroup
            };
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select Access Group'), aFeatures, inputObj);

            if (inputObj.ok && inputObj.rolegroup) {
                $('#user_group').val(inputObj.rolegroup);
            }
        },
        
        getJob: function () {
            var screenwidth = GeckoJS.Session.get('screenwidth') || 800;
            var screenheight = GeckoJS.Session.get('screenheight') || 600;
            var jobid = $('#job_id').val();
            var aURL = 'chrome://viviecr/content/select_job.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            
            var jobModel = new JobModel();
            var jobsData = jobModel.find('all', {
                order: 'jobname'
            });
            var inputObj = {
                jobid: jobid,
                jobsData: jobsData
            };
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select Default Job'), aFeatures, inputObj);

            if (inputObj.ok && inputObj.jobid) {
                $('#job_name').val(inputObj.jobname);
                $('#job_id').val(inputObj.jobid);
            }
        },

        load: function () {

            var panel = this.getListObj();

            this.requestCommand('list', -1);

            this._selectedIndex = -1;
            panel.selectedItems = [-1];
            panel.selectedIndex = -1;

            GeckoJS.FormHelper.reset('userForm');

            this.validateForm();
        },

        confirmChangeUser: function(index) {
            // check if user form has been modified
            if (this._selectedIndex != -1 && (index == null || (index != -1 && index != this._selectedIndex))
                && GeckoJS.FormHelper.isFormModified('userForm')) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                             _('Discard Changes'),
                                             _('You have made changes to the current user. Are you sure you want to discard the changes?'))) {
                    return false;
                }
            }
            return true;
        },

        exit: function() {
            // check if user form has been modified
            if (this._selectedIndex != -1&& GeckoJS.FormHelper.isFormModified('userForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_CANCEL;

                var action = prompts.confirmEx(null,
                                               _('Exit'),
                                               _('You have made changes to the current user. Save changes before exiting?'),
                                               flags, _('Save'), _('Discard'), '', null, check);
                if (action == 2) {
                    return;
                }
                else if (action == 0) {
                    this.requestCommand('update', null, 'Users');
                }
            }
            window.close();
        },

        select: function(){
		
            var panel = this.getListObj();
            var index = panel.selectedIndex;

            if (index == this._selectedIndex && index != -1) return;

            if (!this.confirmChangeUser(index)) {
                panel.selectedItems = [this._selectedIndex];
                return;
            }

            this.requestCommand('list', index);

            this._selectedIndex = index;
            panel.selectedItems = [index];
            panel.selectedIndex = index;
            panel.ensureIndexIsVisible(index);
            
            this.validateForm(true);


        },
        
        setDefaultUser: function() {
            var panel = this.getListObj();
            var view = panel.datasource;

            if (panel) {
                if (panel.selectedIndex >= 0) {
                    var user = view.data[panel.selectedIndex];
                    if (user) {
                        GeckoJS.Configure.write('vivipos.fec.settings.DefaultUser', user.id);
                    }
                }
            }
        },

        // initialize selected user to userid
        initUser: function(userid) {
            
            var panel = this.getListObj();
            var users = panel.datasource.data;

            if (users) {
                for (var i = 0; i < users.length; i++) {
                    if (users[i].id == userid) {
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
                var numeric = password.replace(/[0-9.]*/, '');
                modBtn.setAttribute('disabled', password.length < 1 || displayname.length < 1 || numeric.length > 0);
                document.getElementById('tab1').removeAttribute('disabled');
                document.getElementById('tab2').removeAttribute('disabled');
                //document.getElementById('tab3').removeAttribute('disabled');

                var textboxes = document.getElementsByTagName('textbox');
                if (textboxes) {
                    for (var i = 0; i < textboxes.length; i++) {
                        textboxes[i].removeAttribute('disabled');
                    }
                }
                document.getElementById('default_price_level').removeAttribute('disabled');
                document.getElementById('user_drawer').removeAttribute('disabled');

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
                //document.getElementById('tab3').setAttribute('disabled', true);

                var textboxes = document.getElementsByTagName('textbox');
                if (textboxes) {
                    for (var i = 0; i < textboxes.length; i++) {
                        textboxes[i].disabled = true;
                    }
                }

                document.getElementById('default_price_level').setAttribute('disabled', true);
                document.getElementById('user_drawer').setAttribute('disabled', true);
            }
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();
