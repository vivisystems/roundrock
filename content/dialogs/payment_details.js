(function(){

    /**
     * paymentDetailstPanel register
     */
    function startup() {

        var $panel = $('#paymentDetailsPanel');
        var $buttonPanel = $('#paymentscrollablepanel');

        $.installPanel($panel[0], {

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
