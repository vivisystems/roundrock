(function(){

    var $panel, $buttonPanel, $itemlist, queues;
    
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
                'max-width': screenwidth,
                'min-width': screenwidth,
                height: screenheight
            },

            init: function(evt) {

                var viewHelper = new NSIQueuesView();

                $buttonPanel[0].datasource = viewHelper ;
                $buttonPanel[0].selectedItems = [] ;

                try {
                    $buttonPanel[0].addEventListener('command', onBtnClick, true);
                }
                catch(e) {
                }
                

            },

            load: function(evt) {

                queues = evt.data.queues;

                $itemlist.val("");
                
                $buttonPanel[0].datasource = queues;
                $buttonPanel[0].vivibuttonpanel.invalidate();
                $buttonPanel[0].scrollToRow(0);

            },

            hide: function(evt) {

                // press escape
                var isOK = typeof evt.data == 'boolean' ? evt.data : false;
                var result = {};

                result.ok = isOK;
                
                if(isOK) {
                    var idx = $buttonPanel[0].value;
                    result.index = idx;
                    result.id = queues[idx].id;
                }

                evt.data = result;
            }

        });

    }

    function onBtnClick(evt) {

            var index = evt.target.value;
            var displayStr = queues[index].summary;

            $itemlist.val(displayStr);

    }

    window.addEventListener('load', startup, false);

})();
