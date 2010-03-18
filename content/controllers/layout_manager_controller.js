(function(){

    var __layout_manager_controller__ = {

        name: 'LayoutManager',

        _layouts: {},
        _selectedLayout: '',
        _fields: [],
        _rbObj: null,

        getRichlistbox: function() {
            this._rbObj = this._rbObj || document.getElementById('rbSelectLayout');
            return this._rbObj;
        },

        initial: function() {

            var width = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            var height = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;
            var resolution = width + 'x' + height;

            var prefwin = document.getElementById('prefwin');
            if (prefwin) {
                prefwin.width=width;
                prefwin.height=height;
                prefwin.dlgbuttons='accept,help';
            }

            var selectedLayout = GeckoJS.Configure.read('vivipos.fec.general.layouts.selectedLayout') || 'traditional';
            var layouts = GeckoJS.Configure.read('vivipos.fec.registry.layouts') || {};

            var observer = {
                observe : function (subject, topic, data) {
                    if (topic == 'xul-overlay-merged') {
                        // each layout preference overlay may specify its own startup function
                        if (typeof prefs_overlay_startup == 'function') {
                            prefs_overlay_startup();
                        }
                    }
                }
            };

            var prefsOverlayUri = 'chrome://viviecr/content/layouts/traditional/traditional_prefs.xul'
            if (layouts[selectedLayout]) {
                prefsOverlayUri = layouts[selectedLayout]['prefs_overlay_uri'] || prefsOverlayUri;
            }
            try {
                document.loadOverlay(prefsOverlayUri, observer);
            }
            catch(e) {
                this.log('ERROR', 'error loading layout preference uril [' + prefsOverlayUri + ']: ' + this.dump(e));
                GREUtils.Dialog.alert(this.topmostWindow, _('Layout Preference Error'),
                                      _('Failed to load preference panel(s) for selected layout'));
            }
            //displayPane.src = prefsOverlayUri;

            // always start on first pane to avoid XUL bug where displayPane is not rendered
            var firstPane = document.getElementById('panelSettingsPane');
            if (firstPane && prefwin) prefwin.showPane(firstPane);

            var rbObj = this.getRichlistbox();

            // filter layouts by resolution
            var index = -1;
            var selectedIndex = -1;
            for (var key in layouts) {
                if (GeckoJS.String.contains(layouts[key].resolutions, resolution)) {
                    this.appendItem(rbObj, layouts[key], key);
                    index++;
                    if (selectedLayout == key) selectedIndex = index;
                }
                else {
                    delete layouts[key];
                }
            }
            this._layouts = layouts;
            this._selectedLayout = rbObj.value = selectedLayout;

            rbObj.selectedIndex = selectedIndex;
            rbObj.ensureIndexIsVisible(selectedIndex);

            // build list of cart display fields
            var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
            var cart = mainWindow.document.getElementById('cartList');
            var fieldListObj = document.getElementById('cartscrollablepanel');
            var displayFields = GeckoJS.Configure.read('vivipos.fec.settings.layout.CartDisplayFields') || '';

            var headers = cart.getAttribute('headerlist') || '';
            var fields = cart.getAttribute('fieldlist') || '';

            var headerArray = headers.split(',');
            var fieldArray = fields.split(',');
            var displayArray = displayFields.split(',');

            var selectedItems = [];
            if (fieldArray.length > 0) {

                var data = [];
                fieldArray.forEach(function(f, i) {
                    if (f) {
                        this._fields.push(f);
                        data.push({header: headerArray[i] ? headerArray[i] : f, field: f});
                        if (displayArray.indexOf(f) > -1) selectedItems.push(i);
                    }
                }, this);

                fieldListObj.datasource = data;
                fieldListObj.value = selectedItems;
            }

            // populate cart status dock target panels
            var selectedElement = GeckoJS.Configure.read('vivipos.fec.settings.layout.cartstatus.selectedElement') || '';
            var selectedDirection = GeckoJS.Configure.read('vivipos.fec.settings.layout.cartstatus.selectedDirection') || 'none';

            // populate relation element list
            var elemObj = document.getElementById('cartstatus_relation_element');
            var elements = mainWindow.$('box[panel]');
            for (let j = 0; j < elements.length; j++) {
                elemObj.appendItem(elements[j].getAttribute('panel'), elements[j].getAttribute('id'));
            };

            $('#cartstatus_relation_element').val(selectedElement);
            $('#cartstatus_relation_direction').val(selectedDirection);
            
            if (selectedDirection == 'none') {
                document.getElementById('cartstatus_relation_element').setAttribute('disabled', true);
            }

            // populate OSD panel overlay target
            var selectedTarget = GeckoJS.Configure.read('vivipos.fec.settings.osdPanel.OverlayTarget') || 'none';
            var targetObj = document.getElementById('osdpanel_overlay_target');
            var $targets = mainWindow.$('#mainPanel').children('box');
            
            for (let j = 0; j < elements.length; j++) {
                targetObj.appendItem(elements[j].getAttribute('panel'), elements[j].getAttribute('id'));
            };

            $targets.each(function(index, elem) {
                targetObj.appendItem(elem.getAttribute('panel') || elem.getAttribute('id'), elem.getAttribute('id'));
            });

            $('#osdpanel_overlay_target').val(selectedTarget);
            this.setOsdPanelTarget(selectedTarget);

            // populate OSD panel access
            var prefsRowsObj = document.getElementById('osd_prefs_rows');

            var osdUsers = GeckoJS.Configure.read('vivipos.fec.registry.osdpanel');
            var count = 0;
            for (let key in osdUsers) {
                let setting = osdUsers[key];

                // retrieve preference
                let prefKey = 'vivipos.fec.settings.osdPanel.access.' + key;
                let prefix = 'osdpanel_access_';
                let prefValue = GeckoJS.Configure.read(prefKey) || false;

                // create UI tags
                let rowObj = document.createElement('row');

                // first column: label or spacer
                let col1;
                if (count++ == 0) {
                    col1 = document.createElement('label');
                    col1.setAttribute('value', _('Panel access'));
                }
                else {
                    col1 = document.createElement('spacer');
                }

                // second column: checkbox with label
                var labelStr = '' ;
                if (setting.label.indexOf('chrome://') != -1) {
                    var keystr = 'vivipos.fec.registry.osdpanel.' + key +'.label';
                    labelStr = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
                }else {
                    labelStr = setting.label;
                }
                let col2 = document.createElement('checkbox');
                col2.setAttribute('id', prefix + '_active_' + key);
                col2.setAttribute('label', labelStr);
                col2.checked = prefValue;

                // third column: templates
                let col3 = document.createElement('menulist');
                col3.setAttribute('flex', '1');
                col3.setAttribute('id', '_template_' + key);
                let menupop = document.createElement('menupopup');
                col3.appendChild(menupop);

                rowObj.appendChild(col1);
                rowObj.appendChild(col2);
                rowObj.appendChild(col3);

                prefsRowsObj.appendChild(rowObj);
            }
        },

        setOsdPanelTarget: function(selectedTarget) {
            let x = 0, y = 0, w = 0, h = 0;

            GeckoJS.Configure.write('vivipos.fec.settings.osdPanel.OverlayTarget', selectedTarget);
            if (selectedTarget != 'custom' && selectedTarget != 'none') {
                let mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                    .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
                //let targetObj = mainWindow.$('#' + selectedTarget);
                let targetObj = mainWindow.document.getElementById(selectedTarget);
                if (targetObj) {
                    x = targetObj.boxObject.screenX;
                    y = targetObj.boxObject.screenY;
                    w = targetObj.clientWidth;
                    h = targetObj.clientHeight;
                }
            }

            let overlayX = document.getElementById('osdpanel_overlay_x');
            let overlayY = document.getElementById('osdpanel_overlay_y');
            let overlayW = document.getElementById('osdpanel_overlay_w');
            let overlayH = document.getElementById('osdpanel_overlay_h');

            if (overlayX) overlayX.disabled = (selectedTarget != 'custom');
            if (overlayY) overlayY.disabled = (selectedTarget != 'custom');
            if (overlayW) overlayW.disabled = (selectedTarget != 'custom');
            if (overlayH) overlayH.disabled = (selectedTarget != 'custom');
        },

        setCartStatusPosition: function(selectedDirection) {
            if (selectedDirection == 'none') {
                document.getElementById('cartstatus_relation_element').setAttribute('disabled', true);
            }
            else {
                document.getElementById('cartstatus_relation_element').removeAttribute('disabled');
            }
        },

        appendItem: function(box, data, value) {
            
            /*
             *              <richlistitem value='' >
                                <hbox flex='1'>
                                    <vbox>
                                        <label value='label' flex='1'/>
                                        <image src='' flex='1'/>
                                    </vbox>
                                    <textbox value='desc' />
                                </hbox>
                            </richlistitem>

             * 
             */

            var item = document.createElement('richlistitem');
            item.setAttribute('value', value);

            var hbox = document.createElement('hbox');
            hbox.setAttribute('flex', '1');

            var image = document.createElement('image');
            image.setAttribute('src', data.icon);
            image.setAttribute('flex', '1');

            var vbox = document.createElement('vbox');

            // get localed label
            var labelStr = '' ;
            if (data.label.indexOf('chrome://') != -1) {
                var keystr = 'vivipos.fec.registry.layouts.' + value +'.label';
                labelStr = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
            }else {
                labelStr = data.label;
            }
            var label = document.createElement('label');
            label.setAttribute('value', labelStr);
            label.setAttribute('flex', '1');

            // get localed desc
            var descStr = '' ;
            if (data.desc.indexOf('chrome://') != -1) {
                var keystr = 'vivipos.fec.registry.layouts.' + value +'.desc';
                descStr = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
            }else {
                // use i18n
                descStr = data.desc;
            }
            var desc = document.createElement('textbox');
            desc.setAttribute('value', descStr);
            desc.setAttribute('readonly', true);
            desc.setAttribute('multiline', true);
            desc.setAttribute('rows', 6);
            desc.setAttribute('flex', '1');

            // maintaince DOM
            vbox.appendChild(label);
            vbox.appendChild(image);
            hbox.appendChild(vbox);
            hbox.appendChild(desc);
            item.appendChild(hbox);
            box.appendChild(item);

            return;

        },

        select: function(obj) {
            
            obj.ensureIndexIsVisible(obj.selectedIndex);

            var layouts = this._layouts;
            var layout = layouts[obj.value];
            if (layout) {
                this.updateLayoutUI(layout);
            }
        },

        updateLayoutUI: function(layout) {

            var disabled_features = (layout['disabled_features'] || '').split(',');
            $('*[feature]').each(function(i) {
                var action = this.getAttribute('feature');
                if(GeckoJS.Array.inArray(this.id, disabled_features) != -1) {
                    this.setAttribute(action, true) ;
                }else {
                    this.setAttribute(action, false) ;
                }
            });
        },
        
        close: function() {

            var screenWidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            var screenHeight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            var layouts = this._layouts;
            var rbObj = this.getRichlistbox();
            var newSelectedLayout = rbObj.value;
            var layout = layouts[newSelectedLayout];
            var changedSkin = '';

            if(layout) {
                // replace prefs width/height to current resolution.
                changedSkin = layout.skin.replace('${width}', screenWidth).replace('${height}', screenHeight );
            }

            var changedLayout = this._selectedLayout != newSelectedLayout;
            // changed layout, prompt restart vivipos
            if(changedLayout) {
                // prompt
                    
                var confirmMessage = _('If you change layout now, the system will restart automatically after you return to the Main Screen. Are you sure you want to change layout?');

                if (GREUtils.Dialog.confirm(this.topmostWindow, _('Confirm Change Layout'), confirmMessage)) {

                    if(changedSkin.length > 0 ) {
                        GeckoJS.Configure.write('general.skins.selectedSkin', changedSkin);
                    }
                    GeckoJS.Configure.write('vivipos.fec.general.layouts.selectedLayout', newSelectedLayout);
                    GeckoJS.Observer.notify(null, 'prepare-to-restart', this);
                }

            }
            else {
                GREUtils.Dialog.alert(this.topmostWindow, _('Layout Manager'), _('Layout settings saved'));
            }

            // update cart status panel
            var dir = document.getElementById('cartstatus_relation_direction').value;
            var elem = document.getElementById('cartstatus_relation_element').value;

            GeckoJS.Configure.write('vivipos.fec.settings.layout.cartstatus.selectedElement', elem);
            GeckoJS.Configure.write('vivipos.fec.settings.layout.cartstatus.selectedDirection', dir);

            // update cart display fields
            var fieldListObj = document.getElementById('cartscrollablepanel');
            var selectedItems = fieldListObj.selectedItems;
            var displayFields = '';

            selectedItems.forEach(function(i) {
                var field = this._fields[i];
                if (field) {
                    displayFields += ((displayFields == '') ? '' : ',') + field;
                }
            }, this);
            GeckoJS.Configure.write('vivipos.fec.settings.layout.CartDisplayFields', displayFields);

            // otherwise just update options and layout
            var mainWindow = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow('Vivipos:Main');
            var main = mainWindow.GeckoJS.Controller.getInstanceByName('Main');
            
            // change button height
            var layoutController = mainWindow.GeckoJS.Controller.getInstanceByName('Layout');
            if (layoutController) layoutController.requestCommand('resetLayout', null, 'Layout');

            main.dispatchEvent('updateLayoutOptions', null);
            
            window.close();
        }


    };

    GeckoJS.Controller.extend(__layout_manager_controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'LayoutManager');
    }, false);

})();
