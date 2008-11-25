(function(){

    GeckoJS.Controller.extend( {
        name: 'SelectRolegroup',
	
        _listObj: null,
        _listDatas: null,
        _rolelistObj: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('rolegroupscrollablepanel');
            }
            return this._listObj;
        },

        load: function (data) {

            var listObj = this.getListObj();
            var groups = this.Acl.getGroupList();

            // var panelView =  new GeckoJS.NSITreeViewArray(groups);
            var panelView =  new NSIRoleGroupsView(groups);
            this.getListObj().datasource = panelView;
            this._listDatas = groups;
            var index = 0;
            if (data) {
                listObj.value = data;            
            } else if (groups) {
                listObj.selectedItems = [0];
                listObj.selectedIndex = 0;
            };
            this.select();

        },
	
        select: function(){
		
            var listObj = this.getListObj();
            selectedIndex = listObj.selectedIndex;
            var rolegroup = this._listDatas[selectedIndex];

            // $("rolegroup").val(rolegroup.name);
            document.getElementById('rolegroup').value = rolegroup.name;

        }
	
    });

})();

