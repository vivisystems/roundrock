(function(){

var FuncItems = window.FuncItems = GeckoJS.NSITreeViewArray.extend({
        init: function() {
            var prefs = GeckoJS.BaseObject.getValues(GeckoJS.Configure.read('vivipos.fec.settings.controlpanels'));
            this.data = new GeckoJS.ArrayQuery(prefs).orderBy("label asc");
        },

        getCellValue: function(row, col) {

            var sResult;

            try {
                sResult = this.data[row][col.id];
            }
            catch (e) {
                return "";
            }
            return _(sResult);
        }

    });


    GeckoJS.Controller.extend( {
        name: 'ControlPanel',
        helpers: ['Number'],

        _dir: null,
        _selectedFile: null,
        _selectedIndex: -1,

        loadItems: function() {
            
            this._selectedFile = null;
            this._selectedIndex = -1;

            this.funcItems = new FuncItems();
            // this.log("Items:" + this.dump(this.funcItems));
            this.query('#imagePanel')[0].datasource = this.funcItems;
            
        },

        select: function(index) {

            function openModal(url, data, w, h) {
              var features = "dialogwidth: " + w + "; dialogheight: " + h + "; resizable: yes";
              var r = window.showModalDialog(url, data, features);
              return r;
            };


            var pref = this.funcItems.data[index];
            var aURL = pref['path'];

            var aName = "pluprop";
            var aArguments = "";
            var width = 800;
            var height = 600;
            // openModal(aURL, null, width, height);

            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=" + width + ",height=" + height;
            window.openDialog(aURL, "Preferences", features);

        },

        

        okButtonClick: function(args) {
            //
        }
        
    });

})();
