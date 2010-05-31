(function(){

    /**
     * Controller Startup
     */
    function startup() {

        var detail;
        var controller;

        if (window.arguments && window.arguments[0]) {
            detail = window.arguments[0].detail;
            controller = window.arguments[0].controller;
        }

        var detailObj = document.getElementById('dialog_message');
        var actionButtonsObj = document.getElementById('action_buttons');
        var rebootButtonsObj = document.getElementById('action_reboot');
        var shutdownButtonsObj = document.getElementById('action_shutdown');

        if (detail) {
            detailObj.value = detail;
        }

        detailObj.hidden = !detail;
        actionButtonsObj.hidden = !detail;

        window.rebootMachine = function() {
            GeckoJS.Session.set('restarting', true);
            controller.requestCommand('rebootMachine', null, 'Main');

            rebootButtonsObj.disabled = true;
            shutdownButtonsObj.disabled = true;
        }

        window.shutdownMachine = function() {
            GeckoJS.Session.set('restarting', true);
            controller.requestCommand('shutdownMachine', null, 'Main');

            rebootButtonsObj.disabled = true;
            shutdownButtonsObj.disabled = true;
        }
    };

    window.addEventListener('load', startup, false);

})();

