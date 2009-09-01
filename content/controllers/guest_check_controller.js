(function(){

    var __controller__ = {
        
        name: 'GuestCheck',

        components: ['CartUtils'],
        uses: ['Table'],
        

        _cartController: null,


        /**
         * Get CartController
         *
         * @return {Controller} controller
         */
        getCartController: function() {

            if(!this._cartController) {
                this._cartController = GeckoJS.Controller.getInstanceByName('Cart');
            }
            return this._cartController;

        },


        /**
         * Get MainController
         *
         * @return {Controller} controller
         */
        getMainController: function() {
            return GeckoJS.Controller.getInstanceByName('Main');
        },


        /**
         * Get KeypadController
         *
         * @return {Controller} controller
         */
        getKeypadController: function() {
            return GeckoJS.Controller.getInstanceByName('Keypad');
        },


        /**
         * openGuestNumDialog
         *
         * @param {Number} no  default number of customers
         * @return {Number} number of customers
         */
        openGuestNumDialog: function (no){

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:no, 
                require0:true,
                numpad:true
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select Number of Customers'), aFeatures, _('Select Number of Customers'), '', _('Number'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                return inputObj.input0;
            }

            return no;
        },

        /**
         * open Table No Dialog
         * 
         * @param {Boolean} tableSelector  use numberpad or table selector
         */
        openTableNumDialog: function (tableSelector){

            tableSelector = tableSelector || false;

            if ( tableSelector ) {

                return this.popupTableSelectorPanel();
                
            }else {

                var no = '';
                var aURL = 'chrome://viviecr/content/prompt_additem.xul';
                var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
                var inputObj = {
                    input0:'',
                    require0:true,
                    numpad:true,
                    disablecancelbtn:true
                };

                GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select Table Number'), aFeatures, _('Select Table Number'), '', _('Number'), '', inputObj);

                if (inputObj.ok && inputObj.input0) {
                    no = inputObj.input0;
                }

                return no;

            }

        },

        /**
         * popupTableSelectorPanel
         *
         * @todo
         */
        popupTableSelectorPanel: function() {

            var inputObj = {
                isNewOrder: true,
                // tables: tables
                tables: null
            };

            var dialog_data = [
            inputObj
            ];
            var self = this;

            try {
                var r = $.popupPanel('selectTablePanel', dialog_data);
            } catch (e) {}

            return '';

        },


        /**
         * Set Number of customers to transaction object
         *
         * @param {Number} num  default number of customers
         */
        guestNum: function(num) {

            var defaultNum = GeckoJS.Session.get('vivipos_fec_number_of_customers') || 1;
            var cart = this.getCartController();
            var curTransaction = cart._getTransaction();

            if (! cart.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                cart._clearAndSubtotal();
                return false;
            }

            if (num) {
                num = isNaN(parseInt(num)) ? -1 : parseInt(num) ;
            } else {
                num = this.getKeypadController().getBuffer();
                num = isNaN(parseInt(num)) ? -1 : parseInt(num) ;

                this.getKeypadController().clearBuffer();
                cart._cancelReturn();
            }
           
            if (num == -1) {
                // popup dialog 
                num = this.openGuestNumDialog(defaultNum);
            }

            // update number of customers.
            curTransaction.setNumberOfCustomers(num);
            
            cart._clearAndSubtotal();
            
            return true;

        },


        /**
         * Set Table no to transaction object
         *
         * @param {Number} no  table no
         * @param {Boolean} tableSelector  use table selector or numberpad dialog
         */
        newTable: function(no, tableSelector) {

            no = no || '';
            tableSelector = tableSelector || false;
            tableSelector = true;
           
            var cart = this.getCartController();
            var curTransaction = cart._getTransaction(true); // autocreate

            if (! cart.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                cart._clearAndSubtotal();
                return '';
            }

            if (no.length == 0) {              
                no = this.getKeypadController().getBuffer() || '';
                this.getKeypadController().clearBuffer();
                cart._cancelReturn();
            }

            // use callback to select table.
            if (no.length == 0) {
                // popup dialog
                no = this.openTableNumDialog(tableSelector) ;
            }

            if (no.length == 0) return '';
            
            // get table define
            var table = this.Table.getTableByNo(no);
            if (table) {

                // set destination action
                var destination = table.destination;

                if (destination) {
                    this.requestCommand('setDestination', destination, 'Destinations');
                } else {
                    var defaultDest = GeckoJS.Session.get('defaultDestination');
                    if (defaultDest) {
                        this.requestCommand('setDestination', defaultDest, 'Destinations');
                    }
                }

                // update Table No
                curTransaction.setTableNo(no);
                cart._clearAndSubtotal();
                
            }else {
                NotifyUtils.warn(_('[%S] is an invalid table number. Table number must be defined through table manager; Please input another table number.', [no]));
            }
            
        },


        /**
         * Set check_no to transaction object
         *
         * @param {Boolean} autoCheckNo  auto create check no
         */
        newCheck: function(autoCheckNo) {

            var cart = this.getCartController();
            var curTransaction = cart._getTransaction();
            var num = -1 ;

            if (! cart.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                cart._clearAndSubtotal();
                return false;
            }

            if (!autoCheckNo) {
                num = this.getKeypadController().getBuffer();
                num = isNaN(parseInt(num)) ? -1 : parseInt(num) ;

                this.getKeypadController().clearBuffer();
                cart._cancelReturn();
            }

            if (num == -1) {
                num = SequenceModel.getSequence('check_no');
            }
            
            // update number of customers.
            curTransaction.setCheckNo(num);
            cart._clearAndSubtotal();

            return true;
        },











        recallOrder: function() {

            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            this.log('recall order: ' + no );

            return this.GuestCheck.recallByOrderNo(no);
        },

        recallTable: function() {
            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            this.log('recallTable order: ' + no );

            return this.GuestCheck.recallByTableNo(no);
        },

        recallCheck: function() {

            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            this.log('recallCheck order: ' + no );

            return this.GuestCheck.recallByCheckNo(no);
        },

        storeCheck: function() {

            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            var curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                return;
            }

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                return;
            }

            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                return;
            }

            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                return;
            }

            var modified = curTransaction.isModified();
            if (modified) {
                this.GuestCheck.store();

                this.dispatchEvent('onStore', curTransaction);

                this._getCartlist().refresh();
            }
            else {
                NotifyUtils.warn(_('No change to store'));
            }
        },

        mergeCheck: function() {

            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            var curTransaction;

            curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                this._clearAndSubtotal();
                return;
            }

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                this._clearAndSubtotal();
                return;
            }
            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                this._clearAndSubtotal();
                return;
            }
            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                this._clearAndSubtotal();
                return;
            }
            var modified = curTransaction.isModified();
            if (modified) {
                NotifyUtils.warn(_('This order has been modified and must be stored first'));
            // r = this.GuestCheck.store();
            // this.dispatchEvent('onStore', curTransaction);
            }

            // r = this.GuestCheck.transferToCheckNo(no);
            var r = this.GuestCheck.mergeOrder(no, curTransaction.data);
        },

        splitCheck: function() {

            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            var curTransaction;

            curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                return;
            }

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                return;
            }
            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                return;
            }
            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                return;
            }
            var modified = curTransaction.isModified();
            if (modified) {
                NotifyUtils.warn(_('This order has been modified and must be stored first'));
            // r = this.GuestCheck.store();
            // this.dispatchEvent('onStore', curTransaction);
            }

            var r = this.GuestCheck.splitOrder(no, curTransaction.data);
        },

        transferTable: function(){
            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            var curTransaction;

            curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                return;
            }

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                return;
            }
            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                return;
            }
            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                return;
            }
            var modified = curTransaction.isModified();
            if (modified) {
                // rec    // XXXX why only rec?
                NotifyUtils.warn(_('This order has been modified and must be stored first'));
            // r = this.GuestCheck.store();
            // this.dispatchEvent('onStore', curTransaction);
            }

            var r = this.GuestCheck.transferToTableNo(no);
        },

        unserializeFromOrder: function(order_id) {
            //
            order_id = order_id;

            var curTransaction = this.GuestCheck.unserializeFromOrder(order_id);

            if (curTransaction) {
                this._setTransactionToView(curTransaction);
                curTransaction.updateCartView(-1, -1);
                this._clearAndSubtotal();
            }
            return true;

        }


    };

    var GuestCheckController = window.GuestCheckController =  GeckoJS.Controller.extend(__controller__);

})();
