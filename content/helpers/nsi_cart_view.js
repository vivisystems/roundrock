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

        rowCountChanged: function(rc1, rc2, jumpToLast) {

            // lazy way ? full refresh
            var oldIndex = this._cartList.currentIndex;
            var newIndex;

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

                if (jumpToLast) newIndex = this.data.length - 1;
                else {
                    if (rc2 >= rc1) newIndex = oldIndex + rc2 - rc1;
                    else newIndex = oldIndex - 1;
                }

                if (newIndex < 0) newIndex = (this.data.length > 0) ? 0 : -1;
                else if (newIndex >= this.data.length) newIndex = this.data.length - 1;

                this.tree.ensureRowIsVisible(newIndex);
                this.tree.view.selection.currentIndex = newIndex;
                this.tree.view.selection.select(newIndex);
            }else {
                this.tree.invalidate();
                //this.tree.ensureRowIsVisible(oldIndex);
                //this.tree.view.selection.currentIndex = oldIndex;
                //this.tree.view.selection.select(oldIndex);
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

        getRowProperties : function(row,props){
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
            this._ord_row = row;
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
