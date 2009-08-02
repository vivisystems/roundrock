var options;

(function(){
    var inputObj = window.arguments[0];
    
    /**
     * Controller Startup
     */
    function startup() {

        var fnTree = document.getElementById('hotkey_function_tree');
        if (fnTree) fnTree.datasource = inputObj.fn_list;
        
        doSetOKCancel(
            function(){
                var selectedIndex = document.getElementById('hotkey_function_tree').selectedIndex;
                var hotkey = document.getElementById('hotkey_hotkey');
                var hotkeyData = {
                    keycombo: hotkey.getHotkey(false),
                    keydisplay: hotkey.getHotkey(true),
                    modifiers: hotkey.getModifiers(false),
                    keycode: hotkey.hotkeyCodeVK,
                    keychar: hotkey.hotkeyChar
                };
                inputObj.name = GeckoJS.String.trim(document.getElementById('hotkey_name').value);
                inputObj.fn = options.fn_list[selectedIndex];
                inputObj.hotkey = hotkeyData;
                
                inputObj.ok = true;
                return true;
            },
            function(){
                inputObj.ok = false;
                return true;
            }
        );

        validateInput();

        var textNodes = document.getElementsByTagName('textbox');
        if (textNodes != null && textNodes.length > 0) {
            for (var i = 0; i < textNodes.length; i++)
                textNodes[i].addEventListener('focus', gotFocus, false);
        }
        
        document.getElementById('hotkey_hotkey').focus();
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


function selectFunction(fnTree) {
    var index = fnTree.selectedIndex;
    
    var fnName = options.fn_list[index].name;
    var fnLabel = options.fn_list[index].label;

    document.getElementById('hotkey_name').value = fnName;
    document.getElementById('hotkey_linked').value = fnLabel;

    validateInput();
}

function validateInput() {

    var hotkey = document.getElementById('hotkey_hotkey').getHotkey(true);
    var label = GeckoJS.String.trim(document.getElementById('hotkey_name').value);
    var fn = document.getElementById('hotkey_linked').value;

    var validated = hotkey != '' && label != '' && fn != '';
    document.getElementById('ok').setAttribute('disabled', !validated);

}
