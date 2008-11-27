(function() {

    var NSIPriceLevelsView = window.NSIPriceLevelsView = GeckoJS.NSITreeViewArray.extend({

        getValue: function() {
            
            var selectedItems = this.tree.selectedItems;
            var selectedItemsStr = [];

            var data = this.data;
            selectedItems.forEach(function(idx){
                selectedItemsStr.push(data[idx].name);
            });

            return selectedItemsStr.join(',');
        },

        setValue: function(items) {

            var selectedItemsStr = items.split(',');
            var selectedItems = [];

            var dataNameIndex = GeckoJS.Array.objectExtract(this.data, '{n}.name');

            selectedItemsStr.forEach(function(name){
                var index = GeckoJS.Array.inArray(name, dataNameIndex);
                if (index != -1) selectedItems.push(index);
            });
            this.tree.selectedItems = selectedItems;
            
        },

        getCurrentIndexData: function (row) {
            return this.data[row];
        },

        getImageSrc: function(row, col) {
            var val = this.getCellValue(row, col);

            var aImageFile = "chrome://viviecr/content/skin/cateimages" + "/" + val + ".png" /*+ "?"+ Math.random()*/;

            if (GREUtils.File.exists(GREUtils.File.chromeToPath(aImageFile))) {
                return aImageFile;

            }else {
                return null;
            }
        },

        renderButton: function(row, btn) {
            /*
            var buttonColor = this.getCellValue(row,{
                id: 'button_color'
            });
            var buttonFontSize = this.getCellValue(row,{
                id: 'font_size'
            });
            */
           var buttonColor = "white";
           var buttonFontSize = "medium";
            if (buttonColor && btn) {
                $(btn).addClass('button-'+ buttonColor);
            }
            if (buttonFontSize && btn) {
                $(btn).addClass('font-'+ buttonFontSize);
            }

        }
    });

})();
