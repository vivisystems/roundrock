(function(){

    /**
     * Controller Promotions Manager
     * 
     */
    var __layout_manager_controller__ = {

        name: 'LayoutManager',

        _layouts: {},

        _selectedLayout: '',

        _rbObj: null,

        getRichlistbox: function() {
            this._rbObj = this._rbObj || document.getElementById('rbSelectLayout');
            return this._rbObj;
        },

        /*
         * initial promotions rules for register
         */
        initial: function() {


            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            document.getElementById('prefwin').width=width;
            document.getElementById('prefwin').height=height;
            document.getElementById('prefwin').dlgbuttons="accept,help";

            var selectedLayout = GeckoJS.Configure.read('vivipos.fec.general.layouts.selectedLayout') || 'traditional';
            var layouts = GeckoJS.Configure.read('vivipos.fec.registry.layouts') || {};

            var rbObj = this.getRichlistbox();


            for (var key in layouts) {

                this.appendItem(rbObj, layouts[key], key);
            }

            rbObj.value = selectedLayout;

            this._selectedLayout = selectedLayout;

            this._layouts = layouts;

            this.updateLayoutUI(layouts[selectedLayout]);

        },

        appendItem: function(box, data, value) {
            
            /*
             *              <richlistitem value="" >
                                <hbox flex="1">
                                    <image src="" />
                                    <vbox flex="1">
                                    <label value="label" />
                                    <label value="desc" />
                                    </vbox>
                                </hbox>
                            </richlistitem>

             * 
             */

             var item = document.createElement('richlistitem');
             item.setAttribute('value', value);

             var hbox = document.createElement('hbox');
             hbox.setAttribute('flex', "1");

             var image = document.createElement('image');
             image.setAttribute('src', data.icon);

             var vbox = document.createElement('vbox');
             vbox.setAttribute('flex', "1");

             // get localed label
             var labelStr = "" ;
             if (data.label.indexOf("chrome://") != -1) {
                labelStr = GeckoJS.StringBundle.getPrefLocalizedString("vivipos.fec.registry.layouts." + value +".label") || "No Label";
             }else {
                // use i18n
                  labelStr = _(data.label);
             }
             var label = document.createElement('label');
             label.setAttribute('value', labelStr);

             // get localed desc
             var descStr = "" ;
             if (data.desc.indexOf("chrome://") != -1) {
                descStr = GeckoJS.StringBundle.getPrefLocalizedString("vivipos.fec.registry.layouts." + value +".desc") || "No Desc";
             }else {
                // use i18n
                  descStr = _(data.desc);
             }
             var desc = document.createElement('label');
             desc.setAttribute('value', descStr);

             // maintaince DOM
             vbox.appendChild(label);
             vbox.appendChild(desc);
             hbox.appendChild(image);
             hbox.appendChild(vbox);
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

            var disabled_features = (layout['disabled_features'] || "").split(",");
            $("*[feature]").each(function(i) {
                var action = this.getAttribute('feature');
                if(GeckoJS.Array.inArray(this.id, disabled_features) != -1) {
                    this.setAttribute(action, true) ;
                }else {
                    this.setAttribute(action, false) ;
                }

            });
        },
        
        close: function() {

            var rbObj = this.getRichlistbox();

            var newSelectedLayout = rbObj.value;

            var changedLayout = this._selectedLayout != newSelectedLayout;
            // changed layout, prompt restart vivipos
            if(changedLayout) {
                // prompt

                var confirmMessage = _("Do you want to change layout") + "\n" + _("If you change layout now, the system will restart automatically after you return to the Main Screen.");

                if (GREUtils.Dialog.confirm(this.window, _("Confirm Change Layout"), confirmMessage)) {

                        GeckoJS.Configure.write('vivipos.fec.general.layouts.selectedLayout', newSelectedLayout);
                        GeckoJS.Observer.notify(null, 'prepare-to-restart', this);
                        return;
                        
                }

            }

            // otherwise just update options and layout
            // mainWindow register promotions rules
            var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

            // change button height
            var main = mainWindow.GeckoJS.Controller.getInstanceByName('Main');
            if(main) main.requestCommand('updateOptions', null, 'Main');


        }


    };

    GeckoJS.Controller.extend(__layout_manager_controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'LayoutManager');
    }, false);


    window.closePreferences = function closePreferences() {
        try {

            $do('close', null, 'LayoutManager');
            
        }
        catch(e) {};
    }
    
})();
