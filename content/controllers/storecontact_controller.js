(function(){

    /**
     * Contact Info Controller
     */

    GeckoJS.Controller.extend( {
        name: 'StoreContact',
        components: ['Form', 'Acl'], 
        scaffold: true,


        // load store contact from database into session cache
        initial: function() {

        },

        beforeScaffoldAdd: function(evt) {
        },

        afterScaffoldAdd: function (evt) {
        },

        beforeScaffoldEdit: function(evt) {
        },

        afterScaffoldEdit: function (evt) {
        },

        afterScaffoldSave: function(evt) {
        },

        beforeScaffoldDelete: function(evt) {
        },

        afterScaffoldDelete: function(evt) {
        },


        afterScaffoldIndex: function(evt) {
        },

        load: function () {
        },

        select: function(index){
        },

        validateForm: function() {
        }

    });

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('onInitial', function() {
                                            main.requestCommand('initial', null, 'StoreContact');
                                      });

    }, false);

})();

