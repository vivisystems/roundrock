(function(){

    /**
     * Class ViviPOS.JobsController
     */
    // GeckoJS.define('ViviPOS.JobsController');

    GeckoJS.Controller.extend( {
        name: 'Jobs',
        components: ['Form', 'Acl'], 
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
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250';
            var inputObj = {input0:null, require0: true};

            this._jobAdded = false;

            window.openDialog(aURL, _('Add New Job'), features, _('New Job'), '', _('Job Name'), '', inputObj);
            if (inputObj.ok && inputObj.input0) {
                evt.data.id = '';
                evt.data.jobname = inputObj.input0;
            } else {
                evt.preventDefault();
                return;
            }

            // check for duplicate job names
            var jobModel = new JobModel();

            var jobs = jobModel.findByIndex('all', {
                index: "jobname",
                value: evt.data.jobname
            });

            if (jobs != null && jobs.length > 0) {
                OsdUtils.warn(_('Duplicate job name [%S]; job not added.', [evt.data.jobname]));
                evt.preventDefault();
                return ;
            }

            evt.data.id = '';

            this._jobAdded = true;
        },

        afterScaffoldAdd: function (evt) {
            // if new job exists, set selectedIndex to last item

            if (this._jobAdded) {
                var panel = this.getListObj();
                var data = panel.datasource.data;
                var newIndex = data.length;

                this.requestCommand('list', newIndex);

                panel.selectedIndex = newIndex;
                panel.selectedItems = [newIndex];

                this.validateForm();

                document.getElementById('job_name').focus();

                // @todo OSD
                OsdUtils.info(_('Job [%S] added successfully', [evt.data.jobname]));
            }
        },

        beforeScaffoldEdit: function(evt) {

            // check if modified to a duplicate job name
            var jobModel = new JobModel();

            var jobs = jobModel.findByIndex('all', {
                index: "jobname",
                value: evt.data.jobname.replace(/^\s*/, '').replace(/\s*$/, '')
            });

            this._jobModified = true;
            if (jobs != null && jobs.length > 0) {
                if ((jobs.length > 1) || (jobs[0].id != $('#job_id').val())) {
                    evt.preventDefault();
                    this._jobModified = false;
                    
                    // @todo OSD
                    OsdUtils.warn(_('Duplicate job name [%S]; job not modified.', [evt.data.jobname]));
                }
            }
        },

        afterScaffoldEdit: function (evt) {

            if (this._jobModified) {
                var panel = this.getListObj();
                var index = panel.selectedIndex;

                this.requestCommand('list', index);

                panel.selectedIndex = index;
                panel.selectedItems = [index];

                // @todo OSD
                OsdUtils.info(_('Job [%S] modified successfully', [evt.data.jobname]));
            }
        },

        afterScaffoldSave: function(evt) {
            //this.load(evt.data);
        },

        beforeScaffoldDelete: function(evt) {
            var panel = this.getListObj();
            var view = panel.datasource;
            var jobname = view.data[panel.selectedIndex].jobname;

            if (GREUtils.Dialog.confirm(null, _('confirm delete %S', [jobname]), _('Are you sure?')) == false) {
                evt.preventDefault();
            }
        },

        afterScaffoldDelete: function(evt) {

            var panel = this.getListObj();
            var view = panel.datasource;
            var index = panel.selectedIndex;

            if (index >= view.data.length - 1) {
                index = view.data.length - 2;
            }
            this.requestCommand('list', index);

            panel.selectedIndex = index;
            panel.selectedItems = [index];

            if (panel.selectedIndex == -1) {
                GeckoJS.FormHelper.reset('jobForm');
            }
            this.validateForm();

            // @todo OSD
            OsdUtils.info(_('Job [%S] removed successfully', [evt.data.jobname]));
        },


        afterScaffoldIndex: function(evt) {
            var panelView = this.getListObj().datasource;
            if (panelView == null) {
                panelView =  new GeckoJS.NSITreeViewArray(evt.data);
                this.getListObj().datasource = panelView;
            }
            panelView.data = evt.data;

            this.validateForm();
        },

        load: function () {

            var panel = this.getListObj();

            this.requestCommand('list', -1);

            panel.selectedItems = [-1];
            panel.selectedIndex = -1;

            GeckoJS.FormHelper.reset('jobForm');

            this.validateForm();
        },

        select: function(index){

            this.requestCommand('list', index);

            document.getElementById('job_name').focus();
        },

        validateForm: function() {

            // return if not in form
            var addBtn = document.getElementById('add_job');
            if (addBtn == null) return;

            var modBtn = document.getElementById('modify_job');
            var delBtn = document.getElementById('delete_job');
            var jobNameTextbox = document.getElementById('job_name');

            var panel = this.getListObj();
            if (panel.selectedIndex > -1) {
                var jobname = jobNameTextbox.value.replace(/^\s*/, '').replace(/\s*$/, '');
                modBtn.setAttribute('disabled', (jobname.length == 0));
                delBtn.setAttribute('disabled', false);
                jobNameTextbox.removeAttribute('disabled');
            }
            else {
                modBtn.setAttribute('disabled', true);
                delBtn.setAttribute('disabled', true);
                jobNameTextbox.setAttribute('disabled', true);
            }
        }

    });


})();

