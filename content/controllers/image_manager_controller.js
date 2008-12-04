(function(){

var ImageFilesView = window.ImageFilesView = GeckoJS.NSITreeViewArray.extend({
        init: function(dir) {
            this._dir = dir;
            this.data = new GeckoJS.Dir.readDir(dir).sort(function(a, b) {if (a.leafName < b.leafName) return -1; else if (a.leafName > b.leafName) return 1; else return 0;});
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

    });


    GeckoJS.Controller.extend( {
        name: 'ImageManager',
        helpers: ['Number'],

        _dir: null,
        _selectedFile: null,
        _selectedIndex: -1,
        _disklimit: 1 * 1024 * 1024, // 50 MB
        _importDir: null,

        loadImage: function(dir) {

            this._selectedFile = null;
            this._selectedIndex = -1;
            this._dir = dir;

            this.imagefilesView = new ImageFilesView(dir);

            var limitSetting = GeckoJS.Configure.read('vivipos.fec.settings.image.disklimit');
            if (limitSetting > this._disklimit) this._disklimit = limitSetting;

            this._importDir = GeckoJS.Configure.read('vivipos.fec.settings.image.importdir');
            if (!this._importDir) this._importDir = '/media/disk/image_import/';

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

        importFromDir: function(importDir) {
            if (!importDir || (importDir.length == 0)) importDir = this._importDir;
            var files = new GeckoJS.Dir.readDir(importDir);

            var orgDir = GREUtils.File.getFile(this._dir);

            var $currentUsage = this.query("#currentUsage");
            var $totalLimit = this.query("#totalLimit");
            var $usageProgressmeter = this.query("#usageProgressmeter");
            var $currentFiles = this.query("#currentFiles");

            var fileCount = this.imagefilesView.fileCount;

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
                }

            }, this);
            this.loadImage(this._dir);

        },

        exportToDir: function() {
            
        },

        deleteImage: function() {

            var result = GREUtils.Dialog.confirm(this.window, "Are you sure", "Are you sure want to delete '" + this._selectedFile.leafName + "'");
            if (result) {
                // unlink
                // GeckoJS.File.remove(this._selectedFile.path) ;
                this._selectedFile.remove(false);
                // refresh
                this.loadImage(this._dir);
            }
            
        },
        
        renameImage: function() {

            var input = {value: this._selectedFile.leafName};
            var result = GREUtils.Dialog.prompt(this.window, "Rename image", "Original image: '" + this._selectedFile.leafName, input);

            if (result) {
                // moveto
                this._selectedFile.moveTo(this._selectedFile.parent, input.value);
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
            
        },

        okButtonClick: function(args) {
            if (this._selectedFile) {
                args.result = true;
                args.file = this._selectedFile.path;
            }
        }
    });

})();
