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
                $buttonPanel[0].selectedItems = selectedItems;
                $buttonPanel[0].vivibuttonpanel.invalidate();
                $buttonPanel[0].scrollToRow(0);

                $buttonPanel[0].datasource.supportSoldout = !evt.data.hideSoldout;
                if (evt.data.hideSoldout) {
                    $('#condimentscrollablepanel-soldout').hide();
                }
                else {
                    $('#condimentscrollablepanel-soldout').show();
                }
            },

            shown: function(evt) {
                // disable hot keys
                $do('disableHotKeys', null, 'Main');
            },
            
            hide: function (evt) {
                // disable hot keys
                $do('restoreHotKeys', null, 'Main');

                // press escape
                var isOK = typeof evt.data == 'boolean' ? evt.data : false;

                var condiments = [];
                var selectedItems = $buttonPanel[0].selectedItems; // 0..n index
                
                if(isOK && selectedItems.length > 0) {

                    selectedItems.sort(function(a,b) {return a - b});
                    
                    selectedItems.forEach(function(index) {
                        condiments.push(condsData[index]);
                    });
                }

                evt.data = {condiments: condiments, selectedItems: selectedItems};
            },

            // custom function for handling sold-out @irving
            doClick: function(panel) {
                
                // get sold out state
                var soldOutBtn =  $('#condimentscrollablepanel-soldout')[0];

                var soldout = soldOutBtn.checkState;
                if (soldout) {
                    soldOutBtn.checked = false;
                    $buttonPanel[0].datasource.soldoutActive = 0;
                }

                // get condiment state
                var selectedIndex = panel.selectedIndex;
                if (selectedIndex > -1) {
                    var cond = condsData[selectedIndex];
                    if (soldout || cond.soldout) {
                        if (soldout) {
                            cond.soldout = !cond.soldout;
/*
                            var selectedItems = panel.selectedItems;
                            var index = selectedItems.indexOf(selectedIndex);
                            if (index != -1) {
                                selectedItems.splice(index, 1);
                                panel.selectedItems = selectedItems;
                            }
*/
                            panel.invalidate();
                        }
                    }
                }
            }

        });

    }

    window.addEventListener('load', startup, false);

})();
