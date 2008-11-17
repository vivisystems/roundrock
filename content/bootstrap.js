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
GREUtils.include('chrome://viviecr/content/models/user.js');
GREUtils.include('chrome://viviecr/content/models/category.js');
GREUtils.include('chrome://viviecr/content/models/product.js');
GREUtils.include('chrome://viviecr/content/models/cart.js');
GREUtils.include('chrome://viviecr/content/models/order.js');
GREUtils.include('chrome://viviecr/content/models/order_detail.js');
GREUtils.include('chrome://viviecr/content/models/cash_drawer.js');
GREUtils.include('chrome://viviecr/content/models/sequence.js');
GREUtils.include('chrome://viviecr/content/models/condiment_group.js');
GREUtils.include('chrome://viviecr/content/models/condiment.js');
GREUtils.include('chrome://viviecr/content/models/plugroup.js');
GREUtils.include('chrome://viviecr/content/models/job.js');

// include project helpers
GREUtils.include('chrome://viviecr/content/helpers/nsi_products_view.js');
GREUtils.include('chrome://viviecr/content/helpers/nsi_categories_view.js');
GREUtils.include('chrome://viviecr/content/helpers/nsi_condiments_view.js');

// include project components
GREUtils.include('chrome://viviecr/content/controllers/components/barcode.js');

// include project controllers
GREUtils.include('chrome://viviecr/content/controllers/main_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/cart_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/keypad_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/vfd_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/cash_drawer_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/products_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/categories_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/taxes_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/selectqueue_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/image_manager_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/control_panel_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/departments_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/plus_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/plugroups_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/condiments_controller.js');
GREUtils.include('chrome://viviecr/content/controllers/jobs_controller.js');

// user define
GREUtils.include('chrome://viviecr/content/tax.js');
GREUtils.include('chrome://viviecr/content/fecposutils.js');

})();
