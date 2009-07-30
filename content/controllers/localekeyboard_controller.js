(function(){

    var __controller__ = {

        name: 'LocaleKeyboard',

        // select the indicated keyboard layout

        selectKbmap: function () {
            var selectedKbmap = $('#kbmap')[0].selectedKbmap;

            $('#keyboard-layout')[0].setAttribute('src', 'chrome://viviecr/content/skin/kblayouts/' + selectedKbmap + '.png');
        },

        settingsChanged: function() {
            var changed = false;

            var locale = $('#locale')[0];
            var kbmap = $('#kbmap')[0];

            if (locale) {
                changed = (locale.currentLocale != locale.selectedLocale)
            }

            if (kbmap) {
                changed = changed || kbmap.currentKbmap != kbmap.selectedKbmap;
            }

            return changed;
        },

        save: function () {
            if (this.settingsChanged()) {
                if (GREUtils.Dialog.confirm(this.topmostWindow, _('confirm language and keyboard mapping change'),
                                                                _('Language and Keyboard mapping changes require system restart to take effect. If you save the changes now, the system will restart automatically after you return to the Main Screen. Do you want to save your changes?')
                                                                )) {
                    var locale = $('#locale')[0];
                    var kbmap = $('#kbmap')[0];

                    // change both XUL and OS locales
                    locale.changeOSLocale();
                    locale.changeLocale();

                    // change keyboard mapping
                    kbmap.changeOSKbmap();

                    GeckoJS.Observer.notify(null, 'prepare-to-restart', this);

                    window.close();

                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                OsdUtils.info(_('No changed to save'));
                return false;
            }
        },

        exit: function() {
            if (this.settingsChanged()) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_CANCEL;

                var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),
                                               _('You have made changes to locale and keyboard settings. Save changes before exiting?'),
                                               flags, _('Save'), _('Discard'), '', null, check);
                if (action == 2) {
                    return;
                }
                else if (action == 0) {
                    if (!this.save()) return;
                }
            }
            window.close();
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();
