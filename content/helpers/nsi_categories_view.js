(function() {

    var NSICategoriesView = window.NSICategoriesView = GeckoJS.NSITreeViewArray.extend({
        init: function(data) {
            this._super(data);

            this._data = GeckoJS.Session.get('categories');
            // alert(GeckoJS.BaseObject.dump(Application.storage.get('GeckoJS_Session_events', [])));
            // alert(GeckoJS.BaseObject.dump(GeckoJS.Session.getEvents().listeners));
            var self = this;
            GeckoJS.Session.addEventListener('change', function(evt){
                if (evt.data.key == 'categories') {
                    //alert('categories refresh');
                    self._data = evt.data.value;
                    try {
                        self.tree.invalidate();
                    }catch(e) {}
                }
            });
            // alert(GeckoJS.BaseObject.dump(GeckoJS.Session.getEvents().listeners));
            //alert(GeckoJS.BaseObject.dump(GeckoJS.Session.getEvents().listeners));
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
            
            var buttonColor = this.getCellValue(row,{
                id: 'button_color'
            });
            var buttonFontSize = this.getCellValue(row,{
                id: 'font_size'
            });

            if (buttonColor && btn) {
                $(btn).addClass('button-'+ buttonColor);
            }
            if (buttonFontSize && btn) {
                $(btn).addClass('font-'+ buttonFontSize);
            }

        }
    });

})();
