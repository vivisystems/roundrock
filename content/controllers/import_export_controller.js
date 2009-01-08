(function(){

    /**
     * Class ImportExportController
     */

    GeckoJS.Controller.extend( {
        name: 'ImportExport',
        scaffold: true,
        uses: ["Product"],
	
        _listObj: null,
        _importDir: null,
        _exportDir: null,
        _finish: false,
        _busy: false,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('datasourcescrollablepanel');
            }
            return this._listObj;
        },

        setButtonDisable: function(disabled) {
            //
            $('#importBtn').attr('disabled', disabled);
            $('#exportBtn').attr('disabled', disabled);
        },

        checkBackupDevices: function() {

            // var osLastMedia = new GeckoJS.File('/tmp/last_media');
            var osLastMedia = new GeckoJS.File('/var/tmp/vivipos/last_media');

            var last_media = "";
            var deviceNode = "";

            // var deviceMount = "/media/";
            var deviceMount = "/var/tmp/";

            var hasMounted = false;

            if (osLastMedia.exists()) {
                osLastMedia.open("r");
                last_media = osLastMedia.readLine();
                osLastMedia.close();
            }

            // $('#importBtn').attr('disabled', true);
            // $('#exportBtn').attr('disabled', true);
            this.setButtonDisable(true);

            $('#lastMedia').attr('value', '');

            if (last_media) {

                var tmp = last_media.split('/');
                deviceNode = tmp[tmp.length-1];
                deviceMount +=  deviceNode;

                var mountDir = new GeckoJS.File(deviceMount);
               
                if (mountDir.exists() && mountDir.isDir()) {

                    // mount dir exists
                    // autocreate backup_dir and restore dir
                    
                    var importDir = new GeckoJS.Dir(deviceMount+'/database_import', true);
                    var exportDir = new GeckoJS.Dir(deviceMount+'/database_export', true);

                    if (importDir.exists() && exportDir.exists()) {

                        this._importDir = importDir.path;
                        this._exportDir = exportDir.path;

                        // this.log(this._importDir + ",," + this._exportDir);

                        // $('#importBtn').attr('disabled', false);
                        // $('#exportBtn').attr('disabled', false);
                        this.setButtonDisable(false);

                        $('#lastMedia').attr('value', deviceMount);


                    }

                }
            }

          //importBtn, exportBtn;

        },

        exportData: function (model) {

            var index = this.getListObj().selectedIndex;
            if (index < 0) {
                NotifyUtils.info(_('Please select a item to export...'));
                return;
            }

            var total;

            var name = this._datas[index].name;
            var model = this._datas[index].model;
            var fileName = this._exportDir + "/" + this._datas[index].filename;

            if (model == "products") {
                var tableTmp = new ProductModel();
            } else if (model == "departments") {
                var tableTmp = new CategoryModel();
            } else if (model == "plugroups") {
                var tableTmp = new PlugroupModel();
            } else if (model == "condimentgroups") {
                var tableTmp = new CondimentGroupModel();
            } else if (model == "condiments") {
                var tableTmp = new CondimentModel();
            }

            total = tableTmp.exportCSV(fileName, {

                limit:9999
            });

            this._datas[index].exported = _('Yes') + _(' (%S)',[this._datas[index].filename]);
            this.getListObj().vivitree.refresh();

            NotifyUtils.info(_('Export To CSV (%S) Finish!!', [this._datas[index].filename]));

        },

        importData: function(model) {
            // return if inporting...
            if (this._busy) return;
            

            var index = this.getListObj().selectedIndex;
            if (index < 0) {
                NotifyUtils.info(_('Please select a item to import...'));
                return;
            }

            var total;
            var progmeter = document.getElementById("datasprogressmeter");

            var waitPanel = document.getElementById("import_wait_panel");
            // waitPanel.noautohide = true;
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            waitPanel.sizeTo(360, 240);
            waitPanel.openPopupAtScreen(200,400);
            waitPanel.moveTo((width - 360) / 2, (height - 240) / 2);
            
            this.sleep(1000);

            var name = this._datas[index].name;
            var model = this._datas[index].model;
            var fileName = this._importDir + "/" + this._datas[index].filename;
            if (!GREUtils.File.exists(fileName)) {
                NotifyUtils.info(_('The CSV file (%S) does not exist!!', [this._datas[index].filename]));
                return;
            }

            var self = this;
            this._busy = true;
            
            var tableTmp = null;
            var tableTpl = {};

            // new model
            if (model == "products") {
                tableTmp = new ProductModel();
            } else if (model == "departments") {
                tableTmp = new CategoryModel();
            } else if (model == "plugroups") {
                tableTmp = new PlugroupModel();
            } else if (model == "condimentgroups") {
                tableTmp = new CondimentGroupModel();
            } else if (model == "condiments") {
                tableTmp = new CondimentModel();
            }

            // get fields from model
            var tpl = new Array();
            for (var v in tableTmp.schema().fields) {
                tpl[v] = true;
            }

            var trimQuote = function(str) {
                return str.substr(1, str.length-2);
            };

            try {
                // read csv file
                var lines = GREUtils.File.readAllLine(fileName);
                if (lines.length <= 0) return;
            }
            catch (e) {
                this._busy = false;
                NotifyUtils.info(_('Open CSV file (%S) error!!', [this._datas[index].filename]));
                return;
            }
            finally {
                this._busy = false;
            }
            total = lines.length;

            // get field name
            var fields = lines[0].split(',');
            lines.splice(0,1);

            var bad = false;
            for( var i = 0; i < fields.length; i++) {
                fields[i] = trimQuote(fields[i]);
                tableTpl[fields[i]] = null;

                // valid the import fields
                if (!tpl[fields[i]]) {
                    bad = true;
                    NotifyUtils.info(_('Import Format Error: Field (%S) not exist!!', [fields[i]]));
                }
            }

            if (bad) return;

            try {
                // set max script run time...
                var oldLimit = GREUtils.Pref.getPref('dom.max_chrome_script_run_time');
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', 5 * 60);

                var query = 'DELETE FROM "main"."' + model + '"';
                tableTmp.execute(query);
                // alert(tableTmp.table);
                // tableTmp.getDataSource().truncate('"main"."' + tableTmp.table + '"');

                progmeter.value = 0;

                var ii = 0;

                this.setButtonDisable(true);

                tableTmp.begin();
                lines.forEach(function(buf) {
                    var datas = buf.split(',');
                    var rowdata = GREUtils.extend({}, tableTpl);
                    for (var i=0; i < fields.length; i++) {
                        // rowdata[fields[i]] = trimQuote(datas[i]);
                        rowdata[fields[i]] = trimQuote(GREUtils.Charset.convertToUnicode(datas[i], 'UTF-8'));
                    }

                    tableTmp.id = rowdata.id
                    // tableTmp.begin();
                    tableTmp.save(rowdata);
                    // tableTmp.commit();

                    progmeter.value = ii * 100 / total;
                    if ( (ii % 100) == 0 )
                        this.sleep(100);

                    ii++;

                }, this);
                //tableTmp.commit();
            }
            catch (e) {
                NotifyUtils.info(_('Import CSV datas (%S) Format error!! Please Check...', [this._datas[index].filename]));
            }
            finally {
                // reset max script run time...
                this._busy = false;
                tableTmp.commit();
                progmeter.value = 100;
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);
                // progmeter.value = 0;
                this.setButtonDisable(false);
                waitPanel.hidePopup();
            }

            this._datas[index].imported = _('Yes') + _(' (%S)',[this._datas[index].filename]);
            this.getListObj().vivitree.refresh();

            NotifyUtils.info(_('Import From CSV (%S) Finish!!', [this._datas[index].filename]));

            return;
// ************************
            
            GREUtils.log("finish...");
        },


        load: function (data) {

            this.checkBackupDevices();

            this._datas = [
                {
                    name: _('Department'),
                    model: 'departments',
                    filename: 'departments.csv',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('Product'),
                    model: 'products',
                    filename: 'products.csv',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('Plu Group'),
                    model: 'plugroups',
                    filename: 'plugroups.csv',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('Condiment Group'),
                    model: 'condimentgroups',
                    filename: 'condimentgroups.csv',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('Condiment'),
                    model: 'condiments',
                    filename: 'condiments.csv',
                    imported: '',
                    exported: ''
                }
            ]
            
            var panelView = new GeckoJS.NSITreeViewArray(this._datas);
            this.getListObj().datasource = panelView;
        }
    });


})();

