(function(){

    var __controller__ = {

        name: 'PriceLevelSchedule',

        pricelevelPanelView: null,
        _listObj: null,
        _listPriceLevelObj: null,
        _listDatas: [],
        _selectedIndex: null,
        _weekIndex: (new Date()).getDay(),

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('schedulescrollablepanel');
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

        readPrefSchedule: function () {
            var datas = GeckoJS.Configure.read('vivipos.fec.settings.PriceLevelSchedule') || '[]';

            this._listDatas = GeckoJS.BaseObject.unserialize(datas) || [];

            if (this._listDatas.length == 0) {
                for (var i = 0; i < 7; i++)
                    this._listDatas.push([]);
            } else if (this._listDatas.length > 0) {
                // translate old schedule format to week schedule...
                if (this._listDatas[0].time) {
                    var week = GeckoJS.BaseObject.unserialize(datas);
                    this._listDatas = [];
                    for (var i = 0; i < 7; i++) {
                        
                        var w = [];
                        week.forEach(function(o){
                            w.push(o);
                        });
                        
                        this._listDatas.push(w);
                    }                
                    var datastr = GeckoJS.BaseObject.serialize(this._listDatas);
                    GeckoJS.Configure.write('vivipos.fec.settings.PriceLevelSchedule', datastr);
                }
            }

            var today = (new Date()).getDay();
            GeckoJS.Session.add('pricelevelSchedule', {day: today, schedule: this._listDatas[today]});
            return this._listDatas;
        },

        createPriceLevelPanel: function () {
            this.readPrefSchedule();
            var defaultpriceLevel = GeckoJS.Configure.read('vivipos.fec.settings.DefaultPriceLevel') || 1;
            var maxPriceLevel = GeckoJS.Configure.read('vivipos.fec.settings.MaxPriceLevel') || 10;

            var priceleveldata = [];
            var item = {name: _('Default') + ' (' + defaultpriceLevel + ')'};
            priceleveldata.push(item);
            for (var i=1; i < maxPriceLevel; i++) {
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
            this._listDatas[this._weekIndex].forEach(function(o){
                let item = {};
                item.time = o.time;
                if (o.pricelevel == 0) item.pricelevel = _('Default Price Level') + ' (' + defaultpriceLevel + ')';
                else item.pricelevel = o.pricelevel;
                pricelevelDatas.push(item);
            });

            var panelView =  new GeckoJS.NSITreeViewArray(pricelevelDatas);
            this.getListObj().datasource = panelView;

            // set week label
            var weekTabs = document.getElementById("weeklabel").childNodes;
            var date = new Date();
            date.setDate(date.getDate() - (date.getDay() - 0));
            for (var i = 0; i < weekTabs.length; i++) {
                weekTabs[i].setAttribute('label', date.toLocaleFormat("%a"));
                date.setDate(date.getDate() + 1);
            }

            var datetimeObj = document.getElementById('datetime');
            var roundDatetime = (new Date()).getTime();
            var roundDate = new Date( roundDatetime - (roundDatetime % 3600000 )); // round down 1hour
            datetimeObj.dateValue = roundDate;
            this.validateForm();
        },

        add: function  () {
            // let seltime = $('#seltime').val();
            var pricelevel = this.getPriceLevelObj().value;
            var seltimeObj = document.getElementById('datetime');
            var h = seltimeObj.hour;
            var n = seltimeObj.minute;
            h = GeckoJS.String.padLeft(h, 2, "0");
            n = GeckoJS.String.padLeft(n, 2, "0");
            var seltime = h + ":" + n;

            let item = {time: seltime, pricelevel: pricelevel};

            var addedDefault = false;
            var modify = false;
            this._listDatas[this._weekIndex].forEach(function(o){
                if (o.time == '00:00') addedDefault = true;
                if (o.time == item.time) {
                    o.pricelevel = item.pricelevel;
                    modify = true;
                }
            });

            if (!addedDefault) {
                let item = {time: '00:00', pricelevel: 0};
                this._listDatas[this._weekIndex].push(item);
            }

            if (!modify) {
                this._listDatas[this._weekIndex].push(item);
            }

            let datas = new GeckoJS.ArrayQuery(this._listDatas[this._weekIndex]).orderBy('time asc');
            this._listDatas[this._weekIndex] = datas;

            var datastr = GeckoJS.BaseObject.serialize(this._listDatas);
            GeckoJS.Configure.write('vivipos.fec.settings.PriceLevelSchedule', datastr);

            this.updateSession();

            OsdUtils.info(_('Schedule [%S - Price Level %S] added successfully', [item.time, item.pricelevel]));
        },

        remove: function() {
            var index = this._listObj.selectedIndex;
            if (index < 0) return;

            var item = this._listDatas[this._weekIndex][index];
            var time = item.time;
            var pricelevel = item.pricelevel ? item.pricelevel : 'default';

            if (GREUtils.Dialog.confirm(this.topmostWindow, _('confirm remove %S - price level %S', [time, pricelevel]), _('Are you sure?'))) {

                if (index > 0) {
                    this._listDatas[this._weekIndex].splice(index, 1);
                    this.getListObj().refresh();
                } else if (index == 0) {
                    this._listDatas[this._weekIndex][0].pricelevel = 0;
                }

                var datastr = GeckoJS.BaseObject.serialize(this._listDatas);

                GeckoJS.Configure.write('vivipos.fec.settings.PriceLevelSchedule', datastr);

                this.updateSession();

                OsdUtils.info(_('Schedule [%S - Price Level %S] removed successfully', [time, pricelevel]));
            }
        },

        updateSession: function() {
            this.load();
            var today = (new Date()).getDay();
            GeckoJS.Session.add('pricelevelSchedule', {day: today, schedule: this._listDatas[today]});

            this.validateForm();
        },

        selectWeek: function(index){
            //
            this._weekIndex = index;

            var pricelevelDatas = [];
            var defaultpriceLevel = GeckoJS.Configure.read('vivipos.fec.settings.DefaultPriceLevel') || 1;
            if (this._listDatas.length == 0) return;
            this._listDatas[this._weekIndex].forEach(function(o){
                let item = {};
                item.time = o.time;
                if (o.pricelevel == 0) item.pricelevel = _('Default Price Level') + ' (' + defaultpriceLevel + ')';
                else item.pricelevel = o.pricelevel;
                pricelevelDatas.push(item);
            });

            var panelView =  new GeckoJS.NSITreeViewArray(pricelevelDatas);
            this.getListObj().datasource = panelView;

            this.getListObj().selectedIndex = -1;
            this.getPriceLevelObj().selectedIndex = -1 ;
            this.getPriceLevelObj().selectedItems = [] ;
            document.getElementById('add_schedule').setAttribute('disabled', true);
            document.getElementById('remove_schedule').setAttribute('disabled', true);

        },

        validateForm: function() {
            var scheduleIndex = this.getListObj().selectedIndex;
            var pricelevelIndex = this.getPriceLevelObj().selectedIndex;

            document.getElementById('add_schedule').setAttribute('disabled', pricelevelIndex == -1);
            document.getElementById('remove_schedule').setAttribute('disabled', scheduleIndex == -1);
        }


    };

    GeckoJS.Controller.extend(__controller__);

})();
