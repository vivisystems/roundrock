(function(){

    /**
     * Window Startup
     */
    function startup() {/*
        if (window.arguments && (typeof window.arguments[0].wrappedJSObject == 'object')) {

            window.args = window.arguments[0].wrappedJSObject;
        } else {

            var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
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
        progress.value = 0;*/

        doSetOKCancel(
            function(){ /*

                var items = document.getElementById('taxscrollablepanel').selectedItems;

                if (items.length == 0) {
                    inputObj.rate = '';
                    inputObj.name = '';
                }
                else {
                    var index = items[0];

                    inputObj.rate = taxes[index].no;
                    inputObj.name = taxes[index].name;
                }
                inputObj.ok = true;
                return true;*/
                alert('ok');
            },
            function(){/*
                inputObj.ok = false;
                return true;*/
                alert('cancel');
            }
            );

        var path = GREUtils.File.chromeToPath('chrome://viviecr/content/images/labels');

        $do('loadImage', path, 'ImageManager');

    }; 

    window.addEventListener('load', startup, true);

})();