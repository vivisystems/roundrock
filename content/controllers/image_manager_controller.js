(function(){

var ImageFilesView = window.ImageFilesView = GeckoJS.NSITreeViewArray.extend({
        init: function(dir) {
            this._dir = dir;
            this.data = new GeckoJS.Dir.readDir(dir);
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

        loadImage: function(dir) {

            this._selectedFile = null;
            this._selectedIndex = -1;
            this._dir = dir;

            this.imagefilesView = new ImageFilesView(dir);
            this.query('#imagePanel')[0].datasource = this.imagefilesView;

            this.query("#currentUsage").val(this.Number.toReadableSize(this.imagefilesView._totalSize));
            this.query("#totalLimit").val(this.Number.toReadableSize(1000000));
            var percent = Math.ceil(this.imagefilesView._totalSize / 1000000 *100 );
            this.query("#usageProgressmeter").val(percent);
            this.query("#currentFiles").val(this.Number.format(this.imagefilesView.fileCount));



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
            importDir = "/usr/share/icons/gnome/32x32/actions/";
            var files = new GeckoJS.Dir.readDir(importDir);

            var orgDir = GREUtils.File.getFile(this._dir);

            var $currentUsage = this.query("#currentUsage");
            var $totalLimit = this.query("#totalLimit");
            var $usageProgressmeter = this.query("#usageProgressmeter");
            var $currentFiles = this.query("#currentFiles");

            files.forEach(function(file) {
                file.copyTo(orgDir, "");

                this.imagefilesView._totalSize += file.fileSize;
                $currentUsage.val(this.Number.toReadableSize(this.imagefilesView._totalSize));
                $totalLimit.val(this.Number.toReadableSize(1000000));
                var percent = Math.ceil(this.imagefilesView._totalSize / 1000000 *100 );
                $usageProgressmeter.val(percent);
                $currentFiles.val(this.Number.format(this.imagefilesView.fileCount));


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
                this.loadImage(this._dir);
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
