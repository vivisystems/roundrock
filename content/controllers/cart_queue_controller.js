(function(){

    var __controller__ = {
        
        name: 'CartQueue',

        _queuePool: null,
        _queueFile: "/var/tmp/cart_queue.txt",
        _queueSession: "cart_queue_pool",
        _defaultQueueFile: "/var/tmp/cart_queue.txt",
        _defaultQueueSession: "cart_queue_pool",
        _trainingQueueFile: "/var/tmp/training_cart_queue.txt",
        _trainingQueueSession: "training_cart_queue_pool",

        _cartController: null,

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

            // add Observer for startTrainingMode event.
            var self = this;
            this.observer = GeckoJS.Observer.newInstance( {
                topics: [ "TrainingMode" ],

                observe: function( aSubject, aTopic, aData ) {
                    if ( aData == "start" ) {
                        self.startTraining( true );
                    } else if ( aData == "exit" ) {
                        self.startTraining( false );
                    }
                }
            } ).register();

        },

        destroy: function() {
            if (this.observer) this.observer.unregister();
        },

        isQueueEnable: function() {
            return true;
        },

        startTraining: function( isTraining ) {

            if ( isTraining ) {
                this._queueFile = this._trainingQueueFile;
                this._queueSession = this._trainingQueueSession;
            } else {
                GeckoJS.Session.remove( this._queueSession );
                this._queueFile = this._defaultQueueFile;
                this._queueSession = this._defaultQueueSession;
            }
            
        },

        /**
         *
         */
        removeQueueRecoveryFile: function() {

            // unserialize from fail recovery file
            var file = new GeckoJS.File(this._queueFile);
            if (!file.exists()) return false;
            file.remove();
            
            return true;

        },

        serializeQueueToRecoveryFile: function(queue) {

            // save serialize to fail recovery file
            var file = new GeckoJS.File(this._queueFile);
            file.open("w");
            file.write(GeckoJS.BaseObject.serialize(queue));
            file.close();
            delete file;

        },

        unserializeQueueFromRecoveryFile: function() {

            // unserialize from fail recovery file
            var file = new GeckoJS.File(this._queueFile);
            if (!file.exists()) return false;

            var data = null;
            file.open("r");
            data = GeckoJS.BaseObject.unserialize(file.read());
            file.close();
            // file.remove();
            delete file;

            this._queuePool = data;
            GeckoJS.Session.set(this._queueSession, this._queuePool);

            return true;

        },

        _getQueuePool: function() {

            this._queuePool = GeckoJS.Session.get(this._queueSession);
            if (this._queuePool == null) {
                this._queuePool = {
                    user: {},
                    data:{}
                };
                GeckoJS.Session.set(this._queueSession, this._queuePool);
            }

            return this._queuePool;

        },

        _hasUserQueue: function(user) {

            if (!user) return false;

            var queuePool = this._getQueuePool();

            var username = user.username;

            if(!queuePool.user[username] || queuePool.user[username].constructor.name != 'Array') {
                return false;
            } else {
                return (queuePool.user[username].length >0);
            }

        },

        _removeUserQueue: function(user) {

            if ( !this._hasUserQueue( user ) ) return 0;

            var removeCount = 0;
            var queuePool = this._getQueuePool();
            var username = user.username;

            queuePool.user[username].forEach(function(key){

                // just delete queue
                if(queuePool.data[key]) delete queuePool.data[key];

                removeCount++;

            }, this);

            delete queuePool.user[username];

            this.serializeQueueToRecoveryFile(queuePool);

            return removeCount;

        },

        _removeQueueByKey: function(key) {

            var queuePool = this._getQueuePool();

            if (queuePool.data[key]) delete queuePool.data[key];

            for (var user in queuePool.user) {

                var userQueues = queuePool.user[user];

                var idx = GeckoJS.Array.inArray(key, userQueues);

                if (idx != -1) {
                    userQueues.splice(idx, 1);
                }
            }
            this.serializeQueueToRecoveryFile(queuePool);
            
        },

        pushQueue: function(nowarning) {

            var cart = this.getCartController();
            var curTransaction = cart._getTransaction();

            if(! cart.ifHavingOpenedOrder() ) {
                if (!nowarning) {
                    NotifyUtils.warn(_('No order to queue'));
                    cart._clearAndSubtotal();
                }
                return;
            }

            if (curTransaction.data.recall == 2) {
                if (!nowarning) {
                    NotifyUtils.warn(_('Cannot queue the recalled order!!'));
                    cart._clearAndSubtotal();
                }
                return;
            }
            var user = this.Acl.getUserPrincipal();

            var count = curTransaction.getItemsCount();
            var key = '';
            var queuePool = this._getQueuePool();

            if (count > 0) {
                key = new Date().toString('hh:mm:ss') + ':' + user.username;

                // queue
                queuePool.data[key] = curTransaction.data;

                // update user queue status
                if(!queuePool.user[user.username]) queuePool.user[user.username] = [];
                queuePool.user[user.username].push(key);

                // only empty view ,
                // next added item will auto create new transaction
                curTransaction.emptyView();

                this.getKeypadController().clearBuffer();

                this.dispatchEvent('onQueue', curTransaction);

                GeckoJS.Session.remove('current_transaction');
                GeckoJS.Session.remove('cart_last_sell_item');
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.serializeQueueToRecoveryFile(queuePool);

                Transaction.removeRecoveryFile();
            }
            else {
                if (!nowarning) {
                    NotifyUtils.warn(_('Order is not queued because it is empty'));
                    cart._clearAndSubtotal();
                }
                return;
            }

        },

        _getQueueIdDialog: function() {

            var queuePool = this._getQueuePool();
            var queues = [];
            var confs = GeckoJS.Configure.read('vivipos.fec.settings');

            // check private queue
            if (confs.PrivateQueue) {
                var user = this.Acl.getUserPrincipal();

                if (user && user.username && queuePool.user[user.username]) {
                    queuePool.user[user.username].forEach(function(key) {
                        queues.push({
                            key: key
                        });
                    });
                }
            }
            else {
                for(var key in queuePool.data) {
                    queues.push({
                        key: key
                    });
                }
            }

            var dialog_data = {
                queues: queues,
                queuePool: queuePool
            };

            return $.popupPanel('selectQueuesPanel', dialog_data);

        },

        pullQueue: function(data) {

            var self = this;
            var cart = this.getCartController();

            return this._getQueueIdDialog().next(function(evt){

                var result = evt.data;

                if (!result.ok) return;

                var key = result.key;
                var queuePool = self._getQueuePool();

                // if has transaction push queue
                self.pushQueue(true);

                var data = queuePool.data[key];

                // remove from list;
                self._removeQueueByKey(key);

                var curTransaction = new Transaction(true);
                curTransaction.data = data ;

                cart._setTransactionToView(curTransaction);
                curTransaction.updateCartView(-1, -1);

                cart._clearAndSubtotal();

                self.serializeQueueToRecoveryFile(queuePool);

                self.dispatchEvent('afterPullQueue', curTransaction);
            });

        }

    };

    var CartQueueController = window.CartQueueController =  GeckoJS.Controller.extend(__controller__);

})();
