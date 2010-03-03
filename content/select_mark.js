(function(){

    var inputObj = window.arguments[0];
    // include controllers  and register itself

    /**
     * Controller Startup
     */
    function startup() {

        document.getElementById('title').setAttribute('value', inputObj.title);
        document.getElementById('description').value = inputObj.description;
        var marksData = inputObj.marks;
        
        var index = -1;
        var panel = document.getElementById('markscrollablepanel');
        window.viewHelper = new GeckoJS.NSITreeViewArray(marksData);

        panel.datasource = window.viewHelper;
        panel.selectedIndex = index;
        panel.selectedItems = [];

        doSetOKCancel(
            function(){

                var index = panel.selectedIndex;
                inputObj.markObj = marksData[index];
                inputObj.name = marksData[index].name;
                inputObj.id = marksData[index].id;
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

