(function(){

    var inputObj = window.arguments[0];

    var depView;

    function startup() {
        var index = inputObj.index;
        var groupData = inputObj.groupData;
        var plugroupOnly = inputObj.plugroupOnly;
        var panel = document.getElementById('productgroupscrollablepanel');

        if (plugroupOnly) {
            depView = new NSIPluGroupsView(groupData);
            panel.datasource = depView;
        }
        else {
            depView = new NSIDepartmentsView('productgroupscrollablepanel', true);

            depView.hideInvisible = false;
            depView.refreshView(false);
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

