(function(){

    var __controller__ = {

        name: 'App',

        getTopmostWindow: function() {

            // get primaryScreen
            var screenMan = Components.classes["@mozilla.org/gfx/screenmanager;1"].getService(Components.interfaces.nsIScreenManager);
            var left = {}, top = {}, width = {}, height = {};
            screenMan.primaryScreen.GetRect(left, top, width, height);

            // skip windowtype = alert:alert
            var win = GREUtils.XPCOM.getUsefulService("window-mediator").getMostRecentWindow(null);
            var doc = win.document;
            var winElement = doc.getElementsByTagName('window');
            var windowtype = '';

            if (winElement[0]) {
                windowtype = winElement[0].getAttribute('windowtype');
                if (windowtype != 'alert:alert') {
                    if ( (win.screenX >= left.value && win.screenX < (left.value+width.value) )) {
                        return win;
                    }
                }
            }

            // enumerator all windows from the oldest window to the youngest
            var enumerator = GREUtils.XPCOM.getUsefulService("window-mediator").getEnumerator(null);
            var winTmp = null;
            while(enumerator.hasMoreElements()) {

                winTmp = enumerator.getNext();
                doc = winTmp.document;
                winElement = doc.getElementsByTagName('window');

                if (winElement[0]) {
                    windowtype = winElement[0].getAttribute('windowtype');
                    if (windowtype != 'alert:alert') {
                        if ( (winTmp.screenX >= left.value && winTmp.screenX < (left.value+width.value) )) {
                            win = winTmp;
                        }
                    }
                }
            }

            return win || null;

        }

    };


//__controller__.__defineGetter__('topmostWindow', __controller__.getTopmostWindow);

    var AppController = window.AppController =  GeckoJS.Controller.extend(__controller__);

    // return primary screen topmost window
    AppController.prototype.__defineGetter__('topmostWindow', __controller__.getTopmostWindow);


})();
