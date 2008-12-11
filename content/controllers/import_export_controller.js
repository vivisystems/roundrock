(function(){

    /**
     * Class ViviPOS.StocksController
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

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('previewscrollablepanel');
            // this._productsById = GeckoJS.Session.get('productsById');
            // this._barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            }
            return this._listObj;
        },

        importPlu: function(data) {
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
            var progress = 0; //parseInt(progmeter.value) + 10;
            progmeter.value = progress;
            progmeter.max = nCount;

            try {
                var oldLimit = GREUtils.Pref.getPref('dom.max_chrome_script_run_time');
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', 5 * 60);

            
                lines.forEach(function(buf) {
                    var dats = buf.split(',');
                    var barcode = trimQuote(dats[0]);
                    var name = trimQuote(GREUtils.Charset.convertToUnicode(dats[1], 'UTF-8'));
                    var price = parseFloat(trimQuote(dats[2])) + 0;
                    var no = cate_no + GeckoJS.String.padLeft(i, pad);
                

                    // progress = parseInt((i * 100) / nCount);
                    progmeter.value = i;
                
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
            
                this._listDatas = datas;
                var panelView =  new GeckoJS.NSITreeViewArray(this._listDatas);
                this.getListObj().datasource = panelView;

            } 
            catch (e) {}
            finally {
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);
            }

        },

        load: function (data) {
        // this.importPlu();
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

