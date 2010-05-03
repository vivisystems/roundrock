(function(){

    var __controller__ = {

        name: 'OsdSubtotal',

        _osdPanelController: null,
        _devicesController: null,
        _cartController: null,
        _template: null,
        _templateKey: 'osd-subtotal',       // this key must match controller's osd registry id
        _osdPanelTemplateKeyPrefix: 'vivipos.fec.settings.osdPanel.template.',
        
        initial: function() {

            // register listener for afterAddMarker event
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            cart.addEventListener('afterAddMarker', this.handleMarker, this);
            cart.addEventListener('onCancelSuccess', this.hideOsdPanel, this);
            cart.addEventListener('beforeSubmit', this.hideOsdPanel, this);

        },

        handleMarker: function(evt) {
            if (typeof evt == 'object' &&
                ((typeof evt.data == 'string' && evt.data == 'subtotal') ||
                 (evt.data.type == 'subtotal'))) {

                let osdPanel = this.getOsdPanelController();
                if (osdPanel.isOpen()) {
                    osdPanel.hide();
                }
                else {
                    let template = this.getTemplate(true);
                    let output = '';
                    if (template) {
                        let data = {};
                        let cart = this.getCartController();
                        if (cart) {
                            data.txn = cart._getTransaction();
                            if (data.txn) data.order = data.txn.data;
                        }
                        data.customer = GeckoJS.Session.get('current_customer');
                        data.store = GeckoJS.Session.get('storeContact');
                        if (data.store) data.store.terminal_no = GeckoJS.Session.get('terminal_no');
                        if (!data.user) {
                            let user = this.Acl.getUserPrincipal();
                            if (user) {
                                data.user = user.username;
                                data.display_name = user.description;
                            }
                        }
                        try {
                            if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', this.dump(data.order.items_tax_details));
                            output = template.process(data);
                        }
                        catch(e) {
                            this.log('ERROR', 'Failed to process template\n\n' + template);
                        }
                    }
                    osdPanel.show(output, null, this);
                }
            }
        },

        hideOsdPanel: function(evt) {
            this.getOsdPanelController().hide();
        },

        getTemplate: function(refresh) {
            if (refresh || !this._template) {
                let devices = this.getDevicesController();
                if (devices) {
                    let templates = devices.getTemplates('osd-subtotal') || {};
                    let selectedTemplate = GeckoJS.Configure.read(this._osdPanelTemplateKeyPrefix + this._templateKey);
                    if (selectedTemplate && templates[selectedTemplate]) {
                        this._template = devices.getTemplateData(selectedTemplate);
                    }
                    else {
                        let templateKeys = GeckoJS.BaseObject.getKeys(templates);
                        if (templateKeys.length > 0) {
                            this._template = devices.getTemplateData(templateKeys[0]);
                        }
                    }
                }
            }
            return this._template;
        },

        getOsdPanelController: function() {
            if (!this._osdPanelController) {
                this._osdPanelController = GeckoJS.Controller.getInstanceByName('OsdPanel');
            }
            return this._osdPanelController;
        },
        
        getDevicesController: function() {
            if (!this._devicesController) {
                this._devicesController = GeckoJS.Controller.getInstanceByName('Devices');
            }
            return this._devicesController;
        },

        getCartController: function() {
            if (!this._cartController) {
                this._cartController = GeckoJS.Controller.getInstanceByName('Cart');
            }
            return this._cartController;
        }

    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'OsdSubtotal');
    }, false);
    
})();
