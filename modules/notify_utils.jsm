/*
 * GREUtils - is simple and easy use APIs libraries for GRE (Gecko Runtime Environment).
 *
 * Copyright (c) 2007 Rack Lin (racklin@gmail.com)
 *
 * $Date: 2008-08-18 10:25:28 +0800 (星期一, 18 八月 2008) $
 * $Rev: 9 $
 */
// support firefox3 or xulrunner 1.9 's import
var EXPORTED_SYMBOLS  = ['NotifyUtils'];

var NotifyUtils = {

	worker: null,
	nofityService: null,

	notify: function(summary, body, icon, total_display_ms, urgency) {

	    icon = icon || "";
            total_display_ms = total_display_ms || 5000;
	    //urgency = (typeof urgency != 'undefined') ? urgency : 1;

	    var runnable = {
		    run: function() {
		        try {
                    if(NotifyUtils.nofityService) NotifyUtils.nofityService.doCall(["vivipos", 0, icon, summary, body, [], {}, total_display_ms],8);
                    // use shell
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

 	trace: function(summary, body, icon) {

	    icon = icon || "";
	    this.notify(summary, body, icon, null, 1);

	},

 	debug: function(summary, body, icon) {

	    icon = icon || "";
	    this.notify(summary, body, icon, null, 1);

	},

 	info: function(summary, body, icon) {

	    icon = icon || "dialog-information";
	    this.notify(summary, body, icon, null, 1);

	},

 	warn: function(summary, body, icon) {

	    icon = icon || "dialog-warning";
	    this.notify(summary, body, icon, null, 1);

	},

 	error: function(summary, body, icon) {

	    icon = icon || "dialog-error";
	    this.notify(summary, body, icon, null, 1);

	},


 	fatal: function(summary, body, icon) {

	    icon = icon || "dialog-error";
	    this.notify(summary, body, icon, null, 1);
	}

};

// create
try {
    if(!NotifyUtils.worker) {
        NotifyUtils.worker = Components.classes["@mozilla.org/thread-manager;1"].getService(Components.interfaces.nsIThreadManager).newThread(0);
    }

    if(!NotifyUtils.nofityService) {
        var dbus = Components.classes["@movial.fi/dbus/service;1"].getService().QueryInterface(Components.interfaces.IDBusService);
        NotifyUtils.nofityService = dbus.getMethod(dbus.SESSION, 'org.freedesktop.Notifications', '/org/freedesktop/Notifications', 'Notify', 'org.freedesktop.Notifications', "susssasa{sv}i", null);
    }

}catch(e) {
}
