// App-specific update preferences

// Whether or not app updates are enabled
pref("app.update.enabled", true);

// This preference turns on app.update.mode and allows automatic download and
// install to take place. We use a separate boolean toggle for this to make
// the UI easier to construct.
pref("app.update.auto", false);

// Defines how the Application Update Service notifies the user about updates:
//
// AUM Set to:        Minor Releases:     Major Releases:
// 0                  download no prompt  download no prompt
// 1                  download no prompt  download no prompt if no incompatibilities
// 2                  download no prompt  prompt
//
// See chart in nsUpdateService.js.in for more details
//
pref("app.update.mode", 1);

// If set to true, the Update Service will present no UI for any event.
pref("app.update.silent", false);

// Update service URL:
pref("app.update.url", "http://update.vivisystems.com.tw/%PRODUCT%/update/VersionCheck.php?channel=%CHANNEL%&version=%VERSION%&build_id=%BUILD_ID%&build_target=%BUILD_TARGET%&dallas=%DALLAS%&mac_address=%MAC_ADDRESS%&vendor_name=%VENDOR_NAME%&system_name=%SYSTEM_NAME%");

// User-settable override to app.update.url for testing purposes.
//pref("app.update.url.override", "");

// URL user can browse to manually if for some reason all update installation
// attempts fail.
//pref("app.update.url.manual", "");

// A default value for the "More information about this update" link
// supplied in the "An update is available" page of the update wizard.
//pref("app.update.url.details", "");

// Interval: Time between checks for a new version (in seconds)
//           default=1 day
pref("app.update.interval", 0);

// Interval: Time before prompting the user to download a new version that
//           is available (in seconds) default=1 day
pref("app.update.nagTimer.download", 86400);

// Interval: Time before prompting the user again to restart to install the
//           latest download (in seconds) default=1 day
pref("app.update.nagTimer.restart", 86400);

// Interval: When all registered timers should be checked (in milliseconds)
//           default=10 minutes
pref("app.update.timer", 600000);
// Give the user x seconds to react before showing the big UI. default=12 hours
pref("app.update.promptWaitTime", 43200);
// Show the Update Checking/Ready UI when the user was idle for x seconds
pref("app.update.idletime", 60);

// Whether or not we show a dialog box informing the user that the update was
// successfully applied. This is off in Firefox by default since we show a
// upgrade start page instead! Other apps may wish to show this UI, and supply
// a whatsNewURL field in their brand.properties that contains a link to a page
// which tells users what's new in this new update.
pref("app.update.showInstalledUI", false);

// 0 = suppress prompting for incompatibilities if there are updates available
//     to newer versions of installed addons that resolve them.
// 1 = suppress prompting for incompatibilities only if there are VersionInfo
//     updates available to installed addons that resolve them, not newer
//     versions.
pref("app.update.incompatible.mode", 0);

// Symmetric (can be overridden by individual extensions) update preferences.
// e.g.
//  extensions.{GUID}.update.enabled
//  extensions.{GUID}.update.url
//  extensions.{GUID}.update.interval
//  .. etc ..
//
pref("extensions.update.enabled", true);
pref("extensions.update.url", "http://update.vivisystems.com.tw/addons/update/VersionCheck.php?reqVersion=%REQ_VERSION%&id=%ITEM_ID%&version=%ITEM_VERSION%&maxAppVersion=%ITEM_MAXAPPVERSION%&status=%ITEM_STATUS%&appID=%APP_ID%&appVersion=%APP_VERSION%&appOS=%APP_OS%&appABI=%APP_ABI%&locale=%APP_LOCALE%&currentAppVersion=%CURRENT_APP_VERSION%&dallas=%DALLAS%&mac_address=%MAC_ADDRESS%&vendor_name=%VENDOR_NAME%&system_name=%SYSTEM_NAME%");
pref("extensions.update.interval", 0);  // Check for updates to Extensions and
                                            // Themes every day
// Non-symmetric (not shared by extensions) extension-specific [update] preferences
//pref("extensions.getMoreExtensionsURL", "http://%LOCALE%.add-ons.mozilla.com/%LOCALE%/%APP%/%VERSION%/extensions/");
//pref("extensions.getMoreThemesURL", "http://%LOCALE%.add-ons.mozilla.com/%LOCALE%/%APP%/%VERSION%/themes/");
//pref("extensions.getMorePluginsURL", "http://%LOCALE%.add-ons.mozilla.com/%LOCALE%/%APP%/%VERSION%/plugins/");

pref("xpinstall.whitelist.add", "update.mozilla.org");
pref("xpinstall.whitelist.add.102", "update.vivisystems.com.tw");
pref("xpinstall.whitelist.add.103", "addons.mozilla.org");
