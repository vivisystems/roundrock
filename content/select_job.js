(function(){

    var inputObj = window.arguments[0];
    // include controllers  and register itself

    /**
     * Controller Startup
     */
    function startup() {

        var jobsData = inputObj.jobsData;
        var jobname = inputObj.jobname;
        var panel = document.getElementById('jobscrollablepanel');
        window.viewHelper = new opener.GeckoJS.NSITreeViewArray(jobsData);

        for (var index = 0; index < jobsData.length; index ++) {
            if (jobsData[index].jobname == jobname) break;
        }
        if (index == jobsData.length) index = -1;
        panel.datasource = window.viewHelper;
        panel.selectedIndex = index;
        panel.selectedItems = [index];

        doSetOKCancel(
            function(){

                var index = panel.selectedIndex;

                inputObj.jobname = jobsData[index].jobname;
                inputObj.index = index;
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

