(function(){


    /**
     * Class ViviPOS.SelectQueueController
     */
    // GeckoJS.define('ViviPOS.SelectQueueController');

    GeckoJS.Controller.extend( {
        name: 'SelectQueue',
        _listObj: null,
        _listDatas: null,
        _datas: [],
    
        getListObj: function() {
            if(this._listObj == null) this._listObj = this.query("#simpleListBoxQueue")[0];
            ///return this._listObj;
            return this.query("#simpleListBoxQueue")[0];
        },
    
        load: function () {

            var listObj = this.getListObj();
            var user = this.Acl.getUserPrincipal();
            
            GeckoJS.Configure.loadPreferences("extensions.vivipos.settings");
            var confs = GeckoJS.Configure.read('extensions.vivipos.settings');

            var cart = GeckoJS.Session.get('cart');
            this._listDatas = GeckoJS.Array.objectExtract(cart.orderQueue, '{s}');

            var self = this;
            this._datas = [];

            // check private queue
            this._listDatas.forEach(function(o){
                var clerk = o.no.slice(9);
                if (confs.PrivateQueue) {
                    if (clerk == user.username) {
                        self._datas.push(o);
                    }
                } else {
                    self._datas.push(o);
                }
            });

            listObj.loadData(this._datas);
        },
    
        select: function(){
		
            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;
            var data = this._listDatas[selectedIndex];

            $('#itemlist').val( data.itemlist);
        
        },
    
        ok: function (args) {
            var selectedIndex = this._listObj.selectedIndex;
            var data = this._listDatas[selectedIndex];
            args.result = true;
            args.data = data;
            /*
            $do('pushQueue',null,'Main');
            $do('pullQueue',data, 'Cart');
            */
            
        }
    
    });


})();
