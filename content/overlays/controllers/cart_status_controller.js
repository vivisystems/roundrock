(function(){

    /**
     * Cart Status controller
     */

    var __controller__ = {

        name: 'CartStatus',

        cart: null,

        statusTextObj: null,
        statusTextObjId: 'cartstatus',

        statusContainerObj: null,
        statusContainerObjId: 'cartStatusPanelContainer',

        initial: function() {

            // register listener for cart event 'onSubmitSuccess'
            let cart = this.getCartController();
            if (cart) {
                cart.addEventListener('newTransaction', this.updateCartStatus, this);
                cart.addEventListener('onGetSubtotal', this.updateCartStatus, this);
                cart.addEventListener('onSubmitSuccess', this.updateCartStatus, this);
                cart.addEventListener('onCancelSuccess', this.updateCartStatus, this);
                cart.addEventListener('onVoidSaleSuccess', this.updateCartStatus, this);
            }

            // add listener for resetLayout event
            var layout = GeckoJS.Controller.getInstanceByName('Layout');
            if (layout) {
                layout.addEventListener('onResetLayout', this.positionPanel, this);
            }
            this.positionPanel();

            // initialize cart status in session
            this.updateCartStatus();
        },

        positionPanel: function() {

            var selectedElement = GeckoJS.Configure.read('vivipos.fec.settings.layout.cartstatus.selectedElement') || '';
            var selectedDirection = GeckoJS.Configure.read('vivipos.fec.settings.layout.cartstatus.selectedDirection') || 'none';
            var selectedPanel = GeckoJS.Configure.read('vivipos.fec.settings.layout.cartstatus.selectedPanel') || '';

            // show active panel, hide all the rest
            var panel = this.getStatusContainerObj();
            if (selectedDirection == 'none' || !selectedElement) {
                panel.hidden = true;
            }
            else {
                panel.hidden = false;
                if (document.getElementById(selectedElement)) {
                    if (selectedDirection == 'after') $('#'+selectedPanel).insertAfter('#'+selectedElement);
                    else $('#'+selectedPanel).insertBefore('#'+selectedElement);
                }
            }

            this.sleep(100);
        },

        getStatusTextObj: function() {
            if (!this.statusTextObj) {
                this.statusTextObj = document.getElementById(this.statusTextObjId);
            }
            return this.statusTextObj;
        },

        getStatusContainerObj: function() {
            if (!this.statusContainerObj) {
                this.statusContainerObj = document.getElementById(this.statusContainerObjId);
            }
            return this.statusContainerObj;
        },

        getCartController: function() {
            if (!this.cart) {
                this.cart = GeckoJS.Controller.getInstanceByName('Cart');
            }
            return this.cart;
        },

        getTransaction: function() {
            let cart = this.getCartController();
            if (cart) {
                return cart._getTransaction();
            }
            else {
                return null;
            }
        },

        sessionHandler: function(evt) {
            key = evt.getData().key;
            if (key == 'current_transaction') {
                alert('session event');
                this.updateCartStatus();
            }
        },

        updateCartStatus1: function() {
            let txn = this.getTransaction();
            if (txn && txn.data) {
                alert('void event: ' + txn.data.status);
            }
            else {
                alert('void event: no txn');
            }
            this.updateCartStatus();
        },

        updateCartStatus: function() {

            let status = 'no-txn';
            let txn = this.getTransaction();
            if (txn) {
                if (txn.isCancel()) {
                    status = 'no-txn';
                }
                else if (txn.isVoided()) {
                    status = 'voided-txn';
                }
                else if (txn.isSubmit()) {
                    if (txn.data.status == 1) {
                        status = 'closed-txn';
                    }
                    else {
                        if (txn.isClosed()) {
                            status = 'locked-txn'
                        }
                        else {
                            status = 'stored-txn';
                        }
                    }
                }
                else {
                    if (txn.isStored()) {
                        status = 'open-recalled-txn';
                    }
                    else if (txn.isClosed()) {
                        status = 'locked-txn'
                    }
                    else {
                        status = 'open-txn';
                    }
                }
            }
            this.getStatusTextObj().setAttribute('value', _('(cartstatus)' + status));
            this.getStatusTextObj().setAttribute('status', status);
        }
    };

    GeckoJS.Controller.extend(__controller__);

    // register onload
    if (mainWindow === window) {
        window.addEventListener('load', function() {
            $do('initial', null, 'CartStatus');
        }, false);
    }

})();
