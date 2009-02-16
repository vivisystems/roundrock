(function(){

    /**
     * select_condiments panel register
     */
    function startup() {

        var $panel = $('#selectCondimentPanel');
        var $buttonPanel = $('#condimentscrollablepanel');

        var condsData = null;

        $.installPanel($panel[0], {

            init: function(evt) {
			
                var viewHelper = new NSICondimentsView();

                $buttonPanel[0].datasource = viewHelper ;
                $buttonPanel[0].selectedItems = [] ;
		
            },

            load: function(evt) {
		
                condsData = evt.data; // 0..n index

                $buttonPanel[0].datasource = condsData ;
                $buttonPanel[0].vivibuttonpanel.invalidate();
                $buttonPanel[0].scrollToRow(0);

            },

            hide: function (evt) {

                var isOK = evt.data;
                var condiments = [];
                var selectedItems = $buttonPanel[0].selectedItems; // 0..n index
                
                if(isOK && selectedItems.length > 0) {

                    selectedItems.forEach(function(index) {
                        condiments.push(condsData[index]);
                    });

                }

                evt.data = condiments;
            }

        });

    };

    window.addEventListener('load', startup, false);

})();
