(function() {

    var OrderHistoryView = window.OrderHistoryView = GeckoJS.NSITreeViewArray.extend({

        name: 'OrderHistoryView',

        _files: [],
        _data: [],

        init: function(dir) {

            this._data = [];
            this._files = [];
            var self = this;

            dir = dir || GeckoJS.Configure.read('vivipos.fec.settings.historyDatabasesPath') || '/data/history_databases';
            
            this._files = new GeckoJS.Dir.readDir(dir, {
                type: "f",
                name: /[\w]*[_]*vivipos_order.sqlite$/
            }).sort(function(a, b) {
                if (a.leafName < b.leafName) return 1; else if (a.leafName > b.leafName) return -1; else return 0;
            });

            var orderDbConfig = GeckoJS.Configure.read('DATABASE_CONFIG.order') || {database: 'vivipos_order.sqlite'};
            var periodSQL = "select max(modified) as modified from orders union select min(modified) as modified from orders";
            var countSQL = "select count(*) as total_orders from orders";
            
            this._files.forEach(function(o){
                try {

                    let filename = o.leafName;
                    let filesize = o.fileSize;
                    let dbConfig = GREUtils.extend({},orderDbConfig, {path: dir, database: filename});
                    let datasource = GeckoJS.ConnectionManager.getDataSourceByClass(dbConfig.classname, dbConfig);

                    let result = datasource.fetchAll(periodSQL);
                    let maxTime = 0;
                    let minTime = 0;
                    let total_orders = 0;
                    
                    if (result && result.length == 2) {
                        minTime = Math.min(result[0]['modified'], result[1]['modified']);
                        maxTime = Math.max(result[0]['modified'], result[1]['modified']);
                    }

                    let result2 = datasource.fetchAll(countSQL);
                    if (result2 && result2.length == 1) {
                        total_orders = result2[0]['total_orders'];
                    }

                    self._data.push({
                       dir: dir,
                       filename: filename,
                       filesize: filesize,
                       minTime: minTime,
                       maxTime: maxTime,
                       total_orders: total_orders,
                       display_filesize: GeckoJS.NumberHelper.toReadableSize(filesize),
                       display_minTime: new Date(minTime*1000).toString('yyyy-MM-dd HH:mm'),
                       display_maxTime: new Date(maxTime*1000).toString('yyyy-MM-dd HH:mm'),
                       display_total_orders: GeckoJS.NumberHelper.format(total_orders)
                    });
                } catch (e) {
                }
            });

        }

    });

})();
