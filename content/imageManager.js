(function(){

    /**
     * Window Startup
     */
    function startup() {

        if (window.arguments) {
            var args = window.args = window.arguments[0].wrappedJSObject;
        } else {

            var sDstDir = GREUtils.File.chromeToPath("chrome://viviecr/content/skin/images/");

            var aURL = "chrome://viviecr/content/imageManager.xul";
            var aName = "imagePicker";

            var args = {
                pickerMode: false,
                // directory: "/home/rack/workspace/sam4s/content/skin/icons/",
                directory: sDstDir + "/",
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
