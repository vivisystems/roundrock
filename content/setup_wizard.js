var data = window.arguments[0];

(function() {

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', data, 'SetupWizard');

    };

    window.addEventListener('load', startup, false);

})();

function finishSetup() {
    $do('finishSetup', null, 'SetupWizard');

    data.restart = false;
    
    return true;
}

function cancelSetup() {
    if (data.restart) {
        return true;
    }
    else {
        $do('cancelSetup', data, 'SetupWizard');
        return data.cancelled;
    }
}