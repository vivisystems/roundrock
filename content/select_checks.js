(function(){

    var inputObj = window.arguments[0];

    // include controllers  and register itself

    /**
     * Controller Startup
     */
    function startup() {

        var checks = inputObj.checks;
        // var queuePool = inputObj.queuePool;

        // var itemlistObj = document.getElementById('itemlist');
        var self = this;

        window.viewHelper = new opener.GeckoJS.NSITreeViewArray(checks);
        window.viewHelper.getCurrentIndexData= function(row) {
            // var text = row + ":" + col.check_no;
            // GREUtils.log(GeckoJS.BaseObject.dump(row))
            // GREUtils.log(row);

            return this.data[row];

        };

        window.viewHelper.getCellValue= function(row, col) {
            // var text = row + ":" + col.check_no;
            var seq = this.data[row].sequence;
            var check_no = this.data[row].check_no;
            var table_no = this.data[row].table_no;
            var book_time = '';
            var text = "Seq:" + seq +
                       "\nCheck# " + check_no +
                       "\nTable# " + table_no +
                       // "Book:" + book_time + "";
                       "";
            return text;

        };
        /*
        getCellValue
        getCurrentIndexData: function (row) {
            return this.data[row];
        }
        */

        document.getElementById('checkScrollablepanel').datasource = window.viewHelper ;

        document.getElementById('checkScrollablepanel').addEventListener('command', function(evt) {
            var index = evt.target.value;

            var itemlistObj = document.getElementById('itemlist');
            var data = window.viewHelper.getCurrentIndexData(index);
            GREUtils.log(GeckoJS.BaseObject.dump(data));

            var displayStr = "";
            displayStr += "SEQ# " + data.sequence + "\n\n";
            var limit = 10, cc= 0;
            data.OrderItem.forEach(function(item){
                if (cc<=limit) {
                    displayStr += item.product_name + ' x ' + item.current_qty + '\n';
                }

            });

            if (cc>limit) displayStr += "   ......   \n" ;

            // displayStr += "\n\nTL: " + data.remain;
            displayStr += "\n\nTL: " + data.total;

            itemlistObj.setAttribute('value', displayStr);

        }, true);

        doSetOKCancel(
            function(){
                // inputObj.condiments = document.getElementById('condiments').value;
                inputObj.index = document.getElementById('checkScrollablepanel').value;
                inputObj.ok = true;

                delete window.viewHelper;

                return true;
            },
            function(){
                inputObj.ok = false;
                delete window.viewHelper;
                return true;
            }
            );

    };

    window.addEventListener('load', startup, false);

})();


