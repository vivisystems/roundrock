(function(){

    var $panel, $buttonPanel, $itemlist, queues, queuePool;
    
    /**
     * select_condiments panel register
     */
    function startup() {

        $panel = $('#selectQueuesPanel');
        $buttonPanel = $('#queueScrollablepanel');
        $itemlist = $('#selectQueues-itemlist');

        var screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
        var screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

        $.installPanel($panel[0], {
            
            css: {
                top: 0,
                left: 0,

                width: screenwidth,
                height: screenheight
            },

            init: function(evt) {

                var viewHelper = new GeckoJS.NSITreeViewArray();

                $buttonPanel[0].datasource = viewHelper ;
                $buttonPanel[0].selectedItems = [] ;

                try {
                    $buttonPanel[0].addEventListener('command', onBtnClick, true);
                }catch(e) {
                    alert(e);
                }
                

            },

            load: function(evt) {

                queues = evt.data.queues;
                queuePool = evt.data.queuePool;

                $itemlist.val("");
                
                $buttonPanel[0].datasource = queues;
                $buttonPanel[0].vivibuttonpanel.invalidate();
                $buttonPanel[0].scrollToRow(0);

            },

            hide: function (evt) {

                // press escape
                var isOK = typeof evt.data == 'boolean' ? evt.data : false;
                var result = {};

                result.ok = isOK;
                
                if(isOK) {
                    var idx = $buttonPanel[0].value;
                    result.index = idx;
                    result.key = queues[idx].key;
                }

                evt.data = result;
            }

        });

    }

    function onBtnClick(evt) {

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

            displayStr += "\n\n" + _("TAL") + ": " + queueData.remain;

            $itemlist.val(displayStr);

    }

    window.addEventListener('load', startup, false);

})();