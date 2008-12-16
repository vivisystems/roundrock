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
        _datas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('datasourcescrollablepanel');
            }
            return this._listObj;
        },

        importPlu: function(data) {
            var self = this;
            var lines = GREUtils.File.readAllLine(this._importDir + "/products_steven.csv");
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

            var prodTmp = new ProductModel();

            var i = 0;
            var nCount = lines.length;
            var datas = [];
            var progmeter = document.getElementById("datasprogressmeter");
            var progress = 0;
            progmeter.value = progress;
            // progmeter.max = nCount;

            var thread = new GeckoJS.Thread();

            var mainRunnable = {
                run: function() {

                    progmeter.value = i * 100 / nCount;

                    
                    if (self._finish) {
                        
                        alert("finish...");
                        self._listDatas = datas;

                        // var panelView =  new GeckoJS.NSITreeViewArray(self._listDatas);
                        // self.getListObj().datasource = panelView;

                    }
                    

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
                            prodTmp.begin();
                            prodTmp.save(product);
                            prodTmp.commit();
                            i++;

                        }, this);

                        self._finish = true;
                        thread.main.dispatch(mainRunnable, thread.main.DISPATCH_NORMAL);
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

        exportPlu: function () {
            //
            var prodTmp = new ProductModel();
            prodTmp.exportCSV(this._exportDir + "/products.csv", {
                // fields: "no,name",
                // fields: "id,cate_no,no,name,barcode,rate,cond_group,buy_price,stock,min_stock,memo,min_sale_qty,sale_unit,setmenu,level_enable1,price_level1,halo1,lalo1,level_enable2,price_level2,halo2,lalo2,level_enable3,price_level3,halo3,lalo3,level_enable4,price_level4,halo4,lalo4,level_enable5,price_level5,halo5,lalo5,level_enable6,price_level6,halo6,lalo6,level_enable7,price_level7,halo7,lalo7,level_enable8,price_level8,halo8,lalo8,level_enable9,price_level9,halo9,lalo9,link_group,auto_maintain_stock,return_stock,force_condiment,force_memo,single,visible,button_color,font_size,age_verification,created,modified"
                limit:9999
            });
            alert(_("export plu finish!"));
            
        },

        importData: function(model) {
//
            var datas = this.getListObj().value.split(',');

            var total;
            var progmeter = document.getElementById("datasprogressmeter");
            var exportprogress = function (value) {
                //
                // GREUtils.log('value:' + value);
                progmeter.value = Math.floor(value / total * 100);
            }

            var thread = new GeckoJS.Thread();

            var workerRunnable;
            
            // progmeter.max = datas.length;
            progmeter.value = 0;
            alert(datas.length);
            for(var k=0; k < datas.length; k++) {
                GREUtils.log(k);
                //
//                progmeter.value = (i / datas.length) * 100;

                var name = this._datas[datas[k]].name;
                var model = this._datas[datas[k]].model;

                if (model == "products") {
                    var tableTmp = new ProductModel();
                    var fileName = this._exportDir + "/products.csv";
                } else if (model == "departments") {
                    var tableTmp = new CategoryModel();
                    var fileName = this._exportDir + "/departments.csv";
                } else if (model == "plugroups") {
                    var tableTmp = new PlugroupModel();
                    var fileName = this._exportDir + "/plugroups.csv";
                } else if (model == "condimentgroups") {
                    var tableTmp = new CondimentGroupModel();
                    var fileName = this._exportDir + "/condimentgroups.csv";
                } else if (model == "condiments") {
                    var tableTmp = new CondimentModel();
                    var fileName = this._exportDir + "/condiments.csv";
                }

            
            // progmeter.value = 100;

            var trimQuote = function(str) {

                return str.substr(1, str.length-2);
            };

            var self = this;

            var tableTmp = null;
            var tableTpl = {};
            var lines = GREUtils.File.readAllLine(fileName);
            var fields = lines[0].split(',');
            lines.splice(0,1);

{
            for( var i = 0; i < fields.length; i++) {
                fields[i] = trimQuote(fields[i]);
            }
            
}

            // update progressbar...
            var mainRunnable = {
                run: function() {
                    progmeter.value = ii * 100 / nCount;

                    if (self._finish) {
                        // alert("finish...");
                        // self._listDatas = datas;
                    }
                },

                QueryInterface: function(iid) {
                    if (iid.equals(Components.Interfaces.nsIRunnable) || iid.equals(Components.Interfaces.nsISupports)) {
                        return this;
                    }
                    throw Components.results.NS_ERROR_NO_INTERFACE;
                }
            };

            var workerProducts = {
                run: function() {
                    /*
                    var currentThread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
                    try {
                            while(currentThread.hasPendingEvents()) currentThread.processNextEvent(true);
                    }
                    catch (e) {}
                    */
                    try {
                        //var oldLimit = GREUtils.Pref.getPref('dom.max_chrome_script_run_time');
                        //GREUtils.Pref.setPref('dom.max_chrome_script_run_time', 5 * 60);

                        lines.forEach(function(buf) {

                            var datas = buf.split(',');
                            var rowdata = GREUtils.extend({}, tableTpl);
                            for (var i=0; i < fields.length; i++) {
                                rowdata[fields[i]] = trimQuote(GREUtils.Charset.convertToUnicode(datas[i], 'UTF-8'));
                            }

                            /// notify main
                            thread.main.dispatch(mainRunnable, thread.main.DISPATCH_NORMAL);

                            tableTmp.id = rowdata.id
                            tableTmp.begin();
                            tableTmp.save(rowdata);
                            tableTmp.commit();
                            ii++;

                        }, this);
                        self._finish = true;
                        thread.main.dispatch(mainRunnable, thread.main.DISPATCH_NORMAL);
                    }
                    catch (e) {}
                    finally {
                        //GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);
                    }



                },

                QueryInterface: function(iid) {
                    if (iid.equals(Components.Interfaces.nsIRunnable) || iid.equals(Components.Interfaces.nsISupports)) {
                        return this;
                    }
                    throw Components.results.NS_ERROR_NO_INTERFACE;
                }
            };

            // Datas
            var workerDatas = {
                run: function() {
                    /*
                    var currentThread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
                    try {
                            while(currentThread.hasPendingEvents()) currentThread.processNextEvent(true);
                    }
                    catch (e) {}
                    */
                    try {
                        //var oldLimit = GREUtils.Pref.getPref('dom.max_chrome_script_run_time');
                        //GREUtils.Pref.setPref('dom.max_chrome_script_run_time', 5 * 60);

                        lines.forEach(function(buf) {

                            var datas = buf.split(',');
                            var rowdata = GREUtils.extend({}, tableTpl);
                            for (var i=0; i < fields.length; i++) {
                                rowdata[fields[i]] = trimQuote(datas[i]);
                            }

                            /// notify main
                            thread.main.dispatch(mainRunnable, thread.main.DISPATCH_NORMAL);

                            tableTmp.id = rowdata.id
                            tableTmp.begin();
                            tableTmp.save(rowdata);
                            tableTmp.commit();
                            ii++;

                        }, this);
                        self._finish = true;
                        thread.main.dispatch(mainRunnable, thread.main.DISPATCH_NORMAL);
                        
                    }
                    catch (e) {}
                    finally {
                        //GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);
                    }



                },

                QueryInterface: function(iid) {
                    if (iid.equals(Components.Interfaces.nsIRunnable) || iid.equals(Components.Interfaces.nsISupports)) {
                        return this;
                    }
                    throw Components.results.NS_ERROR_NO_INTERFACE;
                }
            };

            var ii = 0;
            var nCount = lines.length;
            // var datas = [];
            var progress = 0;
            // @todo:
            if (model == 'products') {
                tableTmp = new ProductModel();
                // tableTpl = tableTmp.schema();
                {
                for (var i=0; i< fields.length; i++) {

                   tableTpl[fields[i]] = null;
                }
                }
                tableTpl.vivible = true;

                var cate_no = '999';
                var pad = 8; // GeckoJS.String.padLeft

                // var progmeter = document.getElementById("importprogressmeter");

                workerRunnable = workerProducts;

            } else if (model == 'departments') {
                tableTmp = new CategoryModel();
                // tableTpl = tableTmp.schema();
                {
                for (var i=0; i< fields.length; i++) {

                   tableTpl[fields[i]] = null;
                }
                }


                // var progmeter = document.getElementById("importprogressmeter");

                workerRunnable = workerDatas;

            } else if (model == 'plugroups') {
                tableTmp = new PlugroupModel();
                // tableTpl = tableTmp.schema();
                {
                for (var i=0; i< fields.length; i++) {

                   tableTpl[fields[i]] = null;
                }
                }


                // var progmeter = document.getElementById("importprogressmeter");

                workerRunnable = workerDatas;


            } else if (model == 'condimentgroups') {
                tableTmp = new CondimentGroupModel();
                // tableTpl = tableTmp.schema();
                {
                for (var i=0; i< fields.length; i++) {

                   tableTpl[fields[i]] = null;
                }
                }
                // var progmeter = document.getElementById("importprogressmeter");

                workerRunnable = workerDatas;

            } else if (model == 'condiments') {
                tableTmp = new CondimentModel();
                // tableTpl = tableTmp.schema();
                {
                for (var i=0; i< fields.length; i++) {

                   tableTpl[fields[i]] = null;
                }
                }


                // var progmeter = document.getElementById("importcondimentprogressmeter");

                workerRunnable = workerDatas;
            }

            self._finish = false;
            // workerRunnable = workerTmp;
            thread._runnable = workerRunnable;
GREUtils.log(model);
            // run worker...
            // thread.start();

            /*
            try {
                    while(thread._workerThread.hasPendingEvents()) thread._workerThread.processNextEvent(true);
            }
            catch (e) {}

            
            */
            // alert("finish...");
            
            // while(!self._finish) thread._workerThread.processNextEvent(true);

            }
            alert("finish...");
        },

        exportData: function (model) {
            //
            var datas = this.getListObj().value.split(',');

            var total;
            var progmeter = document.getElementById("datasprogressmeter");
            var exportprogress = function (value) {
                //
                // GREUtils.log('value:' + value);
                progmeter.value = Math.floor(value / total * 100);
            }

            // progmeter.max = datas.length;
            progmeter.value = 0;
            for(var i=0; i < datas.length; i++) {
                //
                progmeter.value = (i / datas.length) * 100;
                
                var name = this._datas[datas[i]].name;
                var model = this._datas[datas[i]].model;

                if (model == "products") {
                    var tableTmp = new ProductModel();
                    var fileName = this._exportDir + "/products.csv";
                } else if (model == "departments") {
                    var tableTmp = new CategoryModel();
                    var fileName = this._exportDir + "/departments.csv";
                } else if (model == "plugroups") {
                    var tableTmp = new PlugroupModel();
                    var fileName = this._exportDir + "/plugroups.csv";
                } else if (model == "condimentgroups") {
                    var tableTmp = new CondimentGroupModel();
                    var fileName = this._exportDir + "/condimentgroups.csv";
                } else if (model == "condiments") {
                    var tableTmp = new CondimentModel();
                    var fileName = this._exportDir + "/condiments.csv";
                }

                total = tableTmp.exportCSV(fileName, {

                    limit:9999
                }/*, exportprogress */);
                /*
                try {
                    while(GeckoJS.Model._workerThread.hasPendingEvents()) GeckoJS.Model._workerThread.processNextEvent(true);
                }
                catch (e) {}
                */
            }
            progmeter.value = 100;
            alert(_("export data finish!"));

        },

        load: function (data) {
            this._importDir = GeckoJS.Configure.read('vivipos.fec.settings.database.importdir');
            this._exportDir = GeckoJS.Configure.read('vivipos.fec.settings.database.exportdir');
            if (!this._importDir) this._importDir = '/media/disk/database_import/';
            if (!this._exportDir) this._exportDir = '/media/disk/database_export/';
            
            this._datas = [
                {
                    name: 'Department',
                    model: 'departments'
                },
                {
                    name: 'Plu',
                    model: 'products'
                },
                {
                    name: 'Plu Group',
                    model: 'plugroups'
                },
                {
                    name: 'Condiment Group',
                    model: 'condimentgroups'
                },
                {
                    name: 'Condiment',
                    model: 'condiments'
                }
            ]
            
            var panelView = new GeckoJS.NSITreeViewArray(this._datas);
            this.getListObj().datasource = panelView;
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

