( function() {
    /**
     * SetDepartmentGroup Controller
     */

    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {
        
        name: 'SetDepartmentGroup',

        departmentUserSetting:[],
        groupUserSetting:[],

        save: function(){

          //save user setting
          var departmentPanel =  document.getElementById('departmentscrollablepanel');
          var groupPanel      =  document.getElementById('groupscrollablepanel');

          var departmentPanelSelectedItems = [];
          var groupPanelSelectedItems = [];

           // get user selected Object push in Array
            for(var i=0 ; i< departmentPanel.selectedItems.length ; i++){

                departmentPanelSelectedItems.push(departmentPanel.datasource.data[departmentPanel.selectedItems[i]]);
            }

            for(var i=0 ; i< groupPanel.selectedItems.length ; i++){

                groupPanelSelectedItems.push(groupPanel.datasource.data[groupPanel.selectedItems[i]]);
            }

            GeckoJS.Configure.write('vivipos.fec.settings.rptConfigure.department', GeckoJS.BaseObject.serialize(departmentPanelSelectedItems));
            GeckoJS.Configure.write('vivipos.fec.settings.rptConfigure.group', GeckoJS.BaseObject.serialize(groupPanelSelectedItems));

  //OSD          GREUtils.Dialog.alert(this.topmostWindow, _('Save'),_("Settings saved successful"));
            this.load();
        },

        load: function(){

            //load department and group
            var allCate  = GeckoJS.Session.get('categories');
               
            var plugroupModel = new PlugroupModel();
            var plugroups = plugroupModel.find('all', {order: 'display_order, name'});

            window.viewHelper = new opener.GeckoJS.NSITreeViewArray(allCate);

            document.getElementById('departmentscrollablepanel').datasource = window.viewHelper ;

            window.viewHelper = new opener.GeckoJS.NSITreeViewArray(plugroups);

            document.getElementById('groupscrollablepanel').datasource = window.viewHelper ;


            //load user setting, which be selected
            var departmentPref = GeckoJS.BaseObject.unserialize( GeckoJS.Configure.read('vivipos.fec.settings.rptConfigure.department'));
            var groupPref = GeckoJS.BaseObject.unserialize( GeckoJS.Configure.read('vivipos.fec.settings.rptConfigure.group'));

            var departmentPanel =  document.getElementById('departmentscrollablepanel');
            var groupPanel      =  document.getElementById('groupscrollablepanel');
            
            var selectedItems = [];

           // set department panel
            for(var x = 0 ; x < departmentPanel.datasource.data.length ; x++){

                for(var j = 0 ; j< departmentPref.length ; j++){

                    if(departmentPanel.datasource.data[x].name == departmentPref[j].name)
                        selectedItems.push(x);
                }
            }
            departmentPanel.selectedItems = selectedItems;
            this.departmentUserSetting = GeckoJS.Array.makeArray(selectedItems);

            // set group panel
            selectedItems = [];
            
            for(var x = 0 ; x < groupPanel.datasource.data.length ; x++){

                for(var j = 0 ; j< groupPref.length ; j++){

                    if(groupPanel.datasource.data[x].name == groupPref[j].name)
                        selectedItems.push(x);
                }
            }
            groupPanel.selectedItems = selectedItems;
            this.groupUserSetting = GeckoJS.Array.makeArray(selectedItems);
        },

        isArrayEqual: function(a1, a2){
            
            if( a1.length != a2.length )
                return false;

            for(var i = 0 ; i < a1.length ; i++){

                if(a1[i] != a2[i])
                return false;
            }
            return true;
        },
        
        test: function(){


            var a =  document.getElementById('departmentscrollablepanel');
            var b =  document.getElementById('groupscrollablepanel') ;

            var list = [];
            a.selectAll();
/*
            for(var i=0 ; i< a.selectedItems.length ; i++){

                list.push(a.datasource.data[a.selectedItems[i]]);
            }

            GeckoJS.Configure.write('vivipos.fec.settings.rptConfigure.Department', GeckoJS.BaseObject.serialize(list));


            var x = 0;*/
        },

        test2: function(){

            var g = GeckoJS.BaseObject.unserialize( GeckoJS.Configure.read('vivipos.fec.settings.rptConfigure.Department'));
            var a =  document.getElementById('departmentscrollablepanel');
            var selecteditems = [];

            for(var x = 0 ; x < a.datasource.data.length ; x++){

                for(var j = 0 ; j< g.length ; j++){

                    if(a.datasource.data[x].name == g[j].name)
                        selecteditems.push(x);
                }
            }

           a.selectedItems = selecteditems;

            var x = 0;
        },

        exit: function(){

           // check if setting modify
             var departmentPanel =  document.getElementById('departmentscrollablepanel');
             var groupPanel      =  document.getElementById('groupscrollablepanel');

             var isModify = !(this.isArrayEqual(this.departmentUserSetting, departmentPanel.selectedItems) &&
                              this.isArrayEqual(this.groupUserSetting, groupPanel.selectedItems));

             if(isModify == true){

                   var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
             
                   var check = {data: false};
                   var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                               prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING +
                               prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;
                /* action = 0  Save
                 * action = 1  Cancal
                 * action = 2  Discard    */
                    var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),_('The Setting is modified, save ?'),
                                               flags, _('Save'), '', _('Discard Changes'), null, check);

                    switch( action )
                     {
                         case 0: this.save();
                                 window.close();
                                 
                         case 1: return ;

                         case 2: window.close();
                     }
                 }
            window.close();
        }

    };

    RptBaseController.extend( __controller__ );
} )();
