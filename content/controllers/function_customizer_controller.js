(function() {

    var __controller__ = {

        name: 'FunctionCustomizer',

        components: ['FunctionSettings'],

        screenwidth: GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800,
        screenheight: GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600,
        profD: GeckoJS.Configure.read('CORE.ProfD'),


        ready: function() {

            // update locale language
            var settings = this.FunctionSettings.settings;

            for (let formName in settings) {
                let formSettings = settings[formName];

                for (let elemId in formSettings) {
                    
                    let localeKey = "";

                    if (elemId.indexOf('cp') == 0) {

                        // control panel
                        localeKey = formSettings[elemId].key + ".label";
                        
                    }else if (elemId.indexOf('rpt') == 0) {

                        // report
                        localeKey = formSettings[elemId].key + ".label";

                    }else if (elemId.indexOf('fn') == 0) {

                        // function
                        let tmps = formSettings[elemId].key.split('.');
                        let k = tmps[tmps.length-1];
                        localeKey = k + ".label";

                    }else if (elemId.indexOf('promo') == 0) {

                        // promotions
                        let tmps = formSettings[elemId].key.split('.');
                        let k = tmps[tmps.length-2]+'.'+tmps[tmps.length-1];
                        localeKey = k + ".label";

                    }else if (elemId.indexOf('dev') == 0) {
                        localeKey = "";
                        let msg = document.getElementById(elemId).getAttribute('label');
                        let labelMsg = _('function_customizer.disable.label', [msg]);
                        document.getElementById(elemId).setAttribute('label', labelMsg);

                    }

                    //  update label with locale
                    if (localeKey.length>0) {
                        let msg = _(localeKey);
                        let labelMsg = _('function_customizer.disable.label', [msg]);
                        document.getElementById(elemId).setAttribute('label', labelMsg);
                    }
                   
                }
            }
            
        },
        

        /*
         * load
         */
        load: function(args) {

            var obj = this.readSetting();

            for (var formName in obj) {

                this.Form.unserializeFromObject(formName, obj[formName]);
                
            }


        },

        save: function() {

            var obj = this.saveSetting();

            GeckoJS.File.remove(this.profD+"/chrome/userConfigure.js");
            GeckoJS.File.remove(this.profD+"/chrome/userChrome.css");

            for (var formName in obj) {

                var buf = this.FunctionSettings.processPrefsSettings(formName, obj[formName]);

                // write products to userConfigure.js
                if(buf.length > 0) GeckoJS.File.appendLine(this.profD+"/chrome/userConfigure.js", buf);
            }

            for (var formName in obj) {

                var buf = this.FunctionSettings.processCssSettings(formName, obj[formName]);

                // write products to userChrome.css
                if(buf.length > 0) {
                    GeckoJS.File.appendLine(this.profD+"/chrome/userChrome.css", buf);
                }
            }

            if (GREUtils.Dialog.confirm(this.topmostWindow, _('function_customizer.saved_confirm.title'),
                                                            _('function_customizer.saved_confirm')
                                                            ))
            {
                // remove flag
                GeckoJS.File.remove(this.profD+"/.fncustomizer");
            }

            window.close();

            try {
                GREUtils.restartApplication();
            }
            catch(err) {
            }


        },

        saveSetting: function() {

            var obj = {};

            var productsForm = this.Form.serializeToObject('productsForm', true);

            // need to process special fields
           
            if (parseInt(productsForm.attrProdPriceLevel) != 9) {
                productsForm.attrProdPriceLevelPref = parseInt(productsForm.attrProdPriceLevel)+1;
                for (let i = productsForm.attrProdPriceLevelPref; i <= 9 ; i++) {
                    productsForm['attrProdPriceLevelCss'+i] = true;
                }
            }else {
                delete productsForm.attrProdPriceLevelPref;
            }

            obj['productsForm'] = productsForm;

            var reportsForm = this.Form.serializeToObject('reportsForm', true);
            obj['reportsForm'] = reportsForm;

            var employeesForm = this.Form.serializeToObject('employeesForm', true);
            obj['employeesForm'] = employeesForm;

            var activitiesForm = this.Form.serializeToObject('activitiesForm', true);
            obj['activitiesForm'] = activitiesForm;

            var toolsForm = this.Form.serializeToObject('toolsForm', true);
            obj['toolsForm'] = toolsForm;

            var systemsForm = this.Form.serializeToObject('systemsForm', true);
            obj['systemsForm'] = systemsForm;

            var functionsForm = this.Form.serializeToObject('functionsForm', true);
            obj['functionsForm'] = functionsForm;

            // save
            var buf = GeckoJS.BaseObject.serialize(obj);
            var f = new GeckoJS.File(this.profD+"/.fncustomizer.js");
            f.open("w");
            f.write(buf);
            f.close();

            return obj;
            
        },

        readSetting: function() {
            var obj = {};

            var f = new GeckoJS.File(this.profD+"/.fncustomizer.js");

            if (!f.exists()) return obj;

            f.open("r");
            var buf = f.read();
            f.close();

            obj = GeckoJS.BaseObject.unserialize(buf);

            return obj;
        }

    };

    GeckoJS.Controller.extend(__controller__);

})()
