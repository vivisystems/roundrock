(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }
    if(typeof ImageFilesView == 'undefined') {
        include( 'chrome://viviecr/content/helpers/image_file_view.js' );
    }

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

            var limitSetting = GeckoJS.Configure.read('vivipos.fec.settings.image.disklimit') || 0;
            if (limitSetting > this._disklimit) this._disklimit = limitSetting;

            this.query('#imagePanel')[0].datasource = this.imagefilesView;

            this.query("#currentUsage").val(this.Number.toReadableSize(this.imagefilesView._totalSize));
            this.query("#totalLimit").val(this.Number.toReadableSize(this._disklimit));
            var percent = Math.ceil(this.imagefilesView._totalSize / this._disklimit *100 );
            this.query("#usageProgressmeter").val(percent);
            this.query("#currentFiles").val(this.Number.format(this.imagefilesView.fileCount));

            this.query('#lblName').val('');
            this.query('#lblSize').val('');

            this.validateForm();
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
            this.validateForm();
        },

        showWaitingPanel: function (message) {

            var waitPanel = document.getElementById( 'wait_panel' );

            // set the content of the label attribute be default string, taking advantage of the statusText attribute.
            var caption = document.getElementById( 'wait_caption' );
            caption.label = message;

            waitPanel.openPopupAtScreen(0, 0);

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

            // automatically link imported photos to products
            var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                    .getService(Components.interfaces.nsIPromptService);
            var check = {value: false};

            var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                        prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +
                        prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var productsById = GeckoJS.Session.get('productsById');
            var sPluDir = GREUtils.File.getFile(GeckoJS.Session.get('pluimage_directory'));
            
            var linkProductImage =
                prompts.confirmEx(this.topmostWindow, _('Link Product Image'),
                                                      _('Do you want to link imported images with matching products?'),
                                                      flags, _('Update Only'), _('No Link'), _('Reset and Update'), null, check);

            var waitPanel = this.showWaitingPanel(_('Importing %S Images', [total]));
            var progmeter = document.getElementById('progress');
            progmeter.value = 0;

            this._busy = true;
            this.setButtonDisable(true);

            $importStatus.val(_('in progress'));
            try {
                this._busy = true;

                if (linkProductImage == 2) {
                    var pluimages = new GeckoJS.Dir.readDir(sPluDir, {type: "f", name: /.png$/i});
                    if (pluimages) {
                        pluimages.forEach(function(f) {
                            GREUtils.File.remove(f);
                        })
                    }
                }
                
                files.forEach(function(file) {
                    if (this.imagefilesView._totalSize <= this._disklimit) {

                        file.copyTo(orgDir, '');

                        // link to product?
                        if (linkProductImage == 0 || linkProductImage == 2) {

                            // get file leaf name without the extension
                            var prodNo;
                            var dotIndex = file.leafName.lastIndexOf('.');
                            if (dotIndex == -1) prodNo = file.leafName;
                            else prodNo = file.leafName.substr(0, dotIndex);
                            var prodId = barcodesIndexes[prodNo]

                            var product = productsById[prodId];
                            if (product && product.no == prodNo) {
                                file.copyTo(sPluDir, '');
                            }
                        }

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
                this.log('ERROR', GeckoJS.BaseObject.dump(e));
                $importStatus.val('error');
                NotifyUtils.error(_('An error was encountered while importing images from [%S]', [importDir]));
            }
            finally {

                this._busy = false;
                this.sleep(200);

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
                NotifyUtils.error(_('An error was encountered while exporting images to [%S]', [exportDir]));
            }
            finally {
                this._busy = false;
                progmeter.value = 100;
                this.sleep(200);

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
                                                 _('confirm delete'),
                                                 _('Are you sure you want to delete [%S]', [this._selectedFile.leafName]));
            if (result) {
                // unlink
                // GeckoJS.File.remove(this._selectedFile.path) ;
                this._selectedFile.remove(false);

                NotifyUtils.info(_('Image [%S] successfully deleted', [this._selectedFile.leafName]));

                // refresh
                this.loadImage(this._dir);
            }
            
        },
        
        deleteAllImages: function() {

            var result = GREUtils.Dialog.confirm(this.topmostWindow,
                                                 _('confirm delete'),
                                                 _('Are you sure you want to delete all images?'));
            if (!result) return;

            var files = new GeckoJS.Dir.readDir(this._dir);
            var total = files ? files.length : 0;

            if (total == 0 || isNaN(total)) {
                NotifyUtils.warn(_('No images to delete!'));
                return;
            }

            var waitPanel = this.showWaitingPanel(_('Deleting %S Images', [total]));
            var progmeter = document.getElementById('progress');
            progmeter.value = 0;

            var removedFiles = 0;
            this.setButtonDisable(true);

            try {
                files.forEach(function(file) {
                    file.remove(false);
                    removedFiles++;

                    progmeter.value = removedFiles * 100 / total;
                    this.sleep(50);
                }, this);

                NotifyUtils.info(_('%S images successfully deleted', [removedFiles]));
            }
            catch (e) {
                this.log('ERROR', GeckoJS.BaseObject.dump(e));
                NotifyUtils.info(_('An error was encountered while deleting all images'));
            }
            finally {
                progmeter.value = 100;
                this.sleep(200);

                this.setButtonDisable(false);
                waitPanel.hidePopup();
            }
            // refresh
            this.loadImage(this._dir);
        },

        renameImage: function() {
            if (this._selectedFile == null) {
                NotifyUtils.warn(_('Please select an image first'));
                return;
            }

            var input = {value: this._selectedFile.leafName};

            // show virtual keyboard
            VirtualKeyboard.show();

            var result = GREUtils.Dialog.prompt(this.topmostWindow, _('Rename Image'), _('Original image') + ': ' + this._selectedFile.leafName, input);

            // hide virtual keyboard
            VirtualKeyboard.hide();

            if (result) {
                var destFile = GeckoJS.String.trim(input.value);
                if (destFile == '') {
                    NotifyUtils.error(_('Image [%S] not renamed; no file name given', [this._selectedFile.leafName]));
                }
                else {

                    if (destFile.substr(-4) != '.png') destFile += '.png';
                    
                    try {
                        if (GREUtils.File.exists(this._selectedFile.parent.path + '/' + destFile)) {
                            if (destFile == this._selectedFile.leafName) {
                                NotifyUtils.warn(_('Image [%S] not renamed to [%S]; no change in file name', [this._selectedFile.leafName, destFile]));
                                return;
                            }
                            
                            if (GREUtils.Dialog.confirm(this.topmostWindow,
                                                        _('confirm overwrite'),
                                                        _('File with name [%S] already exists. Overwrite?', [destFile]))) {
                                GREUtils.File.remove(this._selectedFile.parent.path + '/' + destFile);
                            }
                            else {
                                NotifyUtils.info(_('Image [%S] not renamed to [%S]; file already exists', [this._selectedFile.leafName, destFile]));
                                return;
                            }
                        }

                        // moveto
                        this._selectedFile.moveTo(this._selectedFile.parent, destFile);

                        NotifyUtils.info(_('Image [%S] successfully renamed to [%S]', [this._selectedFile.leafName, destFile]));

                        // refresh
                        this.loadImage(this._dir);
                    }
                    catch (e) {
                        NotifyUtils.error(_('Failed to rename image [%S] to [%S]'), [this._selectedFile.leafName, destFile]);

                        this.log('ERROR', GeckoJS.BaseObject.dump(e));
                    }
                    finally {
                    }
                }
            }            
        },

        exit: function() {
            if (window.args && this._selectedFile) {
                window.args.result = true;
                window.args.file = this._selectedFile.path;
            }
            window.close();
        },

        validateForm: function() {

            var count = (this.imagefilesView && this.imagefilesView.fileCount) || 0;

            document.getElementById('deleteAllBtn').setAttribute('disabled', count == 0);
            document.getElementById('exportBtn').setAttribute('disabled', count == 0);
            
            if (this._selectedFile) {
                document.getElementById('deleteBtn').setAttribute('disabled', false);
                document.getElementById('renameBtn').setAttribute('disabled', false);
                document.getElementById('selectBtn').setAttribute('disabled', false);
            }
            else {
                document.getElementById('deleteBtn').setAttribute('disabled', true);
                document.getElementById('renameBtn').setAttribute('disabled', true);
                document.getElementById('selectBtn').setAttribute('disabled', true);
            }
        }
    };

    AppController.extend(__controller__);

})();
