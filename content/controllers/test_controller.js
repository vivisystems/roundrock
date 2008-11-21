(function(){

    /**
     * Class ViviPOS.CartController
     */

    GeckoJS.Controller.extend( {
        name: 'Test',
        components: ['Tax'],
        
        createTransaction: function(id) {
            var t = new Transaction();
            this.log(this.dump(t));
            alert('ok');
        }
    });


})();
