(function(){
    var inputObj = window.arguments[0];
    var topics = inputObj.topics;
    var data = inputObj.shiftchange;
    var detail = inputObj.shiftchange.detail;

    /**
     * Controller Startup
     */
    function startup() {
        // set topic list
        window.viewHelper = new GeckoJS.NSITreeViewArray(topics);

        document.getElementById('topicscrollablepanel').datasource = window.viewHelper ;
        document.getElementById('topicscrollablepanel').selectedIndex = 0;
        document.getElementById('topicscrollablepanel').selectedItems = [0];

        
        window.viewDetailHelper = new GeckoJS.NSITreeViewArray(detail);

        document.getElementById('shiftscrollablepanel').datasource = window.viewDetailHelper ;
        document.getElementById('shiftscrollablepanel').selectedIndex = 0;
        document.getElementById('shiftscrollablepanel').selectedItems = [0];
        
        document.getElementById('cancel').setAttribute('disabled', false);

        document.getElementById('clearBtn').addEventListener('command', clearTextBox, false);

        doSetOKCancel(

            function(){

                var index = document.getElementById('topicscrollablepanel').selectedIndex;

                inputObj.description = document.getElementById('description').value;
                inputObj.type = document.getElementById('type').value;
                inputObj.amount = parseFloat(document.getElementById('amount').value);

                if (!isNaN(inputObj.amount) && (index >= 0)) {

                    var topic = topics[index];
                    inputObj.topic = topic.topic;

                    inputObj.ok = true;
                    return true;
                } else if (isNaN(inputObj.amount)) {
                    inputObj.amount = 0;
                    inputObj.ok = true;
                    return true;
                } else {
                    NotifyUtils.warn(_('data incompleted!'));
                }
            },

            function(){
                inputObj.ok = false;
                return true;
            }
            );

    };

    /**
     * Clear  box
     */
    function clearTextBox() {

        var focusedElement = document.commandDispatcher.focusedElement;
        focusedElement.value = '';

    };

    
    window.addEventListener('load', startup, false);

})();
