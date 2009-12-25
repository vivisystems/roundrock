var options;

(function(){
    var caption0 = window.arguments[0];
    var inputObj = window.arguments[1];
    
    /**
     * Controller Startup
     */
    function startup() {

        // hide numberpad
        if ('numpad' in inputObj) {
            document.getElementById('numpad').setAttribute('hidden', false);
            if (inputObj.numpad != null) {
                document.getElementById('multinumberpad').setTarget(inputObj.numpad);
                document.getElementById('bkeyBtn').setTarget(inputObj.numpad);
                document.getElementById('clearBtn').setTarget(inputObj.numpad);
            }
        }
        else {
            document.getElementById('numpad').setAttribute('hidden', true);
        }
        document.getElementById('dialog-caption').setAttribute("label", caption0);

        var disablecancelbtn = ('disablecancelbtn' in inputObj);
        document.getElementById('cancel').setAttribute('hidden', disablecancelbtn);

        var usersPanel = document.getElementById('usersPanel');
        usersPanel.datasource = inputObj.users;

        doSetOKCancel(
            function(){
                let user = inputObj.users[usersPanel.selectedIndex] || null;
                let password = GeckoJS.String.trim(document.getElementById('input0').value);
                if (user) {
                    if (user.password == password) {
                        inputObj.ok = true;
                        inputObj.user = user;
                        return true;
                    }else {
                        alert(_('Authentication failed! Please make sure the password is correct.'));
                        return false;
                    }
                }else {
                    alert(_('Authentication failed! Please select a user'));
                    return false;
                }

                return false;
            },
            function(){
                inputObj.ok = false;
                inputObj.user = {};
                return !disablecancelbtn;
            }
        );

        document.getElementById('input0').focus();
    };

    function gotFocus() {
        var focusedElement = document.commandDispatcher.focusedElement;
        if (focusedElement.tagName == 'html:input' || focusedElement.tagName == 'textbox') {
            focusedElement.select();
        }
        return true;
    };
    
    window.addEventListener('load', startup, false);

    // make inputObj globally available
    options = inputObj;
})();


function clearFocusedElement(target) {
    var focused;
    if (target) {
        focused = document.getElementById(target);
    }
    if (!focused) focused = document.commandDispatcher.focusedElement;
    if (focused.tagName == 'html:input' || focused.tagName == 'textbox') focused.value = '';
}
