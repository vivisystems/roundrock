(function(){

    /**
     * Controller Sound
     */

    GeckoJS.Controller.extend( {
        name: 'Sound',

        // initialize volume - called from main_controller

        initial: function () {
            var volume = GeckoJS.Configure.read('vivipos.fec.settings.sound.volume') || 0;
            this.setVolume(volume);
        },

        // initialize volume scale - called from sysprefs.js
        load: function () {
            var scale = document.getElementById('volume-scale');
            if (scale) scale.value = GeckoJS.Configure.read('vivipos.fec.settings.sound.volume');
        },

        beep: function () {
            GREUtils.Sound.play('chrome://viviecr/content/sounds/beep.wav');
        },

        warn: function () {
            GREUtils.Sound.play('chrome://viviecr/content/sounds/warn.wav');
        },

        // set alsamixer volume - called from sysprefs.js
        setVolume: function(volume) {
            GeckoJS.Configure.write('vivipos.fec.settings.sound.volume', volume);
            
            // invoke script to set volume
            try {
                var script = new GeckoJS.File('/usr/bin/amixer');
                script.run(['sset', 'Master', volume]);
                script.close();
            }
            catch (e) {
                //@todo OSD

                NotifyUtils.warn(_('Failed to set volume'));
            }
        }

    });

})();
