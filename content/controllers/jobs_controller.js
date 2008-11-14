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
                this._listObj = this.query("#simpleListBoxJob")[0];
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
/*
        beforeScaffoldAdd: function (evt) {
            var user = evt.data;
            if ((user.no == '') || (user.name == '')){
                alert('user no or user name is empty...');
                evt.preventDefault();
                return ;
            }
            var userModel = new ViviPOS.UserModel();

            var user_no = userModel.findByIndex('all', {
                index: "no",
                value: user.no
            });
            var user_name = userModel.findByIndex('all', {
                index: "name",
                value: user.name
            });

            if (user_no != null) {
                alert('Duplicate user no...' + user.no);
                evt.preventDefault();
            } else if (user_name != null) {
                alert('Duplicate user name...' + user.name);
                evt.preventDefault();
            }
        },

        beforeScaffoldEdit: function (evt) {
            var user = evt.data;
            if ((user.no == '') || (user.name == '')){
                alert('user no or user name is empty...');
                evt.preventDefault();
                return ;
            }
            var userModel = new ViviPOS.UserModel();

            var user_no = userModel.findByIndex('all', {
                index: "no",
                value: user.no
            });
            var user_name = userModel.findByIndex('all', {
                index: "name",
                value: user.name
            });
            if ((user_no != null) && (user_no[0].id != this.Scaffold.currentData.id)) {
                alert('Duplicate user no...' + user.no);
                evt.preventDefault();
            } else if ((user_name != null) && (user_name[0].id != this.Scaffold.currentData.id)) {
                alert('Duplicate user name...' + user.name);
                evt.preventDefault();
            }

        },
*/
        load: function (data) {
		
            // var listObj = this.getListObj();
            this.getListObj();
            var jobModel = new ViviPOS.JobModel();
            var jobs = jobModel.find('all', {
                order: "no"
            });
            
            this._listDatas = jobs;
            this._listObj.loadData(jobs);

            var i = 0;
            var j = 0;
            if (data) {
                if ((typeof data) == 'object' ) {
                    jobs.forEach(function(o) {
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
            selectedIndex = this._listObj.selectedIndex;
            if (selectedIndex >= 0) {
                var job = this._listDatas[selectedIndex];
                this.requestCommand('view', job.id);
            }

        }
	
    });


})();

