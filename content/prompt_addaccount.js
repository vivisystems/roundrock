(function(){
    var inputObj = window.arguments[0];
    var topics = inputObj.topics;

    /**
     * Controller Startup
     */
    function startup() {
        // set topic list
        
        window.viewHelper = new GeckoJS.NSITreeViewArray(topics);

        document.getElementById('topicscrollablepanel').datasource = window.viewHelper ;
        document.getElementById('topicscrollablepanel').selectedIndex = 0;
        document.getElementById('topicscrollablepanel').selectedItems = [0];
       
        document.getElementById('cancel').setAttribute('disabled', false);

        document.getElementById('clearBtn').addEventListener('command', clearTextBox, false);

        doSetOKCancel(

            function(){

                var index = document.getElementById('topicscrollablepanel').selectedIndex;
                var topic = topics[index];
                
                inputObj.topic_no = topic.no;
                inputObj.topic = topic.topic;
                inputObj.description = document.getElementById('description').value;
                inputObj.type = document.getElementById('type').value;
                inputObj.amount = document.getElementById('amount').value;
                
                inputObj.ok = true;
                return true;
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
