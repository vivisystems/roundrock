(function() {

var __klass__ = {
    
    name: 'Test1',

    /*
     * Type Action
     */
    execute: function() {
        // abstract
        // this.log(' process type ' + this.trigger.name);
        // alert(this.dump(this.trigger.getTriggerItems()));
    }


};

PromotionType.extend('Test1', __klass__);

})();
