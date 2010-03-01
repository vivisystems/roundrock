(function(){
   
    /**
     * prompt_additem panel register
     */
    function startup() {

        var $panel = $('#promptPasswordPanel');

        var screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
        var screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

        var savedHotKeys;

        $.installPanel($panel[0], {
            
            css: {
                left: 0,
                top: 0,

                width: screenwidth,
                'max-width': screenwidth,

                height: screenheight,
                'max-height': screenheight
            },

            init: function(evt) {
                
                /*
                var textNodes = document.getElementsByTagName('textbox');
                if (textNodes != null && textNodes.length > 0) {
                    for (var i = 0; i < textNodes.length; i++)
                        textNodes[i].addEventListener('focus', gotFocus, false);
                }
                */

            },

            load: function(evt) {

                var caption0 = evt.data[0];
                var title0 = evt.data[1];
                
                document.getElementById('promptPassword-dialog-caption').setAttribute("value", caption0);
                document.getElementById('promptPassword-title0').value = title0;
                document.getElementById('promptPassword-input0').value = '';

                promptPassword_validateInput();
            },

            shown: function(evt) {
                var keys = document.getElementById('keyset_extensions');
                if (keys) {
                    keys.setAttribute('disabled', true);
                }

                let hotkeys = document.getElementById('hotkeySets');
                if (hotkeys) {
                    savedHotKeys = hotkeys.keys;
                    hotkeys.keys = [];
                }

                document.getElementById('promptPassword-input0').focus();
            },

            hide: function (evt) {

                var keys = document.getElementById('keyset_extensions');
                if (keys) {
                    keys.removeAttribute('disabled');
                }

                let hotkeys = document.getElementById('hotkeySets');
                if (hotkeys) {
                    alert('hotkeys: ' + savedHotKeys);
                    hotkeys.keys = savedHotKeys;
                }

                // press escape
                var isOK = typeof evt.data == 'boolean' ? evt.data : false;
                var result = {};

                if(isOK) {
                    result.input0 = GeckoJS.String.trim(document.getElementById('promptPassword-input0').value);
                    result.ok = true;

                }else {
                    result.ok = false;
                }
                
                evt.data = result;
            }

        });

    }


    function gotFocus() {
        /*
        var focusedElement = document.commandDispatcher.focusedElement;
        if (focusedElement.tagName == 'html:input' || focusedElement.tagName == 'textbox') {
            focusedElement.select();
        }
        return true;
        */
    }


    window.addEventListener('load', startup, false);

})();

function promptPassword_processInput(evt) {
    if (evt.keyCode == 13) {
        var pwd = document.getElementById('promptPassword-input0').value;
        if (pwd != '') {
            $.hidePanel('promptPasswordPanel', true);
        }
    }
    else if (evt.keyCode == 27) {
        document.getElementById('promptPassword-input0').value = '';
        promptPassword_validateInput();
    }
}

function promptPassword_clearFocusedElement() {
    var focused = document.commandDispatcher.focusedElement;
    if (focused.tagName == 'html:input' || focused.tagName == 'html:textarea') focused.value = '';
}

// global promptPassword_validateInput function
function promptPassword_validateInput() {
    var pwd = document.getElementById('promptPassword-input0').value;
    document.getElementById('promptPassword-ok').setAttribute('disabled', pwd == '');
}
