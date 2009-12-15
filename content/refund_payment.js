(function(){
    var inputObj = window.arguments[0];
    
    /**
     * Controller Startup
     */
    function startup() {

        var topwin = GREUtils.XPCOM.getUsefulService("window-mediator").getMostRecentWindow(null);

        $do('load', inputObj, 'RefundPayment');
        var rcp = GeckoJS.Controller.getInstanceByName( 'RefundPayment' );
        
        doSetOKCancel(

            function(){
                $do('save', inputObj, 'RefundPayment');

                var proceed = false;
                
                if (inputObj.paidTotal == inputObj.refundTotal) {
                    proceed = GREUtils.Dialog.confirm(topwin,
                                                      _('Void Sale'),
                                                      _('Are you sure you want to void transaction [%S] (payment [%S], refund [%S])?',
                                                        [inputObj.sequence, rcp.formatPrice(inputObj.paidTotal, true), rcp.formatPrice(inputObj.refundTotal, true)]));
                }
                else {
                    proceed = GREUtils.Dialog.confirm(topwin,
                                                      _('Void Sale'),
                                                      _('Refund payment amount [%S] is different from payment amount [%S]. Are you sure you want to void transaction [%S] now?',
                                                        [rcp.formatPrice(inputObj.refundTotal, true), rcp.formatPrice(inputObj.paidTotal, true), inputObj.sequence]));
                }
                if (proceed) {
                    inputObj.ok = true;
                    return true;
                }
                else {
                    return false;
                }
            },

            function(){
                inputObj.ok = false;
                return true;
            }
        );
    };

    window.addEventListener('load', startup, false);

})();
