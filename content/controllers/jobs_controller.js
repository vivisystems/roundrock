(function(){

    /**
     * Class ViviPOS.JobsController
     */
    // GeckoJS.define('ViviPOS.JobsController');

    GeckoJS.Controller.extend( {
        name: 'Jobs',
        scaffold: true,
	
        _listObj: null,
        _listDatas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('jobscrollablepanel');
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
            window.openDialog(aURL, "prompt_additem", features, "New Job", "Please input:", "No", "Name", inputObj);
            if (inputObj.ok && inputObj.input0) {
                $("#job_id").val('');
                evt.data.jobname = inputObj.input0;
            } else {
                evt.preventDefault();
            }
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
            var jobPanelView =  new GeckoJS.NSITreeViewArray(evt.data);
            this.getListObj().datasource = jobPanelView;
        },

        load: function (data) {
            this.requestCommand('list');
        },

        select: function(index){
            if (index >= 0) {
                var job = this._listDatas[index];
                this.requestCommand('view', job.id);
                this._listObj.selectedIndex = index;
            }
        }
	
    });


})();

