(function(){
    var inputObj = window.arguments[0];
    
    /**
     * Controller Startup
     */
    function startup() {

        $do('load', inputObj, 'RefundPayment');
        
        doSetOKCancel(

            function(){
                $do('save', inputObj, 'RefundPayment');

                if (GREUtils.Dialog.confirm(window,
                                            _('Void Sale'),
                                            _('Are you sure you want to void transaction [%S] (payment [%S], refund [%S])?',
                                              [inputObj.sequence, inputObj.paidTotal, inputObj.refundTotal]))) {
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
