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

        // @todo
        exportToCsv: function(csvFileName) {
            alert(csvFileName);
            if (!csvFileName) {
                // need filename
                return;
            }

        }
    });

})();
