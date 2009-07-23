(function(){

    var inputObj = window.arguments[0];
    // include controllers  and register itself

    /**
     * Controller Startup
     */
    function startup() {

        document.getElementById('title').setAttribute('label', inputObj.title);
        document.getElementById('description').value = inputObj.description;
        var marksData = [];
        var datas = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableMarks');
        if (datas != null)
            marksData = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datas));
        if (marksData.length <= 0) marksData = [];

        var index = -1;
        // var marksData = inputObj.marksData;
        var panel = document.getElementById('markscrollablepanel');
        window.viewHelper = new opener.GeckoJS.NSITreeViewArray(marksData);

        panel.datasource = window.viewHelper;
        panel.selectedIndex = index;
        panel.selectedItems = [index];

        doSetOKCancel(
            function(){

                var index = panel.selectedIndex;
                inputObj.markObj = marksData[index];
                inputObj.name = marksData[index].name;
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

