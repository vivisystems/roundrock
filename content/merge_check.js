(function(){
    include('chrome://viviecr/content/models/sequence.js');
    include('chrome://viviecr/content/models/transaction.js');

    include('chrome://viviecr/content/models/order.js');
    include('chrome://viviecr/content/models/order_addition.js');
    include('chrome://viviecr/content/models/order_annotation.js');
    include('chrome://viviecr/content/models/order_item.js');
    include('chrome://viviecr/content/models/order_object.js');
    include('chrome://viviecr/content/models/order_payment.js');
    include('chrome://viviecr/content/models/order_receipt.js');

    include('chrome://viviecr/content/controllers/components/barcode.js');
    include('chrome://viviecr/content/controllers/components/tax.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/controllers/merge_check_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'MergeCheck');

    };

    window.addEventListener('load', startup, false);

})();


