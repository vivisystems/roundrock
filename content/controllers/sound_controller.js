(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'Sound',

        volume: null,

        // initialize volume - called from main_controller
        initial: function () {

            // self initial after main afterInitial
            var volume = GeckoJS.Configure.read('vivipos.fec.settings.sound.volume') || 0;
            this.setVolume(volume);

            // register listener to cart controller is exists
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if (cart) {
                cart.addEventListener(['afterAddItem','afterModifyItem','afterVoidItem','afterAddDiscount',
                    'afterAddSurcharge','afterAddMarker','afterCancel','afterAddPayment','afterShiftTax',
                    'afterItemByBarcode'], this.playBeep, this);
            }

        },

        // initialize volume scale - called from sysprefs.js
        load: function () {
            var scale = document.getElementById('volume-scale');
            if (scale) {
                scale.value = GeckoJS.Configure.read('vivipos.fec.settings.sound.volume');
                scale.setAttribute('onchange', 'setVolume(this.value, false)');
            }
        },

        beep: function () {
            //if (this.volume > 0) GREUtils.Sound.play('chrome://viviecr/content/sounds/beep.wav');
            GREUtils.Sound.beep();
        },

        warn: function () {
            //if (this.volume > 0) GREUtils.Sound.play('chrome://viviecr/content/sounds/warn.wav');
            GREUtils.Sound.beep();
            GREUtils.Sound.beep();
        },

        // set alsamixer volume - called from sysprefs.js
        setVolume: function(data) {

            var volume;
            var silent = true;

            if (data.length > 1) {
                volume = data[0];
                silent = data[1];
            }
            else {
                volume = data;
            }
            GeckoJS.Configure.write('vivipos.fec.settings.sound.volume', volume);

            this.volume = volume;

            // invoke script to set volume
            try {
                var script = new GeckoJS.File('/usr/bin/amixer');
                script.run(['sset', 'Master', volume + '%']);
                script.run(['sset', 'Master Front', volume + '%']);
                script.run(['sset', 'Front', volume + '%']);
                script.close();
                if (!silent) this.beep();
            }
            catch (e) {

                NotifyUtils.warn(_('Failed to set volume'));
            }
        },
        
        playBeep: function (evt) {
            if (evt.data == null) {
                return;
            }

            if (evt.data.error) {
                switch(evt.type) {
                    case 'afterItemByBarcode':
                        if (GeckoJS.Configure.read('vivipos.fec.settings.beepOnScanningError')) {
                            this.warn();
                        }
                        break;

                    default:
                        break;
                }
            }
            else {
                switch(evt.type) {
                    case 'afterAddItem':
                        if (GeckoJS.Configure.read('vivipos.fec.settings.beepOnItemAdd')) {
                            this.beep();
                        }
                        break;

                    case 'afterModifyItem':
                        if (GeckoJS.Configure.read('vivipos.fec.settings.beepOnModify')) {
                            this.beep();
                        }
                        break;

                    case 'afterVoidItem':
                        if (GeckoJS.Configure.read('vivipos.fec.settings.beepOnVOID')) {
                            this.beep();
                        }
                        break;

                    case 'afterShiftTax':
                        if (GeckoJS.Configure.read('vivipos.fec.settings.beepOnTaxStatusShift')) {
                            GREUtils.Sound.play('chrome://viviecr/content/sound/beep.wav');
                        }
                        break;

                    case 'afterAddDiscount':
                        if (GeckoJS.Configure.read('vivipos.fec.settings.beepOnDiscountSurcharge')) {
                            this.beep();
                        }
                        break;

                    case 'afterAddSurcharge':
                        if (GeckoJS.Configure.read('vivipos.fec.settings.beepOnDiscountSurcharge')) {
                            this.beep();
                        }
                        break;

                    case 'afterAddMarker':
                        switch(evt.data.type) {
                            case 'subtotal':
                                if (GeckoJS.Configure.read('vivipos.fec.settings.beepOnSubtotal')) {
                                    this.beep();
                                }
                                break;

                            case 'total':
                                if (GeckoJS.Configure.read('vivipos.fec.settings.beepOnTotal')) {
                                    this.beep();
                                }
                                break;

                            case 'tray':
                                if (GeckoJS.Configure.read('vivipos.fec.settings.beepOnTrayMarker')) {
                                    this.beep();
                                }
                                break;
                        }
                        break;

                    case 'afterAddPayment':
                        if (GeckoJS.Configure.read('vivipos.fec.settings.beepOnPayment')) {
                            this.beep();
                        }
                        break;

                    case 'afterCancel':
                        if (GeckoJS.Configure.read('vivipos.fec.settings.beepOnCANCEL')) {
                            this.beep();
                        }
                        break;

                    case 'afterTaxShift':
                        if (GeckoJS.Configure.read('vivipos.fec.settings.beepOnTaxStatusShift')) {
                            this.beep();
                        }
                        break;

                    default:
                        break;

                }
            }
        }


    };

    AppController.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'Sound');
                                      });

    }, false);

})();
