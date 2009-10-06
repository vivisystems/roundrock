(function(){

    /**
     * Class SplitCheckController
     */
    var __controller__ = {

        name: 'SplitCheck',
        
        _inputObj: null,
        _sourceOrder: null, 
        _sourcePanelView: null,

        _splitPanelView: null,
        _splitOrders: [] ,


        newMinimalTransaction: function() {

            let org = this._sourceOrder;
            let tran = new Transaction(true, true) ;

            tran.data.destination = org.data.destination;
            tran.data.destination_prefix = org.data.destination_prefix;
            tran.data.table_no = org.data.table_no;
            tran.data.no_of_customers = org.data.no_of_customers;
            tran.data.status = 0;
            tran.data.recall = 2;

            return tran;

        },

        selectSourceItem: function(index) {
            if (index == -1) return;
            let data = this._sourcePanelView.data[index];
            if (!data || data.level >0 || data.type != 'item') {
                // disabled
                document.getElementById('btn_addtosplit').disabled = true;
                document.getElementById('qty_modifier').value = 0 ;
            }else {
                let indexId = data.index ;
                let item = this._sourcePanelView.items[indexId];
                document.getElementById('qty_modifier').value = item.current_qty ;
                document.getElementById('qty_modifier').max =  item.current_qty;
                document.getElementById('qty_modifier').min = 1;
                document.getElementById('btn_addtosplit').disabled = (item.current_qty <= 0);
            }
            document.getElementById('btn_mergeto').disabled = true;
            document.getElementById('splitScrollablePanel').selectedIndex = -1;
            document.getElementById('splitScrollablePanel').view.selection.clearSelection();
        },

        selectSplitItem: function(index) {
            if (index == -1) return;
            
            let data = this._splitPanelView.data[index];
            if (!data || data.level >0) {
                // disabled
                document.getElementById('btn_mergeto').disabled = true;
                document.getElementById('qty_modifier').value = 0 ;
                document.getElementById('qty_modifier').max = 0 ;
                document.getElementById('qty_modifier').min = 0 ;
            }else {
                let indexId = data.index ;
                let item = this._splitPanelView.items[indexId];
                document.getElementById('qty_modifier').value = item.current_qty ;
                document.getElementById('qty_modifier').max =  item.current_qty;
                document.getElementById('qty_modifier').min = 1;
                document.getElementById('btn_mergeto').disabled = (item.current_qty <= 0);
            }
            document.getElementById('btn_addtosplit').disabled = true;
            document.getElementById('sourceScrollablePanel').selectedIndex = -1;
            document.getElementById('sourceScrollablePanel').view.selection.clearSelection();
        },


        createNewSplitOrder: function() {
            
            let count = this._splitOrders.length;
           
            this._splitOrders.push(this.newMinimalTransaction());

            document.getElementById('splitOrderTabs').appendItem(_("SP#") + (count+1), count);
            
        },

        selectSplitOrder: function(index) {

            var panelView2 = this._splitPanelView;
            panelView2.setTransaction(this._splitOrders[index]);
            
        },
        
        addToSplit: function(index) {

            let qty = document.getElementById('qty_modifier').value;
            let splitIndex = document.getElementById('splitOrderTabs').selectedIndex;

            let sourceTran = this._sourceOrder;
            let targetTran = this._splitOrders[splitIndex];


            targetTran.moveCloneItem(sourceTran, index, qty);

            var panelView = this._sourcePanelView;
            var panelView2 = this._splitPanelView;

            panelView.setTransaction(sourceTran);
            panelView2.setTransaction(targetTran);

            index = (index > panelView.data.length ) ? 0 : index;
            document.getElementById('sourceScrollablePanel').selectedIndex = index;
            this.selectSourceItem(index);
            this.log(this.dump(sourceTran.data));
            this.log(this.dump(targetTran.data));


        },

        mergeTo: function(index) {

            let qty = document.getElementById('qty_modifier').value;
            let splitIndex = document.getElementById('splitOrderTabs').selectedIndex;

            let sourceTran = this._sourceOrder;
            let targetTran = this._splitOrders[splitIndex];

            sourceTran.moveCloneItem(targetTran, index, qty);

            var panelView = this._sourcePanelView;
            var panelView2 = this._splitPanelView;

            panelView.setTransaction(sourceTran);
            panelView2.setTransaction(targetTran);

            index = (index > panelView2.data.length ) ? 0 : index;
            document.getElementById('splitScrollablePanel').selectedIndex = index;
            this.selectSplitItem(index);
            this.log(this.dump(sourceTran.data));
            this.log(this.dump(targetTran.data));


        },

        autoSplitByMarkers: function() {
            
            let splitIndex = -1;

            let sourceTran = this._sourceOrder;
            let targetTran = null;

            let firstMark = false;


            let splitObj = document.getElementById('splitOrderTabs');
            while (splitObj.itemCount >0) {
                splitObj.removeItemAt(0);
            }
            this._splitOrders = [];

            
            for(let i=0; i < sourceTran.data.display_sequences.length; i++) {
                let data = sourceTran.data.display_sequences[i] ;

                let type = data.type;
                if (type == 'tray') {
                    firstMark = true;
                    splitIndex++;
                    targetTran = this._splitOrders[splitIndex] = this.newMinimalTransaction();
                    splitObj.appendItem(_("SP#") + (splitIndex+1), splitIndex);

                }else if (type == 'item'){
                    
                    if (!firstMark) continue;

                    let item = sourceTran.data.items[data.index];

                    targetTran.moveCloneItem(sourceTran, i, item.current_qty);
                    i--;
                }
                
            }

            // remove all markers
            for(let i=0; i < sourceTran.data.display_sequences.length; i++) {
                let data = sourceTran.data.display_sequences[i] ;

                let type = data.type;
                if (type == 'tray') {
                    sourceTran.voidItemAt(i) ;
                    i--;
                }
            }

            var panelView = this._sourcePanelView;
            var panelView2 = this._splitPanelView;

            panelView.setTransaction(sourceTran);

            splitObj.selectedIndex = 0;
            panelView2.setTransaction(this._splitOrders[0]);

        },


        confirm: function() {

            // check split status
            let splitCount = this._splitOrders.length ;
            let sourceTran = this._sourceOrder;
            var inputObj = window.arguments[0];

            

            let splitDatas = [] ;

            for(let i in  this._splitOrders) {
                let data = this._splitOrders[i];

                if (data.data.items_count == 0) continue;

                splitDatas.push(data.data) ;
                
            }
            
            if (splitCount == 1 && sourceTran.data.items_count == 0 || splitDatas.length == 0) {
                return this.cancel();
            }else {
                
                if (GREUtils.Dialog.confirm(this.topmostWindow,
                    _('confirm split'),
                    _('Are you sure you want to save all split checks')) == false) {
                    inputObj.ok = false;
                    window.close();
                    return;
                }

                inputObj.source_data = sourceTran.data;
                inputObj.split_datas = splitDatas;
                inputObj.ok = true;

                window.close();
            }

        },

        cancel: function() {
            var inputObj = window.arguments[0];
            if (GREUtils.Dialog.confirm(this.topmostWindow,
                _('confirm discard'),
                _('Are you sure you want to discard split checks')) != false) {
                inputObj.ok = false;
                window.close();
                return;
            }
        },


        load: function() {

            var inputObj = this._inputObj = window.arguments[0];
            let orgTransaction = inputObj.transaction;
            
            let newTransaction = new Transaction(true, true);
            newTransaction.data = orgTransaction.data;
            this._sourceOrder = newTransaction;

            var panelView = this._sourcePanelView = new NSISimpleCartView('sourceScrollablePanel');
            panelView.setTransaction(this._sourceOrder);

            document.getElementById('btn_addtosplit').disabled = true;
            document.getElementById('btn_mergeto').disabled = true;

            this.createNewSplitOrder();

            // set default splited order to 0
            document.getElementById('splitOrderTabs').selectedIndex = 0;
            var panelView2 = this._splitPanelView = new NSISimpleCartView('splitScrollablePanel');
            panelView2.setTransaction(this._splitOrders[0]);

        }

    };
    
    GeckoJS.Controller.extend(__controller__);

})();

