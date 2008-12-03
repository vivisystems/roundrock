(function() {

    var NSICartView = window.NSICartView = GeckoJS.NSITreeViewArray.extend({
        
        name: 'NSICartView',
        _cartList: null,
        _transaction: null,
        _emptyArrayView: null,

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

        rowCountChanged: function(rc1, rc2) {
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

                this.tree.ensureRowIsVisible(rc2-1);
                this.tree.view.selection.currentIndex = rc2-1;
                this.tree.view.selection.select(rc2-1);
            }else {
                this.tree.invalidate();
                //this.tree.ensureRowIsVisible(oldIndex);
                //this.tree.view.selection.currentIndex = oldIndex;
                //this.tree.view.selection.select(oldIndex);
            }

        },

        getLevel: function(row) {
            return this.data[row].level;
        },

        getCurrentIndexData: function (row) {
            return this.data[row];
        }


    });

})();
