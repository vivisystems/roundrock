(function(){

    var inputObj = window.arguments[0];

    var depView;

    function startup() {
        var id = inputObj.id;
        var panel = document.getElementById('productgroupscrollablepanel');

        depView = new NSIDepartmentsView('productgroupscrollablepanel', true);

        depView.hideInvisible = false;
        depView.refreshView(false);

        var index = -1;
        var data = depView.data;
        for (var i = 0; i < data.length; i++) {
            if (data[i] == id) {
                index = i;
                break;
            }
        }

        panel.selectedIndex = index;
        panel.selectedItems = [index];

        panel.ensureIndexIsVisible(index);
        
        doSetOKCancel(
            function(){

                var index = panel.selectedIndex;

                inputObj.group_name = depView.getCellValue(index, {id: 'name'});
                inputObj.group_id = depView.getCellValue(index, {id: 'id'});
                
                inputObj.ok = true;

                return true;
            },
            function(){
                inputObj.ok = false;
                
                return true;
            }
        );

    };

    window.addEventListener('load', startup, false);

})();

