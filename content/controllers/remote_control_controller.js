(function(){

    /**
     * RemoteControl Controller
     */

    var __controller__ = {
        name: 'RemoteControl',

        initial: function () {

            var settings = (new X11vncSetting()).read();

            alert(this.dump(settings));
            if (settings == null) {
                settings = {};
            }
            settings['password_org'] = settings['verify'] = settings['password'];

            this.Form.unserializeFromObject('remoteControlForm', settings);

        },

        save: function(result) {

            var obj = this.Form.serializeToObject('remoteControlForm', false);

            var passwordModified = false;

            if (obj['password'] != obj['verify']) {
                NotifyUtils.warn(_('Password and Verify Password not the same'));
                result.data = false;
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
                        x11vncProg.run([obj.password,'/home/root/.vnc/passwd'], true); // no arguments and blocking.
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
            }
            result.data = true;

        }

    };

    GeckoJS.Controller.extend(__controller__);

})();
