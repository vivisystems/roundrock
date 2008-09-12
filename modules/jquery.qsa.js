if ( typeof document.querySelectorAll === "function" ) (function(){
        var oldfind = jQuery.fn.find;

	if ( {}.__proto__ ) {
        	jQuery.fn.find = function(selector){
                	if ( this[0] === document ) {
                        	try {
                                	var results = document.querySelectorAll( selector );
                                	var length = results.length;
                                	results.constructor = jQuery;
                                	results.__proto__ = jQuery.prototype;
                                	results.length = length;
                                	return results;
                        	} catch(e){}
                	}
                	return oldfind.call( this, selector );
        	};
	} else {
        	jQuery.fn.find = function(selector){
                	if ( this[0] === document ) {
                        	try {
					this.length = 0;
					Array.prototype.push.apply( this, Array.prototype.slice.call(
						document.querySelectorAll( selector ) ) );
					return this;
                        	} catch(e){}
                	}
                	return oldfind.call( this, selector );
        	};
	}
})();
