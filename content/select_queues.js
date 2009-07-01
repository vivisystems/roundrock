(function(){

    var inputObj = window.arguments[0];

    function startup() {

        var queues = inputObj.queues;
        var queuePool = inputObj.queuePool;

        var itemlistObj = document.getElementById('itemlist');

        window.viewHelper = new opener.GeckoJS.NSITreeViewArray(queues);
        document.getElementById('queueScrollablepanel').datasource = window.viewHelper ;

        document.getElementById('queueScrollablepanel').addEventListener('command', function(evt) {
            var index = evt.target.value;
            var key = queues[index].key;

            var queueData = queuePool.data[key];

            var displayStr = "";

            displayStr += _("SEQ") + ": " + queueData.seq + "\n\n";

            var limit = 10, cc= 0;

            for(var txid in queueData.items) {
                var item = queueData.items[txid];
                displayStr += item.name + ' x ' + item.current_qty + '\n';
                cc++;
                if (cc>limit) break;
            }

            if (cc>limit) displayStr += "   ......   \n" ;

            displayStr += "\n\n" + "(TAL)" + ": " + queueData.remain;

            itemlistObj.setAttribute('value', displayStr);


        }, true);
        
        doSetOKCancel(
            function(){
                // inputObj.condiments = document.getElementById('condiments').value;
                inputObj.index = document.getElementById('queueScrollablepanel').value;
                inputObj.ok = true;

                delete window.viewHelper;

                return true;
            },
            function(){
                inputObj.ok = false;
                delete window.viewHelper;
                return true;
            }
            );

    };

    window.addEventListener('load', startup, false);

})();


