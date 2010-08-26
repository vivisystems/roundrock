(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {
        
        name: 'RemoteControl',

        initial: function () {

            var settings = (new X11vncSetting()).read();
            
            if (settings == null) {
                settings = {};
            }
            settings['password_org'] = settings['verify'] = settings['password'];

            this.Form.unserializeFromObject('remoteControlForm', settings);

        },

        save: function() {

            var obj = this.Form.serializeToObject('remoteControlForm', false);

            var passwordModified = false;

            if (obj['password'] != obj['verify']) {
                NotifyUtils.warn(_('Password and Verify Password not the same'));
                return false;
            }

            // check password modified ?
            if (obj['password_org'] != obj['password']) {
                passwordModified = true;
            }

            delete obj['password_org'];

            // change boolean to integer
            for (var k in obj) {
                if(typeof obj[k] == 'boolean') {
                    obj[k] = obj[k] ? 1 : 0 ;
                }

            }

            (new X11vncSetting()).save(obj);

            // restart sync_client
            try {

                // change x11vnc password
                if (passwordModified) {
                    var x11vncProg = new GeckoJS.File('/usr/bin/x11vnc');
                    if (x11vncProg.exists()) {
                        x11vncProg.run(['--storepasswd', obj.password,'/data/profile/x11vnc_passwd'], true); // no arguments and blocking.
                    }
                    delete x11vncProg;
                    x11vncProg = null;
                }

                // restart x11vnc
                var x11vncScript = new GeckoJS.File('/etc/X11/Xsession.d/90x11vnc');
                if (x11vncScript.exists()) {
                    x11vncScript.run([], true); // no arguments and blocking.
                }
                delete x11vncScript;
                x11vncScript = null;
            }catch(e) {
                return false
            }

            obj['password_org'] = obj['password'];
            this.Form.unserializeFromObject('remoteControlForm', obj);

            OsdUtils.info(_('Remote control settings saved'));
        },

        exit: function() {
            if (GeckoJS.FormHelper.isFormModified('remoteControlForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),
                                               _('You have made changes to remote control settings. Save changes before exiting?'),
                                               flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    if (!this.save()) return;
                }
            }
            window.close();
        }

    };

    AppController.extend(__controller__);

})();
