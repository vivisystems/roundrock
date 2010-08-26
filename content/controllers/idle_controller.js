(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'Idle',

        registeredIdles: {},

        getObserveObject: function(name, func) {

            var idleName = name || '';
            var idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(Components.interfaces.nsIIdleService);
            var self = this;
            
            var idleObserver = {
                
                observe: function(subject, topic, data) {

                    if (topic == 'idle') {
                       
                        try {

                            // callback function
                            if(typeof func == "function") func.call(self);

                        }catch(e) {
                            self.log('ERROR', 'ERROR invoke idle callback', e);
                        }

                        self.dispatchEvent('onIdle', {
                            name: idleName,
                            subject: subject,
                            topic: topic ,
                            data: data
                        });

                    }else if (topic == 'back'){

                        self.dispatchEvent('onBack', {
                            name: idleName,
                            subject: subject,
                            topic: topic ,
                            data: data
                        });

                    }

                }
            };

            return idleObserver;
        },


        registerDefault: function() {

            var self = this;
            var name = 'default';
            var idleTime = GeckoJS.Configure.read("vivipos.fec.settings.idle.time") || 60; // one minute
            
            var callback = function() {
                
                try {

                    GREUtils.gc(); // gc force

                    window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                    .getInterface(Components.interfaces.nsIDOMWindowUtils)
                    .garbageCollect();

                    // notification-daemon has memory leak restart it.
                    GREUtils.File.run('/etc/X11/Xsession.d/70notification-daemon', [], true);

                }catch(e) {
                    self.log('ERROR', 'ERROR process default idle.', e);
                }

            };

            this.register(name, idleTime, callback);

        },


        register: function (name, idleTime, callback) {

            if (this.registeredIdles[name]) {

                this.log('WARN', 'Idle service already registered, please unregister existing service first');

            }else {

                idleTime = idleTime || GeckoJS.Configure.read("vivipos.fec.settings.idle.time") || 60; // one minute
                var idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(Components.interfaces.nsIIdleService);
                var idleObserve = this.getObserveObject(name, callback);

                idleService.addIdleObserver(idleObserve, idleTime);

                // add to registeredIdles
                this.registeredIdles[name] = {name: name, idle: idleTime, observe: idleObserve};

            }

        },


        unregister: function (name) {

            if (this.registeredIdles[name]) {

                var idleTime = this.registeredIdles[name]['idle'];
                var observe = this.registeredIdles[name]['observe'];

                var idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(Components.interfaces.nsIIdleService);
                idleService.removeIdleObserver(observe, idleTime);

                delete this.registeredIdles[name];
                
            }
            
        },

        unregisterAll: function() {

            var idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(Components.interfaces.nsIIdleService);
            
            for (var name in this.registeredIdles) {

                var idleTime = this.registeredIdles[name]['idle'];
                var observe = this.registeredIdles[name]['observe'];

                idleService.removeIdleObserver(observe, idleTime);

            }

            this.registeredIdles = {};
            
        },


        updateIdleTime: function(evt) {
            // re-register with new idle time if different from old idle time
            
            var idleTime = GeckoJS.Configure.read("vivipos.fec.settings.idle.time") || 60; // one minute
            var idleController = GeckoJS.Controller.getInstanceByName('Idle');

            if (idleController) {

                var idleObject = idleController.registeredIdles['default'];
                if (idleObject) {
                    if (idleTime != idleObject.idle) {
                        idleController.unregister('default');
                        idleController.registerDefault();
                    }
                }

            }
        }


    };

    AppController.extend(__controller__);


    function startup() {

        var idleController = GeckoJS.Controller.getInstanceByName('Idle');
        
        if (idleController) {
            idleController.registerDefault();
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
            idleController.unregisterAll();
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
