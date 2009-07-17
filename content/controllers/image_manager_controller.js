(function(){

    var __view__ = {

        init: function(dir) {
            this._dir = dir;

            // only .png supported.
            this.data = new GeckoJS.Dir.readDir(dir, {type: "f", name: /.png$/i}).sort(function(a, b) {
                if (a.leafName < b.leafName) return -1; 
                else if (a.leafName > b.leafName) return 1; 
                else return 0;
            });

            var totalSize = 0;
            this.fileCount = this.data.length;
            this.data.forEach(function(file) {
                totalSize += file.fileSize;
            });
            this._totalSize = totalSize;

        },

        getCurrentIndexData: function (row) {
            return this.data[row];
        },

        getImageSrc: function(row, col) {

                var val = this.getCellValue(row, col);

                var aImageFile = "file://" + val;

                return aImageFile;
        },
        renderButton: function(row, btn) {

            if (btn) {
                btn.removeAttribute('checked');
            }

        }

    };

    var ImageFilesView = window.ImageFilesView = GeckoJS.NSITreeViewArray.extend(__view__);

    var __controller__ = {
        name: 'ImageManager',
        helpers: ['Number'],

        _dir: null,
        _selectedFile: null,
        _selectedIndex: -1,
        _disklimit: 200 * 1024 * 1024, // 200 MB
        _pluDir: null,
        _importDir: null,
        _exportDir: null,

        setButtonDisable: function(disabled) {
            //
            //$('#importBtn').attr('disabled', disabled);
            //$('#exportBtn').attr('disabled', disabled);

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
            // var osLastMedia = new GeckoJS.File('/var/tmp/vivipos/last_media');

            var last_media = "";
            var deviceNode = "";
            var deviceReady = false;

            var deviceMount = "/media/";
            // var deviceMount = "/var/tmp/";

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

                    var importDir = new GeckoJS.Dir(deviceMount+'/image_import', true);
                    var exportDir = new GeckoJS.Dir(deviceMount+'/image_export', true);

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

        loadImage: function(dir) {

            this._selectedFile = null;
            this._selectedIndex = -1;
            this._dir = dir;

            this.imagefilesView = new ImageFilesView(dir);

            var limitSetting = GeckoJS.Configure.read('vivipos.fec.settings.image.disklimit');
            if (limitSetting > this._disklimit) this._disklimit = limitSetting;

            this.query('#imagePanel')[0].datasource = this.imagefilesView;

            this.query("#currentUsage").val(this.Number.toReadableSize(this.imagefilesView._totalSize));
            this.query("#totalLimit").val(this.Number.toReadableSize(this._disklimit));
            var percent = Math.ceil(this.imagefilesView._totalSize / this._disklimit *100 );
            this.query("#usageProgressmeter").val(percent);
            this.query("#currentFiles").val(this.Number.format(this.imagefilesView.fileCount));

            this.query('#lblName').val('');
            this.query('#lblSize').val('');

        },

        select: function(index) {

            var selectedFile = this.imagefilesView.getCurrentIndexData(index);
            if (selectedFile) {

                var imagePanel = this.query('#imagePanel')[0];
                if(this._selectedIndex > -1) {
                    var btnIndex =  this._selectedIndex % imagePanel.buttonCount;
                     imagePanel.buttons[btnIndex].removeAttribute('checked');
                }
                
                this._selectedFile = selectedFile;
                this._selectedIndex = index;

                var btnIndex2 =  this._selectedIndex % imagePanel.buttonCount;
                imagePanel.buttons[btnIndex2].setAttribute('checked', true);

                this.query('#lblName').val(selectedFile.leafName);
                this.query('#lblSize').val(this.Number.toReadableSize(selectedFile.fileSize));
            }
        },

        showWaitingPanel: function (message) {

            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            var waitPanel = document.getElementById( 'wait_panel' );

            waitPanel.sizeTo( 360, 120 );
            var x = ( width - 360 ) / 2;
            var y = ( height - 240 ) / 2;

            // set the content of the label attribute be default string, taking advantage of the statusText attribute.
            var caption = document.getElementById( 'wait_caption' );
            caption.label = message;

            waitPanel.openPopupAtScreen( x, y );

            return waitPanel;
        },

        importFromDir: function(importDir) {
            // return if importing...
            if (this._busy) return;

            if (!this.checkBackupDevices()) return;

            if (!importDir || (importDir.length == 0)) importDir = this._importDir;

            var files = new GeckoJS.Dir.readDir(importDir, {type: "f", name: /.png$/i});

            var orgDir = GREUtils.File.getFile(this._dir);

            var $currentUsage = this.query("#currentUsage");
            var $totalLimit = this.query("#totalLimit");
            var $usageProgressmeter = this.query("#usageProgressmeter");
            var $currentFiles = this.query("#currentFiles");

            var $importUsage = this.query("#actionUsage");
            var $importFiles = this.query("#actionFiles");
            var $importStatus = this.query("#actionStatus");
            
            var fileCount = this.imagefilesView.fileCount;

            var importUsage = 0;
            var importFiles = 0;

            var result = GREUtils.Dialog.confirm(this.topmostWindow,
                                                 _("confirm import"),
                                                 _("Please attach the USB thumb drive containing the images to import and press OK to start the import."));

            if (!result) return;

            var total = files ? files.length : 0;
            if (total == 0 || isNaN(total)) {
                NotifyUtils.warn(_('No images found at [%S]', [importDir]));
                return;
            }

            var waitPanel = this.showWaitingPanel(_('Importing %S Images', [total]));
            var progmeter = document.getElementById('progress');
            progmeter.value = 0;

            this._busy = true;
            this.setButtonDisable(true);

            $importStatus.val(_('in progress'));
            try {
                // set max script run time...
                var oldLimit = GREUtils.Pref.getPref('dom.max_chrome_script_run_time');
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', 5 * 60);
                this._busy = true;

                files.forEach(function(file) {
                    if (this.imagefilesView._totalSize <= this._disklimit) {

                        file.copyTo(orgDir, "");

                        this.imagefilesView._totalSize += file.fileSize;

                        $currentUsage.val(this.Number.toReadableSize(this.imagefilesView._totalSize));
                        $totalLimit.val(this.Number.toReadableSize(this._disklimit));
                        var percent = Math.ceil(this.imagefilesView._totalSize / this._disklimit *100 );
                        $usageProgressmeter.val(percent);

                        var fileCountDir = new GeckoJS.Dir.readDir(this._dir);
                        if (fileCountDir) fileCount = fileCountDir.length;
                        $currentFiles.val(this.Number.format(fileCount));

                        var totalSize = 0;
                        fileCountDir.forEach(function(file) {
                            totalSize += file.fileSize;
                        });
                        this.imagefilesView._totalSize = totalSize;

                        importUsage += file.fileSize;
                        importFiles++;

                        progmeter.value = importFiles * 100 / total;
                        this.sleep(50);
                    }
                }, this);
                $importStatus.val(_('import done'));

                NotifyUtils.info(_('%S image successfully imported from [%S]', [total, importDir]));
            }
            catch (e) {
                $importStatus.val('error');
                NotifyUtils.info(_('An error was encountered while importing images from [%S]', [importDir]));
            }
            finally {

                this._busy = false;
                this.sleep(200);
                // reset max script run time...
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);

                this.execute("/bin/sh", ["-c", "/bin/sync; /bin/sleep 1; /bin/sync;"]);

                // progmeter.value = 0;
                this.setButtonDisable(false);
                waitPanel.hidePopup();
            }

            $importUsage.val(this.Number.toReadableSize(importUsage));
            $importFiles.val(this.Number.format(importFiles));

            this.loadImage(this._dir);

        },

        exportToDir: function(exportDir) {
            // return if importing...
            if (this._busy) return;

            if (!this.checkBackupDevices()) return;

            if (!exportDir || (exportDir.length == 0)) exportDir = this._exportDir;

            var result = GREUtils.Dialog.confirm(this.topmostWindow,
                                                 _("Confirm Export"),
                                                 _("Please attach the USB thumb drive to export images to and press OK to start the export."));

            if (!result) return;

            var $exportUsage = this.query("#actionUsage");
            var $exportFiles = this.query("#actionFiles");
            var $exportStatus = this.query("#actionStatus");

            var exportUsage = 0;
            var exportFiles = 0;

            if (!exportDir || (exportDir.length == 0)) exportDir = this._exportDir;

            var files = new GeckoJS.Dir.readDir(this._dir);
            var total = files ? files.length : 0;

            if (total == 0 || isNaN(total)) {
                NotifyUtils.warn(_('No images to export!'));
                return;
            }
            
            var waitPanel = this.showWaitingPanel(_('Exporting %S Images', [total]));
            var progmeter = document.getElementById('progress');
            progmeter.value = 0;

            this._busy = true;
            this.setButtonDisable(true);


            $exportStatus.val(_('in progress'));
            try {
                var self = this;

                if (!GREUtils.File.isDir(exportDir) || !GREUtils.File.isWritable(exportDir)) {
                    throw new Exception();
                }

                // set max script run time...
                var oldLimit = GREUtils.Pref.getPref('dom.max_chrome_script_run_time');
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', 5 * 60);
                

                var destDir = GREUtils.File.getFile(exportDir);

                files.forEach(function(file) {
                    file.copyTo(destDir, "");
                    exportUsage += file.fileSize;
                    exportFiles++;

                    progmeter.value = exportFiles * 100 / total;
                    self.sleep(50);
                }, this);
                $exportStatus.val(_('export done'));

                NotifyUtils.info(_('%S images successfully exported to [%S]', [exportFiles, exportDir]));
            }
            catch (e) {
                $exportStatus.val('error');
                NotifyUtils.info(_('An error was encountered while exporting images to [%S]', [exportDir]));
            }
            finally {
                this._busy = false;
                progmeter.value = 100;
                this.sleep(200);
                // reset max script run time...
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);

                this.execute("/bin/sh", ["-c", "/bin/sync; /bin/sleep 1; /bin/sync;"]);

                // progmeter.value = 0;
                this.setButtonDisable(false);
                waitPanel.hidePopup();
            }

            $exportUsage.val(this.Number.toReadableSize(exportUsage));
            $exportFiles.val(this.Number.format(exportFiles));
        },

        deleteImage: function() {
            if (this._selectedFile == null) {
                NotifyUtils.warn(_('Please select an image first'));
                return;
            }

            var result = GREUtils.Dialog.confirm(this.topmostWindow,
                                                 _("confirm delete"),
                                                 _("Are you sure you want to delete %S", [this._selectedFile.leafName]));
            if (result) {
                // unlink
                // GeckoJS.File.remove(this._selectedFile.path) ;
                this._selectedFile.remove(false);

                NotifyUtils.info(_('Image (%S) is successfully deleted', [this._selectedFile.leafName]));

                // refresh
                this.loadImage(this._dir);
            }
            
        },
        
        renameImage: function() {
            if (this._selectedFile == null) {
                NotifyUtils.warn(_('Please select an image first'));
                return;
            }

            var input = {value: this._selectedFile.leafName};
            var result = GREUtils.Dialog.prompt(this.topmostWindow, _('Rename Image'), _('Original image: ') + this._selectedFile.leafName, input);

            if (result) {
                try {
                    // moveto
                    this._selectedFile.moveTo(this._selectedFile.parent, input.value);

                    NotifyUtils.info(_('Image (%S) successfully renamed to (%S)', [this._selectedFile.leafName, input.value]));
                    // refresh
                    //this.loadImage(this._dir);
                    var imagePanel = this.query('#imagePanel')[0];
                    if(this._selectedIndex > -1) {
                        var btnIndex =  this._selectedIndex % imagePanel.buttonCount;
                        imagePanel.buttons[btnIndex].label = input.value;
                        this.query('#lblName').val(input.value);
                        this._selectedFile.leafName = input.value;
                    }
                }
                catch (e) {
                    //
                    NotifyUtils.info(_('Rename Image (%S) Error'), [this._selectedFile.leafName]);
                }
                finally {
                    //
                }

            }
            
        },

        okButtonClick: function(args) {
            if (this._selectedFile) {
                args.result = true;
                args.file = this._selectedFile.path;
            }
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();
