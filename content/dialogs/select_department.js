(function(){

    /**
     * select_condiments panel register
     */
    function startup() {

        var $panel = $('#selectDepartmentPanel');
        var $buttonPanel = $('#departmentscrollablepanel');

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
                var viewHelper = new NSIDepartmentsView('departmentscrollablepanel', true);
                $buttonPanel[0].datasource = viewHelper ;
            },

            load: function(evt) {
                let viewHelper = $buttonPanel[0].datasource;
                viewHelper.contentType = evt.data.type;
                
                $buttonPanel[0].vivibuttonpanel.resizeButtons();
                $buttonPanel[0].selectedItems = [];
                $buttonPanel[0].scrollToRow(0);
                
                viewHelper.refreshView(true);
            },

            shown: function(evt) {
                // disable hot keys
                $do('disableHotKeys', null, 'Main');
            },

            hide: function (evt) {
                // disable hot keys
                $do('restoreHotKeys', null, 'Main');

                var selected;
                var isOK = typeof evt.data == 'boolean' ? evt.data : false;
                var currentIndex = $buttonPanel[0].currentIndex;
                var viewHelper = $buttonPanel[0].datasource;
                var depts = viewHelper.data || [];

                if(isOK && currentIndex > -1 && currentIndex < depts.length) {
                    selected = depts[currentIndex];
                }

                evt.data = {selected: selected};
            }

        });

    }

    window.addEventListener('load', startup, false);

})();
