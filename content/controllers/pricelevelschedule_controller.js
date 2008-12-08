(function(){

    /**
     * Class DepartmentsController
     */
    GeckoJS.Controller.extend( {

        name: 'PriceLevelSchedule',
        _selectedIndex: null,
        pricelevelPanelView: null,
        _listObj: null,
        _listPriceLevelObj: null,
        _listDatas: [],

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('simpleListBoxSchedule');
            }
            return this._listObj;
        },

        getPriceLevelObj: function() {
            if(this._listPriceLevelObj == null) {
                this._listPriceLevelObj = document.getElementById('pricelevelscrollablepanel');
                this.createPriceLevelPanel();
            }
            return this._listPriceLevelObj;
        },

        readPrefSchedule: function (){
            var datas = GeckoJS.Configure.read('vivipos.fec.settings.PriceLevelSchedule') || "[]";
            this._listDatas = GeckoJS.BaseObject.unserialize(datas);
            GeckoJS.Session.add('pricelevelSchedule', this._listDatas);
            return this._listDatas;
        },

        createPriceLevelPanel: function () {
            this.readPrefSchedule();
            var defaultpriceLevel = GeckoJS.Configure.read('vivipos.fec.settings.DefaultPriceLevel') || 1;

            var priceleveldata = [];
            var item = {name: "Default:(" + defaultpriceLevel + ")"};
            priceleveldata.push(item);
            for (var i=1; i < 10; i++) {
                var item ={name: i};
                priceleveldata.push(item);
            }
            var panelView =  new GeckoJS.NSITreeViewArray(priceleveldata);
            this.getPriceLevelObj().datasource = panelView;
        },

        load: function (){
            this.getPriceLevelObj();
            var pricelevelDatas = [];
            var defaultpriceLevel = GeckoJS.Configure.read('vivipos.fec.settings.DefaultPriceLevel') || 1;
            this._listDatas.forEach(function(o){
                let item = {};
                item.time = o.time;
                if (o.pricelevel == 0) item.pricelevel = "Default Price Level: (" + defaultpriceLevel + ")";
                else item.pricelevel = o.pricelevel;
                pricelevelDatas.push(item);
            });

            this.getListObj().loadData(pricelevelDatas);
        },

        add: function  () {
            let seltime = $("#seltime").val();
            var pricelevel = this.getPriceLevelObj().value;
            let item = {time: seltime, pricelevel: pricelevel};

            var addedDefault = false;
            var modify = false;
            this._listDatas.forEach(function(o){
                if (o.time == "00:00") addedDefault = true;
                if (o.time == item.time) {
                    o.pricelevel = item.pricelevel;
                    modify = true;
                }
            });

            if (!addedDefault) {
                let item = {time: "00:00", pricelevel: 0};
                this._listDatas.push(item);
            }

            if (!modify) {
                this._listDatas.push(item);
            }

            let datas = new GeckoJS.ArrayQuery(this._listDatas).orderBy("time asc");

            var datastr = GeckoJS.BaseObject.serialize(datas);
            GeckoJS.Configure.write('vivipos.fec.settings.PriceLevelSchedule', datastr);
            this._listDatas = datas
             
            this.updateSession();

        },

        remove: function() {
            var index = this._listObj.selectedIndex;
            if (index < 0) return;
            
            if (GREUtils.Dialog.confirm(null, "confirm remove", "Are you sure?")) {

                if (index > 0) {
                    this._listDatas.splice(index, 1);
                } else if (index == 0) {
                    this._listDatas[0].pricelevel = 0;
                }

                var datastr = GeckoJS.BaseObject.serialize(this._listDatas);
                GeckoJS.Configure.write('vivipos.fec.settings.PriceLevelSchedule', datastr);

                this.updateSession();

            }
        },

        testJS: function() {
            var global = this;
            var obj = {};

            // var loader = Components.classes["@mozilla.org/moz/jssubscriptloader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
            var loader = GREUtils.XPCOM.getUsefulService("jssubscript-loader");
            loader.loadSubScript("data:text/plain,var a=1", obj)
            loader.loadSubScript("data:text/plain,this.b=1", obj)
            loader.loadSubScript("data:text/plain,c=1", obj)
            loader.loadSubScript("data:text/plain,function f(){}", obj)
            
            alert(obj.toSource()); // ({a:1, b:1, f:function f() {}})
            alert("a" in global); // false
            alert("b" in global); // false
            alert(global.c); // 1

        },

        updateSession: function() {
            this.load();
            GeckoJS.Session.add('pricelevelSchedule', this._listDatas);
        }


    });

})();

