(function(){

    var NSIProductsView = window.NSIProductsView = GeckoJS.NSITreeViewArray.extend( {
        
        getCurrentIndexData: function (row) {
            return this.data[row];
        },

        getCellValue: function(row, col) {
            return this.getCellText(row, col);
        },

        getCellText: function(row, col) {

            // this.log(row +","+col);
            var products = GeckoJS.Session.get('products');

            var sResult;
            var idx;
            var key;

            try {
                key = col.id;
                idx = this.data[row];
                sResult= products[idx][key];
            }
            catch (e) {
                return "";
            }
            return sResult;

        },

        getImageSrc: function(row, col) {
            
                var val = this.getCellValue(row, col);
                //this.log('getImageSrc = ' + row + ", " +col.id + "," + val);

                var aImageFile = "chrome://viviecr/content/skin/pluimages" + "/" + val + ".png" /*+ "?"+ Math.random()*/;
                if (GREUtils.File.exists(GREUtils.File.chromeToPath(aImageFile))) {
                    return aImageFile;

                }else {
                    return null;
                }
        },

        renderButton: function(row, btn) {

            var buttonColor = this.getCellValue(row,{id: 'button_color'});
            var buttonFontSize = this.getCellValue(row,{id: 'font_size'});

            if (buttonColor && btn) {
                $(btn).addClass('button-'+ buttonColor);
            }
            if (buttonFontSize && btn) {
                $(btn).addClass('font-'+ buttonFontSize);
            }
        }

    });

})();

