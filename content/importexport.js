(function(){

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/import_export_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'ImportExport');

        /*
        var oldLimit = GREUtils.Pref.getPref('dom.max_chrome_script_run_time');

        alert('oldLimit = ' + oldLimit);

        GREUtils.Pref.setPref('dom.max_chrome_script_run_time', 5);

        while(true) {
            1+1;
        }
        alert('out');
        GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);
        */

        /*
        var text = '"00100000","Coffee","Red","100"\r\n' +
                   '"00100001","Coffee1","Red","101"\r\n' +
                   '"00100002","Coffee2","Red","102"\r\n';
        var text2 = 'aaa,bbb,ccc,ddd';
        var delim = ',';
        var quote = '"';
        var linedelim = '\r\n';
        // alert("before...");
        var lines = text.split(linedelim);
        alert(lines.length + ":" + lines);
        lines.forEach(function(o){
            GREUtils.log('ooo:' + o);
        })


        //for (var k=0, ll=lines.length; k<ll; k++) {
        //    lines[k] = splitline(lines[k]);
        //}

        var r = GeckoJS.String.parseCSV(text, delim, quote);
        // alert("r:" + this.dump(r));
        // alert("r:" + r);
        r.forEach(function(o){
            GREUtils.log('rrr:' + o);
            o.forEach(function(k){
                GREUtils.log('kkk:' + k);

            })
        })
        */
    };

    window.addEventListener('load', startup, false);

})();


