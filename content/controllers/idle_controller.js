(function(){

    var __controller__ = {

        name: 'Idle',

        // implement observe for idle
        observe: function(subject, topic, data) {

            if (topic == 'idle') {

                var idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(Components.interfaces.nsIIdleService);
                
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

            var idleTime = GeckoJS.Configure.read("vivipos.fec.settings.idle.time") || 60;

            var idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(Components.interfaces.nsIIdleService);
            
            idleService.addIdleObserver(this, idleTime); // one minute


        },

        unregister: function () {

            var idleTime = GeckoJS.Configure.read("vivipos.fec.settings.idle.time") || 60;

            var idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(Components.interfaces.nsIIdleService);

            idleService.removeIdleObserver(this, idleTime); // one minute

        }


    };

    GeckoJS.Controller.extend(__controller__);



    function startup() {

        var idleController = GeckoJS.Controller.getInstanceByName('Idle');
        
        if (idleController) {
            idleController.register();
        }
    }


    function destroy () {
        
        var idleController = GeckoJS.Controller.getInstanceByName('Idle');

        if (idleController) {
            idleController.unregister();
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
