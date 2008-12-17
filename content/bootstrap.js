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

// include project libs

// include project models
include('chrome://viviecr/content/models/user.js');
include('chrome://viviecr/content/models/category.js');
include('chrome://viviecr/content/models/product.js');
include('chrome://viviecr/content/models/cart.js');
include('chrome://viviecr/content/models/cash_drawer.js');
include('chrome://viviecr/content/models/sequence.js');
include('chrome://viviecr/content/models/transaction.js');
include('chrome://viviecr/content/models/condiment_group.js');
include('chrome://viviecr/content/models/condiment.js');
include('chrome://viviecr/content/models/plugroup.js');
include('chrome://viviecr/content/models/job.js');
include('chrome://viviecr/content/models/producttmp.js');


include('chrome://viviecr/content/models/order.js');
include('chrome://viviecr/content/models/order_item.js');
include('chrome://viviecr/content/models/order_addition.js');
include('chrome://viviecr/content/models/order_payment.js');
include('chrome://viviecr/content/models/order_object.js');


// include project helpers
include('chrome://viviecr/content/helpers/nsi_products_view.js');
include('chrome://viviecr/content/helpers/nsi_plus_view.js');
include('chrome://viviecr/content/helpers/nsi_categories_view.js');
include('chrome://viviecr/content/helpers/nsi_departments_view.js');
include('chrome://viviecr/content/helpers/nsi_cart_view.js');
include('chrome://viviecr/content/helpers/nsi_condiments_view.js');
include('chrome://viviecr/content/helpers/nsi_plugroups_view.js');
include('chrome://viviecr/content/helpers/nsi_rolegroups_view.js');
include('chrome://viviecr/content/helpers/nsi_taxes_view.js');


// include project components
include('chrome://viviecr/content/controllers/components/barcode.js');
include('chrome://viviecr/content/controllers/components/tax.js');

// include project controllers
include('chrome://viviecr/content/controllers/main_controller.js');
include('chrome://viviecr/content/controllers/cart_controller.js');
include('chrome://viviecr/content/controllers/keypad_controller.js');
// include('chrome://viviecr/content/controllers/vfd_controller.js');
include('chrome://viviecr/content/controllers/cash_drawer_controller.js');
include('chrome://viviecr/content/controllers/products_controller.js');
include('chrome://viviecr/content/controllers/categories_controller.js');
include('chrome://viviecr/content/controllers/taxes_controller.js');
include('chrome://viviecr/content/controllers/image_manager_controller.js');
include('chrome://viviecr/content/controllers/departments_controller.js');
include('chrome://viviecr/content/controllers/plus_controller.js');
include('chrome://viviecr/content/controllers/pricelevel_controller.js');
include('chrome://viviecr/content/controllers/plugroups_controller.js');
include('chrome://viviecr/content/controllers/condiments_controller.js');
include('chrome://viviecr/content/controllers/jobs_controller.js');
include('chrome://viviecr/content/controllers/pricelevelschedule_controller.js');
include('chrome://viviecr/content/controllers/plusearch_controller.js');
include('chrome://viviecr/content/controllers/stocks_controller.js');
include('chrome://viviecr/content/controllers/currencysetup_controller.js');

include('chrome://viviecr/content/controllers/test_controller.js');


//
//
// user define
// include('chrome://viviecr/content/tax.js');
include('chrome://viviecr/content/fecposutils.js');

})();
