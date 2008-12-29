(function(){

    GeckoJS.Controller.extend( {
        name: 'SelectCondgroup',
	
        _listObj: null,
        _listDatas: null,
        _rolelistObj: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('condgroupscrollablepanel');
            }
            return this._listObj;
        },

        load: function (data) {

            var listObj = this.getListObj();

            var groups = GeckoJS.Session.get('condGroups');
            if (!groups) {
                var condGroupModel = new CondimentGroupModel();
                var condGroups = condGroupModel.find('all', {
                    order: "name"
                });
                GeckoJS.Session.add('condGroups', condGroups);
                groups = GeckoJS.Session.get('condGroups');
            }

            var panelView =  new NSICondGroupsView(groups);
            this.getListObj().datasource = panelView;

            this._listDatas = groups;

            var index = (groups.length > 0) ? 0 : -1;
            if (data) {
                for (var i = 0; i < groups.length; i++) {
                    if (groups[i].id == data) {
                        index = i;
                        break;
                    }
                }
                if (listObj.selectedIndex == null || listObj.selectedIndex < 0) {
                    listObj.selectedItems = [index];
                    listObj.selectedIndex = index;
                }
            };
            this.select();


        },
	
        select: function(){
		
            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;
            var group = this._listDatas[selectedIndex];

            if (group) {
                document.getElementById('cond_group_name').value = group.name;
                document.getElementById('cond_group').value = group.id;
            }
        }
	
    });

})();

