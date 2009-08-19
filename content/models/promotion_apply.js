(function(){

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'PromotionApply',
        useDbConfig: 'memory',

        appendItem: function(promotion, trigger, type) {
            
            var sql = "INSERT INTO promotion_applies VALUES("
            + "NULL,"
            + "'"+ promotion.id +"',"
            + "'"+ promotion.name +"',"
            + "'"+ promotion.code +"',"
            + "'"+ promotion.alt_name1 +"',"
            + "'"+ promotion.alt_name2 +"',"
            + "'"+ promotion.trigger +"',"
            + "'"+ trigger.getPrefs().name +"',"
            + "'"+ trigger.getPrefs().label +"',"
            + "'"+ promotion.type +"',"
            + "'"+ type.getPrefs().name +"',"
            + "'"+ type.getPrefs().label +"',"
            + trigger.getMatchedAmount() +","
            + trigger.getMatchedItemsQty() +","
            + trigger.getMatchedItemsSubtotal() +","
            + type.getDiscountSubtobal() +","
            + "'" + (type.getTaxNo()||'') +"'," // tax_name
            + type.getDiscountTaxSubtotal()
            + ")";

            var datasource = this.getDataSource();

            try {

                datasource.connect();
                if(sql && datasource.conn) datasource.conn.executeSimpleSQL(sql);

            }catch(e) {
                this.log(sql +",,"+ e);
            }

        },

        removeItem: function(promotion) {

            var sql = 'DELETE FROM promotion_applies WHERE id=' + "'"+promotion.id +"'";

            var datasource = this.getDataSource();

            try {

                datasource.connect();
                if(sql && datasource.conn) datasource.conn.executeSimpleSQL(sql);

            }catch(e) {
                this.log(sql +",,"+ e);
            }

        },

        truncate: function() {
            var sql = "DELETE FROM promotion_applies";
            var datasource = this.getDataSource();

            try {

                datasource.connect();
                if(sql && datasource.conn) datasource.conn.executeSimpleSQL(sql);

            }catch(e) {
            // this.log(sql +",,"+ e);
            }

        },
        
        
        getDiscountSubotal: function() {
            var sql = "SELECT SUM(discount_subtobal) as subtotal FROM promotion_applies";
            var d = this.getDataSource().fetchAll(sql);
            if (d[0]['subtotal']) return d[0]['subtotal'];
            else 0;
        },

        getApplyItems: function() {

            var sql = "SELECT * FROM promotion_applies";
            return this.getDataSource().fetchAll(sql);
            
        }


    };

    var PromotionApplyModel = window.PromotionApplyModel = AppModel.extend(__model__);

})();
