(function(){

    /**
     * Big Disk controller
     */

    var __controller__ = {

        name: 'BigDisk',

        _marker: '.bigdisk',
        _id: '.bigdisk_id',
        _data_path: '',
        _marker_path:'',
        _license_path: '/etc/vivipos.lic',
        _bigdisk_pref: 'vivipos.vivicenter.roundrock.settings.BigDisk',

        initial: function() {

            // set up event listeners
            this.addEventListener('suspendBigDisk', this._suspendBigDisk, this);

            var bigdisk = '';
            var current_bigdisk = GeckoJS.Configure.read(this._bigdisk_pref) || 'none';

            // set up various paths
            this._data_path = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            this._marker_path = this._data_path + '/' + this._marker;

            // check if big disk is enabled
            bigdisk = this._checkProvisionedBigDisk(this._marker_path, this._license_path);
            if (bigdisk) {
                switch(current_bigdisk) {
                    case 'suspended':
                        // restore and merge, reset current_bigdisk
                        alert('resumeBigDisk');
                        if (this.dispatchEvent('resumeBigDisk')) {
                            GeckoJS.Configure.write(this._bigdisk_pref, bigdisk);
                        }
                        break;
                        
                    case 'none':
                        alert('activateBigDisk');
                        if (this.dispatchEvent('activateBigDisk')) {
                            GeckoJS.Configure.write(this._bigdisk_pref, bigdisk);
                        }

                    default:
                        if (bigdisk != current_bigdisk) {
                            // restore but no merge, reset current_bigdisk
                            alert('newBigDisk');
                            if (this.dispatchEvent('newBigDisk')) {
                                GeckoJS.Configure.write(this._bigdisk_pref, bigdisk);
                            }
                        }
                        else {
                            alert('continue with big disk');
                        }
                        break;
                }
            }
            else {
                if (current_bigdisk != 'none' && current_bigdisk != 'suspended') {

                    alert('suspendBigDisk');
                    if (this.dispatchEvent('suspendBigDisk')) {
                        GeckoJS.Configure.write(this._bigdisk_pref, 'suspended');
                    }
                }
                else {
                    if (current_bigdisk == 'none') {
                        alert('no big disk found; big disk never activated');
                    }
                    else {
                        alert('no big disk found; big disk suspended');
                    }
                }
            }
            
            this.dispatchEvent('BigDiskMode', bigdisk)
        },

        _checkProvisionedBigDisk: function(marker, license) {

            var bigdisk = '';
            var licenseFile = new GeckoJS.File(license);
            var markerFile = new GeckoJS.File(marker);

            if (licenseFile.exists() && licenseFile.isReadable() && markerFile.exists() && markerFile.isReadable()) {

                licenseFile.open('r');
                markerFile.open('r');

                var license_data = licenseFile.read() || '';
                var marker_content = markerFile.read() || '';
                var marker_data = marker_content.substr(37);
                if (license_data == marker_data) {
                    bigdisk = marker_content.substr(0, 36);
                }

                licenseFile.close();
                markerFile.close();
            }

            return bigdisk;
        },

        _suspendBigDisk: function(evt) {

            var notifications = [];

            // verify that various system options and parameters fall within limits
            //
            // 1. bi-directional sync
            var settings = (new SyncSetting()).read();
            if (GeckoJS.String.parseBoolean(settings.pull_order)) {
                notifications.push(_('Orders will not be pulled from synchronization server'))
            }

            // 2. number of days to retain order data

            // 3. number of days to retain inventory commitment records

            // 4. number of local backups

            // notify user that system options and parameters have been updated
            if (notifications.length > 0) {

                var win = this.topmostWindow;
                if (win.document.documentElement.id == 'viviposMainWindow'
                    && win.document.documentElement.boxObject.screenX < 0) {
                    win = null;
                }
                GREUtils.Dialog.alert(win,
                                      _('Configuration Validation'),
                                      _('We have detected terminal configurations that are incompatible with your storage capacity. Incompatible configurations have been automatically adjusted.')
                                        + '\n\n'
                                        + _('Terminal will restart for the new configurations to take effect'));


                if (GeckoJS.String.parseBoolean(settings.pull_order)) {
                    settings.pull_order = 0;
                    (new SyncSetting()).save(settings);

                    if (restart_sync) {
                        // restart sync_client
                        GeckoJS.File.run('/etc/init.d/sync_client', ['restart'], true);
                    }
                }

                $do('restart', null, 'Main');
                GeckoJS.Configure.write(this._bigdisk_pref, false);
            }
            else {

            }
        },

        destroy: function() {

        }
    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'BigDisk');
    }, false);

})();
