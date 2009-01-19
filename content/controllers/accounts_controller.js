(function(){

    /**
     * Class ViviPOS.JobsController
     */
    // GeckoJS.define('ViviPOS.JobsController');

    GeckoJS.Controller.extend( {
        name: 'Accounts',
        scaffold: true,
	
        _listObj: null,
        _listDatas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('accountscrollablepanel');
            }
            return this._listObj;
        },

        /*
        beforeScaffold: function(evt) {
            
        },
        */
        beforeScaffoldAdd: function(evt) {
            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300";
            var inputObj = {input0:null, input1:null};
            window.openDialog(aURL, "prompt_additem", features, "New Job", "Please input:", "Job Name", "", inputObj);
            if (inputObj.ok && inputObj.input0) {
                $("#account_id").val('');
                
                evt.data.id = '';
                evt.data.jobname = inputObj.input0;
            } else {
                evt.preventDefault();
            }
            evt.preventDefault();
        },

        /*
        afterScaffoldAdd: function(evt) {

        },
        */

        beforeScaffoldSave: function(evt) {
            // this.log(this.dump(evt));

        },

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
            var panelView =  new GeckoJS.NSITreeViewArray(evt.data);
            this.getListObj().datasource = panelView;
        },

        load: function (data) {
            this.requestCommand('list');
        },

        select: function(index){
            if (index >= 0) {
                var account = this._listDatas[index];
                this.requestCommand('view', account.id);
                this._listObj.selectedIndex = index;
            }
        }

    });


})();

