(function(){

    var __controller__ = {

        name: 'Jobs',

        components: ['Form', 'Acl'],

        scaffold: true,
	
        _listObj: null,
        _listDatas: null,
        _selectedIndex: -1,

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

            if (!this.confirmChangeJob()) return;

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250';
            var inputObj = {input0:null, require0: true};

            this._jobAdded = false;

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Job'), features, _('New Job'), '', _('Job Name'), '', inputObj);
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
                NotifyUtils.warn(_('Duplicate job name [%S]; job not added.', [evt.data.jobname]));
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
                panel.ensureIndexIsVisible(newIndex);
                
                this.validateForm();

                document.getElementById('job_name').focus();

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
                    
                    NotifyUtils.warn(_('Duplicate job name [%S]; job not modified.', [evt.data.jobname]));
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
                panel.ensureIndexIsVisible(index);

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

            // make sure no user has job as his default
            var userModel = new UserModel();
            var users = userModel.findByIndex('all', {
                index: 'job_id',
                value: evt.data.id
            });

            if (users && users.length > 0) {
                NotifyUtils.warn(_('[%S] has been assigned as the default job to one or more users and may not be deleted', [jobname]));
                evt.preventDefault();
            }
            else if (GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete %S', [jobname]), _('Are you sure?')) == false) {
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
            panel.ensureIndexIsVisible(index);

            if (panel.selectedIndex == -1) {
                GeckoJS.FormHelper.reset('jobForm');
            }
            this.validateForm();

            OsdUtils.info(_('Job [%S] removed successfully', [evt.data.jobname]));
        },


        afterScaffoldIndex: function(evt) {
            
            this.getListObj().datasource = evt.data;

        },

        afterScaffoldView: function(evt) {
            var panel = this.getListObj();
            this._selectedIndex = panel.selectedIndex;
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

            var panel = this.getListObj();

            if (!this.confirmChangeJob(index)) {
                panel.selectedItems = [this._selectedIndex];
                return;
            }

            this.requestCommand('list', index);

            panel.selectedItems = [index];
            panel.selectedIndex = index;
            panel.ensureIndexIsVisible(index);
            
            this.validateForm(true);
            document.getElementById('job_name').focus();
        },

        confirmExit: function(data) {
            // check if job form has been modified
            data.close = true;
            if (this._selectedIndex != -1 && GeckoJS.FormHelper.isFormModified('jobForm')) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                             _('Discard Changes'),
                                             _('You have made changes to the current job. Are you sure you want to discard the changes?'))) {
                    data.close = false;
                }
            }
        },

        confirmChangeJob: function(index) {
            // check if job form has been modified
            if (this._selectedIndex != -1 && (index == null || (index != -1 && index != this._selectedIndex))
                && GeckoJS.FormHelper.isFormModified('jobForm')) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                             _('Discard Changes'),
                                             _('You have made changes to the current job. Are you sure you want to discard the changes?'))) {
                    return false;
                }
            }
            return true;
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

    };

    GeckoJS.Controller.extend(__controller__);

})();

