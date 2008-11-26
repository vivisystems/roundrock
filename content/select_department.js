(function(){

    var inputObj = window.arguments[0];
    // include controllers  and register itself

    /**
     * Controller Startup
     */
    function startup() {

        var depsData = inputObj.depsData;

        window.viewHelper = new opener.GeckoJS.NSITreeViewArray(depsData);

        window.viewHelper.renderButton= function(row, btn) {

            var buttonColor = this.getCellValue(row,{
                id: 'button_color'
            });
            var buttonFontSize = this.getCellValue(row,{
                id: 'font_size'
            });

            if (buttonColor && btn) {
                $(btn).addClass('button-'+ buttonColor);
            }
            if (buttonFontSize && btn) {
                $(btn).addClass('font-'+ buttonFontSize);
            }

        };

        document.getElementById('departmentscrollablepanel').datasource = window.viewHelper ;

        /*
        document.getElementById('condimentscrollablepanel').addEventListener('command', function(evt) {
        }, true);
        */


        doSetOKCancel(
            function(){

                var index = document.getElementById('departmentscrollablepanel').selectedIndex;

                inputObj.cate_no = depsData[index].no;
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


