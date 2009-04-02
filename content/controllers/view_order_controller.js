(function(){

    /**
     * Class ViviPOS.JobsController
     */
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/template_ext.js');

    var __controller__ = {

        name: 'ViewOrder',

        load: function (seq) {

            // get browser content body
            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById( 'abody' );
            
            // load data
            var orderModel = new OrderModel();
            var order = orderModel.findByIndex('first', {
                index: 'sequence',
                value: seq,
                recursive: 2
            });

            //this.log(GeckoJS.BaseObject.dump(order));

            // load template
            var path = GREUtils.File.chromeToPath('chrome://viviecr/content/order_template.tpl');
            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );

            var data = {};
            data.order = order;
            data.sequence = seq;

            var result = tpl.process(data);

            if (doc) {
                doc.innerHTML = result;
            }
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();