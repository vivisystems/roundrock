(function(){

    var __controller__ = {

        name: 'ImportExport',

        scaffold: true,

        uses: ["Product"],
	
        _listObj: null,
        _importDir: null,
        _exportDir: null,
        _finish: false,
        _busy: false,
        _importFolder: 'database_import',
        _exportFolder: 'database_export',

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('datasourcescrollablepanel');
            }
            return this._listObj;
        },

        setButtonDisable: function(disabled) {
            //
            //$('#importBtn').attr('disabled', disabled);
            //$('#exportBtn').attr('disabled', disabled);

            $('#importBtn').attr('disabled', this._busy);
            $('#exportBtn').attr('disabled', this._busy);

            $('#ok').attr('disabled', this._busy);
        },

        execute: function(cmd, param) {
            try {
                var exec = new GeckoJS.File(cmd);
                var r = exec.run(param, true);
                // this.log("ERROR", "Ret:" + r + "  cmd:" + cmd + "  param:" + param);
                exec.close();
                return true;
            }
            catch (e) {
                NotifyUtils.warn(_('Failed to execute command (%S).', [cmd + ' ' + param]));
                return false;
            }
        },

        checkBackupDevices: function() {

            var osLastMedia = new GeckoJS.File('/tmp/last_media');

            var last_media = "";
            var deviceNode = "";
            var deviceReady = false;

            var deviceMount = "/media/";

            if (osLastMedia.exists()) {
                osLastMedia.open("r");
                last_media = osLastMedia.readLine();
                osLastMedia.close();
            }

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
                    
                    var importDir = new GeckoJS.Dir(deviceMount+'/' + this._importFolder, true);
                    var exportDir = new GeckoJS.Dir(deviceMount+'/' + this._exportFolder, true);

                    if (importDir.exists() && exportDir.exists()) {

                        this._importDir = importDir.path;
                        this._exportDir = exportDir.path;

                        this.setButtonDisable(false);
                        deviceReady = true;

                        $('#lastMedia').attr('value', deviceMount);

                    }
                }
            } else {
                $('#lastMedia').attr('value', _('Media Not Found!'));
                NotifyUtils.info(_('Please attach the USB thumb drive...'));
            }

            return deviceReady ;

        },

        exportData: function (model) {
            // return if importing...
            if (this._busy) {
                GREUtils.Dialog.alert(this.topmostWindow, _('Export Error'), _('Import/Export already in progress'));
                return;
            }

            if (!this.checkBackupDevices()) {
                GREUtils.Dialog.alert(this.topmostWindow, _('Export Error'), _('Export device and/or folder not found [%S]', [this._exportFolder]));
                return;
            }

            var index = this.getListObj().selectedIndex;
            if (index < 0) {
                NotifyUtils.warn(_('Please select a data category to export'));
                return;
            }

            var total;
            var progmeter = document.getElementById("exportprogressmeter");

            var waitPanel = document.getElementById("export_wait_panel");
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            waitPanel.sizeTo(360, 120);
            var x = (width - 360) / 2;
            var y = (height - 240) / 2;
            this._busy = true;

            this.sleep(200);

            var name = this._datas[index].name;
            var model = this._datas[index].model;
            var fileName = this._exportDir + "/" + this._datas[index].filename;

            
            if (model == "products") {
                var tableTmp = new ProductModel();
            } else if (model == "categories") {
                var tableTmp = new CategoryModel();
            } else if (model == "plugroups") {
                var tableTmp = new PlugroupModel();
            } else if (model == "condimentgroups") {
                var tableTmp = new CondimentGroupModel();
            } else if (model == "condiments") {
                var tableTmp = new CondimentModel();
            }

            var dist = 1;
            if (total > 500) dist = 100;
            else if (total > 100) dist = 10;

            progmeter.value = 0;

            var updateProgress = function(index, total) {
                //
                progmeter.value = index * 100 / total;
                if ( (index % dist) == 0 )
                    this.sleep(50);
            };

            try {

                // set max script run time...
                var oldLimit = GREUtils.Pref.getPref('dom.max_chrome_script_run_time');
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', 5 * 60);

                this.setButtonDisable(true);

                total = tableTmp.exportCSV(fileName, {

                    limit:99999
                }, updateProgress);

                // sync to media...
                this.execute("/bin/sh", ["-c", "/bin/sync; /bin/sleep 1; /bin/sync;"]);

            }
            catch (e) {
                NotifyUtils.info(_('Export To CSV (%S) Error!!', [this._datas[index].filename]));
                this._busy = false;
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);
                // progmeter.value = 0;
                this.setButtonDisable(false);
                waitPanel.hidePopup();
            }
            finally {
                
                this._busy = false;
                tableTmp.commit();
                progmeter.value = 100;
                this.sleep(200);
                // reset max script run time...
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);
                // progmeter.value = 0;
                this.setButtonDisable(false);
                waitPanel.hidePopup();
            }

            this._datas[index].exported = _('Yes') + _(' (%S)',[this._datas[index].filename]);
            this.getListObj().vivitree.refresh();

            NotifyUtils.info(_('Data export to CSV file [%S] finished!', [this._datas[index].filename]));

        },

        importData: function(model) {
            // return if importing...
            if (this._busy) {
                GREUtils.Dialog.alert(this.topmostWindow, _('Import Error'), _('Import/Export already in progress'));
                return;
            }

            if (!this.checkBackupDevices()) {
                GREUtils.Dialog.alert(this.topmostWindow, _('Import Error'), _('Import device and/or folder not found [%S]', [this._importFolder]));
                return;
            }

            var index = this.getListObj().selectedIndex;
            if (index < 0) {
                NotifyUtils.warn(_('Please select a data category to import'));
                return;
            }

            var total;
            var progmeter = document.getElementById("importprogressmeter");

            var waitPanel = document.getElementById("import_wait_panel");
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            waitPanel.sizeTo(360, 120);
            var x = (width - 360) / 2;
            var y = (height - 240) / 2;
            waitPanel.openPopupAtScreen(x, y);
            
            this.sleep(50);

            var name = this._datas[index].name;
            var model = this._datas[index].model;
            var fileName = this._importDir + "/" + this._datas[index].filename;
            if (!GREUtils.File.exists(fileName)) {
                waitPanel.hidePopup();
                NotifyUtils.error(_('The specified CSV file [%S] does not exist!', [this._datas[index].filename]));
                return;
            }

            var self = this;
            this._busy = true;
            
            var tableTmp = null;
            var tableTpl = {};

            // new model
            if (model == "products") {
                tableTmp = new ProductModel();
            } else if (model == "categories") {
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

            try {
                // read csv file
                var lines = GREUtils.File.readAllLine(fileName);
                if (lines.length <= 0) return;
            }
            catch (e) {
                this._busy = false;
                waitPanel.hidePopup();
                NotifyUtils.error(_('Unable to open the specified CSV file [%S]!', [this._datas[index].filename]));
                return;
            }
            finally {
                this._busy = false;
            }
            total = lines.length;

            // get field name
            var fields = GeckoJS.String.parseCSV(lines[0])[0];
            lines.splice(0,1);

            var bad = false;
            if (bad) return;

            try {
                // set max script run time...
                var oldLimit = GREUtils.Pref.getPref('dom.max_chrome_script_run_time');
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', 5 * 60);

                // var query = 'DELETE FROM "main"."' + model + '"';
                // tableTmp.execute(query);
                tableTmp.truncate();

                progmeter.value = 0;

                var ii = 0;
                var dist = 1;
                if (total > 500) dist = 100;
                else if (total > 100) dist = 10;

                this.setButtonDisable(true);

                tableTmp.begin();
                lines.forEach(function(buf) {
                    var datas = GeckoJS.String.parseCSV(buf)[0];
// this.log(this.dump(datas));
                    var rowdata = GREUtils.extend({}, tableTpl);
                    for (var i=0; i < fields.length; i++) {
                        rowdata[fields[i]] = GREUtils.Charset.convertToUnicode(datas[i], 'UTF-8');
                    }

                    if (model == "products") {
                        try {
                            if (!rowdata['cate_no'] || rowdata['cate_no'].length <= 0) rowdata['cate_no'] = '999';
                        } catch (e) {
                            // self.log("error..." + ii);
                            rowdata['cate_no'] = '888';
                        }
                    }

                    tableTmp.id = rowdata.id;
                    // tableTmp.begin();
                    tableTmp.save(rowdata);
                    // tableTmp.commit();

                    progmeter.value = ii * 100 / total;
                    if ( (ii % dist) == 0 )
                        this.sleep(50);

                    ii++;

                }, this);
                //tableTmp.commit();
            }
            catch (e) {
                NotifyUtils.error(_('Format error detected in import CSV file [%S]!', [this._datas[index].filename]));
            }
            finally {
                
                this._busy = false;
                tableTmp.commit();
                progmeter.value = 100;
                this.sleep(200);
                // reset max script run time...
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);
                // progmeter.value = 0;
                this.execute("/bin/sh", ["-c", "/bin/sync; /bin/sleep 1; /bin/sync;"]);

                this.setButtonDisable(false);
                waitPanel.hidePopup();
            }

            this._datas[index].imported = _('Yes') + _(' (%S)',[this._datas[index].filename]);
            this.getListObj().vivitree.refresh();

            NotifyUtils.info(_('Data import from CSV file [%S] finished!', [this._datas[index].filename]));

            // restart vivipos
            GeckoJS.Observer.notify(null, 'prepare-to-restart', this);
        },


        load: function (data) {

            this.checkBackupDevices();

            this._datas = [
                {
                    name: _('Department'),
                    model: 'categories',
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
                    name: _('Product Group'),
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
    };

    GeckoJS.Controller.extend(__controller__);

})();

