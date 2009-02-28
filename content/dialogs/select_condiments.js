(function(){

    /**
     * select_condiments panel register
     */
    function startup() {

        var $panel = $('#selectCondimentPanel');
        var $buttonPanel = $('#condimentscrollablepanel');

        var screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
        var screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

        var condsData = null;
        var selectedItems = [];

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
			
                var viewHelper = new NSICondimentsView();

                $buttonPanel[0].datasource = viewHelper ;
                $buttonPanel[0].selectedItems = [] ;
		
            },

            load: function(evt) {
		
                condsData = evt.data.conds; // 0..n index
                selectedItems = evt.data.selectedItems; // 0..n index

                $buttonPanel[0].datasource = condsData ;
                $buttonPanel[0].selectedItems = selectedItems ;
                $buttonPanel[0].vivibuttonpanel.invalidate();
                $buttonPanel[0].scrollToRow(0);

            },

            hide: function (evt) {

                // press escape
                var isOK = typeof evt.data == 'boolean' ? evt.data : false;

                var condiments = [];
                var selectedItems = $buttonPanel[0].selectedItems; // 0..n index
                
                if(isOK && selectedItems.length > 0) {

                    selectedItems.forEach(function(index) {
                        condiments.push(condsData[index]);
                    });

                }

                evt.data = {condiments: condiments, selectedItems: selectedItems};
            }

        });

    }

    window.addEventListener('load', startup, false);

})();
