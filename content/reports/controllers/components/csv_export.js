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
        
        execute: function(cmd, param) {
            try {
                var exec = new GeckoJS.File(cmd);
                var r = exec.run(param, true);
                // this.log("ERROR", "Ret:" + r + "  cmd:" + cmd + "  param:" + param);
                exec.close();
                return true;
            }
            catch (e) {
                NotifyUtils.warn(_('Failed to execute command (%S).', [cmd + ' ' + param]));
                return false;
            }
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
                
                // sync to media...
                this.execute("/bin/sync", []);

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
