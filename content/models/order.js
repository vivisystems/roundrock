// GREUtils.define('ViviPOS.OrderModel');
var OrderModel = window.OrderModel =  GeckoJS.Model.extend({
    name: 'Order',
    hasMany: ['OrderDetail'],
	
    saveOrder: function(data) {
        data['created'] = parseInt(new Date().getTime() / 1000);      // 18:45
        data['created_date'] = new Date().toString("yyyy-MM-dd HH:mm:ss");      // 18:45
        data['modified'] = parseInt(new Date().getTime() / 1000);      // 18:45
        data['modified_date'] = new Date().toString("yyyy-MM-dd HH:mm:ss");      // 18:45
        this.save(data);
    },
	
    beforeSave: function(evt) {
        // alert(GeckoJS.BaseObject.dump(evt.data));
        // alert("beforeSave..." + evt.data['total']);
        // evt.data['total'] = evt.data['total'] * 2; // change test
        return true;
    }
    
});
