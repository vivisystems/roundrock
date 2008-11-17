(function(){

    /**
     * Class ViviPOS.PluGroupsController
     */
    // GeckoJS.define('ViviPOS.JobsController');

    GeckoJS.Controller.extend( {
        name: 'Plugroups',
        scaffold: true,

        _listObj: null,
        _listDatas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = this.query("#simpleListBoxGroup")[0];
            }
            return this._listObj;
        },

        beforeScaffold: function(evt) {
            if (evt.data == 'delete') {
                if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?") == false) {
                    evt.preventDefault();
                }
            }
        },

        afterScaffoldSave: function(evt) {
            // maintain Acl...
            this.load(evt.data);
        },
        /*
        beforeScaffoldDelete: function(evt) {
            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?") == false) {
                evt.preventDefault();
            }
        },
        */
        afterScaffoldDelete: function() {
            this.load();
        },

        load: function (data) {

            // var listObj = this.getListObj();
            this.getListObj();
            // var pluGroupModel = new ViviPOS.PlugroupModel();
            var pluGroupModel = new PlugroupModel();
            var groups = pluGroupModel.find('all', {
                order: "no"
            });

            this._listDatas = groups;
            this._listObj.loadData(groups);

            var i = 0;
            var j = 0;
            if (data) {
                if ((typeof data) == 'object' ) {
                    groups.forEach(function(o) {
                        if (o.no == data.no) {
                            j = i;
                        }
                        i++;
                    });
                }
            }
            this._listObj.selectedIndex = j;
            this._listObj.ensureIndexIsVisible(j);
        },

        select: function(){

            this.getListObj();
            var selectedIndex = this._listObj.selectedIndex;
            if (selectedIndex >= 0) {
                var job = this._listDatas[selectedIndex];
                this.requestCommand('view', job.id);
            }

        }

    });


})();

