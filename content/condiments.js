(function(){

    function startup() {

        $do('createCondimentPanel', null, "Condiments");

        doSetOKCancel(
            function(){
                var data = {close: true};
                $do('confirmExit', data, 'Condiments');
                return data.close;
            },
            function(){
                alert('cancel');
                var data = {close: true};
                $do('confirmExit', data, 'Condiments');
                return data.close;
            }
        );
    };

    window.addEventListener('load', startup, false);

})();


