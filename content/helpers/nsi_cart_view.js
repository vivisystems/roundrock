(function() {

    var NSICartView = window.NSICartView = GeckoJS.NSITreeViewArray.extend({
        
        name: 'NSICartView',
        _cartList: null,
        _transaction: null,
        _emptyArrayView: null,
        _old_row: null,

        init: function(domId) {
            this._data = [];
            this._emptyArrayView = new GeckoJS.NSITreeViewArray([]);
            this._cartList = document.getElementById('cartList');
        },


        empty: function() {
            // display empty cart list tree
            // use empty view for quick support
            this._cartList.datasource = this._emptyArrayView;
            GeckoJS.Session.set('vivipos_fec_order_sequence', '');
            GeckoJS.Session.set('vivipos_fec_number_of_items', '');
            GeckoJS.Session.set('vivipos_fec_tax_total', '');
            GeckoJS.Session.set('vivipos_fec_check_number', '');
            GeckoJS.Session.set('vivipos_fec_table_number', '');
            GeckoJS.Session.set('vivipos_fec_current_table_seat', '');
            GeckoJS.Session.set('vivipos_fec_number_of_customers', '');
            GeckoJS.Session.set('vivipos_fec_order_destination', '');


        },

        setTransaction: function(transaction) {
            this._data = [];
            this._transaction = transaction;
            transaction.view = this;
            this._cartList.datasource = this;
            // last seq
            this._cartList.currentIndex = (transaction.data.display_sequences.length -1);
            GeckoJS.Session.set('vivipos_fec_order_sequence', transaction.data.seq);
            GeckoJS.Session.set('vivipos_fec_check_number', transaction.data.check_no);
            GeckoJS.Session.set('vivipos_fec_table_number', transaction.data.table_no);
            GeckoJS.Session.set('vivipos_fec_current_table_seat', (transaction.data.table_no? 1 : ''));
            GeckoJS.Session.set('vivipos_fec_number_of_customers', transaction.data.no_of_customers || '');
            GeckoJS.Session.set('vivipos_fec_order_destination', transaction.data.destination);
            GeckoJS.Session.set('vivipos_fec_number_of_items', transaction.data.qty_subtotal || '');
        },

        getSelectedIndex: function() {
            return this._cartList.currentIndex;
        },

        rowCountChanged: function(rc1, rc2, newIndex) {

            var oldIndex = this._cartList.currentIndex;

            //GREUtils.log('rowCountChanged 1: ' + oldIndex + ', ' + rc1 + ', ' + rc2 + ', ' + newIndex);
            if (rc1 < 0) {
                rc1 = 0;
                oldIndex = 0;
            }
            if (oldIndex < 0) {
                oldIndex = 0;
            }
            if (rc2 < 0) rc2 = this.data.length;
            if (newIndex == null) newIndex = this.data.length - 1;
            if (rc1 != rc2) {
                this.tree.rowCountChanged(oldIndex, rc2 - rc1);
            }
            // doing so to redraw the tree.
            this._cartList.invalidate();

            if (newIndex < 0) newIndex = (this.data.length > 0) ? 0 : -1;
            else if (newIndex >= this.data.length) newIndex = this.data.length - 1;

            this._cartList.view.selection.select(newIndex);
            this._cartList.ensureRowIsVisible(newIndex);
        },
        
        getCellProperties: function(row, col, prop) {
            var data = this.getCurrentIndexData(row);
            var aserv=Components.classes['@mozilla.org/atom-service;1'].
                      getService(Components.interfaces.nsIAtomService);

            if (data.batchMarker) {
                prop.AppendElement(aserv.getAtom('batchMarker'));
            }

            // set cell properties to allow CSS to be applied
            this.getRowProperties(row, prop);

            switch(col.id) {
                case 'tag':
                    if (data.type == 'item' || data.type == 'setitem') {
                        if (data.tagged) {
                            prop.AppendElement(aserv.getAtom('treecellTagged'));
                        }
                        else {
                            prop.AppendElement(aserv.getAtom('treecellUntagged'));
                        }
                    }
                    break;

                case 'label':
                    prop.AppendElement(aserv.getAtom('treecellLabel'));
                    break;

                case 'seat_no':
                    prop.AppendElement(aserv.getAtom('treecellSeatNo'));
                    break;

                case 'name':
                    if (data.type == 'condiment') {
                        prop.AppendElement(aserv.getAtom('treecellCondiment'));
                    }
                    else {
                        prop.AppendElement(aserv.getAtom('treecellProduct'));
                    }
                    break;

                case 'current_qty':
                    prop.AppendElement(aserv.getAtom('treecellQty'));
                    break;

                case 'current_price':
                    prop.AppendElement(aserv.getAtom('treecellUnitPrice'));
                    break;

                case 'current_subtotal':
                    prop.AppendElement(aserv.getAtom('treecellSubtotal'));
                    if (data.price_modifier > 1) {
                        prop.AppendElement(aserv.getAtom('surchargeApplied'));
                    }
                    else if (data.price_modifier < 1) {
                        prop.AppendElement(aserv.getAtom('discountApplied'));
                    }
                    break;

                case 'current_tax':
                    prop.AppendElement(aserv.getAtom('treecellTax'));
                    break;
            }
        },

        getRowProperties : function(row, props){
            var data = this.getCurrentIndexData(row);
            var aserv=Components.classes['@mozilla.org/atom-service;1'].
                      getService(Components.interfaces.nsIAtomService);
            if (data.type == 'tray') {
                props.AppendElement(aserv.getAtom('treeTRAY'));
            } else if (data.type == 'subtotal') {
                props.AppendElement(aserv.getAtom('treeSUBTOTAL'));
            } else if (data.type == 'total') {
                props.AppendElement(aserv.getAtom('treeTOTAL'));
            } else if (data.returned) {
                props.AppendElement(aserv.getAtom('treeReturnItem'));
            } else if (parseFloat(data.current_qty.replace('X', '')) < 0) {
                props.AppendElement(aserv.getAtom('treeRefundItem'));
            } else if (data.stock_status == '0') {
                props.AppendElement(aserv.getAtom('treeLowStock'));
            } else if (data.stock_status == '-1') {
                props.AppendElement(aserv.getAtom('treeOutofStock'));
            } else if (data.age_verification == '1') {
                props.AppendElement(aserv.getAtom('treeVerifyAge'));
            }
            if (data.batchMarker) {
                props.AppendElement(aserv.getAtom('batchMarker'));
            }
            else {
                props.AppendElement(aserv.getAtom('regular'));
            }
        },

        getCellValue: function(row, col) {

            var sResult;
            var key;
            try {
                key = col.id;
                var data = this.data[row];
                if (key == 'row') {
                    sResult = 1 + parseInt(row);
                }
                else if (key == 'price_level') {
                    // display price level only if current price exists
                    sResult = '';
                    if (data.type == 'item' && data.current_price != '' && data.price_level != '') {
                            sResult = '[' + data.price_level + ']';
                    }
                }
                else
                    sResult = this.data[row][key] || '';
            }
            catch (e) {
                sResult =  '';
            }
            return sResult;

        },


        getLevel: function(row) {
            return this.data[row].level;
        },

        isContainer: function(row) {
            var itemDisplay = this.data[row];

            // is a container only if this is the first condiment
            var result = false;
            if (itemDisplay.type == 'condiment') {

                result = true;
                // look back through data to see if another condiment exists
                for (var i = row - 1; i >= 0; i--) {
                    var item = this.data[i];
                    //this.log('checking item [' + item.type + ']: ' + item.name);
                    if (item.type == 'item' || item.type == 'setitem') {
                        break;
                    }
                    else if (item.type == 'condiment') {
                        result = false;
                        break;
                    }
                }
            }

            //this.log('isContainer [' + itemDisplay.name + ' (' + row + ')]: ' + result);
            return result;
        },

        toggleOpenState: function(row) {
           
            var itemDisplay = this.data[row];
            if (itemDisplay.open) {
                this._transaction.collapseCondiments(row);
            }
            else {
                this._transaction.expandCondiments(row);
            }
            // need to save transaction state
            if (this._transaction) {
                Transaction.serializeToRecoveryFile(this._transaction);
            }
        },

        isContainerOpen: function(row) {
            return this.data[row].open;
        },

        isContainerEmpty: function(row) {
            return false;
        },

        hasNextSibling: function(row, afterIndex) {
            return false;
        },

        getParentIndex: function(row) {
            return -1;
        },
        
        getCurrentIndexData: function (row) {
            return this.data[row];
        }


    });

})();
