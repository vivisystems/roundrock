(function(){

    /**
     * Controller Promotions Manager
     * 
     */
    var __promotions_manager_controller__ = {

        name: 'PromotionsManager',

        uses: ['Promotion'],

        _activedPromotions: [],

        _activedTriggers: {},
        _activedTypes: {},

        _lastPromotionId: '',

        /*
         * initial promotions rules for register
         */
        initial: function() {

           
            // load promotions trigger / type class
            var promotionsTriggers = GeckoJS.Configure.read('vivipos.fec.registry.promotion.trigger') || false;

            var promotionsTypes = GeckoJS.Configure.read('vivipos.fec.registry.promotion.type') || false;

            // var activedPromotions = this.Promotion.getActivedPromotions();

            var daysOfWeek = [];
            var date = new Date();
            date.setDate(date.getDate() - (date.getDay() + 1));
            for (var i=0; i < 7; i++) {
                date.setDate(date.getDate() + 1);
                daysOfWeek.push({name: date.toLocaleFormat("%A")});
            }

            document.getElementById('days_of_week').datasource = daysOfWeek;

            this.refresh();
                
        },

        close: function() {
            window.close();
        },

        add: function  () {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';

            var inputObj = {
                input0:null,
                require0:true,
                input1:null,
                require1:true

            };

            window.openDialog(aURL,
                _('Add New Promotion Rule'),
                features,
                _('New Promotion Rule'),
                '',
                _('Rule Name'),
                _('Rule Code'),
                inputObj);

            if (inputObj.ok && inputObj.input0) {

                var start_date = new Date().clearTime();
                var end_date = Date.today().addDays(1).addSeconds(-1);
                var start_time = start_date;
                var end_time = end_date;

                var inputData = {
                    name: inputObj.input0,
                    code: inputObj.input1,
                    start_date: (start_date.getTime()/1000),
                    end_date: (end_date.getTime()/1000),
                    start_time: (start_time.getTime()/1000),
                    end_time: (end_time.getTime()/1000),
                    days_of_week: '',
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

                    this._lastPromotionId = this.Promotion.id;

                    // to modify mode
                    this.refresh();
                    
                    this.modifyById(this._lastPromotionId);

                    // @todo OSD
                    OsdUtils.info(_('Promotion Rule [%S] added successfully', [inputData.name]));
                }
                catch (e) {
                    // @todo OSD
                    alert(e);
                    NotifyUtils.error(_('An error occurred while adding Promotion Rule [%S]. The rule may not have been added successfully', [inputData.name]));
                }
            }
        },

        refresh: function() {
            
            var promotions = this.Promotion.find('all', {order: 'rule_order'});
           
            document.getElementById('promotions_tree').datasource = promotions;

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
                document.getElementById('promotions_tree').selectedIndex = index;
                document.getElementById('promotions_tree').selection.select(index);
                this.modify();
            }
        },

        modify: function() {
            
            var selIndex = document.getElementById('promotions_tree').selectedIndex;

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
                      
            //this.Form.reset('promotionForm');

            this.Form.unserializeFromObject('promotionForm', selObj);

            // set time to javascript datetime
            document.getElementById('start_date').value = (selObj.start_date*1000);
            document.getElementById('end_date').value = (selObj.end_date*1000);
            document.getElementById('start_time').value = (selObj.start_time*1000);
            document.getElementById('end_time').value = (selObj.end_time*1000);


            $('[form=promotionForm]').each(function(i) {
                this.removeAttribute('disabled');
            });

            this.updateTriggerUI();
            this.updateTypeUI();


        },

        updateTriggerUI: function() {

        },

        updateTypeUI: function() {

        },

        remove: function() {

            var selIndex = document.getElementById('promotions_tree').selectedIndex;
            var selObj = this._activedPromotions[selIndex];

            if (!selObj) return;

            if (GREUtils.Dialog.confirm(null, _('confirm delete %S', [selObj.name]), _('Are you sure?'))) {

                try {

                    var id = selObj.id;

                    this.Promotion.del(id);

                    this.Form.reset('promotionForm');
                    
                    $('[form=promotionForm]').attr('disabled', true);

                    document.getElementById('promotions_tree').selectedIndex = -1;
                    document.getElementById('promotions_tree').selection.select(-1);

                    this.refresh();

                    // @todo OSD
                    OsdUtils.info(_('Promotion Rule [%S] removed successfully', [selObj.name]));
                }
                catch (e) {
                    // @todo OSD
                    NotifyUtils.error(_('An error occurred while removing Promotion Rule [%S]. The group may not have been removed successfully', [selObj.name]));
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

                    this.Promotion.id = formData.id;
                    this.Promotion.save(formData);


                    this.refresh();

                    this.modifyById(formData.id);

                    // @todo OSD
                    OsdUtils.info(_('Promotion Rule [%S] modified successfully', [formData.name]));
                }
                catch (e) {
                    // @todo OSD
                    NotifyUtils.error(_('An error occurred while removing Promotion Rule [%S]. The group may not have been modified successfully', [formData.name]));
                }

            
        },

        up: function() {

            var selIndex = document.getElementById('promotions_tree').selectedIndex;
            var preIndex = selIndex -1;

            var id = this._activedPromotions[selIndex]['id'];

            this.swap(selIndex, preIndex);
            
            this.modifyById(id);


        },

        down: function() {

            var selIndex = document.getElementById('promotions_tree').selectedIndex;
            var nextIndex = selIndex +1;

            var id = this._activedPromotions[selIndex]['id'];

            this.swap(selIndex, nextIndex);

            this.modifyById(id);
            
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

        }



    };

    GeckoJS.Controller.extend(__promotions_manager_controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'PromotionsManager');
    }, false);

    
})();
