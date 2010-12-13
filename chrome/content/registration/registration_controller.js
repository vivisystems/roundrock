(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    GeckoJS.include('chrome://viviecr/content/models/storecontact.js');

    var __controller__ = {

        name: 'Registration',
        
        components: ['Form'],

        _old_branch_id: null,

        _terminal_no: null,
        
        _model_id: null,

        _script_path: null,
        _script_uri: 'chrome://roundrock/content/scripts/registration.sh',
        _script_output: '/tmp/registration.status',

        initial: function() {
            // intercept Main.initial()
            var main = GeckoJS.Controller.getInstanceByName('Main');

            if (main) {

                let formObj = this.loadRegistration();

                if (formObj == null) {
                    let screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
                    let screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

                    let aURL = 'chrome://roundrock/content/registration/registration.xul';
                    let aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + screenwidth + ',height=' + screenheight;

                    GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _( 'Registration' ), aFeatures);

                    // log user process
                    this.log('FATAL', 'restarting after registration');

                    try {
                        GREUtils.restartApplication();
                        window.stop();
                        window.close();

                        this.sleep(1000);
                    }catch(e) {
                        this.log('ERROR', 'Error restarting after registration', e);
                    }
                }
            }
        },

        isAlphaNumeric: function(str) {
            var nonalphaRE = /[^a-zA-Z0-9]/;
            return !nonalphaRE.test(str);
        },

        update: function (data) {

            data.exitFlag = false;

            // validate input
            var valid = true;

            // trim spaces and validate
            $('textbox').each(function(index, node) {
                node.value = GeckoJS.String.trim(node.value);
                valid = !(node.value == null || node.value.length == 0);
                return;
            });

            // validate input - address
            if (valid &&
                ((document.getElementById('city').selectedIndex <= 0) ||
                 (document.getElementById('area').selectedIndex <= 0) ||
                 (document.getElementById('road').selectedIndex <= 0))) {
                valid = false;
            }

            if (!valid) {
                alert(_('Please sure all required fields are populated'));
                return;
            }

            // grab form data
            var formObj = GeckoJS.FormHelper.serializeToObject('RegistrationForm') || {};

            // add city, area, and road
            formObj.county = GeckoJS.String.trim(document.getElementById('city').label);
            formObj.city = GeckoJS.String.trim(document.getElementById('area').label);
            formObj.address1 = GeckoJS.String.trim(document.getElementById('road').label);

            if (formObj == null) {
                NotifyUtils.error(_('Unable to save store contact!'));
                return;
            }

            if (!this.validateForm(formObj)) return;

            // update stock_record.
            if (this._old_branch_id != formObj.branch_id) {
                var stockRecordModel = new StockRecordModel();
                var sql = "UPDATE stock_records SET warehouse = '" + formObj.branch_id + "' WHERE warehouse = '" + this._old_branch_id + "';";
                stockRecordModel.execute( sql );

                this._old_branch_id = formObj.branch_id;
            }

            if (this._terminal_no != formObj.terminal_no) {
                // update sync settings
                let settings = (new SyncSetting()).read();
                settings.machine_id = formObj.terminal_no;
                (new SyncSetting()).save(settings);

                // update shift_marker as well
                if (this._terminal_no != null && this._terminal_no != '') {
                    var shiftMarkerModel = new ShiftMarkerModel();
                    var shiftMarker = shiftMarkerModel.findByIndex('first', {index: 'terminal_no',
                                                                             value: this._terminal_no});
                    if (shiftMarker) {
                        shiftMarkerModel.id = shiftMarker.id;
                        shiftMarker.terminal_no = formObj.terminal_no;
                        shiftMarkerModel.save(shiftMarker);
                    }
                }
                
                // restart sync_client
                GeckoJS.File.run('/etc/init.d/sync_client', ['restart'], true);
                
                GeckoJS.Observer.notify(null, 'prepare-to-restart', this);
            }

            var storeContactModel = new StoreContactModel();
            storeContactModel.id = formObj.id;
            if (storeContactModel.save(formObj)) {
                GeckoJS.Session.set('storeContact', formObj);

                this.setForm(formObj, false);

                // make exit options available to user from this point on
                $('#keyExit').attr('disabled', false);
                $('#btnExit').attr('hidden', false);

                // determine if MODEM is available
                let env = Components.classes["@mozilla.org/process/environment;1"]
                             .getService(Components.interfaces.nsIEnvironment);
                let IMEI = env.get('MODEM_IMEI');
                let SERIAL = env.get('license_stub');
                
                if (IMEI == '' || SERIAL == '') {
                    GREUtils.Dialog.alert(this.topmostWindow, _('Terminal Registration'),
                                          _('Registration information has been successfully stored, but registration cannot be completed at this moment as this terminal has not been provisioned with remote support capabilities'));
                    return;
                }
                else {
                    // call external script to register
                    let parms = [encodeURIComponent(SERIAL),
                                 encodeURIComponent(IMEI),
                                 encodeURIComponent(formObj.name),
                                 encodeURIComponent(formObj.email),
                                 encodeURIComponent(formObj.contact),
                                 encodeURIComponent(formObj.telephone1),
                                 encodeURIComponent(formObj.zip),
                                 encodeURIComponent(formObj.county),
                                 encodeURIComponent(formObj.city),
                                 encodeURIComponent(formObj.address1 + ' ' + formObj.address2),
                                 this._script_output
                                ];
                    if (this._execute(this._script_path, parms, false)) {
                        let status = this._readStatus(this._script_output);
                        let msg = _('Internal error occurred while attempting to send registration information to Registration Server!');

                        switch(parseInt(status.code)) {
                            case -2:
                                msg = _('Registration cancelled!');
                                break;

                            case -1:
                                msg = _('Unknown response from Registration Server');
                                break;

                            case 0:
                                msg = _('Terminal has been successfully registered. Thank you!');
                                data.exitFlag = true;
                                break;

                            case 1:
                                msg = _('Failed to detect wireless modem while attempting to send registration information to Registration Server!');
                                break;

                            case 2:
                                msg = _('Failed to connect to Internet while attempting to send registration information to Registration Server!');
                                break;

                            case 3:
                                msg = _('An error has occurred while contacting the Registration Server' + '\n\n' + status.response);
                                break;

                            case 4:
                                msg = _('Registration rejected by the Registration Server' + '\n\n' + status.response);
                                break;

                            default:
                                msg = _('Invalid response code [%S] from Registration Server', [status.code]);
                                break;
                        }
                        GREUtils.Dialog.alert(this.topmostWindow, _('Terminal Registration'), msg);
                    }
                    else {
                        GREUtils.Dialog.alert(this.topmostWindow, _('Terminal Registration'),
                                              _('Error occurred while attempting to send registration information to Registration Server!'));
                    }
                }

            }
            else {
                NotifyUtils.error(_('Failed to save store contact information (error code %S); please try again.', [storeContactModel.lastError]));
                this.log('ERROR', 'Failed to save store contact information:' + '\nDatabase Error [' +
                                  storeContactModel.lastError + ']: [' + storeContactModel.lastErrorString + ']');
                data.exitFlag = false;
            }
        },


        loadRegistration: function() {

            var formObj;
            var terminal_no = GeckoJS.Session.get('terminal_no');

            if (terminal_no == null || terminal_no == '') {
                // terminal_no from sync_settings
                var syncSettings = (new SyncSetting()).read() || {};

                terminal_no = syncSettings.machine_id;
            }
            this._terminal_no = terminal_no;

            if (terminal_no != null && terminal_no != '') {
                var storeContactModel = new StoreContactModel();
                formObj = storeContactModel.findByIndex('first', {index: 'terminal_no',
                                                                  value: terminal_no});
            }

            return formObj;
        },


        load: function () {
            
            this._script_path =  GREUtils.File.chromeToPath(this._script_uri);

            var formObj = this.loadRegistration();

            if (formObj != null) {
                this.setForm(formObj, true);

                this._old_branch_id = formObj.branch_id;
                this._model_id = formObj.id;
            }
            else {
                // force form; disable exit options
                $('#keyExit').attr('disabled', true);
                $('#btnExit').attr('hidden', true);

                // make terminal_no text field editable
                $('#txtTERMINALNO').removeAttr('readonly');

                this.clearForm();
            }
        },

        validateForm: function(formObj) {

            let empty = false;

            // trim all fields
            for (let key in formObj) {
                formObj[key] = GeckoJS.String.trim(formObj[key]);
                if (formObj[key] == null || formObj[key].length == 0) {
                    empty = (key != 'id');
                }
            }

            if (empty) {
                GREUtils.Dialog.alert(this.topmostWindow, _('Terminal Registration'),
                                      _('Please make sure all required fields are populated'));
                return false;
            }

            if (!this.isAlphaNumeric(formObj.branch_id)) {
                GREUtils.Dialog.alert(this.topmostWindow, _('Terminal Registration'),
                                      _('Branch ID must only contain [a-z], [A-Z], and [0-9]'));
                return false;
            }

            if (!this.isAlphaNumeric(formObj.terminal_no)) {
                GREUtils.Dialog.alert(this.topmostWindow, _('Terminal Registration'),
                                      _('Terminal number must only contain [a-zA-Z] and [0-9]'));
                return false;
            }

            return true;
        },

        setForm: function(formObj, updateAddress) {
            GeckoJS.FormHelper.unserializeFromObject('RegistrationForm', formObj);

            var self = this;

            if (updateAddress) {
                // set city, county, address1
                var cityObj = document.getElementById('city');
                cityObj.setAttribute('label', formObj.county)
                $('#city menuitem[label="' + formObj.county + '"]').each(function(index, node) {
                    node.doCommand();
                    self.sleep(100);
                    return false;
                });

                var areaObj = document.getElementById('area');
                areaObj.setAttribute('label', formObj.city)
                $('#area menuitem[label="' + formObj.city + '"]').each(function(index, node) {
                    node.doCommand();
                    self.sleep(100);
                    return false;
                });

                var roadObj = document.getElementById('road');
                roadObj.setAttribute('label', formObj.address1)
                $('#road menuitem[label="' + formObj.address1 + '"]').each(function(index, node) {
                    node.doCommand();
                    return false;
                });
            }
        },

        clearForm: function() {

            // clear text fields
            GeckoJS.FormHelper.reset('RegistrationForm');

            // reset menu lists
            $('menulist').each(function(index, node) {
                node.selectedIndex = 0;
            });
        },
        
        _readStatus: function(statusFile) {
            var status = {code: -2, response: ''};
            var outputFile = new GeckoJS.File(statusFile);
            if (outputFile.exists() && outputFile.isReadable()) {
                outputFile.open('r');
                status.code = outputFile.readLine() || -1;
                status.response = outputFile.readAllLine();
                outputFile.close();
            }
            return status;
        },
        
        _execute: function(cmd, params, nonblocking) {
            try {
                var exec = new GeckoJS.File(cmd);
                var r = exec.run(params, !nonblocking);
                exec.close();
                return true;
            }
            catch (e) {
                this.log('ERROR', 'Failed to execute command [' + cmd + ' ' + params + ']');
                return false;
            }
        }


    };

    AppController.extend(__controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'Registration');
    }, false);

})();
