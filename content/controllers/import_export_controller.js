(function(){

    /**
     * Class ViviPOS.ImportExportController
     */

    GeckoJS.Controller.extend( {
        name: 'ImportExport',
        scaffold: true,
        uses: ["Product"],
	
        _listObj: null,
        _importDir: null,
        _exportDir: null,
        _finish: false,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('datasourcescrollablepanel');
            }
            return this._listObj;
        },

        checkBackupDevices: function() {

            var osLastMedia = new GeckoJS.File('/tmp/last_media');

            var last_media = "";
            var deviceNode = "";

            var deviceMount = "/media/";

            var hasMounted = false;

            if (osLastMedia.exists()) {
                osLastMedia.open("r");
                last_media = osLastMedia.readLine();
                osLastMedia.close();
            }

            if (last_media) {

                var tmp = last_media.split('/');
                deviceNode = tmp[tmp.length-1];
                deviceMount +=  deviceNode;

                var mountDir = new GeckoJS.File(deviceMount);
               
                if (mountDir.exists() && mountDir.isDir()) {

                    // mount dir exists
                    // autocreate backup_dir and restore dir
                    
                    var importDir = new GeckoJS.Dir(deviceMount+'/import', true);
                    var exportDir = new GeckoJS.Dir(deviceMount+'/export', true);

                    if (importDir.exists() && exportDir.exists()) {

                        this._importDir = importDir.path;
                        this._exportDir = exportDir.path;

                        this.log(this._importDir + ",," + this._exportDir);

                        $('#importBtn').attr('disabled', false);
                        $('#exportBtn').attr('disabled', false);

                        $('#lastMedia').attr('value', deviceMount);


                    }

                }
            }

          //importBtn, exportBtn;

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
                });
            }
            progmeter.value = 100;
            NotifyUtils.info('Export To CSV ('+ fileName + ') Finish!!');

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

        importData: function(model) {
//
            var datas = this.getListObj().value.split(',');

            var total;
            var progmeter = document.getElementById("datasprogressmeter");

            var thread = new GeckoJS.Thread();
            var workerRunnable;

            var self = this;

            var tableTmp = null;
            var tableTpl = {};

            // progmeter.max = datas.length;
            progmeter.value = 0;
            for(var k=0; k < datas.length; k++) {

                var name = this._datas[datas[k]].name;
                var model = this._datas[datas[k]].model;

                if (model == "products") {
                    var tableTmp = new ProductModel();
                    var fileName = this._importDir + "products.csv";
                } else if (model == "departments") {
                    var tableTmp = new CategoryModel();
                    var fileName = this._importDir + "departments.csv";
                } else if (model == "plugroups") {
                    var tableTmp = new PlugroupModel();
                    var fileName = this._importDir + "plugroups.csv";
                } else if (model == "condimentgroups") {
                    var tableTmp = new CondimentGroupModel();
                    var fileName = this._importDir + "condimentgroups.csv";
                } else if (model == "condiments") {
                    var tableTmp = new CondimentModel();
                    var fileName = this._importDir + "condiments.csv";
                }

            var trimQuote = function(str) {

                return str.substr(1, str.length-2);
            };

            
            var lines = GREUtils.File.readAllLine(fileName);
            var fields = lines[0].split(',');
            lines.splice(0,1);

            for( var i = 0; i < fields.length; i++) {
                fields[i] = trimQuote(fields[i]);
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
            var progress = 0;
            // @todo:
            if (model == 'products') {
                tableTmp = new ProductModel();
                // tableTpl = tableTmp.schema();
                for (var i=0; i< fields.length; i++) {

                   tableTpl[fields[i]] = null;
                }
                tableTpl.vivible = true;

                var cate_no = '999';
                var pad = 8; // GeckoJS.String.padLeft

                workerRunnable = workerProducts;

            } else if (model == 'departments') {
                tableTmp = new CategoryModel();
                // tableTpl = tableTmp.schema();
                for (var i=0; i< fields.length; i++) {

                   tableTpl[fields[i]] = null;
                }

                workerRunnable = workerDatas;

            } else if (model == 'plugroups') {
                tableTmp = new PlugroupModel();
                // tableTpl = tableTmp.schema();
                for (var i=0; i< fields.length; i++) {

                   tableTpl[fields[i]] = null;
                }

                workerRunnable = workerDatas;


            } else if (model == 'condimentgroups') {
                tableTmp = new CondimentGroupModel();
                // tableTpl = tableTmp.schema();
                for (var i=0; i< fields.length; i++) {

                   tableTpl[fields[i]] = null;
                }

                workerRunnable = workerDatas;

            } else if (model == 'condiments') {
                tableTmp = new CondimentModel();
                // tableTpl = tableTmp.schema();
                for (var i=0; i< fields.length; i++) {

                   tableTpl[fields[i]] = null;
                }

                workerRunnable = workerDatas;
            }

            self._finish = false;
            // workerRunnable = workerTmp;
            thread._runnable = workerRunnable;
            // run worker...
            thread.start();

            /*
            try {
                    while(thread._workerThread.hasPendingEvents()) thread._workerThread.processNextEvent(true);
            }
            catch (e) {}

            
            */
            // alert("finish...");
            
            // while(!self._finish) thread._workerThread.processNextEvent(true);

            }
            GREUtils.log("finish...");
        },


        load: function (data) {

            this.checkBackupDevices();

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
        }
    });


})();

