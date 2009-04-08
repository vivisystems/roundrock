(function(){

    var inputObj = window.arguments[0];
    // include controllers  and register itself

    /**
     * Controller Startup
     */
    function startup() {

        var groupData = inputObj.groupData;
        var index = inputObj.index;
        var panel = document.getElementById('productgroupscrollablepanel');

        window.viewHelper = new opener.GeckoJS.NSITreeViewArray(groupData);

        window.viewHelper.renderButton= function(row, btn) {

            var buttonColor = this.getCellValue(row,{
                id: 'button_color'
            });
            var buttonFontSize = this.getCellValue(row,{
                id: 'font_size'
            });

            if (buttonColor && btn) {
                $(btn).addClass(buttonColor);
            }
            if (buttonFontSize && btn) {
                $(btn).addClass('font-'+ buttonFontSize);
            }

        };

        panel.datasource = window.viewHelper;
        panel.selectedIndex = index;
        panel.selectedItems = [index];

        doSetOKCancel(
            function(){

                var index = panel.selectedIndex;

                inputObj.group_name = groupData[index].name;
                inputObj.group_id = groupData[index].id;
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

