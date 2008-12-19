(function(){

    /**
     * Class ViviPOS.JobsController
     */

    GeckoJS.Controller.extend( {
        name: 'Accounts',
        scaffold: true,
        uses: ['AccountTopic'],

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
            // evt.preventDefault();

            var aURL = "chrome://viviecr/content/prompt_addaccount.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=500,height=450";
            var inputObj = {
                input0:null,
                input1:null,
                topics:null
            };
            inputObj.topics = this.AccountTopic.find('all');

            window.openDialog(aURL, "prompt_addaccount", features, inputObj);

            if (inputObj.ok) {
                $("#account_id").val('');
                
                evt.data.id = '';
                evt.data.topic_no = inputObj.topic_no;
                evt.data.topic = inputObj.topic;
                evt.data.description = inputObj.description;
                evt.data.type = inputObj.type;
                evt.data.amount = inputObj.amount;
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
            var panelView =  new GeckoJS.NSITreeViewArray(evt.data);
            this.getListObj().datasource = panelView;
        },

        load: function(data) {
            var showtype = document.getElementById('show_type').value;
            var filter = "";
            if (showtype == 'IN') filter = "type='IN'";
            else if (showtype == 'OUT') filter = "type='OUT'";
                
            this.requestCommand('list', {
                conditions: filter
            });
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

