(function(){

    var inputObj = window.arguments[0];

    // include controllers  and register itself

    /**
     * Controller Startup
     */
    function startup() {

        var tables = inputObj.tables;
        // var queuePool = inputObj.queuePool;

        // var itemlistObj = document.getElementById('itemlist');
        var self = this;

        window.viewHelper = new opener.GeckoJS.NSITreeViewArray(tables);
        window.viewHelper.getCurrentIndexData= function(row) {
            // var text = row + ":" + col.check_no;
            // GREUtils.log(GeckoJS.BaseObject.dump(row))
            GREUtils.log(row);

            return this.data[row];

        };

        window.viewHelper.getCellValue= function(row, col) {

            if (this.data[row].sequence) {

                var seq = this.data[row].sequence;
                var check_no = this.data[row].check_no;
                var table_no = this.data[row].table_no;
                var book_time = '';

                var text = "# " + table_no + "        " +
                           "\nSeq:  " + seq +
                           "\nCheck# " + check_no +                           
                           // "Book:" + book_time + "";
                           "";
            } else {
                // var table_no = GeckoJS.String.padLeft(this.data[row].table_no, 5, '.') + '.. ';
                var table_no = this.data[row].table_no;
                var text = "# " + table_no + "\n \n ";
            }

            return text;

        };

        document.getElementById('tableScrollablepanel').datasource = window.viewHelper ;

        doSetOKCancel(
            function(){
                inputObj.index = document.getElementById('tableScrollablepanel').value;
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


