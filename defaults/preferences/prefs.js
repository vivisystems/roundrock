pref("toolkit.defaultChromeURI", "chrome://vivipos/content/vivipos.xul");

// Prevent xulrunner from launching multiple instances.
pref("toolkit.singletonWindowType", "Vivipos:Main");


/* prefwindow prefs (see: MDC - Preferences System and bug 350528) */
pref("browser.preferences.animateFadeIn", "false");
pref("browser.preferences.instantApply", "false");

//
// Advanced DOM JavaScript preferences
//
pref("dom.disable_window_move_resize", true);
pref("dom.disable_window_flip", true);
pref("dom.event.contextualmenu.enabled", false);
pref("dom.disable_window_open_feature.status", true);
pref("dom.disable_window_status_change", true);

pref("dom.max_chrome_script_run_time", 60);
pref("dom.max_script_run_time", 60);

/* TraceMonkey JIT 1.9.1 */
pref("javascript.options.jit.content", true);
pref("javascript.options.jit.chrome", true);

/* extension prefs - turn off extension updating for now */
pref("extensions.update.enabled", false);
pref("extensions.update.interval", 86400);

// pref("xpinstall.dialog.confirm", "chrome://vivipos/content/xpinstall/xpinstallConfirm.xul");
pref("xpinstall.dialog.progress.skin", "chrome://mozapps/content/extensions/extensions.xul?view=installs");
pref("xpinstall.dialog.progress.chrome", "chrome://mozapps/content/extensions/extensions.xul?view=installs");
pref("xpinstall.dialog.progress.type.skin", "Extension:Manager");
pref("xpinstall.dialog.progress.type.chrome", "Extension:Manager");

// Dynamic Skin Switching
pref("extensions.dss.enabled", false);

// Non-dynamic switch pending after next restart
pref("extensions.dss.switchPending", false);

pref("extensions.ignoreMTimeChanges", false);
pref("extensions.logging.enabled", false);

pref("general.autoScroll", true);
pref("general.smoothScroll", false);

// Don't warn when opening external http urls
// This is to allow for launching _blank targeted links in the default browser
pref("network.protocol-handler.warn-external.http", false);
pref("network.protocol-handler.warn-external.https", false);
pref("network.protocol-handler.warn-external.ftp", false);

pref("network.proxy.share_proxy_settings",  false);

pref("plugin.default_plugin_disabled", true);
pref("security.warn_entering_secure.show_once", true);
pref("security.warn_leaving_secure.show_once", true);

// NB these point at AMO
// pref("extensions.update.url", "chrome://mozapps/locale/extensions/extensions.properties");
// pref("extensions.getMoreExtensionsURL", "chrome://mozapps/locale/extensions/extensions.properties");
// pref("extensions.getMoreThemesURL", "chrome://mozapps/locale/extensions/extensions.properties");

// Prevent popups by default
pref("privacy.popups.firstTime",            true);
pref("privacy.popups.showBrowserMessage",   true);
pref("dom.disable_open_during_load",        true);

// Disable drag image for linux, see
// https://bugzilla.mozilla.org/show_bug.cgi?id=376238
pref("nglayout.enable_drag_images", false);

/* Ignore OS locale setting */
pref("intl.locale.matchOS", "false");

/* vivipos default locale */
pref("general.useragent.locale", "en-US");
pref("intl.charset.default", "UTF-8");

