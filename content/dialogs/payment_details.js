(function(){

    /**
     * paymentDetailstPanel register
     */
    function startup() {

        var $panel = $('#paymentDetailsPanel');
        var $buttonPanel = $('#paymentscrollablepanel');

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

            },

            load: function(evt) {

                var title = evt.data[0];
                var details = evt.data[1];

                document.getElementById('paymentDetails-title').setAttribute("label", title);

                if (details != null) {
                    details = GeckoJS.Array.objectExtract(details, '{s}');
                    $buttonPanel[0].datasource = details ;
                }else {
                    $buttonPanel[0].datasource = [];
                }

                ///$buttonPanel[0].vivibuttonpanel.invalidate();

            },

            hide: function (evt) {

            }

        });

    }

    window.addEventListener('load', startup, false);

})();
