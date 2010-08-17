(function() {

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'PackageBuilder',

        components: ['Package', 'CheckMedia'],

        // package configuration
        Packages: [],
        Locations: [],
        Sectors: {},
        SectorList: [],
        Resolutions: [],

        screenwidth: GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800,
        screenheight: GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600,

        targetLocales: [],

        translations: {},
        lastTargetLocale: null,

        exporting_file_folder: 'package_export',
        rdf_chrome_path: 'chrome://viviecr/content/packages/install.rdf',

        /*
         * load
         */

        load: function(args) {

            var resolution = this.screenwidth + 'x' + this.screenheight;
            var data = this.Package.loadData();

            this.iconFile = args.icon;
            this.imageFile = args.image;

            this.Packages = data.packages;
            this.Locations = data.locations;
            this.Sectors = data.sectors;

            // set iamge src
            var screenshotImageObj = document.getElementById('screenshot');
            var thumbnailImageObj = document.getElementById('thumbnail');

            if (screenshotImageObj) screenshotImageObj.setAttribute('src', 'file://' + this.imageFile);
            if (thumbnailImageObj) {
                thumbnailImageObj.setAttribute('src', 'file://' + this.iconFile);
                thumbnailImageObj.setAttribute('onclick', '$do("showScreenShot", null, "PackageBuilder")');
            }

            // populate location list
            var locationListObj = document.getElementById('locationlist');
            locationListObj.datasource = this.Locations;

            // compile sector and resolution lists
            var sectorList = [];
            var sectorCheck = {};
            var resolutionList = [];
            var resolutionCheck = {};

            this.Locations.forEach(function(location) {
                var sectors = this.Sectors[location.location];
                sectors.forEach(function(sector) {
                    if (!(sector.sector in sectorCheck)) {
                        sectorCheck[sector.sector] = true;
                        sectorList.push(sector);
                    }

                    if (sector.resolutions) {
                        var resolutions = sector.resolutions.split(',');
                        resolutions.forEach(function(res) {
                            if (!(res in resolutionCheck)) {
                                resolutionCheck[res] = true;
                                resolutionList.push({resolution: res});
                            }
                        }, this);
                    }
                }, this);
            }, this);

            if (!(resolution in resolutionCheck)) {
                resolutionList.push({resolution: resolution});
            }
            
            // populate sector list
            var sectorListObj = document.getElementById('sectorlist');
            this.SectorList = sectorList.sort(function(a, b) {
                                                  if (a.sector > b.sector)
                                                      return -1;
                                                  else if (a.sector < b.sector)
                                                      return 1;
                                                  else
                                                      return 0;
                                              });
            sectorListObj.datasource = this.SectorList;
            
            // populate resolution list
            var resolutionListObj = document.getElementById('resolutionlist');
            resolutionListObj.datasource = resolutionList;
            this.Resolutions = resolutionList;
        },

        selectLocation: function(index) {
            var locationObj = document.getElementById('pkg_location');

            if (index > -1) {
                locationObj.value = this.Locations[index].location;
            }

            this.validateForm();
        },

        selectSector: function(index) {
            var sectorObj = document.getElementById('pkg_sector');

            if (index > -1) {
                sectorObj.value = this.SectorList[index].sector;
            }

            this.validateForm();
        },

        updateLocaleList: function() {
            var localeEntries = document.getElementById('locales').value;
            var localeListObj = document.getElementById('localelist');
            var targetLocaleListObj = document.getElementById('targetlocales');

            this.selectTargetLocale(targetLocaleListObj.selectedIndex);

            var workingLocales = [];
            var localeMarkers  = {};
            var targetLocales = [];

            if (localeEntries) {
                workingLocales = localeEntries.split(',').map(function(elem) {return {locale: GeckoJS.String.trim(elem)}});
            }
            workingLocales.push({locale: 'en'});
            var selectedLocales = localeListObj.listbox.selectedItems;

            var lastIndex = -1;
            selectedLocales.forEach(function(l) {
                workingLocales.push({locale: l.value});
            }, this);

            for (var i = 0; i < workingLocales.length; i++) {
                var l = workingLocales[i];
                if (this.isValidLocale(l.locale)) {
                    if (!(l.locale in localeMarkers)) {
                        targetLocales.push(l);
                        localeMarkers[l.locale] = true;
                        if (l.locale == this.lastLocale) {
                            lastIndex = i;
                        }
                    }
                }
            }
            targetLocales = targetLocales.sort(function(a, b) {if (a.locale > b.locale)
                                                                   return 1;
                                                               else if (a.locale < b.locale)
                                                                   return -1;
                                                               else return 0});

            targetLocaleListObj.datasource = targetLocales;
            this.targetLocales = targetLocales;
            
            if (lastIndex > -1) {
                targetLocaleListObj.selection.select(lastIndex);
            }
            else {
                this.lastLocale = null;
                targetLocaleListObj.selection.clearSelection();
            }
            this.setTranslationForm(this.lastLocale);

            this.validateForm();
        },

        selectTargetLocale: function(index) {
            // update last locale
            if (this.lastLocale) {
                this.translations[this.lastLocale] = {location: document.getElementById('location_translation').value,
                                                      sector: document.getElementById('sector_translation').value,
                                                      description: document.getElementById('description_translation').value
                }
            }

            if (index > -1) {
                this.lastLocale = this.targetLocales[index].locale;
            }
            else {
                this.lastLocale = null;
            }
            this.setTranslationForm(this.lastLocale);
        },

        setTranslationForm: function(locale) {
            var locationObj = document.getElementById('location_translation');
            var sectorObj = document.getElementById('sector_translation');
            var descriptionObj = document.getElementById('description_translation');

            var location_str = '';
            var sector_str = '';
            var description_str = '';

            if (locale) {
                if (this.translations[locale]) {
                    location_str = this.translations[locale].location || '';
                    sector_str = this.translations[locale].sector || '';
                    description_str = this.translations[locale].description || '';
                }
                
                locationObj.removeAttribute('disabled');
                sectorObj.removeAttribute('disabled');
                descriptionObj.removeAttribute('disabled');
            }
            else {
                locationObj.setAttribute('disabled', true);
                sectorObj.setAttribute('disabled', true);
                descriptionObj.setAttribute('disabled', true);
            }
            locationObj.value = location_str;
            sectorObj.value = sector_str;
            descriptionObj.value = description_str;
        },

        _getSelectedResolutions: function() {
            var resolutionEntries = document.getElementById('resolutions').value;
            var resolutionListObj = document.getElementById('resolutionlist');
            var resolutions = [];

            if (resolutionEntries) {
                resolutions = resolutionEntries.split(',');
                resolutions = resolutions.map(function(elem) {return GeckoJS.String.trim(elem)});
            }

            var selectedItems = resolutionListObj.selectedItems;
            selectedItems.forEach(function(item) {
                if (resolutions.indexOf(this.Resolutions[item].resolution) == -1) {
                    resolutions.push(this.Resolutions[item].resolution);
                }
            }, this)

            return resolutions;
        },

        _showWaitPanel: function(message) {
            var caption = document.getElementById( 'wait_caption' );
            if (caption) caption.label = message;

            // hide progress bar
            var progress = document.getElementById('progress');
            if (progress) progress.setAttribute('hidden', true);

            var waitPanel = document.getElementById('wait_panel');
            if (waitPanel) waitPanel.openPopupAtScreen(0, 0);

            // release CPU for progressbar ...
            this.sleep(100);
            return waitPanel;
        },

        updateTranslation: function() {
            var targetLocaleListObj = document.getElementById('targetlocales');
            this.selectTargetLocale(targetLocaleListObj.selectedIndex);

            this.validateForm();
        },

        isAlphaNumeric: function(str) {
            var nonalphaRE = /[^a-zA-Z0-9\-_]/;
            return !nonalphaRE.test(str);
        },

        isValidLocale: function(str) {
            var localeRE1 = /^[a-z]{2}$/;
            var localeRE2 = /^[a-z]{2}-[A-Z]{2}$/
            var localeRE3 = /^[a-z]{2}-[A-Z]{2}-[A-Z]{2}$/
            return localeRE1.test(str) || localeRE2.test(str) || localeRE3.test(str);
        },

        escapeXML: function(str) {
            if (!str) return '';

            return str.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
        },
        
        validateForm: function() {
            var location = GeckoJS.String.trim(document.getElementById('pkg_location').value);
            var sector = GeckoJS.String.trim(document.getElementById('pkg_sector').value);
            var exportBtn = document.getElementById('export');

            var resolutions = this._getSelectedResolutions();

            // check if translations exist for all locales
            var translationExists = true;
            var enExists = false;
            if (this.targetLocales.length > 0) {
                for (var i = 0; i < this.targetLocales.length; i++) {
                    var locale = this.targetLocales[i].locale;
                    if (!this.translations[locale] ||
                        !GeckoJS.String.trim(this.translations[locale].location) ||
                        !GeckoJS.String.trim(this.translations[locale].sector) ||
                        !GeckoJS.String.trim(this.translations[locale].description)) {
                        translationExists = false;
                        break;
                    }
                    if (locale == 'en') {
                        enExists = true;
                    }
                }
            }
            else {
                translationExists = false;
            }
            if (location && this.isAlphaNumeric(location) &&
                sector && this.isAlphaNumeric(sector) &&
                resolutions && resolutions.length > 0 &&
                translationExists && enExists) {
                exportBtn.setAttribute('disabled', false)
            }
            else {
                exportBtn.setAttribute('disabled', true)
            }
        },

        showScreenShot: function() {
            var deck = document.getElementById('deck');
            if (deck) deck.selectedIndex = 1;
        },

        hideScreenShot: function() {
            var deck = document.getElementById('deck');
            if (deck) deck.selectedIndex = 0;
        },

        exportPackage: function() {
            // required info:
            // 1. location
            // 2. sector
            // 3. target locales
            // 4. resolutions
            // 5. translations
            // 6. current skin
            // 7. current layout

            if (!GREUtils.Dialog.confirm(this.topmostWindow, _('Export Package'), _('Are you sure you want to export this package now?'))) {
                return;
            }

            var media_path = this.CheckMedia.checkMedia( this.exporting_file_folder );
            if ( !media_path ) {
                NotifyUtils.warn( _( 'Media not found!! Please attach the USB thumb drive...' ) );
                return;
            }

            var waitPanel = this._showWaitPanel(_('Generating add-on...'));

            var data = {};
            data.location = document.getElementById('pkg_location').value;
            data.sector = document.getElementById('pkg_sector').value;
            data.resolutions = this._getSelectedResolutions();
            data.locales = this.targetLocales;
            data.translations = this.translations;
            data.customcode = document.getElementById('customcode').checked;
            data.timezone = document.getElementById('timezone').checked;

            if (data.timezone) {
                var tzFile = new GeckoJS.File('/etc/timezone');
                if (tzFile.exists()) {
                    tzFile.open("r");
                    data.timezone =  tzFile.readLine() || "Africa/Abidjan";
                    tzFile.close();
                }
                else {
                    delete data.timezone;
                }
            }
            data.skin = GREUtils.Pref.getPref('general.skins.selectedSkin');
            if (data.skin) {
                data.skin = data.skin.replace('-' + this.screenwidth + 'x' + this.screenheight, '-${width}x${height}');
            }
            else {
                data.skin = 'traditional-${width}x${height}/1.0';
            }

            data.layout = GeckoJS.Configure.read('vivipos.fec.general.layouts.selectedLayout') || 'traditional';
            
            // create directory structure
            var profPath = GeckoJS.Configure.read('ProfD');
            var systemPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');

            var rootPath = systemPath + '/backups/' + GeckoJS.String.uuid();
            var chromePath = rootPath + '/chrome';
            var defaultsPath = rootPath + '/defaults';
            var prefsPath = defaultsPath + '/preferences';
            var contentPath = chromePath + '/content';
            var localePath = chromePath + '/locale';
            var imagePath = contentPath + '/images';
            var dbPath = contentPath + '/databases';

            new GeckoJS.Dir(rootPath, true);
            new GeckoJS.Dir(chromePath, true);
            new GeckoJS.Dir(defaultsPath, true);
            new GeckoJS.Dir(prefsPath, true);
            new GeckoJS.Dir(contentPath, true);
            new GeckoJS.Dir(localePath, true);
            new GeckoJS.Dir(imagePath, true);
            new GeckoJS.Dir(dbPath, true);

            // create chrome.manifest
            var manifest = new GeckoJS.File(rootPath + '/chrome.manifest', true);
            manifest.open('w');
            manifest.write('content package_' + data.location + '_' + data.sector + ' chrome/content/ xpcnativewrappers=no\n');

            // process locales
            this.targetLocales.forEach(function(e) {
                manifest.write('locale package_' + data.location + '_' + data.sector + ' ' + e.locale + ' chrome/locale/' + e.locale + '/\n');
                new GeckoJS.Dir(localePath + '/' + e.locale, true);

                var properties = new GeckoJS.File(localePath + '/' + e.locale + '/messages.properties', true);
                properties.open('w');
                if (data.translations[e.locale]) {
                    properties.write('vivipos.fec.registry.package-location.' + data.location + '=' +
                                     GeckoJS.String.trim(data.translations[e.locale].location) + '\n');
                    properties.write('vivipos.fec.registry.package.' + data.location + '.' + data.sector + '.label=' +
                                     GeckoJS.String.trim(data.translations[e.locale].sector) + '\n');
                    properties.write('vivipos.fec.registry.package.' + data.location + '.' + data.sector + '.description=' +
                                     GeckoJS.String.trim(data.translations[e.locale].description) + '\n');
                }
            }, this);
            manifest.close();

            // copy images
            GREUtils.File.copy(this.iconFile, imagePath + '/' + data.location + '_' + data.sector + '_thumbnail.png');
            GREUtils.File.copy(this.imageFile, imagePath + '/' + data.location + '_' + data.sector + '.png');

            // store preferences
            var mPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
            var prefFile = new GeckoJS.File(contentPath + '/user.js', true);
            mPrefService.savePrefFile(prefFile.file);

            // copy db files
            var dbs = GeckoJS.Dir.readDir(systemPath + '/databases', {type: 'f'});

            dbs.forEach(function(f) {
                GREUtils.File.copy(f.path, dbPath);
            })

            // create package.js
            var prefs = new GeckoJS.File(prefsPath + '/package.js', true);
            prefs.open('w');
            prefs.write('pref("vivipos.fec.registry.package-location.' + data.location + '", ' +
                        '"chrome://package_' + data.location + '_' +  data.sector + '/locale/messages.properties");\n');

            if (data.timezone) {
                prefs.write('pref("vivipos.fec.registry.package-timezone.' + data.location + '", "' + data.timezone + '");\n');
            }
            
            prefs.write('pref("vivipos.fec.registry.package.' + data.location + '.' + data.sector + '.label", ' +
                        '"chrome://package_' + data.location + '_' +  data.sector + '/locale/messages.properties");\n');
            prefs.write('pref("vivipos.fec.registry.package.' + data.location + '.' + data.sector + '.icon", ' +
                        '"chrome://package_' + data.location + '_' +  data.sector + '/content/images/' + data.location + '_' + data.sector + '_thumbnail.png");\n');
            prefs.write('pref("vivipos.fec.registry.package.' + data.location + '.' + data.sector + '.fullimage", ' +
                        '"chrome://package_' + data.location + '_' +  data.sector + '/content/images/' + data.location + '_' + data.sector + '.png");\n');
            prefs.write('pref("vivipos.fec.registry.package.' + data.location + '.' + data.sector + '.description", ' +
                        '"chrome://package_' + data.location + '_' +  data.sector + '/locale/messages.properties");\n');
            prefs.write('pref("vivipos.fec.registry.package.' + data.location + '.' + data.sector + '.resolutions", "' +
                        data.resolutions.join(',') + '");\n');
            prefs.write('pref("vivipos.fec.registry.package.' + data.location + '.' + data.sector + '.skin", "' + data.skin + '");\n');
            prefs.write('pref("vivipos.fec.registry.package.' + data.location + '.' + data.sector + '.layout", "' + data.layout + '");\n');
            prefs.write('pref("vivipos.fec.registry.package.' + data.location + '.' + data.sector + '.datapath", ' +
                        '"chrome://package_' + data.location + '_' +  data.sector + '/content");\n');

            if (data.customcode) {
                // create extensions.tar
                var exec = new GeckoJS.File('/bin/tar');
                exec.run(['-czf', contentPath + '/extensions.tgz', '-C', profPath + '/extensions', '.'], true);
                exec.close();

                prefs.write('pref("vivipos.fec.registry.package.' + data.location + '.' + data.sector + '.customcode", "extensions.tgz");\n');
            }
            prefs.close();

            // generate install.rdf
            var package_id = 'package_' + data.location + '_' + data.sector;
            var package_name = this.escapeXML(document.getElementById('package_name').value || package_id);
            var package_version = this.escapeXML(document.getElementById('package_version').value || '');
            var package_creator = this.escapeXML(document.getElementById('package_creator').value || '');
            var package_desc = this.escapeXML(data.translations['en'].description || '');

            var rdfPath = GREUtils.File.chromeToPath(this.rdf_chrome_path);
            var rdf = GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(rdfPath));

            rdf = rdf.replace('${package_id}', package_id);
            rdf = rdf.replace('${package_name}', package_name);
            rdf = rdf.replace('${package_version}', package_version);
            rdf = rdf.replace('${package_creator}', package_creator);
            rdf = rdf.replace('${package_description}', package_desc);

            var installRDF = new GeckoJS.File(rootPath + '/install.rdf', true);
            installRDF.open('w');
            installRDF.write(rdf);
            installRDF.close();

            // create localization.js
            prefs = new GeckoJS.File(prefsPath + '/localization.js', true);
            prefs.open('w');
            /* localization */
            prefs.write('pref("vivipos.fec.registry.localization.package.' + package_id + '.base", "en");\n');
            prefs.write('pref("vivipos.fec.registry.localization.package.' + package_id + '.ext", "dtd,properties");\n');

            // create XPI and move to media
            var xpiFile = 'package_' + data.location + '_' + data.sector + '_' + package_version + '.xpi'
            var convertedXPIFile = GREUtils.Charset.convertFromUnicode(xpiFile.replace(' ', '_'), 'UTF-8');
            var exportScript = systemPath + '/scripts/export_package.sh';
            var exec = new GeckoJS.File(exportScript);
            exec.run([rootPath, convertedXPIFile, media_path], true);
            exec.close();

            // remove tmp directory, which should be empty
            GREUtils.Dir.remove(rootPath);

            waitPanel.hidePopup();
            
            // notify user
            GREUtils.Dialog.alert(this.topmostWindow, _('Export Package'), _('Package [%S] has been exported to [%S] as [%S]',
                                  [package_name, media_path, xpiFile]));
        }

    };

    AppController.extend(__controller__);

})()
