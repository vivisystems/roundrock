(function(){

    var inputObj = window.arguments[0];
    // include controllers  and register itself

    /**
     * Controller Startup
     */
    function startup() {

        var jobsData = inputObj.jobsData;
        var jobid = inputObj.jobid;
        var panel = document.getElementById('jobscrollablepanel');
        window.viewHelper = new opener.GeckoJS.NSITreeViewArray(jobsData);

        for (var index = 0; index < jobsData.length; index ++) {
            if (jobsData[index].id == jobid) break;
        }
        if (index == jobsData.length) index = -1;
        panel.datasource = window.viewHelper;
        
        panel.selectedIndex = index;
        panel.selectedItems = [index];

        doSetOKCancel(
            function(){

                var selectedItems = panel.selectedItems;
                
                if (selectedItems.length == 0) {
                    inputObj.jobid = '';
                }
                else {
                    var index = selectedItems[0];
                    
                    inputObj.jobid = jobsData[index].id;
                    inputObj.jobname = jobsData[index].jobname;
                }
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

