(function() {

    var CsvExportComponent = window.CsvExportComponent = GeckoJS.Component.extend({

    /**
     * Component BrowserPrint
     */

        name: 'CsvExport',

        initial: function () {
            // @todo :
            alert('Csv Export initial...');
        },

        printToFile: function(csvFileName, datas, tpl) {
            if (!csvFileName) {
                // need filename
                return;
            }

            try {

                var saveFile = new GeckoJS.File(csvFileName, true);
                saveFile.open("w");

                var buf = tpl.process(datas);

                saveFile.write(buf+"\n");

                saveFile.close();

            }catch(e){
                GREUtils.log('ERROR', 'exportCSV ' + e);
            }

        },

        // @todo
        exportToCsv: function(csvFileName, headers, columns, datas) {

            if (!csvFileName) {
                // need filename
                return;
            }

            try {

                var saveFile = new GeckoJS.File(csvFileName, true);
                saveFile.open("w");

                var isFirstRow = true;
                var buff = "";

                buf = headers.join('","');
                buf = '"'+buf+'"';

                saveFile.write(buf+"\n");

                datas.forEach(function(row) {

                    var buf = "";

                    var data =[];
                    columns.forEach(function(col){
                        var val = new String(row[col]);
                        val = val.replace('"', '""');
                        data.push(val);
                    });

                    buf = data.join('","');
                    buf = '"'+buf+'"';

                    saveFile.write(buf+"\n");

                });

                saveFile.close();

            }catch(e){
                GeckoJS.BaseModel.log('ERROR', 'exportCSV ' + e);
            }

        }
    });

})();
