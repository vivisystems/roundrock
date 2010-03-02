var promptAddMemo_options;

(function(){
   
    /**
     * prompt_AddMemo panel register
     */
    function startup() {

        var $panel = $('#promptAddMemoPanel');

        var screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
        var screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

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
                // clear previous entries
                var input0 = document.getElementById('promptAddMemo-input0');
                if (input0) {
                    input0.value = '';
                }

                var input1 = document.getElementById('promptAddMemo-input1');

                var caption0 = evt.data[0];
                var text0 = evt.data[1];
                var title0  = evt.data[2];
                var inputObj = evt.data[4];
                
                // make inputObj globally available
                promptAddMemo_options = inputObj;

                document.getElementById('promptAddMemo-dialog-caption').setAttribute("value", caption0);
                document.getElementById('promptAddMemo-text0').value = text0;
                document.getElementById('promptAddMemo-title0').value = title0;

                // must use setAttribute; otherwise values would be wiped out by change made to 'multiline'
                if (input0) input0.setAttribute('value', inputObj.input0);
                if (input0) input0.value = inputObj.input0;
                if (input1) input1.datasource = inputObj.annotations;

                document.getElementById('promptAddMemo-cancel').setAttribute('disabled', false);

                promptAddMemo_validateInput();

                window.selectAnnotation = function(index) {
                    var anno = inputObj.annotations[index];
                    input0.value = anno ? anno.type : '';

                    promptAddMemo_validateInput();
                }

            },

            shown: function(evt) {
                // disable hot keys
                $do('disableHotKeys', null, 'Main');

                // set focus on primary input
                var input0 = document.getElementById('promptAddMemo-input0');
                if (input0) {
                    input0.focus();
                }

                var input1 = document.getElementById('promptAddMemo-input1');
                if (input1) {
                    input1.selectedIndex = -1;
                    input1.selection.clearSelection();
                }

            },

            hide: function (evt) {
                // restore hot keys
                $do('restoreHotKeys', null, 'Main');

                // press escape
                var isOK = typeof evt.data == 'boolean' ? evt.data : false;
                var result = {};

                if(isOK) {
                    result.input0 = GeckoJS.String.trim(document.getElementById('promptAddMemo-input0').value);
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

function promptAddMemo_clearFocusedElement() {
    var focused = document.commandDispatcher.focusedElement;
    if (focused.tagName == 'html:input' || focused.tagName == 'html:textarea') focused.value = '';
}

// global promptAddMemo_validateInput function
function promptAddMemo_validateInput() {

    var input0 = GeckoJS.String.trim(document.getElementById('promptAddMemo-input0').value);

    document.getElementById('promptAddMemo-ok').setAttribute('disabled', input0.length == 0);

}
