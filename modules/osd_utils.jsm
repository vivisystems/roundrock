/*
 * GREUtils - is simple and easy use APIs libraries for GRE (Gecko Runtime Environment).
 *
 * Copyright (c) 2007 Rack Lin (racklin@gmail.com)
 *
 * $Date: 2008-08-18 10:25:28 +0800 (星期一, 18 八月 2008) $
 * $Rev: 9 $
 */
// support firefox3 or xulrunner 1.9 's import
var EXPORTED_SYMBOLS  = ['OsdUtils'];

var OsdUtils = {

	worker: null,
	osdService: null,

	text: function(markup, x, y, fade, display, composite) {

	    x = (typeof x != 'undefined') ? x : 100;
            y = (typeof y != 'undefined') ? y : -200;
            fade = (typeof fade != 'undefined') ? fade : 200;
            display = (typeof display != 'undefined') ? display : 1500;
	    composite = (typeof composite != 'undefined') ? composite : 2;

	    var osdService = this.osdService;

	    var runnable = {
		    run: function() {
		        try {
    			    osdService.osdText (markup,x, y, fade,display,composite);
                }catch(e) {
                }
		    },

		    QueryInterface: function(iid) {
                if (iid.equals(Components.Interfaces.nsIRunnable) || iid.equals(Components.Interfaces.nsISupports)) {
                    return this;
                }
                throw Components.results.NS_ERROR_NO_INTERFACE;
		    }
		};

	   this.worker.dispatch(runnable, this.worker.DISPATCH_NORMAL);

	},


 	trace: function(markup, x, y, fade, display) {

	    var format = "<span font_desc='Sans 20' color='green'>%MSG%</span>" ;
	    var msg = format.replace('%MSG%', markup);

	    x = (typeof x != 'undefined') ? x : 100;
            y = (typeof y != 'undefined') ? y : -200;
            fade = (typeof fade != 'undefined') ? fade : 200;
            display = (typeof display != 'undefined') ? display : 1500;

	    this.text(msg, x, y, fade, display, 2);

	},

 	debug: function(markup, x, y, fade, display) {

	    var format = "<span font_desc='Sans 20' color='green'><b>%MSG%</b></span>" ;
	    var msg = format.replace('%MSG%', markup);

	    x = (typeof x != 'undefined') ? x : 100;
            y = (typeof y != 'undefined') ? y : -200;
            fade = (typeof fade != 'undefined') ? fade : 200;
            display = (typeof display != 'undefined') ? display : 1500;

	    this.text(msg, x, y, fade, display, 2);

	},

 	info: function(markup, x, y, fade, display) {

	    var format = "<span font_desc='Sans 20' color='blue'>%MSG%</span>" ;
	    var msg = format.replace('%MSG%', markup);

	    x = (typeof x != 'undefined') ? x : 100;
            y = (typeof y != 'undefined') ? y : -200;
            fade = (typeof fade != 'undefined') ? fade : 200;
            display = (typeof display != 'undefined') ? display : 1500;

	    this.text(msg, x, y, fade, display, 2);

	},

 	warn: function(markup, x, y, fade, display) {

	    var format = "<span font_desc='Sans 20' color='blue'><b>%MSG%</b></span>" ;
	    var msg = format.replace('%MSG%', markup);

	    x = (typeof x != 'undefined') ? x : 100;
            y = (typeof y != 'undefined') ? y : -200;
            fade = (typeof fade != 'undefined') ? fade : 200;
            display = (typeof display != 'undefined') ? display : 1500;

	    this.text(msg, x, y, fade, display, 2);

	},

 	error: function(markup, x, y, fade, display) {

	    var format = "<span font_desc='Sans 22' color='red'><b>%MSG%</b></span>" ;
	    var msg = format.replace('%MSG%', markup);

	    x = (typeof x != 'undefined') ? x : 100;
            y = (typeof y != 'undefined') ? y : -200;
            fade = (typeof fade != 'undefined') ? fade : 200;
            display = (typeof display != 'undefined') ? display : 2000;

	    this.text(msg, x, y, fade, display, 2);

	},

 	fatal: function(markup, x, y, fade, display) {

	    var format = "<span font_desc='Sans 22' color='red'><b><i>%MSG%</i></b></span>" ;
	    var msg = format.replace('%MSG%', markup);

	    x = (typeof x != 'undefined') ? x : 100;
            y = (typeof y != 'undefined') ? y : -200;
            fade = (typeof fade != 'undefined') ? fade : 200;
            display = (typeof display != 'undefined') ? display : 2000;

	    this.text(msg, x, y, fade, display, 2);

	}

};

// create worker thread
if(!OsdUtils.worker) {
        OsdUtils.worker = Components.classes["@mozilla.org/thread-manager;1"].getService(Components.interfaces.nsIThreadManager).newThread(0);
}

if(!OsdUtils.osdService) {
        OsdUtils.osdService = Components.classes["@firich.com.tw/aosd;1"].getService(Components.interfaces.mozIFECAosd);
}
