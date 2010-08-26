(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {
        
        name: 'CartQueue',

        uses: ['OrderQueue'],

        cartController: null,

        getCartController: function() {

            if(!this._cartController) {
                this._cartController = GeckoJS.Controller.getInstanceByName('Cart');
            }
            return this._cartController;
            
        },

        getMainController: function() {
            return GeckoJS.Controller.getInstanceByName('Main');
        },

        getKeypadController: function() {
            return GeckoJS.Controller.getInstanceByName('Keypad');
        },

        initial: function() {

        },

        destroy: function() {
        },

        isQueueEnable: function() {
            return true;
        },

        _hasUserQueue: function(user) {

            if (!user) return false;

            var username = user.username;

            return this.OrderQueue.hasUserQueue(username);

        },

        _removeUserQueue: function(user) {

            if (!user) return false;

            var username = user.username;

            return this.OrderQueue.removeUserQueue(username);

        },

        _removeQueueById: function(id) {

            if (!id) return null;

            return this.OrderQueue.popQueue(id);

        },

        getQueues: function() {

            var queues = [];
            var username = '';

            var canViewAllQueues = this.Acl.isUserInRole('acl_view_all_queues');

            if (!canViewAllQueues) {
                var user = this.Acl.getUserPrincipal();
                if (user) username = user.username;
            }

            queues = this.OrderQueue.getQueueSummaries(username);

            return queues;

        },

        pushQueue: function(nowarning) {

            var cart = this.getCartController();
            var curTransaction = cart._getTransaction();

            if(! cart.ifHavingOpenedOrder() ) {
                if (!nowarning) {
                    NotifyUtils.warn(_('No order to queue'));
                    cart._clearAndSubtotal();
                }
                return false;
            }

            if (curTransaction.data.recall == 2) {
                if (!nowarning) {
                    NotifyUtils.warn(_('Cannot queue the recalled order!!'));
                    cart._clearAndSubtotal();
                }
                return false;
            }

            var user = this.Acl.getUserPrincipal();
            var count = curTransaction.getItemsCount();

            if (count > 0) {

                // update user queue status
                let success = this.OrderQueue.pushQueue(user.username, curTransaction.data.id, curTransaction.data);

                if (!success) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                        _('Push Queue Error'),
                        _('This order could not be queued. Please check the network connectivity to the terminal designated as the table master [message #2201]'));
                    return false;
                }

                // only empty view ,
                // next added item will auto create new transaction
                curTransaction.emptyView();

                this.getKeypadController().clearBuffer();

                GeckoJS.Session.remove('current_transaction');
                GeckoJS.Session.remove('cart_last_sell_item');
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.dispatchEvent('onQueue', curTransaction);

                Transaction.removeRecoveryFile();
                
            }else {
                if (!nowarning) {
                    NotifyUtils.warn(_('Order is not queued because it is empty'));
                    cart._clearAndSubtotal();
                }
                return false;
            }

        },

        _getQueueIdDialog: function() {

            var queues = this.getQueues();

            if (!queues) {
                GREUtils.Dialog.alert(this.topmostWindow,
                    _('Pull Queue Error'),
                    _('Can not get queues list. Please check the network connectivity to the terminal designated as the table master [message #2202]'));
                return false;
            }
            
            var dialog_data = {
                queues: queues
            };

            return $.popupPanel('selectQueuesPanel', dialog_data);

        },

        _pullQueueToCart: function(id) {

            id = id || false;
            
            var cart = this.getCartController();

            // popQueue
            var data = this._removeQueueById(id);

            if (data) {

                // if has transaction push queue
                this.pushQueue(true);

                var curTransaction = new Transaction(true);
                curTransaction.data = data ;

                // recall alway recalc promotions
                Transaction.events.dispatch('onUnserialize', curTransaction, curTransaction);
                curTransaction.calcPromotions();
                curTransaction.calcTotal();

                cart._setTransactionToView(curTransaction);
                curTransaction.updateCartView(-1, -1);

                cart.returnItem(true);
                cart._clearAndSubtotal();

                this.dispatchEvent('afterPullQueue', curTransaction);

            }else {
                
                GREUtils.Dialog.alert(this.topmostWindow,
                    _('Pull Queue Error'),
                    _('This order could not be pulled. Please check the network connectivity to the terminal designated as the table master [message #2203]'));
                return false;
                
            }


        },

        pullQueue: function(id) {

            id = id || false;
            var self = this;

            if (id) {

                return self._pullQueueToCart(id);
                
            }else {

                var dialogPopuped = this._getQueueIdDialog();
                if (dialogPopuped === false) return false;
                
                return dialogPopuped.next(function(evt){

                    var result = evt.data;

                    if (!result.ok) return;

                    id = result.id;

                    return self._pullQueueToCart(id);

                });

            }
            
        }

    };

    var CartQueueController = window.CartQueueController =  AppController.extend(__controller__);

})();
