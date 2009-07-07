(function(){

    var AppModel = window.AppModel = GeckoJS.Model.extend({
        name: 'App',

    /**
    *
    * @public
    * @function
    * @param {Object} data
    */
        saveToBackup: function(data) {
            dump('call Save to backup \n');
            return this._super(data);
        }
    });

})();
