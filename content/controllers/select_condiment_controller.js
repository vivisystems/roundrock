(function(){

    GeckoJS.Controller.extend( {
        name: 'SelectCondiment',
	
        _listObj: null,
        _listDatas: null,
        _rolelistObj: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('condimentscrollablepanel');
            }
            return this._listObj;
        },

        load: function (data) {

            var listObj = this.getListObj();

            var condGroups = GeckoJS.Session.get('condGroups');
            if (!condGroups) {
                var condGroupModel = new CondimentGroupModel();
                var condGroups = condGroupModel.find('all', {
                    order: "no"
                });
                GeckoJS.Session.add('condGroups', condGroups);
                condGroups = GeckoJS.Session.get('condGroups');
                /*
                var idx = 0;
                condGroups.forEach(function(o) {
                    o
                });
                */
            }

            var i = -1;
            var index = -1;

            condGroups.forEach(function(o) {
                i++;
                if (o.name == data) {index = i}
            });

            var conds = condGroups[index]['Condiment'];

            this._selectedIndex = index;

            var condPanelView =  new NSICondimentsView(conds);
            listObj.datasource = condPanelView;


            this._listDatas = conds;

        }
	
    });

})();

