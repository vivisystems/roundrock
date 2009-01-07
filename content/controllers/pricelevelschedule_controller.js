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

        readPrefSchedule: function (){
            var datas = GeckoJS.Configure.read('vivipos.fec.settings.PriceLevelSchedule') || '[]';
            this._listDatas = GeckoJS.BaseObject.unserialize(datas);
            GeckoJS.Session.add('pricelevelSchedule', this._listDatas);
            return this._listDatas;
        },

        createPriceLevelPanel: function () {
            this.readPrefSchedule();
            var defaultpriceLevel = GeckoJS.Configure.read('vivipos.fec.settings.DefaultPriceLevel') || 1;

            var priceleveldata = [];
            var item = {name: _('Default') + ' (' + defaultpriceLevel + ')'};
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
                if (o.pricelevel == 0) item.pricelevel = _('Default Price Level') + ' (' + defaultpriceLevel + ')';
                else item.pricelevel = o.pricelevel;
                pricelevelDatas.push(item);
            });

            var panelView =  new GeckoJS.NSITreeViewArray(pricelevelDatas);
            this.getListObj().datasource = panelView;

            this.validateForm();
        },

        add: function  () {
            // let seltime = $('#seltime').val();
            var pricelevel = this.getPriceLevelObj().value;
            var seltimeObj = document.getElementById('seltime');
            var h = seltimeObj.hour;
            var n = seltimeObj.minute;
            h = GeckoJS.String.padLeft(h, 2, "0");
            n = GeckoJS.String.padLeft(n, 2, "0");
            var seltime = h + ":" + n;

            let item = {time: seltime, pricelevel: pricelevel};

            var addedDefault = false;
            var modify = false;
            this._listDatas.forEach(function(o){
                if (o.time == '00:00') addedDefault = true;
                if (o.time == item.time) {
                    o.pricelevel = item.pricelevel;
                    modify = true;
                }
            });

            if (!addedDefault) {
                let item = {time: '00:00', pricelevel: 0};
                this._listDatas.push(item);
            }

            if (!modify) {
                this._listDatas.push(item);
            }

            let datas = new GeckoJS.ArrayQuery(this._listDatas).orderBy('time asc');

            var datastr = GeckoJS.BaseObject.serialize(datas);
            GeckoJS.Configure.write('vivipos.fec.settings.PriceLevelSchedule', datastr);
            this._listDatas = datas

            this.updateSession();

            // @todo OSD
            OsdUtils.info(_('Schedule [%S - Price Level %S] added successfully', [item.time, item.pricelevel]));
        },

        remove: function() {
            var index = this._listObj.selectedIndex;
            if (index < 0) return;

            var item = this._listDatas[index];
            var time = item.time;
            var pricelevel = item.pricelevel ? item.pricelevel : 'default';

            if (GREUtils.Dialog.confirm(null, _('confirm remove %S - price level %S', [time, pricelevel]), _('Are you sure?'))) {

                if (index > 0) {
                    this._listDatas.splice(index, 1);
                } else if (index == 0) {
                    this._listDatas[0].pricelevel = 0;
                }

                var datastr = GeckoJS.BaseObject.serialize(this._listDatas);

                GeckoJS.Configure.write('vivipos.fec.settings.PriceLevelSchedule', datastr);

                this.updateSession();

                // @todo OSD
                OsdUtils.info(_('Schedule [%S - Price Level %S] removed successfully', [time, pricelevel]));
            }
        },

        updateSession: function() {
            this.load();
            GeckoJS.Session.add('pricelevelSchedule', this._listDatas);

            this.validateForm();
        },

        validateForm: function() {
            var scheduleIndex = this.getListObj().selectedIndex;
            var pricelevelIndex = this.getPriceLevelObj().selectedIndex;

            document.getElementById('add_schedule').setAttribute('disabled', pricelevelIndex == -1);
            document.getElementById('remove_schedule').setAttribute('disabled', scheduleIndex == -1);
        }


    });

})();
