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
            + "'"+ this.escapeString(promotion.name) +"',"
            + "'"+ this.escapeString(promotion.code) +"',"
            + "'"+ this.escapeString(promotion.alt_name1) +"',"
            + "'"+ this.escapeString(promotion.alt_name2) +"',"
            + "'"+ promotion.trigger +"',"
            + "'"+ this.escapeString(trigger.getPrefs().name) +"',"
            + "'"+ this.escapeString(trigger.getPrefs().label) +"',"
            + "'"+ promotion.type +"',"
            + "'"+ this.escapeString(type.getPrefs().name) +"',"
            + "'"+ this.escapeString(type.getPrefs().label) +"',"
            + trigger.getMatchedAmount() +","
            + trigger.getMatchedItemsQty() +","
            + trigger.getMatchedItemsSubtotal() +","
            + type.getDiscountSubtotal() +","
            + "'" + this.escapeString(type.getTaxNo()||'') +"'," // tax_name
            + type.getDiscountTaxSubtotal() +","// current_tax
            + type.getDiscountTaxIncludedSubtotal() +"," // included_tax
            + "'"+GeckoJS.BaseObject.serialize(type.getDiscountTaxDetails())+"'" // tax details
            + ")";

            var datasource = this.getDataSource();

            try {

                datasource.connect();
                if(sql && datasource.conn) datasource.conn.executeSimpleSQL(sql);

            }catch(e) {
                this.log('ERROR', 'appendItem: promotion_applies error. SQL:'+sql, e);
            }

        },

        removeItem: function(promotion) {

            var sql = 'DELETE FROM promotion_applies WHERE id=' + "'"+promotion.id +"'";

            var datasource = this.getDataSource();

            try {

                datasource.connect();
                if(sql && datasource.conn) datasource.conn.executeSimpleSQL(sql);

            }catch(e) {
                this.log('ERROR', 'removeItem: promotion_applies error. SQL:'+sql, e);
            }

        },

        truncate: function() {
            var sql = "DELETE FROM promotion_applies";
            var datasource = this.getDataSource();

            try {

                datasource.connect();
                if(sql && datasource.conn) datasource.conn.executeSimpleSQL(sql);

            }catch(e) {
                this.log('ERROR', 'truncate: promotion_applies error. SQL:'+sql, e);
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
            var applyItems = this.getDataSource().fetchAll(sql);

            if (applyItems && applyItems.length > 0) {
                applyItems.forEach(function(promotion) {
                    promotion.tax_details = GeckoJS.BaseObject.unserialize(promotion.tax_details);
                }, this)
            }

            return applyItems;
        }


    };

    var PromotionApplyModel = window.PromotionApplyModel = AppModel.extend(__model__);

})();
