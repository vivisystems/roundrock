(function(){

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var PromotionModel = window.PromotionModel = AppModel.extend({
        name: 'Promotion',

        getActivedPromotions: function() {
            return this.find('all', {
                conditions: 'active=1',
                order: 'rule_order',
                recursive: 0
            });
        },

        getPromotions: function(condition) {
            condition = condition || '1=1';
            return this.find('all', {
                conditions: condition,
                order: 'rule_order',
                recursive: 0
            });
        }

    });

})();
