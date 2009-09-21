(function(){
    /**
     * Tables View is support for controll panel  maintaince use.
     **/
    var NSITablesView = window.NSITablesView = GeckoJS.NSITreeViewArray.extend( {

        name: 'NSITablesView',

        regionsById: null,

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

        getCellValue: function(row, col) {

            let value = '';
            switch(col.id) {
                default:
                    value = this.data[row][col.id];  
                    break;
                case 'region':
                    let regionId = this.data[row]['table_region_id'];
                    let region = this.getRegions()[regionId];
                    if(region) value = region.name;
                    break;
            }
            return value;

        }


    });

})();

