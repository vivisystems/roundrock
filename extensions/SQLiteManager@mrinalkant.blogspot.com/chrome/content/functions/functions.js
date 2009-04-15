//functions to be created for the db
var smDbFunctions = {
  //for use as where col regexp string_for_re
  // col goes as the second argument
  g_RegExpString: null,
  g_RegExp: null,
  regexp: {
    onFunctionCall: function(val) {
      if (this.g_RegExp == null || val.getString(0) != this.g_RegExpString) {
        this.g_RegExpString = val.getString(0);
        this.g_RegExp = new RegExp(this.g_RegExpString);
      }
      if (val.getString(1).match(this.g_RegExp)) return 1;
      else return 0;
    }
  }
};
