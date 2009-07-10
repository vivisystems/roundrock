(function() {

    var __controller__ = {

        name: 'SetupWizard',
        
        components: ['Tax', 'Package'],

        // configuration keys
        PackageKey: 'vivipos.fec.registry.package',
        BasePackage: 'viviecr',

        // package configuration
        Packages: [],
        Locations: [],
        Sectors: {},

        screenwidth: GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800,
        screenheight: GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600,

        currentLocale: null,
        selectedLocale: null,
        availabelLocales: [],

        currentKbmap: null,
        selectedKbmap: null,
        availableKbmaps: [  {label: _('(kbmap)Albania'), value: 'al', image: ''},
                            {label: _('(kbmap)Andorra'), value: 'ad', image: ''},
                            {label: _('(kbmap)Arabic'), value: 'ara', image: ''},
                            {label: _('(kbmap)Armenia'), value: 'am', image: ''},
                            {label: _('(kbmap)Azerbaijan'), value: 'az', image: ''},
                            {label: _('(kbmap)Bangladesh'), value: 'bd', image: ''},
                            {label: _('(kbmap)Belarus'), value: 'by', image: ''},
                            {label: _('(kbmap)Belgium'), value: 'be', image: ''},
                            {label: _('(kbmap)Bosnia and Herzegovina'), value: 'ba', image: ''},
                            {label: _('(kbmap)Brazil'), value: 'br', image: ''},
                            {label: _('(kbmap)Bulgaria'), value: 'bg', image: ''},
                            {label: _('(kbmap)Canada'), value: 'ca', image: ''},
                            {label: _('(kbmap)China'), value: 'cn', image: ''},
                            {label: _('(kbmap)Congo, Democratic Republic of the'), value: 'cd', image: ''},
                            {label: _('(kbmap)Croatia'), value: 'hr', image: ''},
                            {label: _('(kbmap)Czechia'), value: 'cz', image: ''},
                            {label: _('(kbmap)Denmark'), value: 'dk', image: ''},
                            {label: _('(kbmap)Esperanto'), value: 'epo', image: ''},
                            {label: _('(kbmap)Estonia'), value: 'ee', image: ''},
                            {label: _('(kbmap)Ethiopia'), value: 'et', image: ''},
                            {label: _('(kbmap)Faroe Islands'), value: 'fo', image: ''},
                            {label: _('(kbmap)Finland'), value: 'fi', image: ''},
                            {label: _('(kbmap)France'), value: 'fr', image: ''},
                            {label: _('(kbmap)Georgia'), value: 'ge', image: ''},
                            {label: _('(kbmap)Germany'), value: 'de', image: ''},
                            {label: _('(kbmap)Ghana'), value: 'gh', image: ''},
                            {label: _('(kbmap)Greece'), value: 'gr', image: ''},
                            {label: _('(kbmap)Guinea'), value: 'gn', image: ''},
                            {label: _('(kbmap)Hungary'), value: 'hu', image: ''},
                            {label: _('(kbmap)Iceland'), value: 'is', image: ''},
                            {label: _('(kbmap)India'), value: 'in', image: ''},
                            {label: _('(kbmap)Iran'), value: 'ir', image: ''},
                            {label: _('(kbmap)Iraq'), value: 'iq', image: ''},
                            {label: _('(kbmap)Ireland'), value: 'ie', image: ''},
                            {label: _('(kbmap)Israel'), value: 'il', image: ''},
                            {label: _('(kbmap)Italy'), value: 'it', image: ''},
                            {label: _('(kbmap)Japan'), value: 'jp', image: ''},
                            {label: _('(kbmap)Japan (PC-98xx Series)'), value: 'nec_vndr_jp', image: ''},
                            {label: _('(kbmap)Kazakhstan'), value: 'kz', image: ''},
                            {label: _('(kbmap)Korea, Republic of'), value: 'kr', image: ''},
                            {label: _('(kbmap)Kyrgyzstan'), value: 'kg', image: ''},
                            {label: _('(kbmap)Laos'), value: 'la', image: ''},
                            {label: _('(kbmap)Latin American'), value: 'latam', image: ''},
                            {label: _('(kbmap)Lithuania'), value: 'lt', image: ''},
                            {label: _('(kbmap)Latvia'), value: 'lv', image: ''},
                            {label: _('(kbmap)Macedonia'), value: 'mk', image: ''},
                            {label: _('(kbmap)Maldives'), value: 'mv', image: ''},
                            {label: _('(kbmap)Malta'), value: 'mt', image: ''},
                            {label: _('(kbmap)Maori'), value: 'mao', image: ''},
                            {label: _('(kbmap)Mongolia'), value: 'mn', image: ''},
                            {label: _('(kbmap)Montenegro'), value: 'me', image: ''},
                            {label: _('(kbmap)Morocco'), value: 'ma', image: ''},
                            {label: _('(kbmap)Nepal'), value: 'np', image: ''},
                            {label: _('(kbmap)Netherlands'), value: 'nl', image: ''},
                            {label: _('(kbmap)Nigeria'), value: 'ng', image: ''},
                            {label: _('(kbmap)Norway'), value: 'no', image: ''},
                            {label: _('(kbmap)Pakistan'), value: 'pk', image: ''},
                            {label: _('(kbmap)Poland'), value: 'pl', image: ''},
                            {label: _('(kbmap)Portugal'), value: 'pt', image: ''},
                            {label: _('(kbmap)Romania'), value: 'ro', image: ''},
                            {label: _('(kbmap)Russia'), value: 'ru', image: ''},
                            {label: _('(kbmap)Serbia'), value: 'rs', image: ''},
                            {label: _('(kbmap)Slovakia'), value: 'sk', image: ''},
                            {label: _('(kbmap)Slovenia'), value: 'si', image: ''},
                            {label: _('(kbmap)South Africa'), value: 'za', image: ''},
                            {label: _('(kbmap)Spain'), value: 'es', image: ''},
                            {label: _('(kbmap)Sweden'), value: 'se', image: ''},
                            {label: _('(kbmap)Switzerland'), value: 'ch', image: ''},
                            {label: _('(kbmap)Syria'), value: 'sy', image: ''},
                            {label: _('(kbmap)Tajikistan'), value: 'tj', image: ''},
                            {label: _('(kbmap)Thailand'), value: 'th', image: ''},
                            {label: _('(kbmap)Turkey'), value: 'tr', image: ''},
                            {label: _('(kbmap)Ukraine'), value: 'ua', image: ''},
                            {label: _('(kbmap)United Kingdom'), value: 'gb', image: ''},
                            {label: _('(kbmap)USA'), value: 'us', image: ''},
                            {label: _('(kbmap)Uzbekistan'), value: 'uz', image: ''},
                            {label: _('(kbmap)Vietnam'), value: 'vn', image: ''} ],

        selectedLocation: null,
        selectedTimezone: null,
        selectedSector: null,
        selectedDefaultUser: null,
        selectedDefaultTaxID: null,
        storeInformation: null,

        lastLocation: null,
        lastSector: null,

        args: null,

        /*
         * load
         */

        load: function(args) {
            
            this.args = args;

            var locationListObj = document.getElementById('locationlist');
            var resolution = this.screenwidth + 'x' + this.screenheight;

            // initialize locales
            var chromeRegInstance = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
            var xulChromeReg = chromeRegInstance.QueryInterface(Components.interfaces.nsIXULChromeRegistry);
            var toolkitChromeReg = chromeRegInstance.QueryInterface(Components.interfaces.nsIToolkitChromeRegistry);

            this.selectedLocale = xulChromeReg.getSelectedLocale(this.BasePackage);
            this.currentLocale = this.selectedLocale;

            var availableLocaleElements = toolkitChromeReg.getLocalesForPackage(this.BasePackage);
            var availableLocales = [];
            while(availableLocaleElements.hasMore()) {

                var locale = availableLocaleElements.getNext();

                availableLocales.push({value: locale,
                                       label: _('(locale)' + locale),
                                       image: 'chrome://vivipos/skin/flags/tb_' + locale + '.png'});
            }
            this.availableLocales = availableLocales;
            
            // initialize kbmaps
            var kb = 'us';
            try {
                var kbFile = new GeckoJS.File('/etc/kbmap');
                if (kbFile.exists()) {
                    kbFile.open('r');
                    kb =  kbFile.readLine() || 'us';
                    kbFile.close();
                }
                delete kbFile
            }catch(e) {
            }

            this.selectedKbmap = kb;
            this.currentKbmap = kb;
            
            // initialize locations
            var data = this.Package.loadData(resolution);
            this.Packages = data.packages;
            this.Locations = data.locations;
            this.Sectors = data.sectors;

            locationListObj.datasource = this.Locations;
            //this.Locations.forEach(function(location, index) {locationListObj.appendItem(location.label, index);})

            // initialize timezone
            var timezones = document.getElementById('timezones');
            this.selectedTimezone = timezones.currentTimezone;

            // if restarted, jump to location selection
            if (args.restarted) {
                var wizard = document.getElementById('wizard');
                wizard.advance('language');
            }
        },

        advanceOK: function() {
            var wizard = document.getElementById('wizard');
            wizard.canAdvance = true;
        },

        /*
         *  wizard page "language"
         */

        initLocaleKbmap: function() {
            // show selected locale
            this.updateLocaleDisplay(this.selectedLocale);

            // populate locale popup panel
            var localeList = document.getElementById('localescrollablepanel');
            if (localeList) {
                localeList.datasource = this.availableLocales;
            }

            // show selected keyboard mapping
            this.updateKbmapDisplay(this.selectedKbmap);

            // populate kbmap popup panel
            var kbmapList = document.getElementById('kbmapscrollablepanel');
            if (kbmapList) {
                kbmapList.datasource = this.availableKbmaps;
            }
        },

        updateLocaleDisplay: function(locale) {
            var localeObj = document.getElementById('locale');
            if (localeObj && locale) {
                localeObj.label = _('(locale)' + locale);
                localeObj.image = 'chrome://vivipos/skin/flags/tb_' + locale + '.png';
            }
        },

        updateKbmapDisplay: function(kbmap) {
            var kbmapObj = document.getElementById('kbmap');
            if (kbmapObj && kbmap) {
                kbmapObj.label = _('(kbmap)' + kbmap);
                kbmapObj.image = 'chrome://vivipos/skin/flags/tb_' + kbmap + '.png';
            }
        },

        showLocalePopup: function() {
            var width = 600;
            var height = 400;

            var localePanel = document.getElementById('localePanel');
            if (localePanel) {
                localePanel.sizeTo(width, height);
                localePanel.openPopupAtScreen((this.screenwidth - width)/2, (this.screenheight - height)/2);
            }
        },

        selectLocale: function(index) {
            var localePanel = document.getElementById('localePanel');
            if (index > -1 && index < this.availableLocales.length) {
                var localeData = this.availableLocales[index];
                if (localeData) {
                    this.selectedLocale = localeData.value;
                    this.updateLocaleDisplay(this.selectedLocale);
                }

                localePanel.hidePopup();
            }
        },

        showKbmapPopup: function() {
            var width = 600;
            var height = 400;

            var kbmapPanel = document.getElementById('kbmapPanel');
            if (kbmapPanel) {
                kbmapPanel.sizeTo(width, height);
                kbmapPanel.openPopupAtScreen((this.screenwidth - width)/2, (this.screenheight - height)/2);
            }
        },

        selectKbmap: function(index) {
            var kbmapPanel = document.getElementById('kbmapPanel');
            if (index > -1 && index < this.availableKbmaps.length) {
                var kbmapData = this.availableKbmaps[index];
                if (kbmapData) {
                    this.selectedKbmap = kbmapData.value;
                    this.updateKbmapDisplay(this.selectedKbmap);
                }

                kbmapPanel.hidePopup();
            }
        },


        changeOSLocale: function(newLocale) {

            try {
                var loc = newLocale.split('-');
                var langENV = "";

                if (loc.length >=2) {
                    langENV = loc[0] + '_' + loc[1] + '.UTF-8';
                }else {
                    langENV = loc[0] + '.UTF-8';
                }

                // ubuntu locale environment
                var envFile = new GeckoJS.File('/etc/environment');
                var osEnvs ;
                if (envFile.exists()) {
                    envFile.open("r");
                    osEnvs = envFile.readAllLine();
                    envFile.close();
                }
                delete envFile;

                var newEnvs = [];
                for each(var envBuf in osEnvs) {
                    if (envBuf.match(/^LANGUAGE=/)) {
                        var languageString = 'LANGUAGE="' +
                                         (loc.length >=2 ? (loc[0] + '_' + loc[1] + ':') : "")+
                                         loc[0] + ':en_US:en"';
                        newEnvs.push(languageString);
                    }else if(envBuf.match(/^LANG=/)) {
                        var langString = 'LANG="'+langENV+'"';
                        newEnvs.push(langString);
                    }else {
                        newEnvs.push(envBuf);
                    }
                }

                var newEnvString = newEnvs.join("\n") + "\n";

                // write environment file
                try {
                    var envFile2 = new GeckoJS.File('/etc/environment', true);
                    envFile2.open("w");
                    envFile2.write(newEnvString);
                    envFile2.close();

                    delete envFile2;

                }catch(e) {};


                // set environment
                try {
                    var envSvc = Components.classes["@mozilla.org/process/environment;1"]
                              .getService(Components.interfaces.nsIEnvironment);

                    envSvc.set('LANG', langENV);
                    envSvc.set('LC_TIME', langENV);
                    envSvc.set('LC_MESSAGES', langENV);
                    envSvc.set('LC_NUMERIC', langENV);
                    envSvc.set('LC_MONETARY', langENV);
                    envSvc.set('LC_ALL', langENV);


                }catch(e) {
                }

                // locale gen
                try {
                    var localeGenScript = new GeckoJS.File('/data/scripts/locale_gen.sh');
                    if (localeGenScript.exists()) {
                        localeGenScript.run([], true); // no arguments and blocking.
                    }
                    delete localeGenScript;
                    localeGenScript = null;
                }catch(e) {
                }

                return true;

            } catch(err) {
            }
            return false;
        },

        changeOSKbmap: function(newKbmap) {

            try {

                // write Kbmap file
                var kbFile = new GeckoJS.File('/etc/kbmap', true);
                kbFile.open("w");
                kbFile.write(newKbmap+"\n");
                kbFile.close();
                delete kbFile;

            }catch (e) {
                // maybe permision deny
            }

            // restart virtual keyboard
            try {
                var resetKeyboardScript = new GeckoJS.File('/data/scripts/reset_keyboard.sh');
                if (resetKeyboardScript.exists()) {
                resetKeyboardScript.run([], true); // no arguments and blocking.
                }
                delete resetKeyboardScript;
                resetKeyboardScript = null;
            }catch(e) {
            }
        },
        
        setLocaleKbmap: function() {

            var requireRestart = false;

            // change XUL and OS locales
            if (this.selectedLocale != this.currentLocale) {
                
                var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                            getService(Components.interfaces.nsIPrefBranch);
                prefs.setCharPref("general.useragent.locale", this.selectedLocale);

                this.changeOSLocale(this.selectedLocale);
                
                requireRestart = true;
            }
            this.currentLocale = this.selectedLocale;

            // change keyboard mapping
            if (this.selectedKbmap != this.currentKbmap) {
                this.changeOSKbmap(this.selectedKbmap);
                requireRestart = true;
            }

            if (requireRestart) {
                this.args.restart = true;
                document.getElementById('wizard').cancel();
                return false;
            }
            else {
                return true;
            }
        },

        /*
         *  wizard page "location"
         */

        checkLocationSelection: function() {
            var wizard = document.getElementById('wizard');
            return wizard.canAdvance = this.lastLocation;
        },

        selectLocation: function (index) {
            if (index > -1 && index < this.Locations.length) {
                this.lastLocation = this.Locations[index];
            }
            else {
                this.lastLocation = null;
            }
            if (this.checkLocationSelection()) {
                var wizard = document.getElementById('wizard');
                if (wizard) wizard.advance();
            }
        },

        setLocation: function() {

            if (!this.lastLocation) return false;

            if (this.selectedLocation) {
                if (this.lastLocation.location == this.selectedLocation.location) {
                    return true;
                }
            }

            this.selectedLocation = this.lastLocation;
            var location = this.selectedLocation.location;

            // read timezone
            if (this.selectedLocation.timezone) {
                var timezones = document.getElementById('timezones');
                timezones.selectedTimezone = this.selectedLocation.timezone;
                timezones.updateTimezone();
            }
            this.initSectorList();

            return true;
        },

        /*
         * wizard page "timezone"
         */

        setTimezone: function() {

            var timezones = document.getElementById('timezones');

            if (this.selectedTimezone != timezones.selectedTimezone) {
                this.selectedTimezone = timezones.selectedTimezone;
                timezones.changeOSTimezone();
            }
            return true;
        },

        /*
         * wizard page "datetime"
         */

        startClock: function() {

            function setTime() {
                var dt = document.getElementById('datetime');
                dt.value = dt.value + 1000;
            };

            var dt = document.getElementById('datetime');
            dt.value = new Date();
            dt.intervalId = setInterval(setTime, 1000);
        },

        stopClock: function() {
            var dt = document.getElementById('datetime');
            clearInterval(dt.intervalId);
        },

        setClock: function() {
            var dt = document.getElementById('datetime');
            var d = new Date(dt.value);
            var dStr = d.toLocaleFormat('%Y%m%d %H:%M:%S');

            try {
                var script = new GeckoJS.File('/bin/date');
                script.run(['-s', dStr], true);
                script.close();
            }
            catch (e) {
            }
            return true;
        },
        
        /*
         *  wizard page "sector"
         */

        initSectorList: function() {

            // initialize sector list - need to

            this.selectedSector = null;
            this.lastSector = null;

            if (this.selectedLocation) {
                var location = this.selectedLocation.location;

                var sectors = this.Sectors[location];
                if (sectors && sectors.length > 0) {

                    var sectorListObj = document.getElementById('sectorlist');
                    while (sectorListObj.getRowCount() > 0) {
                        sectorListObj.removeItemAt(0);
                    }
                    sectors.forEach(function(sector, index) {
                        this.appendSectorItem(sectorListObj, sector, index);
                    }, this);
                }
            }
        },

        displayScreenShot: function(image) {
            var deck = document.getElementById('sector_deck');
            var screenshot = document.getElementById('sector_screenshot');
            if (screenshot) screenshot.src = image;
            deck.selectedIndex = 1;
        },

        hideScreenShot: function() {
            var deck = document.getElementById('sector_deck');
            deck.selectedIndex = 0;
        },

        appendSectorItem: function(box, data, value) {

            /*
             *              <richlistitem value="" >
                                <hbox flex="1">
                                    <image src="" />
                                    <vbox flex="1">
                                    <label value="label" />
                                    <label value="desc" />
                                    </vbox>
                                </hbox>
                            </richlistitem>

             *
             */

            var item = document.createElement('richlistitem');
            item.setAttribute('value', value);

            var hbox = document.createElement('hbox');
            hbox.setAttribute('flex', "1");

            var image = document.createElement('image');
            image.setAttribute('src', data.icon);
            image.setAttribute('onclick', '$do("displayScreenShot", "' + data.fullimage + '", "SetupWizard")');

            var vbox = document.createElement('vbox');
            vbox.setAttribute('flex', "1");

            // get localed label
            var label = document.createElement('label');
            label.setAttribute('value', data.label);

            // get localed desc
            var desc = document.createElement('label');
            desc.setAttribute('value', data.description);

            // maintaince DOM
            vbox.appendChild(label);
            vbox.appendChild(desc);
            hbox.appendChild(image);
            hbox.appendChild(vbox);
            item.appendChild(hbox);
            box.appendChild(item);

            return;

        },

        checkSectorSelection: function() {
            var wizard = document.getElementById('wizard');
            wizard.canAdvance = this.lastSector;
        },

        selectSector: function(val) {

            if (this.selectedLocation) {
                var location = this.selectedLocation.location;
                if (location) {
                    var sectors = this.Sectors[location];
                    if (sectors) {
                        var index = parseInt(val);
                        if (isNaN(index) || index < 0 || index >= sectors.length) {
                            this.lastSector = null;
                        }
                        else {
                            this.lastSector = sectors[index];
                        }
                    }
                }
            }
            this.checkSectorSelection();
        },

        setSector: function() {
            if (!this.lastSector) {
                return false;
            }

            if (this.selectedSector && this.lastSector.sector == this.selectedSector.sector) {
                return true;
            }
            this.selectedSector = this.lastSector;
            var datapath = this.selectedSector.datapath;
            if (datapath) {
                try {
                    var profPath = GeckoJS.Configure.read('ProfD');
                    // remove existing prefs.js
                    //GREUtils.File.remove(profPath + '/prefs.js');

                    // copy prefs.js to profile directory
                    var prefsPath = GREUtils.File.chromeToPath(datapath + '/user.js');
                    GREUtils.File.copy(prefsPath, profPath + '/user.js');

                    // close all existing datasource connections
                    GeckoJS.ConnectionManager.closeAll();

                    // remove existing database files
                    var systemPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
                    var dbDir = new GeckoJS.Dir(systemPath + '/databases');
                    dbDir.remove(true);

                    // copy database files to database and training directories
                    var dbPath = GREUtils.File.chromeToPath(datapath + '/databases/');
                    var dbs = GeckoJS.Dir.readDir(dbPath, {type: 'f'});

                    dbs.forEach(function(f) {
                        GREUtils.File.copy(f.path, systemPath + '/databases/');
                        GREUtils.File.copy(f.path, systemPath + '/training/');
                    })
                }
                catch(e) {
                    return false;
                }
            }
            return true;
        },

        /*
         * wizard page "store"
         */

        isAlphaNumeric: function(str) {
            var nonalphaRE = /[^a-zA-Z0-9]/;
            return !nonalphaRE.test(str);
        },

        checkStoreInformation: function() {
            var wizard = document.getElementById('wizard');
            var store = GeckoJS.FormHelper.serializeToObject('storecontactForm');

            // validate store name
            var validated = store.name && store.name.length > 0;

            // validate branch name
            validated = validated && store.branch && store.branch.length > 0;

            // validate branch id
            validated = validated && store.branch_id && store.branch_id.length > 0 && this.isAlphaNumeric(store.branch_id);

            // validate terminal number
            validated = validated && store.terminal_no && store.terminal_no.length > 0 && this.isAlphaNumeric(store.terminal_no);

            return wizard.canAdvance = validated;
        },

        setStoreInformation: function() {
            this.storeInformation = GeckoJS.FormHelper.serializeToObject('storecontactForm');

            // clear password
            GeckoJS.FormHelper.reset('userForm');
            
            if (this.checkStoreInformation()) {
                this.loadUsers();
                return true;
            }
            else {
                return false;
            }
        },

        /*
         * wizard page "login"
         */

        loadLogin: function() {
            this.checkPassword();
        },
        
        loadUsers: function() {
            var userListObj = document.getElementById('userscrollablepanel');

            this.selectedDefaultUser = null;
            
            var model = new UserModel();
            var users = model.find('all', {order: 'displayname'});

            if (parseInt(model.lastError) != 0) {
                this._dbError(model.lastError, model.lastErrorString,
                              _('An error was encountered while retrieving user accounts (error code %S).', [model.lastError]));
                return;
            }
            
            if (userListObj) {
                userListObj.datasource = users;
            }
        },

        selectUser: function(index) {
            var userListObj = document.getElementById('userscrollablepanel');
            if (userListObj) {
                var users = userListObj.datasource.data;
                if (users && users.length > 0 && index > -1 && index < users.length) {
                    this.selectedDefaultUser = users[index].id;
                }
            }
        },

        setPasswordCheckMessage: function(msg) {
            var msgLabelObj = document.getElementById('password_check');

            if (msgLabelObj) msgLabelObj.value = msg;
        },

        isNumeric: function(str) {
            var nonNumericRE = /[^0-9]/;
            return !nonNumericRE.test(str);
        },

        checkPassword: function() {
            var wizard = document.getElementById('wizard');
            var form = GeckoJS.FormHelper.serializeToObject('userForm');

            // please enter password
            if (!form.password || form.password.length == 0) {
                this.setPasswordCheckMessage(_('Please enter the administrator password'));
                return wizard.canAdvance = false;
            }

            // password must only contain numbers
            if (!this.isNumeric(form.password)) {
                this.setPasswordCheckMessage(_('Password must only contain 0-9'));
                return wizard.canAdvance = false;
            }

            // please confirm password
            if (!form.confirm || form.confirm.length == 0) {
                this.setPasswordCheckMessage(_('Please enter the password again to confirm'));
                return wizard.canAdvance = false;
            }

            // not confirmed
            if (form.confirm != form.password) {
                this.setPasswordCheckMessage(_('Passwords do not match'));
                return wizard.canAdvance = false;
            }
            // not confirmed
            this.setPasswordCheckMessage(_(''));
            return wizard.canAdvance = true;
        },

        setLogin: function() {
            
            var passwordTextbox = document.getElementById('admin_password');

            if (passwordTextbox) this.adminPassword = passwordTextbox.value;
            if (this.checkPassword()) {
                this.loadTaxes();
                return true;
            }
            else {
                return false;
            }
        },

        /*
         * wizard page "taxes"
         */

        loadTaxes: function() {
            var taxListObj = document.getElementById('taxlist');
            var taxes = this.Tax.getTaxList();
            var taxEntries = [];

            var type_str;
            var rate_str;
            var rate_type_str;
            var threshold_str;

            taxes.forEach(function(tax) {
                var taxObj = this.Tax.getTax(tax.no);
                type_str = _('(taxType)' + tax.type);
                if (tax.type == 'COMBINE') {
                    rate_type_str = '';
                    rate_str = '';
                    threshold_str = '';

                    taxObj.CombineTax.forEach(function(cTax) {
                        if (rate_type_str) rate_type_str += ',';
                        rate_type_str += cTax.no;
                    }, this);
                }
                else {
                    rate_type_str = _('(taxRateType)' + tax.rate_type);
                    rate_str = tax.rate;
                    threshold_str = tax.threshold;
                }
                taxEntries.push({id: tax.id,
                                 no: tax.no,
                                 type_str: type_str,
                                 name: tax.name,
                                 rate_type_str: rate_type_str,
                                 rate_str: rate_str,
                                 threshold_str: threshold_str});
            }, this);

            this.taxEntries = taxEntries;

            taxListObj.selection.select(-1);
            taxListObj.datasource = taxEntries;
        },

        setDefaultTax: function() {
            var taxListObj = document.getElementById('taxlist');
            var tax = (taxListObj.selectedItems.length) ? this.taxEntries[taxListObj.selectedIndex] : null;
            if (tax) {
                this.selectedDefaultTaxID = tax.id;
            }
            else {
                this.selectedDefaultTaxID = null;
            }
        },

        /*
         * wizard finish/cancel
         */

        finishSetup: function() {
            // completion tasks:

            // 1. configure selectedSkin and layout
            // 2. if default user is selected, configure default user and enable automatic login
            // 3. configure default tax
            // 4. set admin password
            // 5. update store contact
            // 6. update terminal number in sync settings
            // 7. copy code

            var profPath = GeckoJS.Configure.read('ProfD');
            var prefs = new GeckoJS.File(profPath + '/user.js');
            prefs.open('a');

            // 0. reset preferences
            // delete existing preferences
            GeckoJS.Configure.remove('vivipos');
            var mPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
            mPrefService.resetPrefs();

            prefs.write('\nuser_pref("general.useragent.locale", "' + this.selectedLocale + '");\n');

            // 1. configure skin & layout
            var newSkin = this.selectedSector.skin.replace('${width}', this.screenwidth).replace('${height}', this.screenheight );
            prefs.write('\nuser_pref("general.skins.selectedSkin", "' + newSkin + '");\n');
            prefs.write('\nuser_pref("vivipos.fec.general.layouts.selectedLayout", "' + this.selectedSector.layout + '");\n');

            // 2. if default user is selected, configure default user and enable automatic login
            if (this.selectedDefaultUser) {
                prefs.write('user_pref("vivipos.fec.settings.DefaultUser", "' + this.selectedDefaultUser + '");\n');
                prefs.write('user_pref("vivipos.fec.settings.DefaultLogin", true);\n');
            }
            else {
                prefs.write('user_pref("vivipos.fec.settings.DefaultUser", "");');
                prefs.write('user_pref("vivipos.fec.settings.DefaultLogin", false);\n');
            }

            // 3. configure default tax
            if (this.selectedDefaultTaxID) {
                prefs.write('user_pref("vivipos.fec.settings.DefaultTaxStatus", "' + this.selectedDefaultTaxID + '");\n');
            }
            else {
                prefs.write('user_pref("vivipos.fec.settings.DefaultTaxStatus", "");\n');
            }
            prefs.close();

            // 4. set admin password
            var model = new UserModel();
            var admin = model.findByIndex('first', {index: 'username', value: 'superuser'});

            if (parseInt(model.lastError) != 0) {
                this._dbError(model.lastError, model.lastErrorString,
                              _('An error was encountered while accessing administrator account (error code %S).', [model.lastError]));
                return;
            }
            if (admin) {
                admin.password = this.adminPassword;
                model.id = admin.id;
                if (!model.save(admin)) {
                    this._dbError(model.lastError, model.lastErrorString,
                                  _('An error was encountered while updating administrator password (error code %S).', [model.lastError]));
                    return;
                }
                this.Acl.changeUserPassword('superuser', this.adminPassword);
            }

            // 5. update store contact
            model = new StoreContactModel();
            var store = model.findByIndex('first', {index: 'terminal_no',
                                                    value: this.storeInformation.terminal_no});

            if (parseInt(model.lastError) != 0) {
                this._dbError(model.lastError, model.lastErrorString,
                              _('An error was encountered while accessing store information (error code %S).', [model.lastError]));
                return;
            }
            if (!store) store = {};
            else {model.id = store.id}

            store.name = this.storeInformation.name;
            store.branch = this.storeInformation.branch;
            store.branch_id = this.storeInformation.branch_id;
            store.terminal_no = this.storeInformation.terminal_no;

            if (!model.save(store)) {
                this._dbError(model.lastError, model.lastErrorString,
                              _('An error was encountered while updating store information (error code %S).', [model.lastError]));
                return;
            }
            // 6. update terminal number in sync settings
            var settings = (new SyncSetting()).read();
            settings.machine_id = this.storeInformation.terminal_no;
            (new SyncSetting()).save(settings);
            
            // 7. copy code
            if (this.selectedSector.customcode) {
                // make sure code archive exists
                var profPath = GeckoJS.Configure.read('ProfD');
                var codePath = GREUtils.File.chromeToPath(this.selectedSector.datapath + '/' + this.selectedSector.customcode);
                if (GREUtils.File.exists(codePath)) {
                    var exec = new GeckoJS.File('/bin/tar');
                    exec.run(['-xzf', codePath, '-C', profPath + '/extensions'], true);
                    exec.close();
                }
            }

            this.args.initialized = true;
            return true;
        },

        cancelSetup: function(data) {

            if (GREUtils.Dialog.confirm(window, _('VIVIPOS Setup'),
                                        _('Unless you plan to restore the terminal from a previously taken backup, ' +
                                          'you are strongly advised to complete the setup process to ensure that the terminal operates properly. ' +
                                          'Are you sure you want to cancel and exit from the setup wizard now?'))) {
                data.initialized = false;
                data.cancelled = true;
            }
            else {
                data.cancelled = false;
            }
        },

        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', errmsg + '\nDatabase Error [' +  errno + ']: [' + errstr + ']');
            GREUtils.Dialog.alert(this.topmostWindow,
                                  _('Data Operation Error'),
                                  errmsg + '\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        }
    };

    GeckoJS.Controller.extend(__controller__);

})()
