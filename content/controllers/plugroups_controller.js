(function(){

    /**
     * Class TempleteController
     */

    GeckoJS.Controller.extend( {
        name: 'Plugroups',
        scaffold: true,
        uses: [],
        _listObj: null,
        _listDatas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('groupscrollablepanel');
            }
            return this._listObj;
        },

        /*
        beforeScaffold: function(evt) {
            
        },
        */

        beforeScaffoldAdd: function(evt) {
            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {input0:null, input1:null};
            window.openDialog(aURL, "prompt_additem", features, "New Group", "Please input:", "Name", "", inputObj);
            if (inputObj.ok && inputObj.input0) {
                $("#plugroup_id").val('');
                evt.data.name = inputObj.input0;
            } else {
                evt.preventDefault();
            }
        },

        /*
        afterScaffoldAdd: function(evt) {

        },
        */

        /*
        beforeScaffoldEdit: function(evt) {

        },
        */

        /*
        afterScaffoldEdit: function(evt) {

        },
        */

        /*
        beforeScaffoldView: function(evt) {

        },
        */

        /*
        afterScaffoldView: function(evt) {

        },
        */

        /*
        beforeScaffoldSave: function(evt) {

        },
        */

        afterScaffoldSave: function(evt) {
            this.load(evt.data);
        },

        beforeScaffoldDelete: function(evt) {
            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?") == false) {
                evt.preventDefault();
            }
        },

        afterScaffoldDelete: function() {
            this.load();
        },

        afterScaffoldIndex: function(evt) {
            this._listDatas = evt.data;
            GeckoJS.Session.add('pluGroups', evt.data);
this.log(this.dump(evt.data));
            var panelView =  new GeckoJS.NSITreeViewArray(evt.data);
            this.getListObj().datasource = panelView;
        },

        load: function (data) {
            this.requestCommand('list');
            
        },

        select: function(index){
            if (index >= 0) {
                GeckoJS.FormHelper.reset('plugroupForm');
                this.requestCommand('view', this._listDatas[index].id);
                this._listObj.selectedIndex = index;
            }
        }
	
    });


})();

