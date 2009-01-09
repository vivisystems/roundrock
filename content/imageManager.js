(function(){

    /**
     * Window Startup
     */
    function startup() {

        if (typeof window.arguments[0].wrappedJSObject == "object") {
            var args = window.args = window.arguments[0].wrappedJSObject;
        } else {

            // var sDstDir = GREUtils.File.chromeToPath("chrome://viviecr/content/skin/images/");
            var sDstDir = GeckoJS.Configure.read('vivipos.fec.settings.image.originaldir');
            if (!sDstDir) sDstDir = '/data/images/original/';
            if (sDstDir[sDstDir.length - 1] != "/") sDstDir += "/";

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
