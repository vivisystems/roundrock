(function(){
    
    /**
     * Controller Startup
     */
    function startup() {

        $do('createRoleList', null, 'AclGroups');
        $do('load', null, 'AclGroups');

        doSetOKCancel(
            function(){
                var data = {close: true};
                $do('confirmExit', data, 'AclGroups');
                return data.close;
            },

            function(){
                var data = {close: true};
                $do('confirmExit', data, 'AclGroups');
                return data.close;
            }
        );
    };

    window.addEventListener('load', startup, false);

})();


