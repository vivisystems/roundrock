(function(){

    GeckoJS.Controller.extend( {
        name: 'SelectTax',
        components: ['Tax'],
	
        _listObj: null,
        _listDatas: null,
        _rolelistObj: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('taxscrollablepanel');
            }
            return this._listObj;
        },

        load: function (data) {

            var listObj = this.getListObj();

            var taxes = this.Tax.getTaxList();

            var panelView =  new NSITaxesView(taxes);
            this.getListObj().datasource = panelView;

            this._listDatas = taxes;

            var index = 0;
            if (data) {
                listObj.value = data;            
            } else {
                listObj.selectedItems = [0];
                listObj.selectedIndex = 0;
            };
            this.select();


        },
	
        select: function(){
		
            var listObj = this.getListObj();
            selectedIndex = listObj.selectedIndex;
            var group = this._listDatas[selectedIndex];

            // $("rolegroup").val(rolegroup.name);
            document.getElementById('rate').value = group.name;

        }
	
    });

})();

