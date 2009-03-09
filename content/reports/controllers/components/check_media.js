(function() {

    var CheckMediaComponent = window.CheckMediaComponent = GeckoJS.Component.extend({

    /**
     * Component CheckMedia
     */

        name: 'CheckMedia',

        initial: function () {
            // @todo :
            alert('check Media initial...');
        },
        
        // @todo
        // folderName can not include the "/" at this moment...
        checkMedia: function(folderName, autoCreate) {

            var osLastMedia = new GeckoJS.File('/tmp/last_media');
            //var osLastMedia = new GeckoJS.File('/var/tmp/vivipos/last_media');

            var last_media = "";
            var deviceNode = "";
            var deviceReady = false;
            this._backupDir = null;

            var deviceMount = "/media/";
            //var deviceMount = "/var/tmp/";

            var hasMounted = false;

            // auto create folder default is true...
            if (typeof autoCreate == "undefined") autoCreate = true;

            if (osLastMedia.exists()) {
                osLastMedia.open("r");
                last_media = osLastMedia.readLine();
                osLastMedia.close();
            }

            if (last_media) {

                var tmp = last_media.split('/');
                deviceNode = tmp[tmp.length-1];
                deviceMount +=  deviceNode + '/';



                var mountDir = new GeckoJS.File(deviceMount);

                if (mountDir.exists() && mountDir.isDir()) {

                    // mount dir exists
                    // autocreate given folder name
                    storeName = GeckoJS.Session.get('storeContact').name;
                    var mediaDir = new GeckoJS.Dir(deviceMount + folderName + '/' + storeName, autoCreate);

                    if (mediaDir.exists()) {

                        // return target path if device ready...
                        deviceReady = mediaDir.path;

                        // deviceReady = true;

                    }
                }
            }

            return deviceReady ;
        }
    });

})();
