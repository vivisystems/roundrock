(function(){

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
        
        initial: function() {

            // register listener for layout option updates
            var main = GeckoJS.Controller.getInstanceByName('Main');
            main.addEventListener('updateLayoutOptions', this.updateGeometry, this);

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

        show: function(doc, geometry) {
            let target = GeckoJS.Configure.read('vivipos.fec.settings.osdPanel.OverlayTarget') || 'none';
            let geometry = this.getGeometry();
            if (target != 'none' && geometry && geometry.w > 0 && geometry.h > 0) {
                let panel = this.getPanelObj();
                let frame = this.getPanelFrameObj();
                let body = frame.contentWindow.document.getElementById( this._panelBodyObjId );
                body.innerHTML = doc || '';

                if (!geometry) {
                    geometry = this.getGeometry();
                }

                panel.openPopupAtScreen(geometry.x, geometry.y);
                panel.sizeTo(geometry.w, geometry.h);
            }
        },

        hide: function() {
            if (this.isOpen()) {
                this.getPanelObj().hidePopup();
            }
        }
        
    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'OsdPanel');
    }, false);
    
})();
