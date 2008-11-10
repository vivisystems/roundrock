(function(){

 /**
  * Window Startup
  */
    function startup() {
    
        // var args = window.args = window.arguments[0].wrappedJSObject;
        centerWindowOnScreen();

        $do('loadItems', null, 'ControlPanel');

    };

    window.addEventListener('load', startup, true);

})();
