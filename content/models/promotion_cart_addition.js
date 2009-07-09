(function(){

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'PromotionCartAddition',
        useDbConfig: 'memory',

        appendItem: function(item) {


        },

        removeItem: function(item) {

        },

        truncate: function() {

        }



    };

    var PromotionCartAdditionModel = window.PromotionCartAdditionModel = AppModel.extend(__model__);

})();
