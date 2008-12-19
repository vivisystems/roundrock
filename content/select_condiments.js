(function(){

    var inputObj = window.arguments[0];
    // include controllers  and register itself

    // GeckoJS.include('chrome://viviecr/content/controllers/select_condiment_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        var condgroup = inputObj.condgroup;
        var condsData = inputObj.condsData;

        // $do('load', inputObj.condgroup, 'SelectCondiment');

        // document.getElementById('condiments').value = inputObj.condiments;
        window.viewHelper = new opener.GeckoJS.NSITreeViewArray(condsData);

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

        document.getElementById('condimentscrollablepanel').datasource = window.viewHelper ;

        /*
        document.getElementById('condimentscrollablepanel').addEventListener('command', function(evt) {
        }, true);
        */


        doSetOKCancel(
            function(){

                var indexes = document.getElementById('condimentscrollablepanel').value.split(',');
                var condiments = [];
                indexes.forEach(function(index) {
                    // condiments.push(condsData[index].name);
                    condiments.push(condsData[index]);
                });


                //inputObj.condiments = condiments.join(',');
                inputObj.condiments = condiments;
                // inputObj.condiments = document.getElementById('condimentscrollablepanel').value;
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


