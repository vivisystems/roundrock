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
GeckoJS.include('chrome://viviecr/content/models/user.js');
GeckoJS.include('chrome://viviecr/content/models/category.js');
GeckoJS.include('chrome://viviecr/content/models/product.js');
GeckoJS.include('chrome://viviecr/content/models/cart.js');
GeckoJS.include('chrome://viviecr/content/models/order.js');
GeckoJS.include('chrome://viviecr/content/models/order_detail.js');
GeckoJS.include('chrome://viviecr/content/models/cash_drawer.js');
GeckoJS.include('chrome://viviecr/content/models/sequence.js');
GeckoJS.include('chrome://viviecr/content/models/transaction.js');

// include project helpers
GeckoJS.include('chrome://viviecr/content/helpers/nsi_products_view.js');
GeckoJS.include('chrome://viviecr/content/helpers/nsi_categories_view.js');
GeckoJS.include('chrome://viviecr/content/helpers/nsi_cart_view.js');

// include project components
GeckoJS.include('chrome://viviecr/content/controllers/components/barcode.js');

// include project controllers
GeckoJS.include('chrome://viviecr/content/controllers/main_controller.js');
GeckoJS.include('chrome://viviecr/content/controllers/cart_controller.js');
GeckoJS.include('chrome://viviecr/content/controllers/keypad_controller.js');
GeckoJS.include('chrome://viviecr/content/controllers/vfd_controller.js');
GeckoJS.include('chrome://viviecr/content/controllers/cash_drawer_controller.js');
GeckoJS.include('chrome://viviecr/content/controllers/products_controller.js');
GeckoJS.include('chrome://viviecr/content/controllers/categories_controller.js');
GeckoJS.include('chrome://viviecr/content/controllers/taxes_controller.js');
GeckoJS.include('chrome://viviecr/content/controllers/selectqueue_controller.js');
GeckoJS.include('chrome://viviecr/content/controllers/image_manager_controller.js');
GeckoJS.include('chrome://viviecr/content/controllers/control_panel_controller.js');
GeckoJS.include('chrome://viviecr/content/controllers/departments_controller.js');
GeckoJS.include('chrome://viviecr/content/controllers/plus_controller.js');
GeckoJS.include('chrome://viviecr/content/controllers/pricelevel_controller.js');

// user define
GeckoJS.include('chrome://viviecr/content/tax.js');
GeckoJS.include('chrome://viviecr/content/fecposutils.js');

})();
