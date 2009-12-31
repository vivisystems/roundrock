var options;

(function(){
    var caption0 = window.arguments[0];
    var inputObj = window.arguments[1];
    
    /**
     * Controller Startup
     */
    function startup() {

        document.getElementById('dialog-caption').setAttribute("label", caption0);


	addPaymentElements(inputObj.input);

        document.getElementById('cancel').setAttribute('disabled', ('disablecancelbtn' in inputObj));

        doSetOKCancel(
            function(){
		recalc();
                inputObj.ok = true;
                return true;
            },
            function(){
                inputObj.ok = false;
                return true;
            }
        );

//        validateInput();

        var textNodes = document.getElementsByTagName('textbox') || document.getElementsByTagName('vivitextbox');
        if (textNodes != null && textNodes.length > 0) {
            for (var i = 0; i < textNodes.length; i++)
                textNodes[i].addEventListener('focus', gotFocus, false);
        }
        
        recalc();
        
        document.getElementById('input0').focus();
    }

    function gotFocus() {
        var focusedElement = document.commandDispatcher.focusedElement;
        if (focusedElement.tagName == 'html:input' || focusedElement.tagName == 'textbox') {
            focusedElement.select();
        }
        return true;
    }

    window.recalc = function recalc() {

      var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
      var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;
      var decimals = GeckoJS.Configure.read('vivipos.fec.settings.DecimalPoint') || '.';
      var thousands = GeckoJS.Configure.read('vivipos.fec.settings.ThousandsDelimiter') || ',';


      var getRoundedPrice = function(price) {
            var roundedPrice = GeckoJS.NumberHelper.round(Math.abs(price), precision_prices, rounding_prices) || 0;
            if (price < 0) roundedPrice = 0 - roundedPrice;
            return roundedPrice;
        };

      var formatPrice= function(price) {
            var options = {
                decimals: decimals,
                thousands: thousands,
                places: ((precision_prices>0)?precision_prices:0)
            };
            // format display precision
            return GeckoJS.NumberHelper.format(price, options);
        };

        var viviParseFloat = function(str, thousands, decimals) {
            var arStr = str.split(decimals);
            // replace number part
            arStr[0] = arStr[0].replace(thousands, "", "g");
            return parseFloat(arStr.join("."));
        };

        var arPayments = [];
        var vivitexts = document.getElementsByTagName('textbox');
        var total = parseFloat(inputObj.total);
        var remain = total ;

        for (var i=0; i < vivitexts.length; i++) {

            let v = vivitexts[i];

            var val = getRoundedPrice(parseFloat(v.value));
            if (val < 0) {
                val = 0 ;
            }else if (val > remain){
                val = remain;
            }
            v.value = val;
            remain -= parseFloat(val);

        }

        if (remain > 0) {
           // add to last once
           vivitexts[vivitexts.length-1].value = parseFloat(parseFloat(vivitexts[vivitexts.length-1].value) + remain);
        }

        for (var j=0; j < vivitexts.length; j++) {
            let v = vivitexts[j];
            arPayments.push(parseFloat(v.value));
        }

        inputObj.input = arPayments ;

    }


    function addPaymentElements(arPayments) {
	var mainRows = document.getElementById('main-rows');

	var paymentCount = arPayments.length;
	var num = 1;

	arPayments.forEach(function(payment) {
		let row = document.createElement('row');
		let hbox = document.createElement('hbox');
		let label = document.createElement('label');
		let textbox = document.createElement('textbox');

		hbox.appendChild(label);
		hbox.appendChild(textbox);

		row.appendChild(hbox);

		mainRows.appendChild(row);


		// set textbox
		textbox.value = payment;
		textbox.setAttribute('popupKeypad', true);
		textbox.setAttribute('keypad', "numpad");
		textbox.setAttribute('numpadClass',"numpad");
		textbox.setAttribute('fixedbtnClass', "button-fixed");

		if (num == paymentCount) {
			// set label
			label.value = num + "*: " ;
			textbox.setAttribute('disabled', true);
		}else {
			label.value = num + ": " ;
			textbox.addEventListener('change', recalc, true);
//			textbox.addEventListener('input', recalc, true);
		}

		num++;
	}, this);
    }

    
    window.addEventListener('load', startup, false);

    // make inputObj globally available
    options = inputObj;
})();

function clearFocusedElement(target) {
    var focused;
    if (target) {
        focused = document.getElementById(target);
    }
    if (!focused) focused = document.commandDispatcher.focusedElement;
    if (focused.tagName == 'html:input' || focused.tagName == 'textbox') focused.value = '';
}
