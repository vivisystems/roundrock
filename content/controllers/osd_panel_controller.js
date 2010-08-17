(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'OsdPanel',

        _panelObjId: 'osdPanel',
        _panelFrameObjId: 'osdPanelFrame',
        _panelBodyObjId: 'osdPanelBody',
        
        _panelObj: null,
        _panelFrameObj: null,

        _panelLeft: -1,
        _panelTop: -1,
        _panelWidth: 0,
        _panelHeight: 0,

        _registry: {},
        _osdPanelAccessKeyPrefix: 'vivipos.fec.settings.osdPanel.access.',
        _osdPanelOverlayTargetKey: 'vivipos.fec.settings.osdPanel.OverlayTarget',

        initial: function() {

            // register listener for layout option updates
            var main = GeckoJS.Controller.getInstanceByName('Main');
            main.addEventListener('onUpdateOptions', this.updateGeometry, this);

            // load registration
            var prefs = GeckoJS.Configure.read('vivipos.fec.registry.osdpanel');
            var registry = {};
            for (var pref in prefs) {
                registry[prefs[pref].controller] = pref;
            }
            this._registry = registry;
        },

        getPanelObj: function() {
            if (!this._panelObj) {
                this._panelObj = document.getElementById(this._panelObjId);
            }
            return this._panelObj;
        },

        getPanelFrameObj: function() {
            if (!this._panelFrameObj) {
                this._panelFrameObj = document.getElementById(this._panelFrameObjId);
            }
            return this._panelFrameObj;
        },

        updateOptions: function(evt) {
            this.updateGeometry(evt);
        },

        updateGeometry: function(evt) {
            let target = GeckoJS.Configure.read('vivipos.fec.settings.osdPanel.OverlayTarget') || 'none';

            let x = 0, y = 0, w = 0, h = 0;
            if (target == 'custom') {
                x = GeckoJS.Configure.read('vivipos.fec.settings.osdPanel.OverlayX') || 0;
                y = GeckoJS.Configure.read('vivipos.fec.settings.osdPanel.OverlayY') || 0;
                w = GeckoJS.Configure.read('vivipos.fec.settings.osdPanel.OverlayW') || 0;
                h = GeckoJS.Configure.read('vivipos.fec.settings.osdPanel.OverlayH') || 0;
            }
            else if (target != 'none') {
                let overlayTarget = document.getElementById(target);
                if (overlayTarget) {
                    x = overlayTarget.boxObject.screenX;
                    y = overlayTarget.boxObject.screenY;
                    w = overlayTarget.clientWidth;
                    h = overlayTarget.clientHeight;
                }
            }

            this._geometry = {
                x: x,
                y: y,
                w: w,
                h: h
            };
        },

        getGeometry: function(evt) {
            if (!this._geometry) {
                this.updateGeometry();
            }
            return this._geometry;
        },

        isOpen: function() {
            let panel = this.getPanelObj();
            return (panel.state == 'open' || panel.state == 'showing');
        },

        show: function(doc, geometry, controller) {
            if (!controller || !controller.name) {
                return;
            }

            // validate controller
            let access = false;
            let key = this._registry[controller.name];
            if (key) {
                access = GeckoJS.Configure.read(this._osdPanelAccessKeyPrefix + key);
            }
            if (!access) {
                return;
            }

            let target = GeckoJS.Configure.read(this._osdPanelOverlayTargetKey) || 'none';
            let geometry = this.getGeometry();
            if (target != 'none' && geometry && geometry.w > 0 && geometry.h > 0) {
                let panel = this.getPanelObj();
                let frame = this.getPanelFrameObj();
                let body = frame.contentWindow.document.getElementById( this._panelBodyObjId );
                body.innerHTML = doc || '';

                if (!geometry) {
                    geometry = this.getGeometry();
                }

                panel.sizeTo(geometry.w, geometry.h);
                panel.setAttribute('style', 'min-height:' + geometry.h + 'px; max-height:' + geometry.h + 'px;' +
                                            'min-width:' + geometry.w + 'px; max-width:' + geometry.w + 'px;');
                panel.openPopupAtScreen(geometry.x, geometry.y);
            }
        },

        hide: function() {
            if (this.isOpen()) {
                this.getPanelObj().hidePopup();
            }
        }
        
    };

    AppController.extend(__controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'OsdPanel');
    }, false);
    
})();
