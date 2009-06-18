(function(){

    /**
     * Localization Editor
     */

    var __controller__ = {
        name: 'ExportLocale',

        components: [ 'CheckMedia' ],

        _exporting_file_folder: 'locale_export',

        _pkg: null,

        _locale: null,

        _path: null,

        load: function(data) {
            var pkg = data[0];
            var locale = data[1];
            var path = data[2];
            var installation = data[3];
            var rdf = data[4];
            
            var packageTextboxObj = document.getElementById('package');
            var localeTextboxObj = document.getElementById('locale');
            var nameTextboxObj = document.getElementById('name');
            var installTextboxObj = document.getElementById('install');

            if (packageTextboxObj) packageTextboxObj.value = pkg;
            if (localeTextboxObj) localeTextboxObj.value = locale;
            if (nameTextboxObj) {
                nameTextboxObj.value = installation;
                nameTextboxObj.select();
            }
            if (installTextboxObj) installTextboxObj.value = rdf;

            this._pkg = pkg;
            this._locale = locale;
            this._path = path;
        },
        
        exportLocale: function() {
            if (!this._pkg) {
                NotifyUtils.warn(_('Please select a package to export first'));
                return;
            }

            if (!this._locale) {
                NotifyUtils.warn(_('Please select a locale to export first'));
                return;
            }

            var media_path = this.CheckMedia.checkMedia( this._exporting_file_folder );
            if ( !media_path ) {
                NotifyUtils.warn( _( 'Media not found!! Please attach the USB thumb drive...' ) );
                return;
            }

            // retrieve new package name
            var name = '';
            var nameTextboxObj = document.getElementById('name');
            if (nameTextboxObj) {
                name = GeckoJS.String.trim(nameTextboxObj.value);
                if (name && name.substr(-4) != '.xpi')
                    name += '.xpi';
            }

            // retrieve edited install.rdf
            var buf = '';
            var installTextboxObj = document.getElementById('install');
            if (installTextboxObj) buf = GeckoJS.String.trim(installTextboxObj.value);

            if (!buf || buf.length == 0) {
                NotifyUtils.warn(_('Installation file [install.rdf] must not be empty'));
                return;
            }

            // save edited install.rdf in /tmp
            var r;
            var tmpInstallRDF = '/tmp/install.rdf.' + GeckoJS.String.uuid();
            var fp = new GeckoJS.File(tmpInstallRDF, true);
            fp.open('w');
            if (!(r = fp.write(buf))) {
                this.log('ERROR', 'Failed to write temporary install.rdf file [' + tmpInstallRDF + ']');
                NotifyUtils.error(_('Failed to create install.rdf file [%S]', [tmpInstallRDF]));
            }
            fp.close();
            if (!r) {
                GREUtils.File.remove(tmpInstallRDF);
                return;
            }

            // invoke external script to generate XPI and move it to media
            var exportScript = '/data/scripts/exportLocale.sh';
            var exec = new GeckoJS.File(exportScript);
            r = exec.run([name, this._path, tmpInstallRDF, media_path], true);

            GREUtils.File.remove(tmpInstallRDF);
            if (r == 0) {
                NotifyUtils.info(_( 'Locale package [%S] successfully exported', [this._pkg]));
            }
            else {
                this.log('ERROR', 'Script ' + exportScript + ' failed to export locale package [' + this._pkg + ']');
                GREUtils.Dialog.alert(window,
                                      _('Export Locale'),
                                      _('Failed to export locale package [%S]', [this._pkg]));
            }
        },
        
        validateForm: function() {
            var exportBtnObj = document.getElementById('export');
            var nameTextboxObj = document.getElementById('name');
            var installTextboxObj = document.getElementById('install');

            // turn on export btn only if all fields are populated
            if (exportBtnObj) {
                if ((nameTextboxObj && nameTextboxObj.value != '') &&
                    (installTextboxObj && GeckoJS.String.trim(installTextboxObj.value) != '')) {
                    exportBtnObj.removeAttribute('disabled');
                }
                else {
                    exportBtnObj.setAttribute('disabled', 'true');
                }
            }
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();
