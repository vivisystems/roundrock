(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'LoadTest',

        uses: ['Product', 'Order', 'TableSetting'],

        _suspendLoadTest: false,
        _loadTestState: null,
        _loadTestStoreTotalTime: 0,
        _loadTestStoreCount: 0,
        _loadTestStoreDataSet: [],
        _loadTestStoreMax: -1,
        _loadTestStoreMin: -1,
        _loadTestFinalizeTotalTime: 0,
        _loadTestFinalizeCount: 0,
        _loadTestFinalizeDataSet: [],
        _loadTestFinalizeMax: -1,
        _loadTestFinalizeMin: -1,
        
        _getKeypadController: function() {
            return GeckoJS.Controller.getInstanceByName('Keypad');
        },

        suspendLoadTest: function() {
            this._suspendLoadTest = true;
        },

        loadTest: function(params) {

            // make sure we are in main window scope
            var mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
            if (!(window === mainWindow)) {
                alert('Load Tests may only be executed in the main window');
            }
            
            var paramList = [];
            if (params) paramList = params.split('|');
            var count = parseInt(paramList[0]) || 1;
            var items = parseInt(paramList[1]) || 1;
            var store = parseInt(paramList[2]) || 0;
            var resume = parseInt(paramList[3]) || 0;
            var noTable = parseInt(paramList[4]) || 0;

            // parse user input
            var buf = this._getKeypadController().getBuffer() || '';
            this.requestCommand('clearBuffer', null, 'Keypad');
            var userParams = buf.split('.');
            if (userParams.length > 0 && !isNaN(parseInt(userParams[0]))) {
                count = parseInt(userParams[0]) || 1;
            }
            if (userParams.length > 1 && !isNaN(parseInt(userParams[1]))) {
                items = parseInt(userParams[1]) || 1;
            }
            if (userParams.length > 2 && !isNaN(parseInt(userParams[2]))) {
                store = parseInt(userParams[2]) || 0;
            }
            if (userParams.length > 3 && !isNaN(parseInt(userParams[3]))) {
                resume = parseInt(userParams[3]) || 0;
            }
            if (userParams.length > 4 && !isNaN(parseInt(userParams[4]))) {
                noTable = parseInt(userParams[4]) || 0;
            }

            this.log('WARN', 'Load test parameters\n   count=[' + count + ']\n   items=[' + items + ']\n   store=[' + store + ']\n   resume=[' + resume + ']\n   noTable=[' + noTable + ']\n\n');

            var customers = GeckoJS.Session.get('customers') || [];
            var products = GeckoJS.Session.get('products') || [];
            var numProds = products.length;
            var numCustomers = customers.length;

            var guestCheckController = GeckoJS.Controller.getInstanceByName('GuestCheck');
            var checkSeq = 0;
            var tables = GeckoJS.Session.get('tables') || [];
            var numTables = tables.length;
            var currentTableIndex = parseInt(numTables * Math.random());    // randomize starting table

            var tableSettings = this.TableSetting.getTableSettings(true);
            var maxCheckNo = tableSettings.MaxCheckNo || 100;

            var customerController = GeckoJS.Controller.getInstanceByName('Customers');

            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var main = GeckoJS.Controller.getInstanceByName('Main');
            var waitPanel;

            // check if open order exist
            if (cart.ifHavingOpenedOrder()) {
                if (GREUtils.Dialog.confirm(this.topmostWindow, _('Load Test'), _('Open order exists, discard the order and proceed with the load test?'))) {
                    cart.cancel(true);
                }
                else {
                    return;
                }
            }

            var progressBar = document.getElementById('interruptible_progress');
            progressBar.mode = 'determined';

            var actionButton = document.getElementById('interruptible_action');

            if (actionButton) {
                actionButton.setAttribute('label', 'Suspend');
                actionButton.setAttribute('oncommand', '$do("suspendLoadTest", null, "LoadTest");');
            }
            
            var ordersOpened = 0;
            var ordersClosed = 0;
            if (resume && this._loadTestState != null) {
                ordersOpened = this._loadTestState.opened;
                ordersClosed = this._loadTestState.closed;
                this._loadTestState = null;
                progressBar.value = ordersClosed * 100 / count;
                waitPanel = main._showWaitPanel('interruptible_wait_panel', 'interruptible_wait_caption', 'Resume Load Testing (' + count + ' orders with ' + items + ' items)', 1000);
            }
            else {
                progressBar.value = 0;
                this._loadTestStoreTotalTime = 0;
                this._loadTestStoreCount = 0;
                this._loadTestStoreDataSet = [];
                this._loadTestStoreMax = -1;
                this._loadTestStoreMin = -1;

                this._loadTestFinalizeTotalTime = 0;
                this._loadTestFinalizeCount = 0;
                this._loadTestFinalizeDataSet = [];
                this._loadTestFinalizeMax = -1;
                this._loadTestFinalizeMin = -1;
                waitPanel = main._showWaitPanel('interruptible_wait_panel', 'interruptible_wait_caption', 'Load Testing (' + count + ' orders with ' + items + ' items)', 1000);
            }

            var currentTableNo = -1;
            var doRecall = true;

            try {
                while (ordersOpened < count || ordersClosed < count) {

                    if (this._suspendLoadTest) {
                        this._suspendLoadTest = false;
                        this._loadTestState = {opened: ordersOpened, closed: ordersClosed}

                        break;
                    }

                    // create new order or recall?
                    doRecall = !noTable && (ordersClosed < count) && (ordersOpened >= count || Math.random() < 0.5);

                    // select a table in sequence
                    if (!noTable && numTables > 0) {
                        let tries = 0;
                        while (tries < numTables) {
                            let table = tables[currentTableIndex++];
                            currentTableIndex %= numTables;
                            tries++;

                            if (doRecall || guestCheckController.isTableAvailable(table)) {
                                currentTableNo = table.table_no;
                                break;
                            }
                        }
                    }

                    this.log('WARN', 'table number [' + currentTableNo + '] doRecall [' + doRecall + '] orders opened [' + ordersOpened + ']');

                    // found table, let's get a transaction'
                    if (currentTableNo > -1 || noTable) {
                        let recalled = false;
                        let txn;

                        if (!noTable && doRecall) {
                            let conditions = 'orders.table_no="' + currentTableNo + '" AND orders.status=2';
                            var orders = this.Order.getOrdersSummary(conditions, true);

                            if (orders.length > 0) {

                                // recall order
                                let index = Math.floor(Math.random() * orders.length);
                                let orderId = orders[index].Order.id;

                                if (guestCheckController.recallOrder(orderId)) {
                                    txn = cart._getTransaction();
                                    if (txn && txn.data) {
                                        if (txn.data.status == 0) {
                                            recalled = true;
                                            this.log('WARN', 'order recalled [' + txn.data.seq + '] status [' + txn.data.status + '] recall [' + txn.data.recall + ']');
                                        }
                                        else {
                                            this.log('WARN', 'skipping closed order [' + txn.data.seq + '] status [' + txn.data.status + '] recall [' + txn.data.recall + ']');
                                            txn = null;
                                        }
                                    }
                                    else {
                                        this.log('WARN', 'empty order recalled for orderId ['+ orderId + ']');
                                    }
                                }
                            }
                        }

                        if (!recalled && ordersOpened < count) {

                            // create a new order
                            if (currentTableNo > -1) {
                                if (guestCheckController.newTable(currentTableNo)) {
                                    txn = cart._getTransaction();
                                }
                            }
                            else if (noTable) {
                                txn = cart._getTransaction(true);
                            }

                            if (customerController && numCustomers > 0) {
                                let cIndex = Math.floor(numCustomers * Math.random());
                                if (cIndex >= numCustomers) cIndex = numCustomers - 1;

                                let customer = customers[cIndex];
                                txn = cart._getTransaction(true);
                                customerController.processSetCustomerResult(txn, {
                                    ok: true,
                                    customer: customer
                                });
                            }

                            if (txn) {
                                ordersOpened++;
                                this.log('WARN', 'new order opened [' + txn.data.seq + '] count [' + ordersOpened + '] status [' + txn.data.status + ']');

                                if (!noTable) {
                                    // assign number of guests
                                    txn.setNumberOfCustomers(parseInt(5 * Math.random() + 1));

                                    // assign check number if not auto-assigned
                                    if (txn.data.check_no == '') {
                                        txn.setCheckNo(++checkSeq % maxCheckNo);
                                    }
                                }
                            }
                        }

                        if (txn) {
                            // get current number of items
                            let itemCount = txn.data.qty_subtotal;
                            let itemsToAdd = items - itemCount;
                            let doStore = false;

                            if (ordersClosed >= count) {
                                doStore = true;
                            }
                            else if (itemsToAdd > 0) {
                                if (noTable) {
                                    doStore = Math.random() < 0.25;
                                }
                                else {
                                    doStore = Math.random() < 0.75;
                                }
                                if (store && doStore) {
                                    itemsToAdd = Math.min(itemsToAdd, Math.ceil(items * Math.random()));
                                }
                            }

                            // add items
                            for (let j = 0; j < itemsToAdd; j++) {

                                // select an item with no condiments from product list
                                var pindex = Math.floor(numProds * Math.random());
                                if (pindex >= numProds) pindex = numProds - 1;

                                var item = this.Product.getProductById(products[pindex].id);
                                if (item.force_condiment) {
                                    item.force_condiment = false;
                                }
                                if (item.force_memo) {
                                    item.force_memo = false;
                                }

                                // add to cart
                                $do('addItem', item, 'Cart');

                                // delay
                                this.sleep(100);

                                while (cart._pendingAddItemEvents.length > 0) {
                                    // wait for addItem to complete
                                    this.sleep(200);
                                }
                            }

                            this.sleep(1000);

                            if (store && doStore) {

                                // instrument storeCheck
                                let start = new Date().getTime();

                                $do('storeCheck', null, 'Cart');

                                // instrument storeCheck
                                let elapsed = (new Date().getTime()) - start;
                                this._loadTestStoreDataSet.push(elapsed);
                                this._loadTestStoreTotalTime += elapsed;
                                this._loadTestStoreCount++;

                                if (elapsed > this._loadTestStoreMax || this._loadTestStoreMax == -1) this._loadTestStoreMax = elapsed;
                                if (elapsed < this._loadTestStoreMin || this._loadTestStoreMin == -1) this._loadTestStoreMin = elapsed;

                                if (noTable) {
                                    this.log('WARN', 'storing order [' + txn.data.seq + '] count [' + ordersClosed + '] status [' + txn.data.status + '] recall [' + txn.data.recall + '] store [' + store + ']');
                                    progressBar.value = (++ordersClosed * 100) / count;
                                    this.log('WARN', 'order stored [' + txn.data.seq + '] count [' + ordersClosed + '] status [' + txn.data.status + '] recall [' + txn.data.recall + ']');
                                }
                            }
                            else if (txn.data.qty_subtotal >= items || noTable) {
                                this.log('WARN', 'closing order [' + txn.data.seq + '] count [' + ordersClosed + '] status [' + txn.data.status + '] recall [' + txn.data.recall + '] qty [' + txn.data.qty_subtotal + ']');

                                // instrument cash
                                let start = new Date().getTime();

                                $do('cash', ',1,', 'Cart');

                                // instrument cash
                                let elapsed = (new Date().getTime()) - start;
                                this._loadTestFinalizeDataSet.push(elapsed);
                                this._loadTestFinalizeTotalTime += elapsed;
                                this._loadTestFinalizeCount++;

                                if (elapsed > this._loadTestFinalizeMax || this._loadTestFinalizeMax == -1) this._loadTestFinalizeMax = elapsed;
                                if (elapsed < this._loadTestFinalizeMin || this._loadTestFinalizeMin == -1) this._loadTestFinalizeMin = elapsed;

                                // update progress bar for order closed
                                if (txn.data.status == 1 || noTable) {
                                    progressBar.value = (++ordersClosed * 100) / count;
                                    this.log('WARN', 'order closed [' + txn.data.seq + '] count [' + ordersClosed + '] status [' + txn.data.status + '] recall [' + txn.data.recall + ']');
                                }
                                else {
                                    this.log('WARN', 'order not closed [' + txn.data.seq + '] count [' + ordersClosed + '] status [' + txn.data.status + '] recall [' + txn.data.recall + ']');
                                }
                            }
                            else {
                                // instrument storeCheck
                                let start = new Date().getTime();

                                $do('storeCheck', null, 'Cart');

                                // instrument storeCheck
                                let elapsed = (new Date().getTime()) - start;
                                this._loadTestStoreDataSet.push(elapsed);
                                this._loadTestStoreTotalTime += elapsed;
                                this._loadTestStoreCount++;

                                if (elapsed > this._loadTestStoreMax || this._loadTestStoreMax == -1) this._loadTestStoreMax = elapsed;
                                if (elapsed < this._loadTestStoreMin || this._loadTestStoreMin == -1) this._loadTestStoreMin = elapsed;

                                this.log('WARN', 'order not closed pending additem queue [' + txn.data.seq + '] count [' + ordersClosed + '] status [' + txn.data.status + '] recall [' + txn.data.recall + '] qty [' + txn.data.qty_subtotal + ']');
                            }
                        }
                        else {
                            // did not find an available order on the current table; do a small delay and retry
                            this.sleep(100);
                        }
                    }
                    else {
                        // did not find an active table; do a small delay and retry
                        this.sleep(100);
                    }
                    // GC & delay
                    GREUtils.gc();
                }
            }
            catch(e) {
                this.log('ERROR', 'exception caught [' + e + ']');
                var exec = new GeckoJS.File('/tmp/vmstat.sh');
                if (exec.exists()) {
                    var r = exec.run([], true);
                    exec.close();
                    this.log('ERROR', 'vmstat captured to /tmp/vmstat');
                }
            }
            finally {
                waitPanel.hidePopup();
                progressBar.mode = 'undetermined';

                if (this._loadTestStoreCount > 0) {

                    // compute standard deviations
                    let std = 0;
                    let avg = this._loadTestStoreTotalTime / this._loadTestStoreCount;
                    if (this._loadTestStoreCount > 1) {
                        let sum = 0;
                        this._loadTestStoreDataSet.forEach(function(val) {
                            sum += Math.pow((val - avg), 2);
                        })
                        std = Math.sqrt(sum / (this._loadTestStoreCount - 1));
                    }
                    this.log('FATAL', 'Statistics: storeCheck count: [' + this._loadTestStoreCount + '], average duration: [' + avg + ']');
                    this.log('FATAL', 'Statistics: storeCheck min duration: [' + this._loadTestStoreMin + '], max duration: [' + this._loadTestStoreMax + '] std [' + std + ']');
                }

                if (this._loadTestFinalizeCount > 0) {

                    // compute standard deviations
                    let std = 0;
                    let avg = this._loadTestFinalizeTotalTime / this._loadTestFinalizeCount;
                    if (this._loadTestFinalizeCount > 1) {
                        let sum = 0;
                        this._loadTestFinalizeDataSet.forEach(function(val) {
                            sum += Math.pow((val - avg), 2);
                        })
                        std = Math.sqrt(sum / (this._loadTestFinalizeCount - 1));
                    }
                    this.log('FATAL', 'Statistics: cash count: [' + this._loadTestFinalizeCount + '], average duration: [' + this._loadTestFinalizeTotalTime / this._loadTestFinalizeCount + ']');
                    this.log('FATAL', 'Statistics: cash min duration: [' + this._loadTestFinalizeMin + '], max duration: [' + this._loadTestFinalizeMax + '] std [' + std + ']');
                }
            }
        }

    };

    AppController.extend(__controller__);
})();
