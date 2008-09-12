// import vivipos libraries

function goRestartApplication()
{
  if (!canQuitApplication())
    return false;

//  var appStartup = Components.classes['@mozilla.org/toolkit/app-startup;1'].
//                     getService(Components.interfaces.nsIAppStartup);
//  appStartup.quit(Components.interfaces.nsIAppStartup.eRestart | Components.interfaces.nsIAppStartup.eAttemptQuit);

  GREUtils.restartApplication();
  return true;
}


function toOpenWindowByType(inType, uri) {
  var winopts = "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar";
  window.open(uri, "_blank", winopts);
}

(function(){


var vivipos = {

    initialized: false,
    version: '0.1',
	
    _handleWindowClose: function(event){
        // handler for clicking on the 'x' to close the window
        return this.shutdownQuery();
    },
    
    
    startup: function(){
    
        if (this.initialized) 
            return;
        this.initialized = true;
        
        var self = this;
        
        // init the error watching
        consoleErrors.startup(this);
        this.hasErrors(false);
		
        // add window close handler
        window.addEventListener("close", function(event){
            self._handleWindowClose(event);
        }, false);
		
	    // hook up an observer and event 
	    // we delay this so the overlay can completely load it's source
//	    setTimeout(function() { self.events.dispatch('epos-startup', ''); }, 100);

    },
    
    shutdown: function(){
        consoleErrors.shutdown();
    },
    
    shutdownQuery: function() {
        return true;
    },
	
    hasErrors: function(errors){
      	var errorImg = document.getElementById("img_jsconsole");
      	if(!errorImg) {
      	    return;
      	}
      	if (errors) {
      		errorImg.setAttribute("mode", "error");
      	}
      	else {
      		errorImg.setAttribute("mode", "ok");
      	}
    }

};

// ------------------------------------------------------------------
// attach to window events so vivipos object can startup / shutdown
// ------------------------------------------------------------------
window.addEventListener("load", function (){
    vivipos.startup();
}, false);

window.addEventListener("unload", function (){
    vivipos.shutdown();
}, false);

// end of wrap 
})();

