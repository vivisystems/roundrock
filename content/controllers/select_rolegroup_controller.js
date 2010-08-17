(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {
        
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
            var groups = this.Acl.getGroupList() || [];

            if (data.hideadmin) {
                groups = groups.filter(function(g) {return g.name != 'admin'});
            }

            var panelView =  new NSIRoleGroupsView(groups);
            this.getListObj().datasource = panelView;
            this._listDatas = groups;
            if (data) {
                listObj.value = data.rolegroup;
            };

            this.select();

        },
	
        select: function(){
		
            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;

            if (selectedIndex > -1) {
                var rolegroup = this._listDatas[selectedIndex];

                document.getElementById('rolegroup').value = rolegroup.name;
            }
        }
	
    };

    AppController.extend(__controller__);

})();

