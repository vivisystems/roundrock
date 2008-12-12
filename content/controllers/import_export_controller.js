(function(){

    /**
     * Class ViviPOS.ImportExportController
     */

    GeckoJS.Controller.extend( {
        name: 'ImportExport',
        scaffold: true,
        uses: ["Product"],
	
        _listObj: null,
        _listDatas: null,
        _selectedIndex: 0,
        _productsById: null,
        _barcodesIndexes: null,
        _datas: null,
        _importDir: null,
        _exportDir: null,
        _finish: false,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('previewscrollablepanel');
            // this._productsById = GeckoJS.Session.get('productsById');
            // this._barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            }
            return this._listObj;
        },

        importPlu: function(data) {
            var self = this;
            var lines = GREUtils.File.readAllLine('/home/achang/workspace/tt2/plu-u8.csv');
            var products = GeckoJS.Session.get('products');
            var productTpl = GREUtils.extend({}, products[0]);

            delete productTpl.id;
            delete productTpl.created;
            productTpl.visible = true;
            productTpl.halo1 = 0;
            productTpl.lalo1 = 0;

            var cate_no = '999';
            var pad = 8; // GeckoJS.String.padLeft

            var trimQuote = function(str) {

                return str.substr(1, str.length-2);
            };

            var prodTmp = new ProducttmpModel();

            var i = 0;
            var nCount = lines.length;
            var datas = [];
            var progmeter = document.getElementById("importprogressmeter");
            var progress = 0;
            progmeter.value = progress;
            progmeter.max = nCount;

            var thread = new GeckoJS.Thread();

            var mainRunnable = {
                run: function() {

                    progmeter.value = i;

                    /*
                    if (self._finish) {
                        self._listDatas = datas;
                        var panelView =  new GeckoJS.NSITreeViewArray(self._listDatas);
                        self.getListObj().datasource = panelView;
                    }
                    */

                },

                QueryInterface: function(iid) {
                    if (iid.equals(Components.Interfaces.nsIRunnable) || iid.equals(Components.Interfaces.nsISupports)) {
                        return this;
                    }
                    throw Components.results.NS_ERROR_NO_INTERFACE;
                }
            };


            var workerRunnable = {
                run: function() {


                    try {
                        var oldLimit = GREUtils.Pref.getPref('dom.max_chrome_script_run_time');
                        GREUtils.Pref.setPref('dom.max_chrome_script_run_time', 5 * 60);


                        lines.forEach(function(buf) {
                            var dats = buf.split(',');
                            var barcode = trimQuote(dats[0]);
                            var name = trimQuote(GREUtils.Charset.convertToUnicode(dats[1], 'UTF-8'));
                            var price = parseFloat(trimQuote(dats[2])) + 0;
                            var no = cate_no + GeckoJS.String.padLeft(i, pad);

                            /// notify main
                            thread.main.dispatch(mainRunnable, thread.main.DISPATCH_NORMAL);

                    
                            var product = GREUtils.extend({}, productTpl);
                            product = GREUtils.extend(product, {
                                no: no,
                                cate_no: cate_no,
                                name: name,
                                barcode: barcode,
                                price_level1: price,
                                level_enable1: true
                            });

                            var id = GeckoJS.String.uuid() + "";
                            product.id = id +"";

                            datas.push(product);

                            prodTmp.save(product);
                    
                            i++;

                        }, this);


                    }
                    catch (e) {}
                    finally {
                        GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);
                    }



                },

                QueryInterface: function(iid) {
                    if (iid.equals(Components.Interfaces.nsIRunnable) || iid.equals(Components.Interfaces.nsISupports)) {
                        return this;
                    }
                    throw Components.results.NS_ERROR_NO_INTERFACE;
                }
            };

            self._finish = false;
            thread._runnable = workerRunnable;
            thread.start();

        //                this._listDatas = datas;
        //                var panelView =  new GeckoJS.NSITreeViewArray(this._listDatas);
        //                this.getListObj().datasource = panelView;

        },

        load: function (data) {
            this._importDir = GeckoJS.Configure.read('vivipos.fec.settings.database.importdir');
            this._exportDir = GeckoJS.Configure.read('vivipos.fec.settings.database.exportdir');
            if (!this._importDir) this._importDir = '/media/disk/database_import/';
            if (!this._exportDir) this._exportDir = '/media/disk/database_export/';
        },

        select: function(index){
        /*
            if (index >= 0) {
                // var item = this._listDatas[index];
                var item = this._datas[index];
                this._selectedIndex = index;
            }
            */
        }
    });


})();

