(function(){

    var __controller__ = {

        name: 'Idle',

        lastIdleTime: -1,

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

            if (this.lastIdleTime == -1) {
                
                var idleTime = GeckoJS.Configure.read("vivipos.fec.settings.idle.time") || 60; // one minute

                var idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(Components.interfaces.nsIIdleService);

                idleService.addIdleObserver(this, idleTime);

                this.lastIdleTime = idleTime;
            }
            else {
                this.log('WARN', 'Idle service already registered, please unregister existing service first');
            }

        },

        unregister: function () {

            if (this.lastIdleTime != -1) {
                var idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(Components.interfaces.nsIIdleService);

                idleService.removeIdleObserver(this, this.lastIdleTime);

                this.lastIdleTime = -1;
            }

        },

        updateIdleTime: function(evt) {
            // re-register with new idle time if different from old idle time
            
            var idleTime = GeckoJS.Configure.read("vivipos.fec.settings.idle.time") || 60; // one minute
            var idleController = GeckoJS.Controller.getInstanceByName('Idle');

            if (idleController) {
                if (idleTime != idleController.lastIdleTime) {
                    idleController.unregister();
                    idleController.register();
                }
            }
        }


    };

    GeckoJS.Controller.extend(__controller__);



    function startup() {

        var idleController = GeckoJS.Controller.getInstanceByName('Idle');
        
        if (idleController) {
            idleController.register();
        }

        // listen for 'updateOptions' event
        var mainController = GeckoJS.Controller.getInstanceByName('Main');

        if (mainController) {
            mainController.addEventListener('onUpdateOptions', idleController.updateIdleTime);
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
