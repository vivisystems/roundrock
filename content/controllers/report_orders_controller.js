(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'ReportOrders',

        _listObj: null,
        _listDatas: null,
        _listdetailObj: null,

        getListObj: function() {
            if(this._listObj == null) this._listObj = this.query("#simpleListBoxReport1")[0];
            return this._listObj;
        },

        getListDetailObj: function() {
            if(this._listdetailObj == null) this._listdetailObj = this.query("#simpleListBoxReport1detail")[0];
            return this._listdetailObj;
        },

        load: function () {

            var listObj = this.getListObj();
            var OrderModel = new ViviPOS.OrderModel();
            var orders = OrderModel.find('all', {
                order: "created DESC"
            });
            this._listDatas = orders;
            // listObj.loadData(orders);
            listObj.bindTreeData(orders);

            // this._listObj.selectedIndex = 0;
            // this._listObj.ensureIndexIsVisible(0);

        },

        select: function(){
		
            var listObj = this.getListObj();
            // selectedIndex = listObj.selectedIndex;
            var selectedIndex = listObj.tree.currentIndex;
            if (selectedIndex >= 0) {
                var order = this._listDatas[selectedIndex];
                var listDetailObj = this.getListDetailObj();
                listDetailObj.loadData(order.OrderDetail);
            }
            
        }
	
    };
    
    AppController.extend(__controller__);

})();
