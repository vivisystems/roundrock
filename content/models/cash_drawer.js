GREUtils.define('ViviPOS.CashDrawerModel');
ViviPOS.CashDrawerModel = GeckoJS.Model.extend({
    name: 'CashDrawer',
	
    _type: "4720",
	
    _path: "chrome://viviecr/content/shell/test-cashdrawer",
	
    getType: function() {
        return this._type;
    },
	
    setType: function(t) {
        this._type = t;
    },
	
    open: function() {
		
        var filePath = GREUtils.File.chromeToPath(this._path);
		
        var fs = GREUtils.File.getFile(filePath);
		
        var args = [];
        args.push(this.getType());
        GREUtils.File.run(fs, args, true);
		

    }
    
});