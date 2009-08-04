(function(){

    function startup() {

        $do('createDepartmentPanel', null, 'Departments');
        $do('initDefaultTax', null, 'Departments');
        
    };

    window.addEventListener('load', startup, false);


})();


