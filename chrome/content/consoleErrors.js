var consoleErrors = {
  app : null,
  
  startup : function(aApp) {
    this.app = aApp;
  
    var csClass = Components.classes['@mozilla.org/consoleservice;1'];
    var cs = csClass.getService(Components.interfaces.nsIConsoleService);
    cs.registerListener(this);
  },

  shutdown : function() {
    var csClass = Components.classes['@mozilla.org/consoleservice;1'];
    var cs = csClass.getService(Components.interfaces.nsIConsoleService);
    cs.unregisterListener(this);
  },

  update: function(isError) {
    if(arguments.length == 0) isError = true;
    this.app.hasErrors(isError)
  },
  
  observe: function(object) {
    try {
      var nsIScriptError = Components.interfaces.nsIScriptError;
      if (object instanceof nsIScriptError) {
        var isWarning = object.flags & nsIScriptError.warningFlag;
        if (!isWarning) {
          this.update();
        }
      }
      else {
        // Must be an nsIConsoleMessage
        if(object.message.toString().length == 0) return this.update(false); // reset
        this.update();

      }
    }
    catch (e) {
   }
  }
};
