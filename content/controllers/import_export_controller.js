(function(){

    var __controller__ = {

        name: 'ImportExport',

        scaffold: true,

        uses: ["Product"],
	
        _listObj: null,
        _importDir: null,
        _exportDir: null,
        _rootDir: null,
        _finish: false,
        _busy: false,
        _importFolder: 'database_import',
        _exportFolder: 'database_export',

        getListObj: function(type) {
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
                    var terminalPath = GeckoJS.Session.get('terminal_no');
                    var importDir = new GeckoJS.Dir(deviceMount+'/' + this._importFolder, true);
                    var exportDir = new GeckoJS.Dir(deviceMount+'/' + this._exportFolder + '/' + terminalPath, true);
                    var rootDir = new GeckoJS.Dir(deviceMount+'/', true);
                    var scriptDir = new GeckoJS.Dir('/data/scripts', true);

                    if (importDir.exists() && exportDir.exists() && rootDir.exists() && scriptDir.exists()) {

                        this._importDir = importDir.path;
                        this._exportDir = exportDir.path;
                        this._rootDir = rootDir.path;
                        this._scriptDir = scriptDir.path;

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

        exportData: function () {
            var self = this;
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


            var exportType = this._datas[index].type;

            switch(exportType) {
                case "model": {
                        var model = this._datas[index].model;
                        switch(model) {
                            case "products": {
                                    var tableTmp = new ProductModel();
                                    break;
                            }
                            case "categories": {
                                    var tableTmp = new CategoryModel();
                                    break;
                            }
                            case "plugroups": {
                                    var tableTmp = new PlugroupModel();
                                    break;
                            }
                            case "condimentgroups": {
                                    var tableTmp = new CondimentGroupModel();
                                    break;
                            }
                            case "condiments": {
                                    var tableTmp = new CondimentModel();
                                    break;
                            }
                            case "promotions": {
                                    var tableTmp = new PromotionModel();
                                    break;
                            }
                            case "setitems": {
                                    var tableTmp = new SetItemModel();
                                    break;
                            }
                        }
                        break;
                }
                case "preference": {
                        var preference = this._datas[index].preference;
                        var preferenceType = this._datas[index].preferenceType;
                        break;
                }
                case "data": {
                        var database = this._datas[index].database;
                        var table = this._datas[index].table;
                        var executable = "/usr/bin/sqlite3";

                        for(var i = 0;i < table.length;i++) {
                            this._datas[index].filename += table[i] + ".sql ";
                            var exportScript = this._scriptDir + '/' + table[i] + ".exp";
                            var command = executable + " " + database + " < " + exportScript + " > " + this._exportDir + "/" + table[i] + ".sql";
                            GREUtils.File.run( "/bin/sh", [ '-c', command ], true );
                        }
                        break;
                }
                case "license": {
                        break;
                }
            }

            var name = this._datas[index].name;
            var fileName = this._exportDir + "/" + this._datas[index].filename;

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
                switch(exportType) {
                    case "model": {
                            try {
                                var result = tableTmp.find('all', {limit:99999});
                                var saveFile = new GeckoJS.File(fileName, true);
                                saveFile.setOutputCharset('big5');
                                saveFile.open("w");

                                var isFirstRow = true;
                                var columns = [];

                                result.forEach(function(row) {
                                    updateProgress();

                                    var buf = "";
                                    if (isFirstRow) {
                                        switch(model) {
                                            case "condiments": {
                                                    columns = [
                                                        'name',
                                                        'condiment_group_id',
                                                        'price',
                                                        'id',
                                                        'button_color',
                                                        'font_size',
                                                        'preset'
                                                    ];
                                                    break;
                                            }
                                            case "condimentgroups": {
                                                    columns = [
                                                        'name',
                                                        'id',
                                                        'seltype',
                                                        'newline'
                                                    ];
                                                    break;
                                            }
                                            case "plugroups": {
                                                    columns = [
                                                        'name',
                                                        'description',
                                                        'visible',
                                                        'link_department',
                                                        'link_group',
                                                        'display_order',
                                                        'id',
                                                        'button_color',
                                                        'font_size',
                                                        'routing'
                                                    ];
                                                    break;
                                            }
                                            case "products": {
                                                    columns = [
                                                        'name',
                                                        'no',
                                                        'cate_no',
                                                        'rate',
                                                        'cond_group',
                                                        'link_group',
                                                        'id',
                                                        'barcode',
                                                        'buy_price',
                                                        'stock',
                                                        'min_stock',
                                                        'memo',
                                                        'min_sale_qty',
                                                        'sale_unit',
                                                        'setmenu',
                                                        'level_enable1',
                                                        'price_level1',
                                                        'halo1',
                                                        'lalo1',
                                                        'level_enable2',
                                                        'price_level2',
                                                        'halo2',
                                                        'lalo2',
                                                        'level_enable3',
                                                        'price_level3',
                                                        'halo3',
                                                        'lalo3',
                                                        'level_enable4',
                                                        'price_level4',
                                                        'halo4',
                                                        'lalo4',
                                                        'level_enable5',
                                                        'price_level5',
                                                        'halo5',
                                                        'lalo5',
                                                        'level_enable6',
                                                        'price_level6',
                                                        'halo6',
                                                        'lalo6',
                                                        'level_enable7',
                                                        'price_level7',
                                                        'halo7',
                                                        'lalo7',
                                                        'level_enable8',
                                                        'price_level8',
                                                        'halo8',
                                                        'lalo8',
                                                        'level_enable9',
                                                        'price_level9',
                                                        'halo9',
                                                        'lalo9',
                                                        'auto_maintain_stock',
                                                        'return_stock',
                                                        'force_condiment',
                                                        'force_memo',
                                                        'single',
                                                        'visible',
                                                        'button_color',
                                                        'font_size',
                                                        'age_verification',
                                                        'icon_only',
                                                        'alt_name1',
                                                        'alt_name2',
                                                        'manual_adjustment_only',
                                                        'append_empty_btns',
                                                        'display_order'
                                                    ];
                                                    break;
                                            }
                                            case "categories": {
                                                    columns = [
                                                        'no',
                                                        'name',
                                                        'visible',
                                                        'id',
                                                        'rate',
                                                        'button_color',
                                                        'font_size',
                                                        'cansale',
                                                        'display_order'
                                                    ];
                                                    break;
                                            }
                                            case "setitems": {
                                                    columns = [
                                                        "pluset_no",
                                                        "sequence",
                                                        "label",
                                                        "preset_no",
                                                        "quantity",
                                                        "baseprice",
                                                        "linkgroup_id",
                                                        "reduction",
                                                        "id"
                                                    ];
                                                    break;
                                            }
                                            default: {
                                                    columns = GeckoJS.BaseObject.getKeys(row[tableTmp.name]);
                                            }
                                        }

                                        buf = columns.join('","');
                                        buf = '"'+buf+'"';

                                        saveFile.write(buf+"\n");

                                        isFirstRow = false;
                                    }

                                    var data =[];
                                    
                                    columns.forEach(function(col){
                                        var val = new String(row[tableTmp.name][col]);
                                        switch(model) {
                                            case "condiments": {
                                                    switch(col) {
                                                        case "condiment_group_id": {
                                                                var condimentGroupId = row[tableTmp.name][col];
                                                                var queryString = "SELECT name FROM condiment_groups WHERE id ='" + condimentGroupId + "';";
                                                                var result = tableTmp.getDataSource().fetchAll(queryString);
                                                                var val = result ? result[0].name : "";
                                                                break;
                                                        }
                                                        default: {
                                                        }
                                                    }
                                            }
                                            case "plugroups": {
                                                    switch(col) {
                                                        case "link_department": {
                                                                var _departmentIds = row[tableTmp.name][col] ? row[tableTmp.name][col].split(',') : [];
                                                                var vals = [];
                                                                _departmentIds.forEach(function(id) {
                                                                    if(id.length > 0) {
                                                                        var queryString = "SELECT name FROM categories WHERE id ='" + id + "';";
                                                                        var result = tableTmp.getDataSource().fetchAll(queryString);
                                                                        try {
                                                                            vals.push(result[0].name);
                                                                        } catch(e) {
                                                                        }
                                                                    }
                                                                },this);
                                                                var val = "";
                                                                for(var i = 0;i < vals.length;i++) {
                                                                    val += vals[i];
                                                                    val += i != (vals.length - 1) ? "," : "";
                                                                }
                                                                break;
                                                        }
                                                        case "link_group": {
                                                                var _groupIds = row[tableTmp.name][col] ? row[tableTmp.name][col].split(',') : [];
                                                                var vals = [];
                                                                _groupIds.forEach(function(id) {
                                                                    if(id.length > 0) {
                                                                        var queryString = "SELECT name FROM plugroups WHERE id = '" + id + "';";
                                                                        var result = tableTmp.getDataSource().fetchAll(queryString);
                                                                        try {
                                                                            vals.push(result[0].name);
                                                                        } catch(e) {
                                                                        }
                                                                    }
                                                                },this);
                                                                var val = "";
                                                                for(var i =  0;i < vals.length;i++) {
                                                                    val += vals[i];
                                                                    val += i != (vals.length - 1) ? "," : "";
                                                                }
                                                                break;
                                                        }
                                                        default: {
                                                        }
                                                    }
                                            }
                                            case "products": {
                                                    switch(col) {
                                                        case "cate_no": {
                                                                var val = "'" +  row[tableTmp.name][col];
                                                                break;
                                                        }
                                                        case "no": {
                                                                var val = "'" +  row[tableTmp.name][col];
                                                                break;
                                                        }
                                                        case "cond_group": {
                                                                var _condGroupIds = row[tableTmp.name][col] ? row[tableTmp.name][col].split(',') : [];
                                                                var vals = [];
                                                                _condGroupIds.forEach(function(id) {
                                                                    if(id.length > 0) {
                                                                        var queryString = "SELECT name FROM condiment_groups WHERE id ='" + id + "';";
                                                                        var result = tableTmp.getDataSource().fetchAll(queryString);
                                                                        try {
                                                                            vals.push(result[0].name);
                                                                        } catch(e) {
                                                                        }
                                                                    }
                                                                },this);
                                                                var val = "";
                                                                for(var i = 0;i < vals.length;i++) {
                                                                    val += vals[i];
                                                                    val += i != (vals.length - 1) ? "," : "";
                                                                }
                                                                break;
                                                        }
                                                        case "link_group": {
                                                                var _pluGroupIds = row[tableTmp.name][col] ? row[tableTmp.name][col].split(',') : [];
                                                                var vals = [];
                                                                _pluGroupIds.forEach(function(id) {
                                                                    if(id.length > 0) {
                                                                        var queryString = "SELECT name FROM plugroups WHERE id ='" + id + "';";
                                                                        var result = tableTmp.getDataSource().fetchAll(queryString);
                                                                        try {
                                                                            vals.push(result[0].name);
                                                                        } catch(e) {
                                                                        }
                                                                    }
                                                                },this);
                                                                var val = "";
                                                                for(var i = 0;i < vals.length;i++) {
                                                                    val += vals[i];
                                                                    val += i != (vals.length - 1) ? "," : "";
                                                                }
                                                                break;
                                                        }
                                                        default: {

                                                        }
                                                    }
                                            }
                                            case "categories": {
                                                    switch(col) {
                                                        case "no": {
                                                                var val = "'" +  row[tableTmp.name][col];
                                                                break;
                                                        }
                                                        default: {

                                                        }
                                                    }
                                            }
                                            case "setitems": {
                                                    switch(col) {
                                                        case "preset_no":
                                                        case "pluset_no": {
                                                                var val = "'" + row[tableTmp.name][col];
                                                                break;
                                                        }
                                                        case "linkgroup_id": {
                                                                if(row[tableTmp.name][col].length > 0) {
                                                                    var queryString = "SELECT name FROM categories WHERE id ='" + row[tableTmp.name][col] + "';";
                                                                    var result = tableTmp.getDataSource().fetchAll(queryString);
                                                                    try {
                                                                        var val = result[0].name;
                                                                    }catch(e){
                                                                        var val = "";
                                                                    }
                                                                }
                                                                break;
                                                        }
                                                        default: {

                                                        }
                                                    }
                                            }
                                            default: {
                                            }
                                        }
                                        
                                        val = val.replace('"', '""');
                                        data.push(val);
                                    });

                                    buf = data.join('","');
                                    buf = '"'+buf+'"';
                                    saveFile.write(buf+"\n");
                                }, this);

                                saveFile.close();

                            }catch(e){
                                GeckoJS.BaseModel.log('ERROR', 'exportCSV ' + e);
                            }
                            break;
                    }
                    case "preference": {
                            var datas = GeckoJS.Configure.read(preference);
                            var _json = preferenceType == 'string' ? datas : GeckoJS.BaseObject.serialize(datas);
                            var saveFile = new GeckoJS.File(fileName, true);
                            saveFile.open("w");
                            saveFile.write(_json);
                            saveFile.close();
                            break;
                    }
                    case "data": {
                            break;
                    }
                    case "license": {
                            var sourceLicenseFile = new GeckoJS.File(this._datas[index].filename, true);
                            sourceLicenseFile.open("r");
                            sourceLicenseFile.copy(this._exportDir);
                            sourceLicenseFile.close();
                            break;
                    }
                }

                // sync to media...
                this.execute("/bin/sh", ["-c", "/bin/sync; /bin/sleep 1; /bin/sync;"]);
            }
            catch (e) {
                GeckoJS.BaseModel.log('ERROR', e);
                NotifyUtils.info(_('Export To (%S) Error!!', [this._datas[index].filename]));
                this._busy = false;
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);
                // progmeter.value = 0;
                this.setButtonDisable(false);
                waitPanel.hidePopup();
            }
            finally {
                
                this._busy = false;
                switch(exportType){
                    case "model": {
                            tableTmp.commit();
                            break;
                    }
                    case "preference": {
                            break;
                    }
                    case "data": {
                            break;
                    }
                }
                
                progmeter.value = 100;
                this.sleep(200);
                // reset max script run time...
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);
                // progmeter.value = 0;
                this.setButtonDisable(false);
                waitPanel.hidePopup();
            }

            this._datas[index].exported = _('Yes') + _(' (%S)',[this._datas[index].filename]);
            this.getListObj().refresh();

            NotifyUtils.info(_('Data export to file [%S] finished!',[this._datas[index].filename]));

        },

        importData: function() {
            // declare self for scope access
            var self = this;

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
            var importType = this._datas[index].type;

            switch(importType){
                case 'model': {
                        var model = this._datas[index].model;
                        switch(model) {
                            case "products": {
                                    var tableTmp = new ProductModel();
                                    break;
                            }
                            case "categories": {
                                    var tableTmp = new CategoryModel();
                                    break;
                            }
                            case "plugroups": {
                                    var tableTmp = new PlugroupModel();
                                    break;
                            }
                            case "condimentgroups": {
                                    var tableTmp = new CondimentGroupModel();
                                    break;
                            }
                            case "condiments": {
                                    var tableTmp = new CondimentModel();
                                    break;
                            }
                            case "promotions": {
                                    var tableTmp = new PromotionModel();
                                    break;
                            }
                            case "setitems": {
                                    var tableTmp = new SetItemModel();
                                    break;
                            }
                        }
                        break;
                }
                case "preference": {
                        var preference = this._datas[index].preference;
                        var preferenceType = this._datas[index].preferenceType;
                        break;
                }
                case "data": {
                        try {
                            //check to see if all required .sql files are present
                            var database = this._datas[index].database;
                            var table = this._datas[index].table;
                            var missingFile = "";
                            for(var i = 0;i < table.length;i++) {
                                var importFile = this._importDir + "/" + table[i] + ".sql";
                                if (!GREUtils.File.exists(importFile)) {
                                    missingFile += table[i] + ".sql";
                                    if(i != table.length - 1) {
                                        missingFile += ", ";
                                    }
                                }
                            }
                            if(missingFile.length > 0) {
                                NotifyUtils.error(_('The specified file(s) [%S] does not exist!', [missingFile]));
                                return;
                            } else {
                                //process the actual import here
                                var executable = "/usr/bin/sqlite3";

                                for(var i = 0;i < table.length;i++) {
                                    this._datas[index].filename += table[i] + ".sql ";
                                    var resetScript = this._scriptDir + '/' + table[i] + ".imp";
                                    var insertScript = this._importDir + '/' + table[i] + ".sql";
                                    var command = executable + " " + database + " < " + resetScript;
                                    GREUtils.File.run( "/bin/sh", [ '-c', command ], true );
                                    command = executable + " " + database + " < " + insertScript;
                                    GREUtils.File.run( "/bin/sh", [ '-c', command ], true );
                                }
                            }
                            waitPanel.hidePopup();
                            this._datas[index].imported = _('Yes') + _(' (%S)',[this._datas[index].filename]);
                            this.getListObj().vivitree.refresh();

                            NotifyUtils.info(_('Data import from file [%S] finished!', [this._datas[index].filename]));

                            // restart vivipos
                            GeckoJS.Observer.notify(null, 'prepare-to-restart', this);

                            return;
                        }catch (e) {
                            waitPanel.hidePopup();
                            GREUtils.Dialog.alert(this.topmostWindow, _('Database Import Error'), _(e));
                        }
                }
                case 'license': {
                        break;
                }
            }

            var name = this._datas[index].name;
            var fileName = this._importDir + "/" + this._datas[index].filename;
            if(importType == "license") {
                waitPanel.hidePopup();
                GREUtils.Dialog.alert(this.topmostWindow, _('License Import Error'), _('License validated - import not required'));
                return;
            }
            if (!GREUtils.File.exists(fileName)) {
                waitPanel.hidePopup();
                NotifyUtils.error(_('The specified file [%S] does not exist!', [this._datas[index].filename]));
                return;
            }
            this._busy = true;
            

            var tableTpl = {};

            // get fields from model
            switch(importType) {
                case "model": {
                        var tpl = new Array();
                        for (var v in tableTmp.schema().fields) {
                            tpl[v] = true;
                        }

                        try {
                            // read csv file
                            var file = new GeckoJS.File(fileName);
                            file.setInputCharset('big5');
                            file.open("r");
                            var lines = file.readAllLine();
                            file.close();
                            if (lines.length <= 0) return;
                        }
                        catch (e) {
                            this._busy = false;
                            waitPanel.hidePopup();
                            NotifyUtils.error(_('Unable to open the specified file [%S]!', [this._datas[index].filename]));
                            return;
                        }
                        finally {
                            this._busy = false;
                        }
                        total = lines.length;

                        // get field name
                        var fields = GeckoJS.String.parseCSV(lines[0])[0];
                        lines.splice(0,1);
                        break;
                }
                case "preference": {
                        try {
                            // read csv file
                            var file = new GeckoJS.File(fileName);
                            file.open("r");
                            var lines = file.readAllLine();
                            file.close();
                            if (lines.length <= 0) return;
                        } catch (e) {
                            this._busy = false;
                            waitPanel.hidePopup();
                            NotifyUtils.error(_('Unable to open the specified file [%S]!', [this._datas[index].filename]));
                            return;
                        }
                        break;
                }
                case "data": {
                        break;
                }
                case "license": {
                        break;
                }
            }

            try {
                // set max script run time...
                var oldLimit = GREUtils.Pref.getPref('dom.max_chrome_script_run_time');
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', 5 * 60);

                progmeter.value = 0;

                var ii = 0;
                var dist = 1;
                if (total > 500) dist = 100;
                else if (total > 100) dist = 10;

                this.setButtonDisable(true);

                switch(importType) {
                    case "license": {
                            break;
                    }
                    case "model": {
                            var errorMsgs = [];
                            
                            //pre-declare variables for efficient relational constraint checks
                            switch(model) {
                                case "condiments": {
                                        var _condimentGrps = GeckoJS.Array.objectExtract(new CondimentGroupModel().find('all'), "{n}.name");
                                        var condimentGrps = [];
                                        for(var x = 0;x < _condimentGrps.length;x++) {
                                            condimentGrps[_condimentGrps[x]] = [];
                                        }
                                        var condimentIds = [];
                                        break;
                                }
                                case "condimentgroups": {
                                        var condimentGrpIds = [];
                                        var condimentGrpNms = [];
                                        break;
                                }
                                case "plugroups": {
                                        var linkGrpNms = [];
                                        var pluGrpNms = [];
                                        var pluGrpIds = [];
                                        break;
                                }
                                case "products": {
                                        var _departments = GeckoJS.Array.objectExtract(new CategoryModel().find('all'), "{n}.no");
                                        var departments = [];
                                        for(var x = 0;x< _departments.length;x++) {
                                            departments[_departments[x]] = [];
                                        }
                                        var prodNos = [];
                                        var barcodes = [];
                                        var prodIds = [];
                                        break;
                                }
                                case "categories": {
                                        var cateNms = [];
                                        var cateNos = [];
                                        var cateIds = [];
                                        break;
                                }
                                case "setitems": {
                                        var setIds = [];
                                        var setSets = [];
                                        var sets = [];
                                }
                                default: {
                                }
                            }

                            for(var i = 0;i < lines.length;i++) {
                                //validate data here, only continue processing data insertion if all data is valid
                                var datas = GeckoJS.String.parseCSV(lines[i])[0];
                                var rowdata = [];
                                for (var j=0; j < fields.length; j++) {
                                    rowdata[fields[j]] = datas[j];
                                }
                                switch(model) {
                                    case "condiments": {
                                            var condNm = rowdata['name'] ? rowdata['name'] : "";
                                            if(!self.isValidRequiredField(rowdata['name'])) {
                                                errorMsgs.push(_("Condiment item @ row %S requires a name", [i + 2]));
                                            }
                                            if(!self.isValidRequiredField(rowdata['condiment_group_id'])) {
                                                errorMsgs.push(_("Condiment item %S @ row %S requires a condiment group", [condNm, i + 2]));
                                            } else {
                                                var condimentGroupNm = GeckoJS.String.trim(rowdata['condiment_group_id']);
                                                var queryString = "SELECT id FROM condiment_groups WHERE name ='" + condimentGroupNm + "';";
                                                var result = tableTmp.getDataSource().fetchAll(queryString);
                                                if(!result[0]) {
                                                    errorMsgs.push(_("Condiment item %S @ row %S requires a valid condiment group", [condNm, i + 2]));
                                                } else {
                                                    if(GeckoJS.Array.inArray(rowdata['name'], condimentGrps[rowdata['condiment_group_id']]) != -1){
                                                        errorMsgs.push(_("Condiment item %S @ row %S has name duplication under the Condiment Group %S", [condNm, i + 2, rowdata['condiment_group_id']]));
                                                    }
                                                    condimentGrps[rowdata['condiment_group_id']].push(rowdata['name']);
                                                }
                                            }
                                            if(!self.isValidUUID(rowdata['id'])) {
                                                errorMsgs.push(_("Condiment item %S @row %S requires a valid UUID", [condNm, i + 2]));
                                            } else {
                                                if(rowdata['id'].length != 0) {
                                                    if(GeckoJS.Array.inArray(rowdata['id'], condimentIds) != -1) {
                                                        errorMsgs.push(_("Condiment item %S @ row %S contains a duplicated ID", [condNm, i + 2]));
                                                    }
                                                    condimentIds.push(rowdata['id']);
                                                }
                                            }
                                            if(!rowdata['price'] || isNaN(rowdata['price'])) {
                                                errorMsgs.push(_("Condiment item %S @ row %S requires a valid price", [condNm, i + 2]));
                                            }
                                            if(!self.isValidButtonColorField(rowdata['button_color'], "condiment", true)) {
                                                errorMsgs.push(_("Condiment item %S @ row %S requires a valid button color", [condNm, i + 2]));
                                            }
                                            if(!self.isValidFontSizeField(rowdata['font_size'], true)) {
                                                errorMsgs.push(_("Condiment item %S @ row %S requires a valid font size", [condNm, i + 2]));
                                            }
                                            if(!self.isValidBooleanField(rowdata['preset'], true)) {
                                                errorMsgs.push(_("Condiment item %S @ row %S requires a valid boolean preset value", [condNm, i + 2]));
                                            }
                                            break;
                                    }
                                    case "condimentgroups": {
                                            var condGrpNm = rowdata['name'] ? rowdata['name'] : "";
                                            if(!self.isValidRequiredField(rowdata['name'])) {
                                                errorMsgs.push(_("Condiment Group item %S @ row %S requires a name", [condGrpNm, i + 2]));
                                            } else {
                                                if(GeckoJS.Array.inArray(rowdata['name'], condimentGrpNms) != -1) {
                                                    errorMsgs.push(_("Condiment Group item %S @ row %S contains a duplicated name", [condGrpNm, i + 2]));
                                                }
                                                condimentGrpNms.push(rowdata['name']);
                                            }
                                            if(!self.isValidUUID(rowdata['id'])) {
                                                errorMsgs.push(_("Condiment Group item %S @ row %S requires a valid UUID", [condGrpNm, i + 2]));
                                            } else {
                                                if(rowdata['id'].length != 0) {
                                                    if(GeckoJS.Array.inArray(rowdata['id'], condimentGrpIds) != -1) {
                                                        errorMsgs.push(_("Condiment Group item %S @ row %S contains a duplicated ID", [condGrpNm, i + 2]));
                                                    }
                                                    condimentGrpIds.push(rowdata['id']);
                                                }
                                            }
                                            if(!self.isValidChoiceField(rowdata['seltype'], [
                                                    "single",
                                                    "multiple"
                                                ], true)) {
                                                errorMsgs.push(_("Condiment Group item %S @ row %S requires a valid select type", [condGrpNm, i + 2]));
                                            }
                                            if(!self.isValidBooleanField(rowdata['newline'], true)) {
                                                errorMsgs.push(_("Condiment Group item %S @ row %S requires a valid boolean new line value", [condGrpNm, i + 2]));
                                            }
                                            break;
                                    }
                                    case "plugroups": {
                                            var pluGrpNm = rowdata['name'] ? rowdata['name'] : "";
                                            if(!self.isValidRequiredField(rowdata['name'])) {
                                                errorMsgs.push(_("Product Group item %S @ row %S requires a name", [pluGrpNm, i + 2]));
                                            } else {
                                                if(GeckoJS.Array.inArray(rowdata['name'], pluGrpNms) != -1) {
                                                    errorMsgs.push(_("Product Group item %S @ row %S contains a duplicated name", [pluGrpNm, i + 2]));
                                                }
                                                pluGrpNms.push(rowdata['name']);
                                            }
                                            if(!self.isValidUUID(rowdata['id'])) {
                                                errorMsgs.push(_("Product Group item %S @ row %S requires a valid UUID", [pluGrpNm, i + 2]));
                                            } else {
                                                if(rowdata['id'].length != 0) {
                                                    if(GeckoJS.Array.inArray(rowdata['id'], pluGrpIds) != -1) {
                                                        errorMsgs.push(_("Product Group item %S @ row %S contains a duplicated ID", [pluGrpNm, i + 2]));
                                                    }
                                                    pluGrpIds.push(rowdata['id']);
                                                }
                                            }
                                            if(!self.isValidButtonColorField(rowdata['button_color'], "plugroup", true)) {
                                                errorMsgs.push(_("Product Group item %S @ row %S requires a valid button color", [pluGrpNm, i + 2]));
                                            }
                                            if(!self.isValidFontSizeField(rowdata['font_size'], true)) {
                                                errorMsgs.push(_("Product Group item %S @ row %S requires a valid font size", [pluGrpNm, i + 2]));
                                            }
                                            if(!self.isValidBooleanField(rowdata['visible'])) {
                                                errorMsgs.push(_("Product Group item %S @ row %S requires a valid boolean visible value", [pluGrpNm, i + 2]));
                                            }
                                            if(!self.isValidBooleanField(rowdata['routing'])) {
                                                errorMsgs.push(_("Product Group item %S @ row %S requires a valid routing field", [pluGrpNm, i + 2]));
                                            }
                                            if(rowdata['link_department'].length > 0) {
                                                var _departmentNms = rowdata['link_department'].split(',');
                                                _departmentNms.forEach(function(name) {
                                                    if(name.length > 0) {
                                                        var queryString = "SELECT id FROM categories WHERE name ='" + name + "';";
                                                        var result = tableTmp.getDataSource().fetchAll(queryString);
                                                        if(result.length < 1) {
                                                            errorMsgs.push(_("Product Group item %S @ row %S has invalid department link", [pluGrpNm, i + 2]));
                                                        }
                                                    }
                                                },this);
                                            }
                                            if(rowdata['link_group'].length > 0) {
                                                //we will build an array of group names first, and reprocess for validation after this initial loop of lines
                                                var _linkGrpNms = rowdata['link_group'].split(',');
                                                _linkGrpNms.forEach(function(name) {
                                                    if(name.length > 0) {
                                                        linkGrpNms.push([name, i]);
                                                    }
                                                },this);
                                            }
                                            break;
                                    }
                                    case "products": {
                                            var prodNm = rowdata['name'] ? rowdata['name'] : "";
                                            if(!self.isValidRequiredField(rowdata['name'])) {
                                                errorMsgs.push(_("Product item @ row %S requires a name", [i + 2]));
                                            }
                                            if(!self.isValidRequiredField(rowdata['cate_no'])) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a department", [prodNm, i + 2]));
                                            } else {
                                                var departmentNo = GeckoJS.String.trim(rowdata['cate_no'].substr(1,rowdata['cate_no'].length));
                                                var queryString = "SELECT id FROM categories WHERE no ='" + departmentNo + "';";
                                                var result = tableTmp.getDataSource().fetchAll(queryString);
                                                if(result.length < 1) {
                                                    errorMsgs.push(_("Product item %S @ row %S requires a valid department", [prodNm, i + 2]));
                                                } else {
                                                    if(GeckoJS.Array.inArray(rowdata['name'], departments[departmentNo]) != -1){
                                                        errorMsgs.push(_("Product item %S @ row %S has name duplication under the department %S", [prodNm, i + 2, departmentNo]));
                                                    }
                                                    departments[departmentNo].push(rowdata['name']);
                                                }
                                            }
                                            if(!self.isValidUUID(rowdata['id'])) {
                                                errorMsgs.push(_("Product item %S @row %S requires a valid UUID", [prodNm, i + 2]));
                                            } else {
                                                if(rowdata['id'].length != 0) {
                                                    if(GeckoJS.Array.inArray(rowdata['id'], prodIds) != -1) {
                                                        errorMsgs.push(_("Product item %S @ row %S contains a duplicated ID", [prodNm, i + 2]));
                                                    }
                                                    prodIds.push(rowdata['id']);
                                                }
                                            }
                                            if(!self.isValidRequiredField(rowdata['no'])) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a product number", [prodNm, i + 2]));
                                            } else {
                                                if(GeckoJS.Array.inArray(rowdata['no'], prodNos) != -1) {
                                                    errorMsgs.push(_("Product item %S @ row %S contains a duplicated product number", [prodNm, i + 2]));
                                                }
                                                prodNos.push(rowdata['no']);
                                            }
                                            if(!self.isValidRequiredField(rowdata['rate'])) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a tax rate", [prodNm, i + 2]));
                                            } else {
                                                var queryString = "SELECT id FROM taxes WHERE no ='" + rowdata['rate'] + "';";
                                                var result = tableTmp.getDataSource().fetchAll(queryString);
                                                if(!result[0]) {
                                                    errorMsgs.push(_("Product item %S @ row %S requires a valid tax rate", [prodNm, i + 2]));
                                                }
                                            }
                                            if(rowdata['cond_group'].length > 0) {
                                                var _condNms = rowdata['cond_group'].split(',');
                                                _condNms.forEach(function(name) {
                                                    if(name.length > 0) {
                                                        var queryString = "SELECT id FROM condiment_groups WHERE name ='" + name + "';";
                                                        var result = tableTmp.getDataSource().fetchAll(queryString);
                                                        if(result.length < 1) {
                                                            errorMsgs.push(_("Product item %S @ row %S has invalid condiment group %S", [prodNm, i + 2, name]));
                                                        }
                                                    }
                                                },this);
                                            }
                                            if(rowdata['link_group'].length > 0) {
                                                var _grpNms = rowdata['link_group'].split(',');
                                                _grpNms.forEach(function(name) {
                                                    if(name.length > 0) {
                                                        var queryString = "SELECT id FROM plugroups WHERE name ='" + name + "';";
                                                        var result = tableTmp.getDataSource().fetchAll(queryString);
                                                        if(result.length < 1) {
                                                            errorMsgs.push(_("Product item %S @ row %S has invalid group link %S", [prodNm, i + 2, name]));
                                                        }
                                                    }
                                                },this);
                                            }
                                            if(rowdata['barcode'].length > 0) {
                                                if(GeckoJS.Array.inArray(rowdata['barcode'], barcodes) != -1) {
                                                    errorMsgs.push(_("Product item %S @ row %S contains duplicated barcode", [prodNm, i + 2]));
                                                }
                                                barcodes.push(rowdata['barcode']);
                                            }
                                            if(isNaN(rowdata['buy_price'])) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid buy price value", [prodNm, i + 2]));
                                            }
                                            if(isNaN(rowdata['stock'])) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid stock value", [prodNm, i + 2]));
                                            }
                                            if(isNaN(rowdata['min_stock'])) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid minimum stock value", [prodNm, i + 2]));
                                            }
                                            if(isNaN(rowdata['min_sale_qty'])) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid minimum sale quantity value", [prodNm, i + 2]));
                                            }
                                            for(var x = 1;x < 10;x++) {
                                                if(!self.isValidBooleanField(rowdata["level_enable" + x], true)) {
                                                    errorMsgs.push(_("Product item %S @ row %S requires a valid level enable %S", [prodNm, i + 2, x]));
                                                }
                                                if(rowdata["price_level" + x].length > 0 && isNaN(rowdata["price_level" + x])) {
                                                    errorMsgs.push(_("Product item %S @ row %S requires a valid price level %S", [prodNm, i + 2, x]));
                                                }
                                                if(rowdata["halo" + x].length > 0 && isNaN(rowdata["halo" + x])) {
                                                    errorMsgs.push(_("Product item %S @ row %S requires a valid halo %S", [prodNm, i + 2, x]));
                                                }
                                                if(rowdata["lalo" + x].length > 0 && isNaN(rowdata["lalo" + x])) {
                                                    errorMsgs.push(_("Product item %S @ row %S requires a valid lalo %S", [prodNm, i + 2, x]));
                                                }
                                            }
                                            if(!self.isValidBooleanField(rowdata['auto_maintain_stock'], true)) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid auto maintain stock value", [prodNm, i + 2]));
                                            }
                                            if(!self.isValidBooleanField(rowdata['return_stock'], true)) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid return stock value", [prodNm, i + 2]));
                                            }
                                            if(!self.isValidBooleanField(rowdata['force_condiment'], true)) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid force condiment value", [prodNm, i + 2]));
                                            }
                                            if(!self.isValidBooleanField(rowdata['force_memo'], true)) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid force memo value", [prodNm, i + 2]));
                                            }
                                            if(!self.isValidBooleanField(rowdata['single'], true)) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid single value", [prodNm, i + 2]));
                                            }
                                            if(!self.isValidButtonColorField(rowdata['button_color'], "product", true)) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid button color", [prodNm, i + 2]));
                                            }
                                            if(!self.isValidFontSizeField(rowdata['font_size'], true)) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid font size", [prodNm, i + 2]));
                                            }
                                            if(!self.isValidBooleanField(rowdata['age_verification'], true)) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid age verification value", [prodNm, i + 2]));
                                            }
                                            if(!self.isValidBooleanField(rowdata['icon_only'], true)) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid icon only value", [prodNm, i + 2]));
                                            }
                                            if(!self.isValidBooleanField(rowdata['manual_adjustment_only'], true)) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid manual adjustment only value", [prodNm, i + 2]));
                                            }
                                            if(rowdata["append_empty_btns"].length > 0 && isNaN(rowdata["append_empty_btns"])) {
                                                errorMsgs.push(_("Product item %S @ row %S requires a valid append empty buttons value", [prodNm, i + 2]));
                                            }
                                            break;
                                    }
                                    case "categories": {
                                            var cateNm = rowdata['name'] ? rowdata['name'] : "";
                                            if(!self.isValidRequiredField(rowdata['name'])) {
                                                errorMsgs.push(_("Department item %S @ row %S requires a name", [cateNm, i + 2]));
                                            } else {
                                                if(GeckoJS.Array.inArray(rowdata['name'], cateNms) != -1) {
                                                    errorMsgs.push(_("Department item %S @ row %S contains a duplicated name", [cateNm, i + 2]));
                                                }
                                                cateNms.push(rowdata['name']);
                                            }
                                            if(!self.isValidRequiredField(rowdata['no'])) {
                                                errorMsgs.push(_("Department item %S @ row %S requires a department number", [cateNm, i + 2]));
                                            } else {
                                                if(GeckoJS.Array.inArray(rowdata['name'], cateNos) != -1) {
                                                    errorMsgs.push(_("Department item %S @ row %S contains a duplicated department number", [cateNm, i + 2]));
                                                }
                                                cateNos.push(rowdata['no']);
                                            }
                                            if(!self.isValidUUID(rowdata['id'])) {
                                                errorMsgs.push(_("Department item %S @row %S requires a valid UUID", [cateNm, i + 2]));
                                            } else {
                                                if(rowdata['id'].length != 0) {
                                                    if(GeckoJS.Array.inArray(rowdata['id'], cateIds) != -1) {
                                                        errorMsgs.push(_("Department item %S @ row %S contains a duplicated ID", [cateNm, i + 2]));
                                                    }
                                                    cateIds.push(rowdata['id']);
                                                }
                                            }
                                            if(!self.isValidBooleanField(rowdata['visible'])) {
                                                errorMsgs.push(_("Department item %S @ row %S requires a valid boolean visible value", [cateNm, i + 2]));
                                            }
                                            if(!self.isValidBooleanField(rowdata['cansale'])) {
                                                errorMsgs.push(_("Department item %S @ row %S requires a valid boolean cansale value", [cateNm, i + 2]));
                                            }
                                            if(!self.isValidButtonColorField(rowdata['button_color'], "department", true)) {
                                                errorMsgs.push(_("Department item %S @ row %S requires a valid button color", [cateNm, i + 2]));
                                            }
                                            if(!self.isValidFontSizeField(rowdata['font_size'], true)) {
                                                errorMsgs.push(_("Department item %S @ row %S requires a valid font size", [cateNm, i + 2]));
                                            }
                                            if(!self.isValidRequiredField(rowdata['rate'])) {
                                                errorMsgs.push(_("Department item %S @ row %S requires a tax rate", [cateNm, i + 2]));
                                            } else {
                                                var queryString = "SELECT id FROM taxes WHERE no ='" + rowdata['rate'] + "';";
                                                var result = tableTmp.getDataSource().fetchAll(queryString);
                                                if(!result[0]) {
                                                    errorMsgs.push(_("Department item %S @ row %S requires a valid tax rate", [cateNm, i + 2]));
                                                }
                                            }
                                            break;
                                    }
                                    case "setitems": {
                                            var plusetNo = rowdata['pluset_no'] ? rowdata['pluset_no'].substr(1, rowdata['pluset_no'].length - 1) : "";
                                            var presetNo = rowdata['preset_no'] ? rowdata['preset_no'].substr(1, rowdata['preset_no'].length - 1) : "";
                                            if(!self.isValidRequiredField(plusetNo)) {
                                                errorMsgs.push(_("Set item @ row %S requires a product number", [i + 2]));
                                            } else {
                                                var queryString = "SELECT id FROM products WHERE no ='" + plusetNo + "';";
                                                var result = tableTmp.getDataSource().fetchAll(queryString);
                                                if(!result[0]) {
                                                    errorMsgs.push(_("Set item @ row %S requires a valid product number", [i + 2]));
                                                } else {
                                                    if(GeckoJS.Array.inArray(plusetNo, sets) == -1) {
                                                        sets.push(plusetNo);
                                                    }
                                                }
                                            }
                                            if(!self.isValidRequiredField(presetNo)) {
                                                errorMsgs.push(_("Set item @ row %S requires a preset product number", [i + 2]));
                                            } else {
                                                var queryString = "SELECT id FROM products WHERE no ='" + presetNo + "';";
                                                var result = tableTmp.getDataSource().fetchAll(queryString);
                                                if(!result[0]) {
                                                    errorMsgs.push(_("Set item @ row %S requires a valid preset product number", [i + 2]));
                                                }
                                            }
                                            if(!self.isValidRequiredField(rowdata['label'])) {
                                                errorMsgs.push(_("Set item @ row %S requires a label", [i + 2]));
                                            }
                                            if(!self.isValidUUID(rowdata['id'])) {
                                                errorMsgs.push(_("Set item @ row %S requires a valid UUID", [i + 2]));
                                            } else {
                                                if(rowdata['id'].length != 0) {
                                                    if(GeckoJS.Array.inArray(rowdata['id'], setIds) != -1) {
                                                        errorMsgs.push(_("Set item row %S contains a duplicated ID", [i + 2]));
                                                    }
                                                    setIds.push(rowdata['id']);
                                                }
                                            }
                                            if(rowdata['linkgroup_id'].length > 0) {
                                                var queryString = "SELECT id FROM categories WHERE name='" + rowdata['linkgroup_id'] + "';";
                                                var result = tableTmp.getDataSource().fetchAll(queryString);
                                                if(!result[0]){
                                                    errorMsgs.push(_("Set item @ row %S requires a valid category link", [i + 2]));
                                                }
                                            }
                                            if(!rowdata['quantity'] || isNaN(rowdata['quantity'])) {
                                                errorMsgs.push(_("Set item @ row %S requires a valid quantity", [i + 2]));
                                            }
                                            if(!rowdata['baseprice'] || isNaN(rowdata['baseprice'])) {
                                                errorMsgs.push(_("Set item @ row %S requires a valid base price value", [i + 2]));
                                            }
                                            if(!self.isValidRequiredField(rowdata['sequence'])) {
                                                errorMsgs.push(_("Set item @ row %S requires a sequence", [i + 2]));
                                            } else {
                                                if(isNaN(rowdata['sequence'])) {
                                                    errorMsgs.push(_("Set item @ row %S requires a valid sequence value", [i + 2]));
                                                } else {
                                                    if(setSets[plusetNo] == null){
                                                       setSets[plusetNo] = [];
                                                    }
                                                    if(GeckoJS.Array.inArray(rowdata['sequence'], setSets[plusetNo]) != -1) {
                                                        errorMsgs.push(_("Set item @ row %S constains a repeating sequence value in product set %S",[i + 2, plusetNo]));
                                                    }
                                                    setSets[plusetNo].push(rowdata['sequence']);
                                                }
                                            }
                                            if(!self.isValidBooleanField(rowdata['reduction'], true)) {
                                                errorMsgs.push(_("Set item @ row %S requires a valid boolean reduction value", [i + 2]));
                                            }
                                            break;
                                    }
                                    default: {
                                    }
                                }
                            }
                            switch(model) {
                                case "condiments": {
                                        break;
                                }
                                case "condimentgroups": {
                                        break;
                                }
                                case "plugroups": {
                                        //if any of the imported product group items has link_group content re-validate here
                                        linkGrpNms.forEach(function(item) {
                                            if(GeckoJS.Array.inArray(item[0], pluGrpNms) == -1){
                                                errorMsgs.push(_("Product Group item @ row %S has invalid group link %S", [item[1] +2, item[0]]));
                                            }
                                        },this);
                                        break;
                                }
                                case "products": {
                                        break;
                                }
                                case "categories": {
                                        break;
                                }
                                case "setitems": {
                                        //check each pluset set's sequence correctness here'
                                        break;
                                }
                                default: {
                                }
                            }

                            if(errorMsgs.length > 0) {
                                var errorMsgDisplay = "";
                                var errorMsgLog = "";
                                var errorLogFile = new GeckoJS.File(fileName + ".log", true);
                                errorLogFile.open("w");
                                for(var i = 0;i < errorMsgs.length;i++) {
                                    errorMsgLog += errorMsgs[i];
                                    errorMsgLog += "\n";
                                }
                                errorLogFile.write(errorMsgLog);
                                errorLogFile.close();
                                var errorDisplayCount = errorMsgs.length > 5 ? 5 : errorMsgs.length;
                                for(var i = 0;i < errorDisplayCount;i++) {
                                    errorMsgDisplay += errorMsgs[i];
                                    errorMsgDisplay += "\n";
                                }
                                if(errorMsgs.length > 5) {
                                    errorMsgDisplay += "............ \n";
                                }
                                errorMsgDisplay += _("Please check %S for complete error log", [fileName + ".log"]);
                                GREUtils.Dialog.alert(this.topmostWindow, _("Import Data Integrity Error"), _(errorMsgDisplay));
                                return;
                            }


                            tableTmp.truncate();
                            tableTmp.begin();
                            lines.forEach(function(buf) {
                                var datas = GeckoJS.String.parseCSV(buf)[0];
            // this.log(this.dump(datas));
                                var rowdata = GREUtils.extend({}, tableTpl);
                                for (var i=0; i < fields.length; i++) {
                                    rowdata[fields[i]] = datas[i];
                                }
                                //let's process new manual data entry here'
                                switch(model) {
                                    case "plugroups": {
                                            if(rowdata['routing'].length < 1) {
                                                rowdata['routing'] = "0";
                                            }
                                            if(rowdata['visible'].length < 1) {
                                                rowdata['visible'] = "0";
                                            }
                                            if(rowdata['button_color'].length < 1) {
                                                rowdata['button_color'] = "plugroup-button-color-default";
                                            }
                                            if(rowdata['font_size'].length < 1) {
                                                rowdata['font_size'] = "medium";
                                            }
                                            //unpack link_department names into ids
                                            var _departmentNms = rowdata['link_department'].length > 0 ? rowdata['link_department'].split(',') : [];
                                            var vals = [];
                                            _departmentNms.forEach(function(name) {
                                                if(name.length > 0) {
                                                    var queryString = "SELECT id FROM categories WHERE name ='" + name + "';";
                                                    var result = tableTmp.getDataSource().fetchAll(queryString);
                                                    try {
                                                        vals.push(result[0].id);
                                                    } catch (e) {
                                                    }
                                                }
                                            },this);
                                            var val = "";
                                            for(var i = 0;i < vals.length;i++) {
                                                val += vals[i];
                                                val += i != (vals.length - 1) ? "," : "";
                                            }
                                            rowdata['link_department'] = val;
                                            break;
                                    }
                                    case "categories": {
                                            if(rowdata['no'].substr(0,1) == "'") {
                                                rowdata['no'] = rowdata['no'].substr(1,(rowdata['no'].length - 1));
                                            }
                                            if(rowdata['button_color'].length < 1) {
                                                rowdata['button_color'] = "department-button-color-default";
                                            }
                                            if(rowdata['font_size'].length < 1) {
                                                rowdata['font_size'] = "medium";
                                            }
                                            if(rowdata['cansale'].length < 1) {
                                                rowdata['cansale'] = "0";
                                            }
                                            if(rowdata['visible'].length < 1) {
                                                rowdata['visible'] = "0";
                                            }
                                            break;
                                    }
                                    case "products": {
                                            if(rowdata['cate_no'].substr(0,1) == "'") {
                                                rowdata['cate_no'] = rowdata['cate_no'].substr(1,(rowdata['cate_no'].length - 1));
                                            }
                                            if(rowdata['no'].substr(0,1) == "'") {
                                                rowdata['no'] = rowdata['no'].substr(1,(rowdata['no'].length - 1));
                                            }
                                            if(rowdata['barcode'].substr(0,1) == "'") {
                                                rowdata['barcode'] = rowdata['barcode'].substr(1,(rowdata['barcode'].length - 1));
                                            }
                                            var _condNms = rowdata['cond_group'].length > 0 ? rowdata['cond_group'].split(',') : [];
                                            var vals = [];
                                            _condNms.forEach(function(name) {
                                                if(name.length > 0) {
                                                    var queryString = "SELECT id FROM condiment_groups WHERE name ='" + name + "';";
                                                    var data = tableTmp.getDataSource().fetchAll(queryString);
                                                    try {
                                                        vals.push(data[0].id);
                                                    } catch(e) {
                                                    }
                                                }
                                            },this);
                                            var val = "";
                                            for(var i = 0;i < vals.length;i++) {
                                                val += vals[i];
                                                val += i != (vals.length - 1) ? "," : "";
                                            }
                                            rowdata['cond_group'] = val;
                                            var _departmentNms = rowdata['link_group'].length > 0 ? rowdata['link_group'].split(',') : [];
                                            var vals = [];
                                            _departmentNms.forEach(function(name) {
                                                if(name.length > 0) {
                                                    var queryString = "SELECT id FROM plugroups WHERE name ='" + name + "';";
                                                    var data = tableTmp.getDataSource().fetchAll(queryString);
                                                    try {
                                                        vals.push(data[0].id);
                                                    } catch(e) {

                                                    }
                                                }
                                            },this);
                                            var val = "";
                                            for(var i = 0;i < vals.length;i++) {
                                                val += vals[i];
                                                val += i != (vals.length - 1) ? "," : "";
                                            }
                                            rowdata['link_group'] = val;
                                            if(rowdata['buy_price'].length < 1) {
                                                rowdata['buy_price'] = "0";
                                            }
                                            if(rowdata['stock'].length < 1) {
                                                rowdata['stock'] = "0";
                                            }
                                            if(rowdata['min_stock'].length < 1) {
                                                rowdata['min_stock'] = "0";
                                            }
                                            if(rowdata['min_sale_qty'].length < 1) {
                                                rowdata['min_sale_qty'] = "0";
                                            }
                                            if(rowdata['sale_unit'].length < 1) {
                                                rowdata['sale_unit'] = "individually";
                                            }
                                            for(var y = 1;y < 10;y++) {
                                                if(rowdata['level_enable' + y].length < 1) {
                                                    rowdata['level_enable' + y] = "0";
                                                }
                                                if(rowdata['price_level' + y].length < 1) {
                                                    rowdata['price_level' + y] = "0";
                                                }
                                                if(rowdata['halo' + y].length < 1) {
                                                    rowdata['halo' + y] = "0";
                                                }
                                                if(rowdata['lalo' + y].length < 1) {
                                                    rowdata['lalo' + y] = "0";
                                                }
                                            }
                                            if(rowdata['auto_maintain_stock'].length < 1) {
                                                rowdata['auto_maintain_stock'] = "0";
                                            }
                                            if(rowdata['return_stock'].length < 1) {
                                                rowdata['return_stock'] = "0";
                                            }
                                            if(rowdata['force_condiment'].length < 1) {
                                                rowdata['force_condiment'] = "0";
                                            }
                                            if(rowdata['single'].length < 1) {
                                                rowdata['single'] = "0";
                                            }
                                            if(rowdata['visible'].length < 1) {
                                                rowdata['visible'] = "0";
                                            }
                                            if(rowdata['button_color'].length < 1) {
                                                rowdata['button_color'] = "product-button-color-default";
                                            }
                                            if(rowdata['font_size'].length < 1) {
                                                rowdata['font_size'] = "medium";
                                            }
                                            if(rowdata['age_verification'].length < 1) {
                                                rowdata['age_verification'] = "0";
                                            }
                                            if(rowdata['icon_only'].length < 1) {
                                                rowdata['icon_only'] = "0";
                                            }
                                            if(rowdata['manual_adjustment_only'].length < 1) {
                                                rowdata['manual_adjustment_only'] = "0";
                                            }
                                            if(rowdata['append_empty_btns'].length < 1) {
                                                rowdata['append_empty_btns'] = "0";
                                            }
                                            break;
                                    }
                                    case "condiments": {
                                            var condNm = rowdata['condiment_group_id'];
                                            var queryString = "SELECT id FROM condiment_groups WHERE name ='" + condNm + "';";
                                            var data = tableTmp.getDataSource().fetchAll(queryString);
                                            try{
                                                rowdata['condiment_group_id'] = data[0].id;
                                            } catch(e) {
                                            }
                                            if(rowdata['button_color'].length < 1) {
                                                rowdata['button_color'] = "condiment-button-color-default";
                                            }
                                            if(rowdata['font_size'].length < 1) {
                                                rowdata['font_size'] = "medium";
                                            }
                                            if(rowdata['preset'].length < 1) {
                                                rowdata['preset'] = "0";
                                            }
                                            break;
                                    }
                                    case "condimentgroups": {
                                            if(rowdata['seltype'].length < 1) {
                                                rowdata['seltype'] = "single";
                                            }
                                            if(rowdata['newline'].length < 1) {
                                                rowdata['newline'] = "0";
                                            }
                                            break;
                                    }
                                    case "setitems": {
                                            if(rowdata['pluset_no'].substr(0,1) == "'") {
                                                rowdata['pluset_no'] = rowdata['pluset_no'].substr(1,(rowdata['pluset_no'].length - 1));
                                            }
                                            if(rowdata['preset_no'].substr(0,1) == "'") {
                                                rowdata['preset_no'] = rowdata['preset_no'].substr(1,(rowdata['preset_no'].length - 1));
                                            }
                                            if(rowdata['quantity'].length < 1) {
                                                rowdata['quantity'] = "0";
                                            }
                                            if(rowdata['baseprice'].length < 1) {
                                                rowdata['baseprice'] = "0";
                                            }
                                            if(rowdata['reduction'].length < 1) {
                                                rowdata['reduction'] = "0";
                                            }
                                            var cateNm = rowdata['linkgroup_id'];
                                            var queryString = "SELECT id FROM categories WHERE name ='" + cateNm + "';";
                                            var data = tableTmp.getDataSource().fetchAll(queryString);
                                            try{
                                                rowdata['linkgroup_id'] = data[0].id;
                                            } catch(e) {
                                            }
                                    }
                                    default: {

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
                            switch(model) {
                                    case "plugroups": {
                                            var pluGrps = tableTmp.find('all');
                                            pluGrps.forEach(function(group) {
                                                var _grpNms = group.link_group.length > 0 ? group.link_group.split(',') : [];
                                                var vals = [];
                                                _grpNms.forEach(function(name) {
                                                    if(name.length > 0) {
                                                        var queryString = "SELECT id FROM plugroups WHERE name ='" + name + "';";
                                                        var result = tableTmp.getDataSource().fetchAll(queryString);
                                                        if(result.length > 0) {
                                                            vals.push(result[0].id);
                                                        }
                                                    }
                                                },this);
                                                var val = "";
                                                for(var i = 0;i < vals.length;i++) {
                                                    val += vals[i];
                                                    val += i != (vals.length - 1) ? "," : "";
                                                }
                                                group.link_group = val;
                                                tableTmp.id = group.id;
                                                tableTmp.save(group);
                                            },this);
                                            break;
                                    }
                                    default: {
                                    }
                            }


                            break;
                    }
                    case "preference": {
                            var line = lines[0];
                            var _datas = preferenceType == 'object' ? GeckoJS.BaseObject.unserialize(line) : line;
                            GeckoJS.Configure.remove(preference);
                            GeckoJS.Configure.write(preference, _datas, true);
                            break;
                    }
                    case "data": {
                            break;
                    }
                    case "license": {
                            break;
                    }
                }

            }
            catch (e) {
                NotifyUtils.error(_('Format error detected in import file [%S]!', [this._datas[index].filename]));
            }
            finally {
                
                this._busy = false;
                switch(importType) {
                    case "model": {
                            tableTmp.commit();
                            break;
                    }
                    case "preference": {
                            break;
                    }
                    case "data": {
                            break;
                    }
                    case "license": {
                            break;
                    }
                }

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
            this.getListObj().refresh();

            NotifyUtils.info(_('Data import from file [%S] finished!', [this._datas[index].filename]));

            // restart vivipos
            GeckoJS.Observer.notify(null, 'prepare-to-restart', this);
        },


        load: function () {

            this.checkBackupDevices();

            this._datas = [
                {
                    name: _('Department'),
                    type: 'model',
                    model: 'categories',
                    filename: 'departments.csv',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('Product'),
                    type: 'model',
                    model: 'products',
                    filename: 'products.csv',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('Product Group'),
                    type: 'model',
                    model: 'plugroups',
                    filename: 'plugroups.csv',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('Condiment Group'),
                    type: 'model',
                    model: 'condimentgroups',
                    filename: 'condimentgroups.csv',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('Condiment'),
                    type: 'model',
                    model: 'condiments',
                    filename: 'condiments.csv',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('Function Panels'),
                    type: 'preference',
                    preference: 'vivipos.fec.settings.functionpanel',
                    preferenceType: 'object',
                    filename: 'function_panels.js',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('Device Settings'),
                    type: 'preference',
                    preference: 'vivipos.fec.settings.selectedDevices',
                    preferenceType: 'string',
                    filename: 'device_settings.js',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('Price Levels'),
                    type: 'preference',
                    preference: 'vivipos.fec.settings.PriceLevelSchedule',
                    preferenceType: 'string',
                    filename: 'price_levels.js',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('HotKeys'),
                    type: 'preference',
                    preference: 'vivipos.fec.settings.hotkeys',
                    preferenceType: 'string',
                    filename: 'hotkeys.js',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('Promotions'),
                    type: 'model',
                    model: 'promotions',
                    filename: 'promotions.csv',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('ACL Permissions'),
                    type: 'data',
                    database: "/data/databases/vivipos_acl.sqlite",
                    filename: '',
                    table: ["acl_group_roles", "acl_groups", "acl_roles", "acl_users"],
                    imported: '',
                    exported: ''
                },
                {
                    name: _('Tables'),
                    type: 'data',
                    database: "/data/databases/vivipos_table.sqlite",
                    filename: '',
                    table: ["tables", "table_statuses", "table_regions", "table_orders", "table_bookings"],
                    imported: '',
                    exported: '',
                },
                {
                    name: _('Set Items'),
                    type: 'model',
                    model: 'setitems',
                    filename: 'setitems.csv',
                    imported: '',
                    exported: ''
                },
                {
                    name: _('License'),
                    type: 'license',
                    filename: '/etc/vivipos.lic',
                    imported: 'Invalid',
                    exported: ''
                }
            ];
            
            var panelView = new GeckoJS.NSITreeViewArray(this._datas);
            this.getListObj().datasource = panelView;
        },

        isValidBooleanField: function(field, optional) {
            if(!optional) {
                if(!field || field.length < 1) {
                    return false;
                }
            } else {
                if(!field || field.length < 1) {
                    return true;
                }
            }
            if(GeckoJS.Array.inArray(String(field).toLowerCase(), [
                "0",
                "1",
                "true",
                "false"
            ]) == -1) {
                return false;
            }
            return true;
        },

        isValidFontSizeField: function(field, optional) {
            var selection = [
                "xlarge",
                "large",
                "medium",
                "small"
            ];
            return this.isValidChoiceField(field, selection, optional);
        },

        isValidButtonColorField: function(field, prefix, optional) {
            var selection = [];
            for(var i = 0;i < 12;i++) {
                if(i == 0) {
                    selection.push(prefix + "-button-color-default");
                } else {
                    selection.push(prefix + "-button-color-" + i);
                }
            }
            return this.isValidChoiceField(field, selection, optional);
        },

        isValidChoiceField: function(field, selection, optional) {
            if(!optional) {
                if(!field || field.length < 1) {
                    return false;
                }
            } else {
                if(!field || field.length < 1) {
                    return true;
                }
            }

            if(GeckoJS.Array.inArray(field, selection) == -1) {
                return false;
            }
            return true;
        },

        isValidRequiredField: function(field) {
            if(!field) {
                return false;
            }

            field = GeckoJS.String.trim(field);

            if(field.length < 1) {
                return false;
            }

            return true;
        },

        isValidUUID: function(field) {
            if(field.length == 0) {
                return true;
            } else {
                var splits = field.split("-");
                if(splits.length != 5) {
                    return false;
                } else {
                    if(splits[0].length != 8 || splits[1].length != 4 || splits[2].length != 4 || splits[3].length != 4 || splits[4].length != 12) {
                        return false;
                    }
                }
            }
            return true;
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();

