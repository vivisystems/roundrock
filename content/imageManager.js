(function(){

    /**
     * Window Startup
     */
    function startup() {

        if (typeof window.arguments[0].wrappedJSObject == "object") {
            var args = window.args = window.arguments[0].wrappedJSObject;
        } else {

            var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/') + '/data';
            // var sDstDir = GREUtils.File.chromeToPath("chrome://viviecr/content/skin/images/");
            // var sDstDir = GeckoJS.Configure.read('vivipos.fec.settings.image.originaldir');
            var sDstDir = datapath + "images/original/";
            if (!sDstDir) sDstDir = '/data/images/original/';

            sDstDir = (sDstDir + '/').replace(/\/+/g,'/');

            var aURL = "chrome://viviecr/content/imageManager.xul";
            var aName = "imagePicker";

            var args = {
                pickerMode: false,
                directory: sDstDir + "",
                result: false,
                file: ""
            };
        }

        if (args.pickerMode) {
            // just hide manager panel ?
            $('#managerPanel').hide();

            doSetOKCancel(function(){
                $do('okButtonClick', args, 'ImageManager');
                return true;
            });
        }

        centerWindowOnScreen();

        $do('loadImage', args.directory, 'ImageManager');

    };

    window.addEventListener('load', startup, true);

})();
