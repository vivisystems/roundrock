/*
 * Setup Wizard
 */

var options = window.arguments[0];

var selectedLocale;
var selectedKbmap;
var selectedLocation;
var selectedTimezone;

/*
 * startup
 */

function startup() {
    // initialize timezone
    var timezones = document.getElementById('timezones');
    selectedTimezone = timezones.currentTimezone;
    
    // initialize location list

    // initialize sector list
}

/*
 *  wizard page "language"
 */

function initLocaleKbmap() {
    // initialize locale
    if (!selectedLocale) {
        var locale = document.getElementById('locale');
        selectedLocale = locale.currentLocale;
    }

    // make sure selectedItem is visible
    locale.listbox.ensureIndexIsVisible(locale.selectedIndex);

    // initialize kbmap
    if (!selectedKbmap) {
        var kbmap = document.getElementById('kbmap');
        selectedKbmap = kbmap.currentKbmap;
    }

    // make sure selectedItem is visible
    kbmap.listbox.ensureIndexIsVisible(kbmap.selectedIndex);
}

function setLocaleKbmap() {

    var locale = document.getElementById('locale');
    var kbmap = document.getElementById('kbmap');

    // change XUL and OS locales
    alert('locale: [' + selectedLocale + '] -> [' + locale.selectedLocale + ']');
    if (selectedLocale != locale.selectedLocale) {
        selectedLocale = locale.selectedLocale;
        locale.changeOSLocale();
        locale.changeLocale();
        alert('locale changed');
    }

    // change keyboard mapping
    alert('kbmap: [' + selectedKbmap + '] -> [' + kbmap.selectedKbmap + ']');
    if (selectedKbmap != kbmap.selectedKbmap) {
        selectedKbmap = kbmap.selectedKbmap;
        kbmap.changeOSKbmap();
        alert('OSkbmap changed');
    }

    return true;
}

/*
 *  wizard page "location"
 */

/*
 * wizard page "timezone"
 */

function setTimezone() {
    
    var timezones = document.getElementById('timezones');

    alert('timezone: [' + selectedTimezone + '] -> [' + timezones.selectedTimezone + ']');
    if (selectedTimezone != timezones.selectedTimezone) {
        selectedTimezone = timezones.selectedTimezone;
        timezones.changeOSTimezone();
        alert('time zone changed');
    }
    return true;
}

/*
 * wizard page "datetime"
 */

function setTime() {
    var dt = document.getElementById('datetime');
    dt.value = dt.value + 1000;
}

function startClock() {
    var dt = document.getElementById('datetime');
    dt.intervalId = setInterval(setTime, 1000);
}

function stopClock() {
    clearInterval(setTime);
}

/*
 * wizard finish/cancel
 */

function finishSetup() {
    options.initialized = true;
    return true;
}

function cancelSetup() {

    if (GREUtils.Dialog.confirm(window, _('VIVIPOS Setup'),
                                _('Unless you plan to restore the terminal from a previously taken backup, ' +
                                  'you are strongly advised to complete the setup process to ensure that the terminal operates properly. ' +
                                  'Are you sure you want to cancel and exit from the setup wizard now?'))) {
        options.initialized = false;

        GREUtils.restartApplication();
        return true;
    }
    return false;
}

window.addEventListener('load', startup, false);
