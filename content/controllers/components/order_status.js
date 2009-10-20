(function() {

    var __component__ = {

        name: 'OrderStatus',

        statusToString: function (status) {
            var statusStr = status + '';

            switch(parseInt(status)) {
                case -3:
                    statusStr = _('(status)merged');
                    break;

                case -2:
                    statusStr = _('(status)voided');
                    break;

                case -1:
                    statusStr = _('(status)cancelled');
                    break;

                case 1:
                    statusStr = _('(status)completed');
                    break;

                case 2:
                    statusStr = _('(status)stored');
                    break;
            }
            return statusStr;
        }
    }

    var OrderStatusComponent = window.OrderStatusComponent = GeckoJS.Component.extend(__component__);

})();
