(function(){

    /**
     */

    GeckoJS.Controller.extend( {
        
        name: 'LedgerEntryTypes',
        scaffold: true,

        _listObj: null,
        _listDatas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('typescrollablepanel');
            }
            return this._listObj;
        },

        /*
        beforeScaffold: function(evt) {
            
        },
        */
        beforeScaffoldAdd: function(evt) {

            // check for duplicate transaction type
            var newType = evt.data.type.replace('\'', '"', 'g');
            var dupType = new GeckoJS.ArrayQuery(this._listDatas).filter('type = \'' + newType + '\'');
            if (dupType.length > 0) {
                NotifyUtils.warn(_('Ledger transaction type [%s] already exists', [newType]));
                evt.preventDefault();
            }
            /*
            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
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
            */
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
            if (evt.data.builtin != 'false') {
                NotifyUtils.warn(_('Can not delete built-in ledger transaction type'));
                evt.preventDefault();
                return;
            }
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

            panelView.getCellValue= function(row, col) {

                var text;
                if (col.id == 'mode') {
                    text = _(this.data[row][col.id]);
                }
                else {
                    text = this.data[row][col.id];
                }
                return text;
            };
            this.getListObj().datasource = panelView;

            if (this._listDatas.length > 0)
                this.getListObj().view.selection.select(0);
            else
                this.getListObj().view.selection.clearSelection();
        },

        load: function() {
            this.requestCommand('list', {});
        },

        select: function(index){
            if (index >= 0) {
                var entry_type = this._listDatas[index];
                this.requestCommand('view', entry_type.id);
                this._listObj.selectedIndex = index;
            }
        }

    });


})();

