/*
 * jQuery blockUI plugin
 * Version 2.14 (18-JAN-2009)
 * @requires jQuery v1.2.3 or later
 *
 * Examples at: http://malsup.com/jquery/block/
 * Copyright (c) 2007-2008 M. Alsup
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * 
 * Thanks to Amir-Hossein Sobhi for some excellent contributions!
 *
 * Support XUL platform by racklin@gmail.com
 * - REMOVE ie6 / ie7 support
 * - REMOVE growlUI
 */

(function($) {

if (/1\.(0|1|2)\.(0|1|2)/.test($.fn.jquery) || /^1.1/.test($.fn.jquery)) {
    alert('blockUI requires jQuery v1.2.3 or later!  You are using v' + $.fn.jquery);
    return;
}

// global $ methods for blocking/unblocking the entire page
$.blockUI   = function(opts) { install(window, opts); };
$.unblockUI = function(opts) { remove(window, opts); };

// plugin method for blocking element content
$.fn.block = function(opts) {
    return this.each(function() {
        if ($.css(this,'position') == 'static')
            this.style.position = 'relative';
        install(this, opts);
    });
};

// plugin method for unblocking element content
$.fn.unblock = function(opts) {
    return this.each(function() {
        remove(this, opts);
    });
};

$.blockUI.version = '2.14.1'; // 2nd generation blocking at no extra cost!

// override these in your code to change the default behavior and style
$.blockUI.defaults = {
    // message displayed when blocking (use null for no message)
    message:  '<h1>Please wait...</h1>',
    
    // styles for the message when blocking; if you wish to disable
    // these and use an external stylesheet then do this in your code:
    // $.blockUI.defaults.css = {};
    css: { 
        padding:        0,
        margin:         0,
        width:          '30%', 
        top:            '40%', 
        left:           '35%', 
        textAlign:      'center', 
        color:          '#000', 
        border:         '3px solid #aaa',
        backgroundColor:'#fff',
        cursor:         'wait'
    },
    
    // styles for the overlay
    overlayCSS:  { 
        backgroundColor: '#000', 
        '-moz-opacity': '0.6'
    },

	// styles applied when using $.growlUI
	growlCSS: { 
		width:    '350px',
		top:      '10px', 
		left:     '', 
		right:    '10px', 
	    border:   'none',
	    padding:  '5px',
	    opacity:  '0.6',
		cursor:    null,
	    color:    '#fff',
	    backgroundColor: '#000',
	    '-webkit-border-radius': '10px',
	    '-moz-border-radius':    '10px'
	},
    
    // z-index for the blocking overlay
    baseZ: 1000,
    
    // set these to true to have the message automatically centered
    centerX: true, // <-- only effects element blocking (page block controlled via css above)
    centerY: true,
    
    // allow body element to be stetched in ie6; this makes blocking look better
    // on "short" pages.  disable if you wish to prevent changes to the body height
    allowBodyStretch: true,
    
    // be default blockUI will supress tab navigation from leaving blocking content;
    constrainTabKey: true,
    
    // fadeIn time in millis; set to 0 to disable fadeIn on block
    fadeIn:  0, //200,

    // fadeOut time in millis; set to 0 to disable fadeOut on unblock
    fadeOut:  0, // 400,
    
	// time in millis to wait before auto-unblocking; set to 0 to disable auto-unblock
	timeout: 0,

	// disable if you don't want to show the overlay
	showOverlay: true,

    // if true, focus will be placed in the first available input field when
    // page blocking
    focusInput: true,
    
    // suppresses the use of overlay styles on FF/Linux (due to performance issues with opacity)
    applyPlatformOpacityRules: true,
    
    // callback method invoked when unblocking has completed; the callback is
    // passed the element that has been unblocked (which is the window object for page
    // blocks) and the options that were passed to the unblock call:
    //     onUnblock(element, options)
    onUnblock: null
    
};

// private data and functions follow...

var pageBlock = null;
var pageBlockEls = [];

function install(el, opts) {
    var full = (el == window);
    var msg = opts && opts.message !== undefined ? opts.message : undefined;
    opts = $.extend({}, $.blockUI.defaults, opts || {});
    opts.overlayCSS = $.extend({}, $.blockUI.defaults.overlayCSS, opts.overlayCSS || {});
    var css = $.extend({}, $.blockUI.defaults.css, opts.css || {});
    msg = msg === undefined ? opts.message : msg;

    // remove the current block (if there is one)
    if (full && pageBlock) 
        remove(window, {fadeOut:0}); 
    
    // if an existing element is being used as the blocking content then we capture
    // its current place in the DOM (and current display style) so we can restore
    // it when we unblock
    if (msg && typeof msg != 'string' && (msg.parentNode || msg.jquery)) {
        var node = msg.jquery ? msg[0] : msg;
        var data = {};
        $(el).data('blockUI.history', data);
        data.el = node;
        data.parent = node.parentNode;
        data.display = node.style.display;
        data.position = node.style.position;
		//if (data.parent)
		//	data.parent.removeChild(node);
    }else if(msg && typeof msg == 'string') {
        // convert to dom
        msg = domHTMLString(msg);
    }
    
    var z = opts.baseZ;
    
    // blockUI uses 3 layers for blocking, for simplicity they are all used on every platform;
    // layer1 is the iframe layer which is used to supress bleed through of underlying content
    // layer2 is the overlay layer which has opacity and a wait cursor
    // layer3 is the message content that is displayed while blocking
    
    var lyr1 = $(domHTMLString('<div class="blockUI" style="display:none"></div>'));
    var lyr2 = $(domHTMLString('<div class="blockUI blockOverlay" style="z-index:'+ z++ +';display:none;cursor:wait;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>'));
    var lyr3 = full ? $(domHTMLString('<div class="blockUI blockMsg blockPage" style="z-index:'+z+';display:none;position:fixed"></div>'))
                    : $(domHTMLString('<div class="blockUI blockMsg blockElement" style="z-index:'+z+';display:none;position:absolute"></div>'));

    // if we have a message, style it
    if (msg) 
        lyr3.css(css);

    // style the overlay
    if (!opts.applyPlatformOpacityRules || !($.browser.mozilla && /Linux/.test(navigator.platform))) 
        lyr2.css(opts.overlayCSS);

    lyr2.css('position', full ? 'fixed' : 'absolute');
    
    // make iframe layer transparent in IE
//    if ($.browser.msie)
//        lyr1.css('opacity','0.0');

    // check for html or xul
    var fullRootTag = $('window').length > 0 ? 'window' : 'body' ;
    $([lyr1[0],lyr2[0],lyr3[0]]).appendTo(full ? fullRootTag : el); 
    
    // show the message
    //lyr3.append(msg);//.show();
    //alert(lyr3[0] +',,,' + msg);
    lyr3[0].appendChild(msg[0] || msg);
    if (msg && (msg.jquery || msg.nodeType))
        $(msg).show();

	if (opts.fadeIn) {
//		if ($.browser.msie && opts.showOverlay)
//			lyr1.fadeIn(opts.fadeIn);
		if (opts.showOverlay)
			lyr2.fadeIn(opts.fadeIn);
		lyr3.fadeIn(opts.fadeIn);
	}
	else {
//		if ($.browser.msie && opts.showOverlay)
//			lyr1.show();
		if (opts.showOverlay)
			lyr2.show();
		lyr3.show();
	}

    // bind key and mouse events
    bind(1, el, opts);
        
    if (full) {
        pageBlock = lyr3[0];
        pageBlockEls = $(':input:enabled:visible',pageBlock);
        if (opts.focusInput)
            setTimeout(focus, 20);
    }
    else
        center(lyr3[0], opts.centerX, opts.centerY);

	if (opts.timeout) {
		// auto-unblock
		setTimeout(function() {
			full ? $.unblockUI(opts) : $(el).unblock(opts);
		}, opts.timeout);
	}
};

// remove the block
function remove(el, opts) {
    var full = el == window;
    var data = $(el).data('blockUI.history');
    opts = $.extend({}, $.blockUI.defaults, opts || {});
    bind(0, el, opts); // unbind events
//    var els = full ? $('body').children().filter('.blockUI') : $('.blockUI', el);
    var els = full ? $('window').children().filter('.blockUI') : $('.blockUI', el);
    
    if (full) 
        pageBlock = pageBlockEls = null;

    if (opts.fadeOut) {
        els.fadeOut(opts.fadeOut);
        setTimeout(function() { reset(els,data,opts,el); }, opts.fadeOut);
    }
    else
        reset(els, data, opts, el);
};

// move blocking element back into the DOM where it started
function reset(els,data,opts,el) {
    els.each(function(i,o) {
        // remove via DOM calls so we don't lose event handlers
        if (this.parentNode) 
            this.parentNode.removeChild(this);
    });

    if (data && data.el) {
        data.el.style.display = data.display;
        data.el.style.position = data.position;
		if (data.parent)
			data.parent.appendChild(data.el);
        $(data.el).removeData('blockUI.history');
    }

    if (typeof opts.onUnblock == 'function')
        opts.onUnblock(el,opts);
};

// bind/unbind the handler
function bind(b, el, opts) {
    var full = el == window, $el = $(el);
    
    // don't bother unbinding if there is nothing to unbind
    if (!b && (full && !pageBlock || !full && !$el.data('blockUI.isBlocked'))) 
        return;
    if (!full) 
        $el.data('blockUI.isBlocked', b);

    if (b && !opts.showOverlay) // don't prevent events when overlay not in use
		return;

    // bind anchors and inputs for mouse and key events
    var events = 'mousedown mouseup keydown keypress';
    b ? $(document).bind(events, opts, handler) : $(document).unbind(events, handler);

// former impl...
//    var $e = $('a,:input');
//    b ? $e.bind(events, opts, handler) : $e.unbind(events, handler);
};

// event handler to suppress keyboard/mouse events when blocking
function handler(e) {
    // allow tab navigation (conditionally)
    if (e.keyCode && e.keyCode == 9) {
        if (pageBlock && e.data.constrainTabKey) {
            var els = pageBlockEls;
            var fwd = !e.shiftKey && e.target == els[els.length-1];
            var back = e.shiftKey && e.target == els[0];
            if (fwd || back) {
                setTimeout(function(){focus(back)},10);
                return false;
            }
        }
    }
    // allow events within the message content
    if ($(e.target).parents('div.blockMsg').length > 0)
        return true;
        
    // allow events for content that is not being blocked
    return $(e.target).parents().children().filter('div.blockUI').length == 0;
};

function focus(back) {
    if (!pageBlockEls) 
        return;
    var e = pageBlockEls[back===true ? pageBlockEls.length-1 : 0];
    if (e) 
        e.focus();
};

function center(el, x, y) {
    var p = el.parentNode, s = el.style;
    var l = ((p.offsetWidth - el.offsetWidth)/2) - sz(p,'borderLeftWidth');
    var t = ((p.offsetHeight - el.offsetHeight)/2) - sz(p,'borderTopWidth');
    if (x) s.left = l > 0 ? (l+'px') : '0';
    if (y) s.top  = t > 0 ? (t+'px') : '0';
};

function sz(el, p) { 
    return parseInt($.css(el,p))||0; 
};

function domHTMLString (htmlString, xmlns) {

    var xmlns = xmlns || "http://www.w3.org/1999/xhtml";

    // try with div container and namespace for easy use.
    var htmlString2 = '<div xmlns="'+xmlns+'">'+htmlString+'</div>';

    var parser=new DOMParser();
    var resultDoc=parser.parseFromString(htmlString2,"text/xml");

    if (resultDoc.documentElement.tagName == "parsererror") {
		return null;
	} else {
		if (resultDoc.documentElement.childNodes.length == 1)
			return resultDoc.documentElement.firstChild;
		else
			return resultDoc.documentElement;
	}

};

function domXULString (xulString, xmlns) {

    var xmlns = xmlns || "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    // try with box container and namespace for easy use.
    var xulString2 = '<box xmlns="'+xmlns+'">'+xulString+'</box>';

    var parser=new DOMParser();
    var resultDoc=parser.parseFromString(xulString2,"text/xml");

    if (resultDoc.documentElement.tagName == "parsererror") {
        return null;
    } else {
        if (resultDoc.documentElement.childNodes.length == 1) {
            return resultDoc.documentElement.firstChild;
        }
        else {
            return resultDoc.documentElement;
        }
    }
};


})(jQuery);

