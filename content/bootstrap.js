/**
 *
 * This file is loaded automatically by overlay.xul loaded
 * This is an application wide file to load any function that is not used within a class define.
 * You can also use this to include or require any files in your application.
 *
 */
(function(){


// include project locale properties
GeckoJS.StringBundle.createBundle("chrome://viviecr/locale/messages.properties");

// include project models
include('chrome://viviecr/content/models/cashdrawer_record.js');
include('chrome://viviecr/content/models/category.js');
include('chrome://viviecr/content/models/clockstamp.js');
include('chrome://viviecr/content/models/condiment.js');
include('chrome://viviecr/content/models/condiment_group.js');
include('chrome://viviecr/content/models/job.js');

include('chrome://viviecr/content/models/order.js');
include('chrome://viviecr/content/models/order_item.js');
include('chrome://viviecr/content/models/order_addition.js');
include('chrome://viviecr/content/models/order_payment.js');
include('chrome://viviecr/content/models/order_object.js');
include('chrome://viviecr/content/models/order_receipt.js');
include('chrome://viviecr/content/models/order_annotation.js');

include('chrome://viviecr/content/models/ledger_entry_type.js');
include('chrome://viviecr/content/models/ledger_record.js');

include('chrome://viviecr/content/models/plugroup.js');
include('chrome://viviecr/content/models/product.js');
include('chrome://viviecr/content/models/sequence.js');
include('chrome://viviecr/content/models/setitem.js');
include('chrome://viviecr/content/models/shift_change.js');
include('chrome://viviecr/content/models/shift_change_detail.js');
include('chrome://viviecr/content/models/shift_marker.js');
include('chrome://viviecr/content/models/storecontact.js');
include('chrome://viviecr/content/models/transaction.js');
include('chrome://viviecr/content/models/user.js');

include('chrome://viviecr/content/models/table.js');
include('chrome://viviecr/content/models/table_region.js');
include('chrome://viviecr/content/models/table_booking.js');
include('chrome://viviecr/content/models/table_status.js');

})();
