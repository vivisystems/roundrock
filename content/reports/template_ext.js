/**
 * TrimPath Template Extensions.
 * 
 * author: racklin@gmail.com
 */
if (typeof(TrimPath) != 'undefined') {

// Using a closure
(function($T) {

    // default modifier
    $T.parseTemplate_etc.modifierDef['default'] = function(s, d) { 
        return (s != null && typeof s != 'undefined' ) ? s : d; 
    } ;

    // round modifier
    $T.parseTemplate_etc.modifierDef['round'] = function (value, precision, policy) {
	precision = typeof precision != 'undefined' ? precision : 0;
	policy = policy || 'to-nearest-precision';

	    if (isNaN(value) || isNaN(precision)) return value;
	    
	    var p = Math.round(precision);
	    var result = value * Math.pow(10, p);
	    
	    switch(policy) {
		
		case 'to-nearest-precision':
		    result = Math.round(result.toFixed(1));
		    break;
		    
		case 'to-nearest-half':
		    result = Math.round(result * 2) / 2;
		    break;
		    
		case 'to-nearest-quarter':
		    result = Math.round(result * 4) / 4;
		    break;
		    
		case 'to-nearest-nickel':
		    result = Math.round(result * 10) / 10;
		    break;
		    
		case 'to-nearest-dime':
		    result = Math.round(result * 20) / 20;
		    break;
		    
		case 'always-round-up':
		    result = Math.round(result + 0.5);
		    break;
		    
		case 'always-round-down':
		    result = Math.floor(result);
		    break;            
	    }
	    var result2 = (result * Math.pow(10, -p));
	    return (precision>=0) ? parseFloat(result2.toFixed(precision)) : result2;
    };

    // format modifier
    $T.parseTemplate_etc.modifierDef['format'] = function ( number, decimals, dec_point, thousands_sep ) {

	    var n = number, c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
	    var d = dec_point == undefined ? "." : dec_point;
	    var t = thousands_sep == undefined ? "," : thousands_sep, s = n < 0 ? "-" : "";
	    var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
	    
	    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };


    $T.parseTemplate_etc.modifierDef['trim'] = function(str){
	    // include it in the regexp to enforce consistent cross-browser behavior.
	    return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    };


	$T.parseTemplate_etc.modifierDef['trimLeft'] = function(str){
	    // include it in the regexp to enforce consistent cross-browser behavior.
	    return str.replace(/^[\s\xa0]+/, '');
	};

$T.parseTemplate_etc.modifierDef['trimRight'] = function(str){
    // include it in the regexp to enforce consistent cross-browser behavior.
    return str.replace(/[\s\xa0]+$/, '');
};

$T.parseTemplate_etc.modifierDef['padLeft'] = function(num, totalChars, padWith) {
    num = num + "";
    totalChars = totalChars <num.length ? num.length : totalChars;
    
    padWith = (padWith) ? padWith : "0";
    if (num.length < totalChars) {
        while (num.length < totalChars) {
            num = padWith + num;
        }
    } else {}
     
    if (num.length > totalChars) { //if padWith was a multiple character string and num was overpadded
        num = num.substring((num.length - totalChars), totalChars);
    } else {}
    
    return num;
};


$T.parseTemplate_etc.modifierDef['padRight'] = function(num, totalChars, padWith) {
    num = num + "";
    totalChars = totalChars <num.length ? num.length : totalChars;
    
    padWith = (padWith) ? padWith : "0";
    if (num.length < totalChars) {
        while (num.length < totalChars) {
            num = num + padWith;
        }
    } else {}
     
    if (num.length > totalChars) { //if padWith was a multiple character string and num was overpadded
        num = num.substring(0, totalChars);
    } else {}
    
    return num;
};


    // unixTimeToLocale modifier
    $T.parseTemplate_etc.modifierDef['unixTimeToString'] = function ( time, type ) {
        type = type || 'datetime';
        var t = time.toFixed(0).length > 10 ? time : time * 1000;
        var d = new Date(t);

        var s = "";

        switch(type) {
            default:
            case 'datetime':
                s = d.toString();
                break;
            case 'date':
                s = d.toDateString();
                break;
            case 'time':
                s = d.toTimeString();
                break;
        }
        return s;

    };


    // unixTimeToLocale modifier
    $T.parseTemplate_etc.modifierDef['unixTimeToLocale'] = function ( time, type ) {
        type = type || 'datetime';
        var t = time.toFixed(0).length > 10 ? time : time * 1000;
        var d = new Date(t);

        var s = "";

        switch(type) {
            default:
            case 'datetime':
                s = d.toLocaleString();
                break;
            case 'date':
                s = d.toLocaleDateString();
                break;
            case 'time':
                s = d.toLocaleTimeString();
                break;
        }
        return s;

    };

          
}) (TrimPath);
// end closure

}

