(function(){

var PromotionModel = window.PromotionModel = GeckoJS.Model.extend({
    name: 'Promotion',

    getActivedPromotions: function() {
        return this.find('all', {conditions: 'active=1', recursive: 0});
    },

    getPromotions: function(condition) {
        condition = condition || '1=1';
        return this.find('all', {conditions: condition, recursive: 0});
    }

});

})();
