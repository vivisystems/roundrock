(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'OverlayLayout',

        loadOverlay: function() {

            //dump('loadOverlay \n');

            var selectedLayout = GeckoJS.Configure.read('vivipos.fec.general.layouts.selectedLayout') || 'traditional';
            var layouts = GeckoJS.Configure.read('vivipos.fec.registry.layouts') || {};

            var layoutOverlayUri = 'chrome://viviecr/content/layouts/traditional/traditional.xul';
            if (layouts[selectedLayout]) {
                layoutOverlayUri = layouts[selectedLayout]['overlay_uri'] || layoutOverlayUri;
            }

            var observer = {
                observe : function (subject, topic, data) {
                    if (topic == 'xul-overlay-merged') {
                        // @irving 7/8/2009 - all overlays are now loaded in the main layout overlay
                        // load functional panels;
                        //document.loadOverlay('chrome://viviecr/content/bootstrap_mainscreen_overlays.xul', null);
                    }
                }
            };
            try {
                document.loadOverlay(layoutOverlayUri, observer);
            }catch(e) {
                if (layoutOverlayUri != 'chrome://viviecr/content/layouts/traditional/traditional.xul') {
                    // try load default
                    document.loadOverlay('chrome://viviecr/content/layouts/traditional/traditional.xul', observer);
                }
            }
        }
    }

    AppController.extend(__controller__);

    window.addEventListener('ViviposStartup', function() {
        // trick, invoke directly
        __controller__.loadOverlay.apply(__controller__);

    }, true);
})();
