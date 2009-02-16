/*
 * jQuery XUL popup panel plugin
 * Version 1.01 (18-JAN-2009)
 * @requires jQuery v1.2.3 or later
 *
 * author: racklin@gmail.com
 *
 */

(function($) {

    if (/1\.(0|1|2)\.(0|1|2)/.test($.fn.jquery) || /^1.1/.test($.fn.jquery)) {
        alert('blockUI requires jQuery v1.2.3 or later!  You are using v' + $.fn.jquery);
        return;
    }

    // global $ methods for blocking/unblocking the entire page
    $.installPanel = function(el, opts) {
        return install(el, opts);
    };
    $.popupPanel = function(el, data) {
        return popup(el, data);
    };
    $.hidePanel = function(el, data) {
        return hide(el, data);
    };

    $.popupPanel.version = '1.01';

    // override these in your code to change the default behavior and style
    $.popupPanel.defaults = {

        // top for panel
        top: 0,
        
        left: 0,

        // styles for the panel
        panelCSS:  {
            backgroundColor: '#000',
            width: '100%',
            height: '100%'
        },

        init: function(evt) {
            //alert('init ' + evt.data);
        },

        load: function(evt) {
            //alert('load ' + evt.data);
        },

        hide: function(evt) {
            alert('hide ' + evt.data);
        },
      
        // time in millis to wait before auto-hide; set to 0 to disable auto-hide
        timeout: 0  
    };

    function install(el, opts) {

        opts = $.extend({}, $.popupPanel.defaults, opts || {});
        opts.panelCSS = $.extend({}, $.popupPanel.defaults.panelCSS, opts.panelCSS || {});

	if(typeof el == 'string') {
		el = document.getElementById(el);
		if(!el) return ;
	}
	
	var $el = $(el);

	var data = $el.data('popupPanel.data');

	var onPopupShown, onPopupHidden, onPopupShownCB, onPopupHiddenCB ;

        if(typeof data == 'undefined') {
            // initial once
            // because popupPanel use lazy initialize pattern.

		onPopupShownCB = new Deferred();

		onPopupShown = function(evt) {

			var element = evt.target;
			var $element = $(element);

			var _data = $element.data('popupPanel.data');
			var _init = $element.data('popupPanel.init');
			var _opts = $element.data('popupPanel.opts');


			var loadFunction = _opts.load;
			var initFunction = _opts.init;

			evt.data = _data;

			if (typeof _init == 'undefined') {

				if(initFunction) initFunction.apply(this, [evt] );

				$element.data('popupPanel.init', {});

			}

			if(loadFunction) loadFunction.apply(this, [evt] );

			return onPopupShownCB.call(evt);

		};

		onPopupHiddenCB = new Deferred();

		onPopupHidden = function(evt) {

			var element = evt.target;
			var $element = $(element);

			var _data = $element.data('popupPanel.data');
			var _opts = $element.data('popupPanel.opts');

			var hideFunction = _opts.hide;

			evt.data = _data;

			if(hideFunction) hideFunction.apply(this, [evt] );

			return onPopupHiddenCB.call(evt);
		};


            el.addEventListener('popupshown', onPopupShown, true);
            el.addEventListener('popuphidden', onPopupHidden, true);

	    $el.data('popupPanel.data', {});
	    $el.data('popupPanel.opts', opts);
            $el.data('popupPanel.popupshown', onPopupShownCB);
            $el.data('popupPanel.popuphidden', onPopupHiddenCB);
            	
	    return onPopupHiddenCB;

        }else {
	    onPopupHiddenCB = $el.data('popupPanel.popuphidden');
	}

	return onPopupHiddenCB;

    };

    function popup(el, data) {

	if(typeof el == 'string') {
		el = document.getElementById(el);
		if(!el) return ;
	}

	var $el = $(el);

	var opts = $el.data('popupPanel.opts');
        var onPopupShownCB = $el.data('popupPanel.popupshown');
	var onPopupHiddenCB = $el.data('popupPanel.popuphidden');

        $el.data('popupPanel.data', data);

        if (opts.timeout) {
            // auto-hide
            setTimeout(function() {
                $.hidePanel(el, data);
            }, opts.timeout);
        }

	var top = opts.top;
	var left = opts.left;

        el.openPopupAtScreen(top, left, false);

	return onPopupHiddenCB;

    };

    // hide the panel
    function hide(el, data) {

	if(typeof el == 'string') {
		el = document.getElementById(el);
		if(!el) return ;
	}

	var $el = $(el);

	var opts = $el.data('popupPanel.opts');
        var onPopupShownCB = $el.data('popupPanel.popupshown');
	var onPopupHiddenCB = $el.data('popupPanel.popuphidden');

	$el.data('popupPanel.data', data);

	el.hidePopup();

	return onPopupHiddenCB;

    };


})(jQuery);

