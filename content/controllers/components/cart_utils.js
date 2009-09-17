(function() {


    var __component__ = {

        name: 'CartUtils',
        
        _weightConversionTable: {
            kg : {kg: 1,         g: 1000,    mg: 1000000, oz: 35.2739,      lb: 2.20462,       ct: 5000},
            g  : {kg: 0.001,     g: 1,       mg: 1000,    oz: 0.0352739,    lb: 0.00220462,    ct: 5},
            mg : {kg: 0.000001,  g: 0.001,   mg: 1,       oz: 0.0000352739, lb: 0.00000220462, ct: 0.005},
            oz : {kg: 0.0283495, g: 28.3495, mg: 28349.5, oz: 1,            lb: 0.062499,      ct: 141.747},
            lb : {kg: 0.453592,  g: 453.592, mg: 453592,  oz: 16,           lb: 1,             ct: 2267.961},
            ct : {kg: 0.0002,    g: 0.2,     mg: 200,     oz: 0.007054,     lb: 0.000440875,   ct: 1}
        },

        convertWeight: function(w, sourceUnit, targetUnit, multiplier, precision) {
            precision = parseInt(precision);
            if (isNaN(precision) || precision < 0) precision = 2;

            var converted = false;
            if (sourceUnit != null && sourceUnit != '' && sourceUnit != 'unit' ||
                targetUnit != null && targetUnit != '' && targetUnit != 'unit') {

                var src = sourceUnit.toLowerCase();
                var tgt = targetUnit.toLowerCase();
                var cList = this._weightConversionTable[src];

                if (cList) {
                    var factor = parseFloat(cList[tgt]);
                    if (factor != null && !isNaN(factor)) {
                        w *= factor;
                        converted = true;
                    }
                }
            }

            if (!converted && multiplier > 0)
                w *= multiplier;

            return parseFloat(w.toFixed(precision));
        },


        dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', 'Database error: ' + errstr + ' [' +  errno + ']');
            GREUtils.Dialog.alert(this.controller.topmostWindow,
                _('Data Operation Error'),
                errmsg + '\n\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        },

        blockUI: function(panel, caption, title, sleepTime) {

            sleepTime = typeof sleepTime =='undefined' ?  0 : sleepTime;
            var waitPanel = document.getElementById(panel);
            var waitCaption = document.getElementById(caption);

            if (waitCaption) waitCaption.setAttribute("label", title);

            waitPanel.openPopupAtScreen(0, 0);

            if (sleepTime > 0) this.sleep(sleepTime);
            return waitPanel;

        },

        unblockUI: function(panel) {

            var waitPanel = document.getElementById(panel);

            waitPanel.hidePopup();

            return waitPanel;

        }

    };

    var CartUtilsComponent = window.CartUtilsComponent = GeckoJS.Component.extend(__component__);

})();
