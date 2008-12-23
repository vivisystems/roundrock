/*
 * GREUtils - is simple and easy use APIs libraries for GRE (Gecko Runtime Environment).
 *
 * Copyright (c) 2007 Rack Lin (racklin@gmail.com)
 *
 * $Date: 2008-08-18 10:25:28 +0800 (星期一, 18 八月 2008) $
 * $Rev: 9 $
 */
// support firefox3 or xulrunner 1.9 's import
var EXPORTED_SYMBOLS  = ['VirtualKeyboard'];

var VirtualKeyboard = {

	kbService: null,

	invoke: function(op) {
            try {
		    if(!this.kbService) {
		        this.kbService = Components.classes["@firich.com.tw/mb-invoker;1"].getService(Components.interfaces.mozIFECMbInvoker);
		    }

		    switch(op) {
			case 1:
				this.kbService.show();
				break;
			case 2:
				this.kbService.hide();
				break;
			case 3:
				this.kbService.toggle();
				break;
		
		    }
	    }catch(e) {
            }
	},

	show: function() {
		this.invoke(1);
	},

	hide: function() {
		this.invoke(2);
	},

	toggle: function() {
		this.invoke(3);
	}

};

