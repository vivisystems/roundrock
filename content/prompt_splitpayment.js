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

        var arPayments = [];
        var vivitexts = document.getElementsByTagName('vivitextbox');
        var total = inputObj.total;
        var remain = total ;

        for (var i=0; i < vivitexts.length; i++) {
            let v = vivitexts[i];
            var val = parseFloat(v.value);
            if (val < 0) {
                val = 0 ;
            }else if (val > remain){
                val = remain;
            }
            v.value = val;
            remain -= val;

        }

        if (remain > 0) {
           // add to last once
           vivitexts[vivitexts.length-1].value = parseFloat(vivitexts[vivitexts.length-1].value) + remain;
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
		let textbox = document.createElement('vivitextbox');

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
		}

		num++;
	}, this);
    }

    
    window.addEventListener('load', startup, false);

    // make inputObj globally available
    options = inputObj;
})();

