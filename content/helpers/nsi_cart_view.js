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

        },

        setTransaction: function(transaction) {
            this._data = [];
            this._transaction = transaction;
            transaction.view = this;
            this._cartList.datasource = this;
            // last seq
            this._cartList.currentIndex = (transaction.data.display_sequences.length -1);
            GeckoJS.Session.set('vivipos_fec_order_sequence', transaction.data.seq);


        },

        getSelectedIndex: function() {
            return this._cartList.currentIndex;
        },

        rowCountChanged: function(rc1, rc2, newIndex) {

            // lazy way ? full refresh
            var oldIndex = this._cartList.currentIndex;

            // standard way, update rowCountChanged event.
            /*
            if (rc1 != rc2) {
                this.tree.rowCountChanged(rc1,rc2-rc1);
            }else {
                this.tree.invalidate();
            }*/
            if (rc2 < 0) rc2 = this.data.length;

            if (rc1 != rc2) {
                // lazy way ? full refresh
                this._cartList.datasource = this;

                /*
                if (jumpToLast) newIndex = rc2 - 1;
                else {
                    if (oldIndex == rc1 - 1) newIndex = rc2 - 1;
                    else newIndex = oldIndex;
                }
                */
                if (newIndex < 0) newIndex = (this.data.length > 0) ? 0 : -1;
                else if (newIndex >= this.data.length) newIndex = this.data.length - 1;

                this.tree.view.selection.currentIndex = newIndex;
                this.tree.view.selection.select(newIndex);
                this.tree.ensureRowIsVisible(newIndex);
            }else {
                this.tree.invalidate();
                //this.tree.ensureRowIsVisible(oldIndex);
                //this.tree.view.selection.currentIndex = oldIndex;
                //this.tree.view.selection.select(oldIndex);
            }

        },
/*
        getCellText: function(row, col) {
            return 'abiowcasdsadasdasdsadasdiii';
        },
*/
        getCellProperties: function(row, col, prop) {
            var aserv=Components.classes["@mozilla.org/atom-service;1"].
                      getService(Components.interfaces.nsIAtomService);
            switch(col.id) {
                case 'name':
                    prop.AppendElement(aserv.getAtom('treecellProduct'));
                    break;

                case 'current_qty':
                    prop.AppendElement(aserv.getAtom('treecellQty'));
                    break;

                case 'current_price':
                    prop.AppendElement(aserv.getAtom('treecellUnitPrice'));
                    break;

                case 'current_subtotal':
                    prop.AppendElement(aserv.getAtom('treecellSubtotal'));
                    break;

                case 'current_tax':
                    prop.AppendElement(aserv.getAtom('treecellTax'));
                    break;
            }
        },

        /*
        getCellProperties: function(row,col,props){

            var data = this.getCurrentIndexData(row);
            if (data.name == "** TRAY") {
                var aserv=Components.classes["@mozilla.org/atom-service;1"].
                          getService(Components.interfaces.nsIAtomService);
                props.AppendElement(aserv.getAtom("treecellTRAY"));
            } else if (data.name == "** SUBTOTAL") {
                var aserv=Components.classes["@mozilla.org/atom-service;1"].
                          getService(Components.interfaces.nsIAtomService);
                props.AppendElement(aserv.getAtom("treecellSUBTOTAL"));
            } else if (data.name == "** TOTAL") {
                var aserv=Components.classes["@mozilla.org/atom-service;1"].
                          getService(Components.interfaces.nsIAtomService);
                props.AppendElement(aserv.getAtom("treecellTOTAL"));
            }
        },
        */

        getRowProperties : function(row, props){
            if (this._old_row == row) return;

            var data = this.getCurrentIndexData(row);
            if (data.name == "** TRAY") {
                var aserv=Components.classes["@mozilla.org/atom-service;1"].
                          getService(Components.interfaces.nsIAtomService);
                props.AppendElement(aserv.getAtom("treeTRAY"));
            } else if (data.name == "** SUBTOTAL") {
                var aserv=Components.classes["@mozilla.org/atom-service;1"].
                          getService(Components.interfaces.nsIAtomService);
                props.AppendElement(aserv.getAtom("treeSUBTOTAL"));
            } else if (data.name == "** TOTAL") {
                var aserv=Components.classes["@mozilla.org/atom-service;1"].
                          getService(Components.interfaces.nsIAtomService);
                props.AppendElement(aserv.getAtom("treeTOTAL"));
            }
            this._old_row = row;
        },

        //getRowProperties : function(row,props){},
        //getColumnProperties : function(column,columnElement,props){},
        //getCellProperties : function(row,column,props){},

        getLevel: function(row) {
            return this.data[row].level;
        },

        getCurrentIndexData: function (row) {
            return this.data[row];
        }


    });

})();
