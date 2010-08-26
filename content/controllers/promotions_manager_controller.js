(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    /**
     * Controller Promotions Manager
     * 
     */
    var __promotions_manager_controller__ = {

        name: 'PromotionsManager',

        uses: ['Promotion'],

        screenwidth: GeckoJS.Session.get('screenwidth') || 800,
        screenheight: GeckoJS.Session.get('screenheight') || 600,

        _activedPromotions: [],
        _activedTriggers: {},
        _activedTypes: {},
        _lastPromotionData: null,
        _treeObj: null,
        _inputFields: null,


        getPromotionsTree: function() {
            this._treeObj = this._treeObj || document.getElementById('promotions_tree');
            return this._treeObj;
        },

        switchInputableFields: function(enable) {

            this._inputFields = this._inputFields || $('[form=promotionForm]');

            if (enable) {
                this._inputFields.each(function(i) {
                    this.removeAttribute('disabled');
                });
            }else {
                this._inputFields.attr('disabled', true);
            }
        },


        /*
         * initial promotions rules for register
         */
        initial: function() {

           
            // load promotions trigger / type class
            var promotionsTriggers = [];
            var promotionsTypes = [];
            
            var triggerPrefs = GeckoJS.Configure.read('vivipos.fec.registry.promotion.trigger') || false;
            if (triggerPrefs) {
                for (var trigger_key in triggerPrefs) {
                    var triggerObj = GREUtils.extend({key: trigger_key, name: _('trigger.'+trigger_key+'.name'), label: _('trigger.'+trigger_key+'.label'), desc: _('trigger.'+trigger_key+'.desc')}, triggerPrefs[trigger_key]);
                    promotionsTriggers.push(triggerObj);
                    this._activedTriggers[trigger_key] = triggerObj;
                }
            }

            var TypePrefs = GeckoJS.Configure.read('vivipos.fec.registry.promotion.type') || false;
            if(TypePrefs) {
                for (var type_key in TypePrefs) {
                    var typeObj = GREUtils.extend({key: type_key, name: _('type.'+type_key+'.name'), label: _('type.'+type_key+'.label'), desc: _('type.'+type_key+'.desc')}, TypePrefs[type_key]);
                    promotionsTypes.push(typeObj);
                    this._activedTypes[type_key] = typeObj;
                }
            }

            // update days of week buttonpanel
            var daysOfWeek = [];
            var date = new Date();
            date.setDate(date.getDate() - (date.getDay() + 1));
            for (var i=0; i < 7; i++) {
                date.setDate(date.getDate() + 1);
                daysOfWeek.push({name: date.toLocaleFormat("%A")});
            }
            document.getElementById('days_of_week').datasource = daysOfWeek;

            // update trigger popup lists
            var triggerList = document.getElementById('triggerList');
            promotionsTriggers.forEach(function(trigger){
                triggerList.appendItem(trigger.label, trigger.key, null);
            });

            // update type popup lists
            var typeList = document.getElementById('typeList');
            promotionsTypes.forEach(function(type){
                typeList.appendItem(type.label, type.key, null);
            });

            // refresh rules tree
            this.refresh();

        },

        exit: function() {
            
            GeckoJS.Observer.notify(null, 'promotions', 'rules-updated');

            window.close();
        },

        add: function  () {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=350';

            var inputObj = {
                input0:null,
                require0:true,
                input1:null,
                require1:true
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Promotion Rule'), aFeatures,
                                       _('New Promotion Rule'), '', _('Rule Name'), _('Rule Code'), inputObj);

            if (inputObj.ok && inputObj.input0) {

                var start_date = new Date().clearTime();
                var end_date = Date.today().addDays(1).addSeconds(-1);
                var start_time = start_date;
                var end_time = end_date;

                // default rule data
                var inputData = {
                    name: inputObj.input0,
                    code: inputObj.input1,
                    start_date: (start_date.getTime()/1000),
                    end_date: (end_date.getTime()/1000),
                    start_time: (start_time.getTime()/1000),
                    end_time: (end_time.getTime()/1000),
                    trigger: 'bypass',
                    type: 'bypass',
                    days_of_week: '0,1,2,3,4,5,6',
                    active: true
                };

                var rules = this.Promotion.findByIndex('all', {
                    index: 'name',
                    value: inputData.name
                });
                if ((rules != null) && (rules.length > 0)) {
                    NotifyUtils.warn(_('Promotion Rule [%S] already exists.', [inputData.name]));
                    return;
                }

                try {

                    //get max_order
                    var tmpObj = this.Promotion.getDataSource().fetchAll('select max(rule_order) as max_rule_order from promotions');
                    var max_rule_order = 0;
                    if (tmpObj) {
                        max_rule_order = tmpObj[0]['max_rule_order'] + 1;
                    }

                    inputData['rule_order'] = max_rule_order;
                    
                    this.Promotion.create();
                    this.Promotion.save(inputData);

                    var addedPromotionId = this.Promotion.id;

                    // to modify mode
                    this.refresh();
                    
                    this.modifyById(addedPromotionId);

                    OsdUtils.info(_('Promotion Rule [%S] added successfully', [inputData.name]));
                }
                catch (e) {

                    NotifyUtils.error(_('An error occurred while adding Promotion Rule [%S]. The rule may not have been added successfully', [inputData.name]));
                }
            }
        },

        refresh: function() {
            
            var promotions = this.Promotion.find('all', {order: 'rule_order'});
           
            this.getPromotionsTree().datasource = promotions;

            this._activedPromotions = promotions;
            
        },

        modifyById: function(id) {

            var index = -1;
            for (var i=0; i< this._activedPromotions.length; i++) {

                if (this._activedPromotions[i]['id'] == id) {
                    index = i;
                    break;
                }
                
            }

            if (index != -1) {
                this.getPromotionsTree().selectedIndex = index;
                this.getPromotionsTree().selection.select(index);
                this.modify();
            }
        },

        modify: function() {
            
            var selIndex = this.getPromotionsTree().selectedIndex;

            if (selIndex < 0) {
                document.getElementById('upBtn').setAttribute('disabled', true);
                document.getElementById('downBtn').setAttribute('disabled', true);
                document.getElementById('modifyBtn').setAttribute('disabled', true);
                document.getElementById('deleteBtn').setAttribute('disabled', true);
                return ;
            }

            var totalPromotions = this._activedPromotions.length;

            document.getElementById('upBtn').setAttribute('disabled', true);
            document.getElementById('downBtn').setAttribute('disabled', true);

            if (selIndex > 0) document.getElementById('upBtn').setAttribute('disabled', false);
            if (selIndex < (totalPromotions -1)) document.getElementById('downBtn').setAttribute('disabled', false);


            document.getElementById('modifyBtn').setAttribute('disabled', false);
            document.getElementById('deleteBtn').setAttribute('disabled', false);          
            
            var selObj = this._activedPromotions[selIndex];

            // update to lastPromotionData
            this._lastPromotionData = selObj;

            //this.Form.reset('promotionForm');

            this.Form.unserializeFromObject('promotionForm', selObj);

            // set time to javascript datetime
            document.getElementById('start_date').value = (selObj.start_date*1000);
            document.getElementById('end_date').value = (selObj.end_date*1000);
            document.getElementById('start_time').value = (selObj.start_time*1000);
            document.getElementById('end_time').value = (selObj.end_time*1000);

            this.switchInputableFields(true);

            this.updateTriggerUI();
            this.updateTypeUI();


        },

        updateTriggerUI: function() {
            
            var triggerList = document.getElementById('triggerList');
            var triggerKey = triggerList.value || 'bypass';
            if(triggerList.value != triggerKey) triggerList.value = triggerKey;
            var triggerObj = this._activedTriggers[triggerKey];

            try {
                if (triggerObj) {

                    // pass data to session
                    let settings = ( this._lastPromotionData['trigger_data'] == null) ? {} : GeckoJS.BaseObject.unserialize(this._lastPromotionData['trigger_data']) ;
                    GeckoJS.Session.set('promotions_manager.trigger.settings.'+triggerKey, settings);

                    document.getElementById('trigger_desc').value = triggerObj.desc;
                    document.getElementById('triggerFrame').webNavigation.loadURI(triggerObj.setting_uri,Components.interfaces.nsIWebNavigation,null,null,null);

                }else {
                    document.getElementById('trigger_desc').value = '';
                    document.getElementById('triggerFrame').webNavigation.loadURI('about:blank',Components.interfaces.nsIWebNavigation,null,null,null);

                }
            }catch(e) {
                // @todo url not exists , use bypass ??
                triggerKey = 'bypass';
                triggerList.value = triggerKey;
                triggerObj = this._activedTriggers[triggerKey];

                GeckoJS.Session.set('promotions_manager.trigger.settings.'+triggerKey, {});

                document.getElementById('trigger_desc').value = triggerObj.desc;
                document.getElementById('triggerFrame').webNavigation.loadURI('about:blank',Components.interfaces.nsIWebNavigation,null,null,null);
            }
            
        },

        getTriggerSettingsFromUI: function() {

            var triggerList = document.getElementById('triggerList');
            var triggerKey = triggerList.value;

            // notify type settings to update session
            var event = document.createEvent("Event");
            event.initEvent("promotion_modify", true, true);
            document.getElementById('triggerFrame').contentWindow.dispatchEvent(event);
            
            var settings = GeckoJS.Session.get('promotions_manager.trigger.settings.'+triggerKey) || {};

            return settings;
        },


        updateTypeUI: function() {
            var typeList = document.getElementById('typeList');
            var typeKey = typeList.value || 'bypass';
            if(typeList.value != typeKey) typeList.value = typeKey;
            var typeObj = this._activedTypes[typeKey];

            try {
                if (typeObj) {

                    let settings = ( this._lastPromotionData['type_data'] == null) ? {} : GeckoJS.BaseObject.unserialize(this._lastPromotionData['type_data']) ;
                    GeckoJS.Session.set('promotions_manager.type.settings.'+typeKey, settings);

                    document.getElementById('type_desc').value = typeObj.desc;
                    document.getElementById('typeFrame').webNavigation.loadURI(typeObj.setting_uri,Components.interfaces.nsIWebNavigation,null,null,null);

                }else {
                    document.getElementById('type_desc').value = '';
                    document.getElementById('typeFrame').webNavigation.loadURI('about:blank',Components.interfaces.nsIWebNavigation,null,null,null);
                }
            }catch(e) {
                
                // @todo url not exists , use bypass ??
                typeKey = 'bypass';
                typeList.value = typeKey;
                typeObj = this._activedTypes[typeKey];
                GeckoJS.Session.set('promotions_manager.type.settings.'+typeKey, {});
                document.getElementById('type_desc').value = typeObj.desc;
                document.getElementById('typeFrame').webNavigation.loadURI('about:blank',Components.interfaces.nsIWebNavigation,null,null,null);
            }

        },

        getTypeSettingsFromUI: function() {

            var typeList = document.getElementById('typeList');
            var typeKey = typeList.value;

            // notify type settings to update session
            var event = document.createEvent("Event");
            event.initEvent("promotion_modify", true, true);
            document.getElementById('typeFrame').contentWindow.dispatchEvent(event);

            var settings = GeckoJS.Session.get('promotions_manager.type.settings.'+typeKey) || {};

            return settings;
        },


        remove: function() {

            var selIndex = this.getPromotionsTree().selectedIndex;
            var selObj = this._activedPromotions[selIndex];

            if (!selObj) return;

            if (GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete %S', [selObj.name]), _('Are you sure?'))) {

                try {

                    var id = selObj.id;

                    this.Promotion.del(id);

                    this.Form.reset('promotionForm');

                    this.switchInputableFields(false);

                    this.getPromotionsTree().selectedIndex = -1;
                    this.getPromotionsTree().selection.select(-1);

                    this.refresh();

                    OsdUtils.info(_('Promotion Rule [%S] removed successfully', [selObj.name]));
                }
                catch (e) {

                    NotifyUtils.error(_('An error occurred while removing Promotion Rule [%S]. The rule may not have been removed successfully', [selObj.name]));
                }
            }
            
        },

        update: function() {


                try {

                    var formData = this.Form.serializeToObject('promotionForm');

                    // set time from javascript datetime
                    formData['start_date'] = (formData['start_date']/1000);
                    formData['end_date'] = (formData['end_date']/1000);
                    formData['start_time'] = (formData['start_time']/1000);
                    formData['end_time'] = (formData['end_time']/1000);

                    // get settings from ui

                    var triggerSettings = this.getTriggerSettingsFromUI();
                    var typeSettings = this.getTypeSettingsFromUI();
                    //this.log(this.dump(triggerSettings) + this.dump(typeSettings));

                    formData['trigger_data'] = GeckoJS.BaseObject.serialize(triggerSettings);
                    formData['type_data'] = GeckoJS.BaseObject.serialize(typeSettings);

                    this.Promotion.id = formData.id;
                    this.Promotion.save(formData);


                    this.refresh();

                    this.modifyById(formData.id);

                    OsdUtils.info(_('Promotion Rule [%S] modified successfully', [formData.name]));
                }
                catch (e) {
                    
                    NotifyUtils.error(_('An error occurred while removing Promotion Rule [%S]. The rule may not have been modified successfully', [formData.name]));
                }

            
        },

        up: function() {

            var selIndex = this.getPromotionsTree().selectedIndex;
            var preIndex = selIndex -1;

            var id = this._activedPromotions[selIndex]['id'];

            this.swap(selIndex, preIndex);

            this.getPromotionsTree().selectedIndex = preIndex;
            this.getPromotionsTree().selection.select(preIndex);

            /// this.modifyById(id);


        },

        down: function() {

            var selIndex = this.getPromotionsTree().selectedIndex;
            var nextIndex = selIndex +1;

            var id = this._activedPromotions[selIndex]['id'];

            this.swap(selIndex, nextIndex);

            this.getPromotionsTree().selectedIndex = nextIndex;
            this.getPromotionsTree().selection.select(nextIndex);

//            this.modifyById(id);
            
        },

        swap: function(index1, index2) {

            var obj1 = this._activedPromotions[index1];
            var obj2 = this._activedPromotions[index2];

            var id1 = obj1.id;
            var id2 = obj2.id;

            var rule_order1 = obj1.rule_order;
            var rule_order2 = obj2.rule_order;

            this.Promotion.id = id1;
            this.Promotion.save({rule_order: rule_order2});

            this.Promotion.id = id2;
            this.Promotion.save({rule_order: rule_order1});

            this.refresh();

        },

        getRate: function () {

            var rate = $('#tax_no').val();
            var aURL = 'chrome://viviecr/content/select_tax.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            var inputObj = {
                rate: rate
            };

            var taxes = GeckoJS.Session.get('taxes');
            if(taxes == null) taxes = this.Tax.getTaxList();

            inputObj.taxes = taxes;

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, 'select_rate', features, inputObj);

            if (inputObj.ok) {
                if (inputObj.rate) {
                    $('#tax_no').val(inputObj.rate);
                    $('#tax_name').val(inputObj.name);
                }
                else {
                    $('#tax_no').val('');
                    $('#tax_name').val('');
                }
            }
        }

    };

    AppController.extend(__promotions_manager_controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'PromotionsManager');
    }, false);

    
})();
