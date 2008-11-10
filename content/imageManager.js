(function(){

 /**
  * Window Startup
  */
    function startup() {
    
        var args = window.args = window.arguments[0].wrappedJSObject;
        if (args.pickerMode) {
            // just hide manager panel ?
            $('#managerPanel').hide();

            doSetOKCancel(function(){
                $do('okButtonClick', args, 'ImageManager');
                return true;
            });
        }

        centerWindowOnScreen();

        //"/home/rack/workspace/sam4s/content/skin/icons/"
        $do('loadImage', args.directory, 'ImageManager');

    };

    window.addEventListener('load', startup, true);

})();
