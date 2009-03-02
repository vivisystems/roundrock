(function(){

    GeckoJS.Controller.extend( {
        name: 'Annotations',

        _orderId: null,
        _codeObj: null,
        _viewObj: null,
        _typeObj: null,
        _codeDatas: [],
        _typeDatas: [],
        _annotationDatas: [],
        _textboxObj: null,

        initial: function() {
            // load default annotation
            var datastr = GeckoJS.Configure.read('vivipos.fec.settings.Annotations');
            var listDatas = null;

            if (datastr != null) {
                listDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datastr));
            }
            GeckoJS.Session.set('annotations', listDatas);

        },

        /*
         * This section deals with management of annotation codes/types
         */

        getCodeListObj: function() {
            if(this._codeObj == null) {
                this._codeObj = document.getElementById('annotationscrollablepanel');
            }
            return this._codeObj;
        },

        loadCodes: function () {

            if (this._codeDatas.length <= 0) {
                var datas = GeckoJS.Configure.read('vivipos.fec.settings.Annotations');
                if (datas != null) this._codeDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datas));
                if (this._codeDatas.length <= 0) this._codeDatas = [];
            }

            this.getCodeListObj().datasource = this._codeDatas;

            this.validateCodeForm();
        },

        addAnnotationCode: function(){
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
            var inputObj = {input0:null, require0:true, alphaOnly0:true, input1:null, require1:true};

            window.openDialog(aURL, _('Add New Annotation Code'), features, _('New Annotation Code'), '', _('Code'), _('Type'), inputObj);
            if (inputObj.ok && inputObj.input0) {
                var annotationCode = inputObj.input0.replace('\'', '"', 'g');

                var dupCodes = new GeckoJS.ArrayQuery(this._codeDatas).filter('code = \'' + annotationCode + '\'');
                if (dupCodes.length > 0) {
                    // @todo OSD
                    NotifyUtils.warn(_('Annotation code [%S] already exists', [annotationCode]));
                    return;
                }

                this._codeDatas.push({code: annotationCode, type: inputObj.input1});

                this.saveAnnotationCodes();

                // loop through this._codeDatas to find the newly added annotation and select it
                for (var index = 0; index < this._codeDatas.length; index++) {
                    if (this._codeDatas[index].code == annotationCode) {
                        this.selectCode(index);
                        break;
                    }
                }

                // @todo OSD
                OsdUtils.info(_('Annotation code [%S] added successfully', [annotationCode]));
            }
        },

        modifyAnnotationCode: function() {
            var inputObj = GeckoJS.FormHelper.serializeToObject('annotationCodeForm');
            var index = this.getCodeListObj().selectedIndex;
            if (index > -1) {
                if (inputObj.code != null && inputObj.code.length > 0) {
                    this._codeDatas[index].type = GeckoJS.String.trim(inputObj.type);

                    this.saveAnnotationCodes();

                    var annotationCode = this._codeDatas[index].code;
                    OsdUtils.info(_('Annotation code [%S] modified successfully', [annotationCode]));
                }
                else {
                    // shouldn't happen, but check anyways
                    NotifyUtils.warn(_('Annotation code must not be empty'));
                }
            }
        },

        deleteAnnotationCode: function(){
            var index = this.getCodeListObj().selectedIndex;
            if (index >= 0) {
                var annotationCode = this._codeDatas[index].code;

                if (!GREUtils.Dialog.confirm(null, _('confirm delete annotation code [%S]', [annotationCode]),
                                             _('Are you sure you want to delete annotation code [%S]?', [annotationCode]))) {
                    return;
                }

                this._codeDatas.splice(index, 1);

                this.saveAnnotationCodes();

                // @todo OSD
                OsdUtils.info(_('Annotation code [%S] deleted successfully', [annotationCode]));

                this.loadCodes();

                index = this.getCodeListObj().selectedIndex;
                if (index >= this._codeDatas.length) index = this._codeDatas.length - 1;
                this.selectCode(index);
            }
        },

        saveAnnotationCodes: function() {
            var datas = new GeckoJS.ArrayQuery(this._codeDatas).orderBy('code asc');
            var datastr = GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(datas));
            GeckoJS.Configure.write('vivipos.fec.settings.Annotations', datastr);
            GeckoJS.Session.set('annotations', datas);

            this.loadCodes();
        },

        validateCodeForm: function() {

            var modifyBtn = document.getElementById('modify_annotation');
            var deleteBtn = document.getElementById('delete_annotation');
            var annotationTextbox = document.getElementById('annotation_type');

            var panel = this.getCodeListObj();
            if (panel.selectedIndex > -1) {
                deleteBtn.removeAttribute('disabled');
                if (GeckoJS.String.trim(annotationTextbox.value).length > 0) {
                    modifyBtn.removeAttribute('disabled');
                }
                else {
                    modifyBtn.setAttribute('disabled', true);
                }
                annotationTextbox.removeAttribute('disabled');
            } else {
                deleteBtn.setAttribute('disabled', true);
                modifyBtn.setAttribute('disabled', true);
                annotationTextbox.setAttribute('disabled', true);
            }
        },
	
        selectCode: function(index){
            this.getCodeListObj().vivitree.selection.select(index);
            if (index > -1) {
                var inputObj = this._codeDatas[index];
                GeckoJS.FormHelper.unserializeFromObject('annotationCodeForm', inputObj);

            }
            else {
                GeckoJS.FormHelper.reset('annotationCodeForm');
            }

            this.validateCodeForm();
        },

        /*
         * This section deals with viewing/adding annotations
         */

        getViewListObj: function() {
            if(this._viewObj == null) {
                this._viewObj = document.getElementById('viewscrollablepanel');
            }
            return this._viewObj;
        },

        getTypeListObj: function() {
            if(this._typeObj == null) {
                this._typeObj = document.getElementById('typescrollablepanel');
            }
            return this._typeObj;
        },

        getOrderId: function() {
            if (this._orderId == null) {
                this._orderId = document.getElementById('order_id').value;
            }
            return this._orderId;
        },

        getTextboxObj: function() {
            if (this._textboxObj == null) {
                this._textboxObj = document.getElementById('annotation_text');
            }
            return this._textboxObj;
        },

        loadViews: function(codes) {

            this.loadAnnotations();

            this.loadTypes(codes);
            
            this.validateAnnotateForm();
        },

        loadAnnotations: function() {
            var orderId = this.getOrderId();

            // load list of annotations
            if (this._annotationDatas.length <= 0) {
                this._annotationDatas = this.retrieveAnnotations(orderId);
                if (this._annotationDatas.length <= 0) this._annotationDatas = [];
            }

            this.getViewListObj().datasource = this._annotationDatas;
        },

        loadTypes: function(filters) {
            // load list of annotation types
            if (this._typeDatas.length <= 0) {
                var types = [];
                var datas = GeckoJS.Configure.read('vivipos.fec.settings.Annotations');
                if (datas != null) types = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datas));
                if (types.length <= 0) types = [];
                else new GeckoJS.ArrayQuery(types).orderBy('type asc');

                if (filters && filters.length > 0) {
                    this._typeDatas = [];

                    var self = this;
                    types.forEach(function(t) {
                        if (filters.indexOf(t.code) > -1) {
                            self._typeDatas.push(t);
                        }
                    });
                }
                else {
                    this._typeDatas = types;
                }
            }

            this.getTypeListObj().datasource = this._typeDatas;
        },

        addAnnotation: function() {
            var typeList = this.getTypeListObj();
            var typeIndex = typeList.selectedIndex;

            var textBox = this.getTextboxObj();
            var text = textBox.value;

            var orderId = this.getOrderId();

            if (typeIndex > -1 && text.length > 0) {
                var annotationType = this._typeDatas[typeIndex].type;

                if (this.Acl.isUserInRole('acl_modify_annotations')) {
                    this.annotate(orderId, annotationType, text);
                }
                else {
                    // no privilege to modify annotation, we must make sure we don't
                    // overwrite existing annotation of the same type
                    var existingAnnotation = this.retrieveAnnotation(orderId, annotationType);
                    if (existingAnnotation == '') {
                        this.annotate(orderId, annotationType, text);
                    }
                    else {
                        NotifyUtils.warn(_('You are not authorized to modify annotations'));
                        return;
                    }
                }

                // drop annotation data and reload
                this._annotationDatas = [];
                this.loadAnnotations();

                // loop through this._annotationDatas to find the newly added annotation and select it
                for (var index = 0; index < this._annotationDatas.length; index++) {
                    if (this._annotationDatas[index].type == annotationType) {
                        this.selectView(index);
                        break;
                    }
                }

                // @todo OSD
                OsdUtils.info(_('Annotation [%S] added successfully', [annotationType]));
            }
        },

        modifyAnnotation: function() {
            var index = this.getViewListObj().selectedIndex;

            var textBox = this.getTextboxObj();
            var text = textBox.value;

            var orderId = this.getOrderId();

            if (index > -1 && text.length > 0) {
                var type = this._annotationDatas[index].type;
                this.annotate(orderId, type, text);

                // drop annotation data and reload
                this._annotationDatas[index].text = text;
                this.loadAnnotations();

                // @todo OSD
                OsdUtils.info(_('Annotation [%S] modified successfully', [type]));
            }
        },

        deleteAnnotation: function(){
            var index = this.getViewListObj().selectedIndex;
            if (index >= 0) {
                var annotationType = this._annotationDatas[index].type;

                if (!GREUtils.Dialog.confirm(null, _('confirm delete annotation [%S]', [annotationType]),
                                             _('Are you sure you want to delete annotation [%S]?', [annotationType]))) {
                    return;
                }

                var annotationModel = new OrderAnnotationModel();
                annotationModel.del(this._annotationDatas[index].id);

                this._annotationDatas.splice(index, 1);
                this.loadAnnotations();

                this.getTextboxObj().value = '';

                // @todo OSD
                OsdUtils.info(_('Annotation [%S] deleted successfully', [annotationType]));

                index = this.getViewListObj().selectedIndex;
                if (index >= this._annotationDatas.length) index = this._annotationDatas.length - 1;
                this.selectView(index);
            }
        },

        selectView: function(index){
            var textBox = this.getTextboxObj();
            var typeList = this.getTypeListObj();

            this.getViewListObj().vivitree.selection.select(index);

            // select type matching the view data
            var type = this._annotationDatas[index].type;
            for (var i = 0; i < this._typeDatas.length; i++) {
                if (this._typeDatas[i].type == type) {
                    typeList.vivitree.selection.select(i);
                    typeList.treeBoxObject.ensureRowIsVisible(i);
                    break;
                }
            }

            // copy view data text into the textbox
            textBox.value = this._annotationDatas[index].text;
            textBox.select();
            textBox.focus();

            this.validateAnnotateForm();
        },

        selectType: function(index){
            this.getTypeListObj().vivitree.selection.select(index);

            var textBox = this.getTextboxObj();
            textBox.select();
            textBox.focus();
            
            this.validateAnnotateForm();
        },

        validateAnnotateForm: function() {

            var addBtn = document.getElementById('add_annotation');
            var modBtn = document.getElementById('modify_annotation');
            var delBtn = document.getElementById('delete_annotation');

            var typeList = this.getTypeListObj();
            var viewList = this.getViewListObj();
            var textBox = this.getTextboxObj();
            var text = textBox.value;

            if (text != null) text = GeckoJS.String.trim(text);

            // can user add?
            if (this.Acl.isUserInRole('acl_annotate')) {
                if (typeList.selectedIndex > -1 && text.length > 0) {
                    addBtn.setAttribute('disabled', false);
                }
                else {
                    addBtn.setAttribute('disabled', true);
                }
            }
            else {
                addBtn.setAttribute('disabled', true);
            }

            // can user modify?
            if (this.Acl.isUserInRole('acl_modify_annotations')) {
                if (viewList.selectedIndex > -1 && text.length > 0) {
                    modBtn.setAttribute('disabled', false);
                }
                else {
                    modBtn.setAttribute('disabled', true);
                }
            }
            else {
                modBtn.setAttribute('disabled', true);
            }

            // can user delete?
            if (this.Acl.isUserInRole('acl_delete_annotations') &&
                viewList.selectedIndex > -1) {
                delBtn.setAttribute('disabled', false);
            }
            else {
                delBtn.setAttribute('disabled', true);
            }
        },

        /*
         * the following functions are APIs for manipulating annotations
         */

        getAnnotationType: function(annotationCode) {
            // check if annotation is valid
            var annotations = GeckoJS.Session.get('annotations');
            var results = new GeckoJS.ArrayQuery(annotations).filter('code = \'' + annotationCode + '\'');
            if (results == null || results.length == 0) {
                return null;
            }
            else {
                return results[0].type;
            }
        },

        annotate: function(order_id, type, text) {
            var annotationModel = new OrderAnnotationModel();
            var annotation = annotationModel.find('first', {
                                                    conditions: 'order_id = \'' + order_id + '\' AND type = \'' + type + '\'',
                                                    recursive: 0
                                                  });
            if (annotation != null) {
                annotation.text = text;
                annotationModel.id = annotation.id;
            }
            else {
                annotation = {order_id: order_id,
                              type: type,
                              text: text};
            }
            annotationModel.save(annotation);
        },
	
        retrieveAnnotation: function(order_id, type) {
            var annotationModel = new OrderAnnotationModel();
            var annotation = annotationModel.find('first', {
                                                    conditions: 'order_id = \'' + order_id + '\' AND type = \'' + type + '\'',
                                                    recursive: 0
                                                  });
            if (annotation != null) {
                return annotation.text;
            }
            return '';
        },

        retrieveAnnotations: function(order_id) {
            var annotationModel = new OrderAnnotationModel();
            return annotationModel.findByIndex('all', {index: 'order_id', value: order_id, order: 'type', recursive: 0});
        }

    });

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('onInitial', function() {
                                            main.requestCommand('initial', null, 'Annotations');
                                      });

    }, false);

})();

