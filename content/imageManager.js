(function(){

    /**
     * Window Startup
     */
    function startup() {
        if (window.arguments && (typeof window.arguments[0].wrappedJSObject == 'object')) {
            
            window.args = window.arguments[0].wrappedJSObject;
        } else {

            var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            // var sDstDir = GREUtils.File.chromeToPath('chrome://viviecr/content/skin/images/');
            // var sDstDir = GeckoJS.Configure.read('vivipos.fec.settings.image.originaldir');
            var sDstDir = datapath + '/images/original/';
            if (!sDstDir) sDstDir = '/data/images/original/';

            sDstDir = (sDstDir + '/').replace(/\/+/g,'/');

            window.args = {
                pickerMode: false,
                directory: sDstDir + '',
                result: false,
                file: ''
            };
        }
        if (window.args && window.args.pickerMode) {
            // just hide manager panel ?
            $('#managerPanel').hide();
            $('#toolbar').show();
        }
        else {
            $('#managerPanel').show();
            $('#toolbar').hide();
        }

        // set progressmeter mode to determined
        var progress = document.getElementById('progress');
        progress.mode = 'determined';
        progress.value = 0;
        
        centerWindowOnScreen();

        $do('loadImage', args.directory, 'ImageManager');

    };

    window.addEventListener('load', startup, true);

})();
