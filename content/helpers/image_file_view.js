(function(){

    var __view__ = {

        /**
         * Array View [{leafName: 'filename', path: 'fullFilePath', fileSize: filesize}]
         *
         */
        init: function(data) {
            this.data = data || [];
            this.fileCount = this.data.length;
            var totalSize = 0;
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

                var aImageFile = "file://" + val + '?' + Math.random();

                return aImageFile;
        },
        renderButton: function(row, btn) {

            if (btn) {
                btn.removeAttribute('checked');
            }

        }

    };

    var ImageFilesArrayView = window.ImageFilesArrayView = GeckoJS.NSITreeViewArray.extend(__view__);


    var ImageFilesView = window.ImageFilesView = ImageFilesArrayView.extend({
        
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
        
    });


})();

