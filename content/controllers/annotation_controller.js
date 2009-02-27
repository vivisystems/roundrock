(function(){

    GeckoJS.Controller.extend( {
        name: 'Annotations',
	
        _listObj: null,
        _listDatas: [],

        initial: function() {
            // load default annotation
            var datastr = GeckoJS.Configure.read('vivipos.fec.settings.Annotations');
            var listDatas = null;

            if (datastr != null) {
                listDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datastr));
            }
            GeckoJS.Session.set('annotations', listDatas);

        },

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('annotationscrollablepanel');
            }
            return this._listObj;
        },

        load: function (data) {

            if (this._listDatas.length <= 0) {
                var datas = document.getElementById('pref_annotations').value;
                if (datas != null) this._listDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datas));
                if (this._listDatas.length <= 0) this._listDatas = [];
            }

            this.getListObj().datasource = this._listDatas;

            this.validateForm();
        },

        addAnnotation: function(){
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
            var inputObj = {input0:null, require0:true, input1:null, require1:true};

            window.openDialog(aURL, _('Add New Annotation'), features, _('New Annotation'), '', _('Code'), _('Text'), inputObj);
            if (inputObj.ok && inputObj.input0) {
                var annotationCode = inputObj.input0;

                var dupCodes = new GeckoJS.ArrayQuery(this._listDatas).filter('code = ' + annotationCode);
                if (dupCodes.length > 0) {
                    // @todo OSD
                    NotifyUtils.warn(_('Annotation [%S] already exists', [annotationCode]));
                    return;
                }

                this._listDatas.push({code: annotationCode, type: inputObj.input1});

                this.saveAnnotations();

                // loop through this._listDatas to find the newly added annotation and select it
                var index = 0;
                for (var index = 0; index < this._listDatas.length; index++) {
                    if (this._listDatas[index].code == annotationCode) {
                        this.select(index);
                        break;
                    }
                }

                // @todo OSD
                OsdUtils.info(_('Annotation [%S] added successfully', [annotationCode]));
            }
        },

        modifyAnnotation: function() {
            var inputObj = GeckoJS.FormHelper.serializeToObject('annotationForm');
            var index = this.getListObj().selectedIndex;
            if (index > -1) {
                if (inputObj.code != null && inputObj.code.length > 0) {
                    this._listDatas[index].type = GeckoJS.String.trim(inputObj.type);

                    this.saveAnnotations();

                    var annotationCode = this._listDatas[index].code;
                    OsdUtils.info(_('Annotation [%S] modified successfully', [annotationCode]));
                }
                else {
                    // shouldn't happen, but check anyways
                    NotifyUtils.warn(_('Annotation name must not be empty'));
                }
            }
        },

        deleteAnnotation: function(){
            var index = this.getListObj().selectedIndex;
            if (index >= 0) {
                var annotationCode = this._listDatas[index].code;
                this._listDatas.splice(index, 1);
                this.saveAnnotations();

                // @todo OSD
                OsdUtils.info(_('Annotation [%S] deleted successfully', [annotationCode]));

                this.load();

                index = this.getListObj().selectedIndex;
                if (index >= this._listDatas.length) index = this._listDatas.length - 1;
                this.select(index);
            }
        },

        saveAnnotations: function() {
            var datas = new GeckoJS.ArrayQuery(this._listDatas).orderBy('code asc');
            var datastr = GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(datas));
            document.getElementById('pref_annotations').value = datastr;
            GeckoJS.Session.set('annotations', datas);

            this.load();
        },

        validateForm: function() {

            var modifyBtn = document.getElementById('modify_annotation');
            var deleteBtn = document.getElementById('delete_annotation');
            var annotationTextbox = document.getElementById('annotation_type');

            var panel = this.getListObj();
            if (panel.selectedIndex > -1) {
                deleteBtn.removeAttribute('disabled');
                if (GeckoJS.String.trim(annotationTextbox.value).length > 0)
                    modifyBtn.removeAttribute('disabled');
                else
                    modifyBtn.setAttribute('disabled', true);
                annotationTextbox.removeAttribute('disabled');
            } else {
                deleteBtn.setAttribute('disabled', true);
                modifyBtn.setAttribute('disabled', true);
                annotationTextbox.setAttribute('disabled', true);
            }
        },
	
        select: function(index){
            this.getListObj().vivitree.selection.select(index);
            if (index > -1) {
                var inputObj = this._listDatas[index];
                GeckoJS.FormHelper.unserializeFromObject('annotationForm', inputObj);

            }
            else {
                GeckoJS.FormHelper.reset('annotationForm');
            }

            this.validateForm();
        },

        getAnnotationType: function(annotationCode) {
            // check if annotation is valid
            var annotations = GeckoJS.Session.get('annotations');
            var results = new GeckoJS.ArrayQuery(annotations).filter('code = ' + annotationCode);
            if (results == null || results.length == 0) {
                return null;
            }
            else {
                return results[0].type;
            }
        }
	
    });

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('onInitial', function() {
                                            main.requestCommand('initial', null, 'Annotations');
                                      });

    }, false);

})();

