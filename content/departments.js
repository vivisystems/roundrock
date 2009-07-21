(function(){

    function startup() {

        $do('createDepartmentPanel', null, 'Departments');
        $do('initDefaultTax', null, 'Departments');
        
        doSetOKCancel(
            function(){
                var data = {close: true};
                $do('confirmExit', data, 'Departments');
                return data.close;
            },
            
            function(){
                var data = {close: true};
                $do('confirmExit', data, 'Departments');
                return data.close;
            }
        );
    };

    window.addEventListener('load', startup, false);


})();


