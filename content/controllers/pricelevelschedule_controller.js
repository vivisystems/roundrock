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


        createPriceLevelPanel: function () {
            var datas = GeckoJS.Configure.read('vivipos.fec.settings.PriceLevelSchedule') || "[]";
            this._listDatas = GeckoJS.BaseObject.unserialize(datas);
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
            // this.createPriceLevelPanel();
            this.getPriceLevelObj();
            var pricelevelDatas = [];

            var datas = new GeckoJS.ArrayQuery(this._listDatas).orderBy("time asc");
            this._listDatas = datas;
            datas.forEach(function(o){
                var item = o;
                if (item.pricelevel == 0) item.pricelevel = "Default Price Level: (" + item.pricelevel + ")";
                pricelevelDatas.push(item);
            });

            this.getListObj().loadData(pricelevelDatas);
        },

        add: function  () {
            let seltime = $("#seltime").val();
            var pricelevel = this.getPriceLevelObj().value;
             
            var item = {time: seltime, pricelevel: pricelevel};
            this._listDatas.push(item);

            var addDefault = false;
            this._listDatas.forEach(function(o){
                if (o.time == "00:00") addDefault = true;
            });

            if (!addDefault) {
                let item = {time: "00:00", pricelevel: 0};
                 
                this._listDatas.push(item);
            }

            var datastr = GeckoJS.BaseObject.serialize(this._listDatas);
            GeckoJS.Configure.write('vivipos.fec.settings.PriceLevelSchedule', datastr);

            this.load();
             
            this.updateSession();

        },

        remove: function() {

            if (GREUtils.Dialog.confirm(null, "confirm remove", "Are you sure?")) {

                var index = this._listObj.selectedIndex;
                if(index >= 0) {

                    var datas = [];
                    var itemtime = this._listDatas[index].time;
                    this._listDatas.forEach(function(o){
                        if (o.time != itemtime) datas.push(o);
                    });
                    this._listDatas = datas;

                    var datastr = GeckoJS.BaseObject.serialize(this._listDatas);
                    GeckoJS.Configure.write('vivipos.fec.settings.PriceLevelSchedule', datastr);
                    this.load();

                    this.updateSession();
                    
                }
            }
        },

        updateSession: function() {
            
            GeckoJS.Session.add('pricelevelSchedule', this._listDatas);
        }


    });

})();

