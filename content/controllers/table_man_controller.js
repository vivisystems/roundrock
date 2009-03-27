(function(){

    /**
     * Class TableMapController
     */

    var __controller__ = {
        name: 'TableMan',
        _tables: [],

        _tableListDatas: null,

        _tableListObj: null,


        initial: function () {
            //
        },

        getTableListObj: function() {
            if(this._tableListObj == null) {
                this._tableListObj = document.getElementById('tablescrollabletree');
            }
            return this._tableListObj;
        },


        selectRegion: function(index) {
            //
            this.log('selectRegion...' + index);
            var tmap = document.getElementById('tmap');
            tmap.datasource = this._tables[index].data;
            var bgimage = this._tables[index].background;

            tmap.backgroundImage = bgimage;
            
            this.log(this.dump(this._tables));
        },

        load: function() {
            //
            var tableModel = new TableModel();
            var tables = tableModel.find('All');
            this._tables = tables;
            var tableView =  new GeckoJS.NSITreeViewArray(this._tables);
            this._getTableListObj().datasource = tableView;

        }

    };
    
    GeckoJS.Controller.extend(__controller__);

})();
