(function() {

    var __controller__ = {

        name: 'SetupWizard',
        
        components: ['Tax', 'Package'],

        // configuration keys
        PackageKey: 'vivipos.fec.registry.package',

        // package configuration
        Packages: [],
        Locations: [],
        Sectors: {},

        selectedLocale: null,
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

        screenwidth: GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800,
        screenheight: GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600,

        /*
         * load
         */

        load: function(args) {

            this.args = args;

            var locationListObj = document.getElementById('locationlist');
            var resolution = this.screenwidth + 'x' + this.screenheight;

            // initialize locations
            var data = this.Package.loadData(resolution);
            this.Packages = data.packages;
            this.Locations = data.locations;
            this.Sectors = data.sectors;
            
            this.Locations.forEach(function(location, index) {locationListObj.appendItem(location.label, index);})

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
            // make sure selectedItem is visible
            var locale = document.getElementById('locale');
            locale.listbox.ensureIndexIsVisible(locale.selectedIndex);

            // make sure selectedItem is visible
            var kbmap = document.getElementById('kbmap');
            kbmap.listbox.ensureIndexIsVisible(kbmap.selectedIndex);
        },

        setLocaleKbmap: function() {

            var locale = document.getElementById('locale');
            var kbmap = document.getElementById('kbmap');
            var requireRestart = false;

            this.selectedLocale = locale.selectedLocale;
            // change XUL and OS locales
            if (this.selectedLocale != locale.currentLocale) {
                locale.changeOSLocale();
                locale.changeLocale();
                requireRestart = true;
            }

            this.selectedKbmap = kbmap.selectedKbmap;
            // change keyboard mapping
            if (this.selectedKbmap != kbmap.currentKbmap) {
                kbmap.changeOSKbmap();
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
            wizard.canAdvance = this.lastLocation;
        },

        selectLocation: function (index) {
            if (index > -1 && index < this.Locations.length) {
                this.lastLocation = this.Locations[index];
            }
            else {
                this.lastLocation = null;
            }
            this.checkLocationSelection();
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
                    GREUtils.File.remove(profPath + '/prefs.js');

                    // copy prefs.js to profile directory
                    var prefsPath = GREUtils.File.chromeToPath(datapath + '/prefs.js');
                    GREUtils.File.copy(prefsPath, profPath);

                    // remove existing database files
                    var systemPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
                    var dbDir = new GeckoJS.Dir(systemPath + '/databases');
                    dbDir.remove(true);

                    // copy database files to database directory
                    var dbPath = GREUtils.File.chromeToPath(datapath + '/databases/');
                    var dbs = GeckoJS.Dir.readDir(dbPath, {type: 'f'});

                    dbs.forEach(function(f) {
                        GREUtils.File.copy(f.path, systemPath + '/databases/');
                    })

                    // close all existing datasource connections
                    GeckoJS.ConnectionManager.closeAll();
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
            var userListObj = document.getElementById('userlist');
            var model = new UserModel();
            var users = model.find('all', {order: 'displayname'});

            if (parseInt(model.lastError) != 0) {
                this._dbError(model.lastError, model.lastErrorString,
                              _('An error was encountered while retrieving user accounts (error code %S).', [model.lastError]));
                return;
            }

            userListObj.selectedIndex = -1;
            while (userListObj.getRowCount() > 0) {
                userListObj.removeItemAt(0);
            }

            if (users) {
                users.forEach(function(user) {
                    userListObj.appendItem(user.displayname, user.id);
                }, this)
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
            // get default user
            var userListObj = document.getElementById('userlist');
            this.selectedDefaultUser = userListObj.value;

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

            // 1. configure selectedSkin
            // 2. if default user is selected, configure default user and enable automatic login
            // 3. set admin password
            // 4. configure default tax
            // 5. update store contact
            // 6. update terminal number in sync settings
            // 7. copy code

            // 1. configure selectedSkin
            var newSkin = this.selectedSector.skin.replace('${width}', this.screenwidth).replace('${height}', this.screenheight );
            alert('configuring new skin: ' + newSkin);
            GeckoJS.Configure.write('general.skins.selectedSkin', newSkin);
            alert('written');
            // 2. if default user is selected, configure default user and enable automatic login
            if (this.selectedDefaultUser) {
                GeckoJS.Configure.write('vivipos.fec.settings.DefaultUser', this.selectedDefaultUser);
            alert('written');
                GeckoJS.Configure.write('vivipos.fec.settings.DefaultLogin', true);
            alert('written');
            }
            else {
                GeckoJS.Configure.remove('vivipos.fec.settings.DefaultUser', true);
            alert('written');
                GeckoJS.Configure.write('vivipos.fec.settings.DefaultLogin', false);
            alert('written');
            }

            // 3. set admin password
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

            // 4. configure default tax
            if (this.selectedDefaultTaxID) {
                GeckoJS.Configure.write('vivipos.fec.settings.DefaultTaxStatus', this.selectedDefaultTaxID);
            alert('written');
            }
            else {
                GeckoJS.Configure.remove('vivipos.fec.settings.DefaultTaxStatus', true);
            alert('written');
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
