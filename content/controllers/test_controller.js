(function(){

    /**
     * Class ViviPOS.TestController
     */

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {
        name: 'Test',
        components: ['Tax','Acl'],

        convert: function(){
            alert(_('Test',['rack']));


/*
            var group = new CategoryModel();
            group.useDbConfig = 'json';
            var groups = group.find('all');

            alert(groups.length);
            group.useDbConfig = 'default';

            group.saveAll(groups);
*/

        },
        
        createTransaction: function(id) {
            var t = new Transaction();
            this.log(this.dump(t));
            alert('ok');
        },

        generateTransactions: function(count) {
alert('generateTransactions [' + count + ']');
            if (isNaN(count) || count < 0) {
                alert(count + ' is not a positive number');
            }
            count = Math.floor(count);
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            cart.clear();

            NotifyUtils.info('preparing to generate ' + count + ' transactions');
            for (var i = 0; i < count; i++) {
                cart.addItemByBarcode('PS00011');
                cart.addItemByBarcode('PS00064');
                cart.addItemByBarcode('PS00083');
                cart.cash();
            }
            NotifyUtils.info(count + ' transactions created');
        },

        importPlu: function(data) {
            var lines = GREUtils.File.readAllLine('/home/rack/workspace/dbf/plu-u8.csv');
            var products = GeckoJS.Session.get('products');
            var productTpl = GREUtils.extend({}, products[0]);

            delete productTpl.id;
            delete productTpl.created;
            productTpl.visible = true;
            productTpl.halo1 = 0;
            productTpl.lalo1 = 0;

            var prod = new ProductModel();

            var cate_no = '999';
            var pad = 8; // GeckoJS.String.padLeft

            var trimQuote = function(str) {

                return str.substr(1, str.length-2);
            };

            var productJSON = GREUtils.JSON.decodeFromFile("/var/tmp/products.db");

            var i = 1;
            lines.forEach(function(buf) {
                var dats = buf.split(',');
                var barcode = trimQuote(dats[0]);
                var name = trimQuote(GREUtils.Charset.convertToUnicode(dats[1], 'UTF-8'));
                var price = parseFloat(trimQuote(dats[2])) + 0;
                var no = cate_no + GeckoJS.String.padLeft(i, pad);
                i++;


                var product = GREUtils.extend({}, productTpl);
                product = GREUtils.extend(product, {no: no, cate_no: cate_no, name: name, barcode: barcode, price_level1: price, level_enable1: true});

                var id = GeckoJS.String.uuid() + "";
                product.id = id +"";

                productJSON[id] = product;

                //alert(this.dump(product));
            }, this);
            GREUtils.JSON.encodeToFile("/var/tmp/products.db", productJSON);
            alert(lines.length + ",," + i + GeckoJS.BaseObject.getKeys(productJSON).length);


        }

    };

    AppController.extend(__controller__);

})();
