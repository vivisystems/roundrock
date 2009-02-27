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

        css: {
            padding:        0,
            margin:         0,
            width:          '640px',
            height:          '480px'
        //top:            '5%',
        //left:           '5%'
        //color:          '#000'
        //backgroundColor:'#fff'
        },

        // styles for the overlay
        overlayCSS:  {
        //backgroundColor: '#000',
        //'-moz-opacity': 0.6,
        //width: '100%',
        //height: '100%'
        },

        init: function(evt) {
        //alert('init ' + evt.data);
        },

        showing: function(evt) {

        },

        load: function(evt) {
        //alert('load ' + evt.data);
        },

        shown: function(evt) {

        },

        hide: function(evt) {
        //alert('hide ' + evt.data);
        },
      
        // time in millis to wait before auto-hide; set to 0 to disable auto-hide
        timeout: 0  
    };

    function install(el, opts) {

        opts = $.extend({}, $.popupPanel.defaults, opts || {});
        opts.overlayCSS = $.extend({}, $.popupPanel.defaults.overlayCSS, opts.overlayCSS || {});

        if(typeof el == 'string') {
            el = document.getElementById(el);
            if(!el) return ;
        }
        var panelTag = el.tagName.toLowerCase();
	
        var $el = $(el);

        var data = $el.data('popupPanel.data');

        var onPopupShowing, onPopupShown, onPopupHidden, onPopupShowingCB, onPopupShownCB, onPopupHiddenCB ;

        if(typeof data == 'undefined') {

            // initial vivipanel css
            if (panelTag == 'vivipanel') {
                try {
                    $(el.popupBox).css(opts.css);
                    $(el.popupOverlay).css(opts.overlayCSS);
                }catch(e) {
                }
            }

            // initial once
            // because popupPanel use lazy initialize pattern.

            onPopupShowingCB = new Deferred();
                
            onPopupShowing = function(evt) {

                var element = evt.target;
                var $element = $(element);

                var _data = $element.data('popupPanel.data');
                var _init = $element.data('popupPanel.init');
                var _opts = $element.data('popupPanel.opts');

                var loadFunction = _opts.load;
                var showingFunction = _opts.showing;

                evt.data = _data;

                // if already init , call load function at showing event
                if (typeof _init != 'undefined') {
                    if(loadFunction) loadFunction.apply(this, [evt] );
                }

                // fixed for non-topmost panel
                // @see https://bugzilla.mozilla.org/show_bug.cgi?id=433340#c100
                if (element.tagName.toLowerCase() == 'panel' && element.getAttribute('non-topmost')) {
                    element.removeAttribute('noautohide');
                }               

                if(showingFunction) showingFunction.apply(this, [evt]);

                return onPopupShowingCB.call(evt);

            };


            onPopupShownCB = new Deferred();

            onPopupShown = function(evt) {

                var element = evt.target;
                var $element = $(element);

                var _data = $element.data('popupPanel.data');
                var _init = $element.data('popupPanel.init');
                var _opts = $element.data('popupPanel.opts');

                var loadFunction = _opts.load;
                var initFunction = _opts.init;
                var shownFunction = _opts.shown;

                evt.data = _data;

                if (typeof _init == 'undefined') {

                    if(initFunction) initFunction.apply(this, [evt] );

                    $element.data('popupPanel.init', {});

                    if(loadFunction) loadFunction.apply(this, [evt] );

                }else {
                    // maybe load function calling at showing event.
                    evt.target.focus();
                }

                if(shownFunction) shownFunction.apply(this, [evt]);

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


            el.addEventListener('popupshowing', onPopupShowing, true);
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

    }

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

        var x = getX(el, opts) ;
        var y = getY(el, opts) ;
        
        el.openPopupAtScreen(x, y, false);

        return onPopupHiddenCB;

    }

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

    }

    function getX(el, opts) {

        var left = opts.css.left || null;
        var x = 0;

        if(left) {
            if (left.indexOf('%') != -1) {
                x = window.innerWidth * parseInt(left) / 100;
            }else {
                x = parseInt(left);
            }
        }else {
            // center default
            x = parseInt((window.innerWidth - parseInt(opts.css.width)) /2);
        }

        return x;
    }

    function getY(el, opts) {

        var top = opts.css.top || null;
        var y = 0;

        if(top) {
            if (top.indexOf('%') != -1) {
                y = window.innerHeight * parseInt(top) / 100;
            }else {
                y = parseInt(top);
            }
        }else {
            // center default
            y = parseInt((window.innerHeight - parseInt(opts.css.height)) /2);
        }

        return y;

    }


})(jQuery);
