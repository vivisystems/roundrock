(function(){

    var window = this;

    /**
     * IdleController
     */
    var __controller__ = {
        name: 'SimpleMq',

        // implement observe for idle
        observe: function(subject, topic, data) {

            if (topic == 'idle') {

                // gc force
                try {

                    GREUtils.gc();

                    window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                          .getInterface(Components.interfaces.nsIDOMWindowUtils)
                          .garbageCollect();
                }catch(e) {
                    
                }

                // notification-daemon has memory leak restart it.
                GREUtils.File.run('/etc/X11/Xsession.d/70notification-daemon', [], true);

                this.dispatchEvent('onIdle', {subject: subject, topic: topic , data: data});

            }else if (topic == 'back'){

                this.dispatchEvent('onBack', {subject: subject, topic: topic , data: data});
                
            }

        },

        register: function () {

            var simpleMqInterval = GeckoJS.Configure.read("vivipos.fec.settings.simple_mq.interval") || 60;


        },

        unregister: function () {

            var simpleMqInterval = GeckoJS.Configure.read("vivipos.fec.settings.simple_mq.interval") || 60;


        }


    };

    GeckoJS.Controller.extend(__controller__);


    function startup() {

        var smqController = GeckoJS.Controller.getInstanceByName('SimpleMq');
        
        if (smqController) {
            smqController.register();
        }
    }


    function destroy () {
        
        var smqController = GeckoJS.Controller.getInstanceByName('SimpleMq');

        if (smqController) {
            smqController.unregister();
        }
    }


    // self register to main window
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {
        window.addEventListener('load', startup, false);
        window.addEventListener('unload', destroy, false);
    }

})();
