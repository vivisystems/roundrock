(function() {

    var NSIQueuesView = window.NSIQueuesView = GeckoJS.NSITreeViewArray.extend({

        name: 'NSIQueuesView' ,

        init: function(data) {

            this._data = data || [];
            
        },

        getCellValue: function(row, col) {

            var sResult;
            var key;

            try {
                key = col.id;
                if (key == 'label') {
                    var created = this.data[row]['created']*1000 || 0;
                    var d = new Date(created).toString("HH:mm");

                    sResult = d + ' : ' + this.data[row]['user'];
                }
                else
                    sResult = this.data[row][key] || "";
            }
            catch (e) {
                sResult =  "";
            }
            return sResult;

        }

    });

})();
