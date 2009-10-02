(function(){
    /**
     * NSITableBookingsView View is support for controll panel  maintaince use.
     **/
    var NSITableBookingsView = window.NSITableBookingsView = GeckoJS.NSITreeViewArray.extend( {

        name: 'NSITableBookingsView',

        regionsById: null,

        init: function(data) {

            this._data = data || [];

        },

        setRegions: function(regions) {
            var regionsById = {};
            regions.forEach(function(region, i) {
                regionsById[region.id] = region ;
            });
            this.regionsById = regionsById;
        },

        getRegions: function() {
            return this.regionsById;
        },

        getTableBooking: function (index) {

            index = index || this.tree.selectedIndex;
            
            return this.data[index];
            
        },

        getCellValue: function(row, col) {

            let value = '';
            switch(col.id) {
                case 'booking': 
                    let bt = this.data[row]['TableBooking']['booking'];
                    value = (new Date(bt*1000)).toString('yyyy/MM/dd HH:mm:ss');
                    break;
                case 'table_no':
                    value = this.data[row]['Table']['table_no'];
                    break;
                default:
                    value = this.data[row]['TableBooking'][col.id];
                    break;
            }
            return value;

        }


    });

})();

