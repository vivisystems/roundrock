(function() {

    var NSISimpleCartView = window.NSISimpleCartView = GeckoJS.NSITreeViewArray.extend({
        
        name: 'NSISimpleCartView',
        
        _cartList: null,
        _transaction: null,
        _emptyArrayView: null,


        init: function(domId) {
            this._data = [];
            this._emptyArrayView = new GeckoJS.NSITreeViewArray([]);
            this._cartList = document.getElementById(domId);
        },


        empty: function() {
            // display empty cart list tree use empty view for quick support
            this._cartList.datasource = this._emptyArrayView;
        },


        setTransaction: function(transaction) {

            this._data = transaction.data.display_sequences;
            this._transaction = transaction;
            this._transaction.view = this;
            this._cartList.datasource = this;
            this._cartList.currentIndex = -1;
            this.tree.invalidate();
            
        },


        getSelectedIndex: function() {
            return this._cartList.currentIndex;
        },


        getCellValue: function(row, col) {

            var sResult;
            var key;

            try {
                key = col.id;
                if (key == 'row') {
                    sResult = 1 + parseInt(row);
                }
                else
                    sResult = this.data[row][key] || "";
            }
            catch (e) {
                sResult =  "";
            }
            return sResult;

        },


        getLevel: function(row) {
            return this.data[row].level;
        },

        
        getCurrentIndexData: function (row) {
            return this.data[row];
        },

        isSelectable: function(row, col) { dump('r'); return false; }


    });

})();
