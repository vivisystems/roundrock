(function() {

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

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
            /*
            if (args.restarted) {
                var wizard = document.getElementById('wizard');
                wizard.advance('language');
            }
            */
        },

        advanceOK: function() {
            var wizard = document.getElementById('wizard');
            wizard.canAdvance = true;
        },

        
        /*
         *  wizard page "language"
         */

        initLocaleKbmap: function() {
            
            // populate locale popup panel
            var localeList = document.getElementById('localescrollablepanel');
            if (localeList) {
                localeList.datasource = this.availableLocales;
            }

            // populate kbmap popup panel
            var kbmapList = document.getElementById('kbmapscrollablepanel');
            if (kbmapList) {
                kbmapList.datasource = this.availableKbmaps;
            }
        },

        setLocaleKbmap: function() {

            var requireRestart = false;
            var localeObj = document.getElementById('locale');
            var kbmapObj = document.getElementById('kbmap');

            // change XUL and OS locales
            if (localeObj.selectedLocale != localeObj.currentLocale) {

                localeObj.changeLocale();
                localeObj.changeOSLocale();
                
                requireRestart = true;
            }
            this.currentLocale = this.selectedLocale;

            // change keyboard mapping
            if (kbmapObj.selectedKbmap != kbmapObj.currentKbmap) {
                kbmapObj.changeOSKbmap();
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
            this.hideSectorScreen();
            
            return true;
        },
        
        /*
         *  wizard page "sector"
         */

        initSectorList: function() {

            this.selectedSector = null;
            this.lastSector = null;

            if (this.selectedLocation) {
                var location = this.selectedLocation.location;

                var sectors = this.Sectors[location];
                if (sectors && sectors.length > 0) {

                    var sectorListObj = document.getElementById('sectorscrollablepanel');
                    sectorListObj.datasource = sectors;

                    sectorListObj.refresh();
                }
            }
        },

        displaySectorScreen: function(image, description) {
            var deck = document.getElementById('sector_deck');
            var desc = document.getElementById('sector_description');
            var screenshot = document.getElementById('sector_screenshot');
            if (screenshot) screenshot.src = image;
            if (desc) desc.value = description;
            deck.selectedIndex = 1;
        },

        hideSectorScreen: function() {
            var deck = document.getElementById('sector_deck');
            deck.selectedIndex = 0;
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
                            this.displaySectorScreen(this.lastSector.fullimage, this.lastSector.description);
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
                    GREUtils.File.remove(profPath + '/prefs.js');

                    // copy prefs.js to profile directory
                    var prefsPath = GREUtils.File.chromeToPath(datapath + '/user.js');
                    GREUtils.File.copy(prefsPath, profPath + '/user.js');

                    // close all existing datasource connections
                    GeckoJS.ConnectionManager.closeAll();

                    // remove existing database files
                    var systemPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');

                    // copy database files to database and training directories
                    var dbPath = GREUtils.File.chromeToPath(datapath + '/databases/');
                    var dbs = GeckoJS.Dir.readDir(dbPath, {type: 'f'});

                    dbs.forEach(function(f) {
                        GREUtils.File.remove(systemPath + '/databases/' + f.leafName);
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
                              _('An error was encountered while retrieving user accounts (error code %S) [message #1301].', [model.lastError]));
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
            this.setPasswordCheckMessage('');
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

                    if (taxObj.CombineTax) {
                        taxObj.CombineTax.forEach(function(cTax) {
                            if (rate_type_str) rate_type_str += ',';
                            rate_type_str += cTax.no;
                        }, this);
                    }
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

        finishSetup: function(data) {
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
            }
            else {
                prefs.write('user_pref("vivipos.fec.settings.DefaultUser", "");');
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
                              _('An error was encountered while accessing administrator account (error code %S) [message #1302].', [model.lastError]));
                return;
            }
            if (admin) {
                admin.password = this.adminPassword;
                model.id = admin.id;
                if (!model.save(admin)) {
                    this._dbError(model.lastError, model.lastErrorString,
                                  _('An error was encountered while updating administrator password (error code %S) [message #1303].', [model.lastError]));
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
                              _('An error was encountered while accessing store information (error code %S) [message #1304].', [model.lastError]));
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
                              _('An error was encountered while updating store information (error code %S) [message #1305].', [model.lastError]));
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
            data.initialized = true;
            return true;
        },

        cancelSetup: function(data) {

            if (GREUtils.Dialog.confirm(this.topmostWindow, _('VIVIPOS Setup'),
                                        _('Unless you plan to restore the terminal from a previously taken backup, you are strongly advised to complete the setup process to ensure that the terminal operates properly. Are you sure you want to cancel and exit from the setup wizard now?'))) {
                data.initialized = false;
                data.cancelled = true;

                // clean up user.js
                var profPath = GeckoJS.Configure.read('ProfD');
                GREUtils.File.remove(profPath + '/user.js');
            }
            else {
                data.cancelled = false;
            }
        },

        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', errmsg + '\nDatabase Error [' +  errno + ']: [' + errstr + ']');
            GREUtils.Dialog.alert(this.topmostWindow,
                                  _('Data Operation Error'),
                                  errmsg + '\n\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        }
    };

    AppController.extend(__controller__);

})()
