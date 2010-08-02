( function() {
    include( 'chrome://viviecr/content/models/order.js' );
    include( 'chrome://viviecr/content/models/order_item.js' );
    include( 'chrome://viviecr/content/models/order_addition.js' );
    include( 'chrome://viviecr/content/models/order_payment.js' );
    include( 'chrome://viviecr/content/models/order_object.js' );
    include( 'chrome://viviecr/content/models/order_receipt.js' );

    // include controllers  and register itself
    include( 'chrome://viviecr/content/reports/controllers/rpt_your_order_controller.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/browser_print.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/csv_export.js' );

    /**
     * Controller Startup
     */
    function startup() {

        $do( 'load', null, 'RptYourOrder' );
        
        var screenwidth = GeckoJS.Configure.read( 'vivipos.fec.mainscreen.width' ) || 800;
        var screenheight = GeckoJS.Configure.read( 'vivipos.fec.mainscreen.height' ) || 600;

        var $panel = $( '#field_picker_panel' );
        var $buttonPanel = $( '#fieldpickerscrollpanel' );
        var $box = $( '#field_picker_box' );

        var selectedItems, fields;

        $.installPanel( $panel[ 0 ], {
            css: {
                left: 0,
                top: 0,

                width: screenwidth,
                'max-width': screenwidth,

                height: screenheight,
                'max-height': screenheight
            },
            
            init: function( evt ) {
                $box.css( { width: screenwidth, height: screenheight } );
                var viewHelper = new GeckoJS.NSITreeViewArray();
                
                $buttonPanel[ 0 ].datasource = viewHelper;
                $buttonPanel[ 0 ].selectedItems = [];
            },

            load: function( evt ) {
                fields = evt.data.fields; // 0..n index
                selectedItems = evt.data.selectedItems; // 0..n index
                
                $buttonPanel[ 0 ].datasource = fields;
                $buttonPanel[ 0 ].selectedItems = selectedItems;
                $buttonPanel[ 0 ].vivibuttonpanel.resizeButtons();
                //$buttonPanel[ 0 ].vivibuttonpanel.invalidate();
                $buttonPanel[ 0 ].scrollToRow( 0 );
            } 
        } );
    }

    window.addEventListener( 'load', startup, false );
} )();
