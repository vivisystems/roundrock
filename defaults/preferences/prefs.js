pref("toolkit.defaultChromeURI", "chrome://vivipos/content/vivipos.xul");
pref("toolkit.defaultChromeFeatures", "chrome,modal=no,toolbar=no,popup=no,titlebar=no,width=1024,height=768");

// Prevent xulrunner from launching multiple instances.
pref("toolkit.singletonWindowType", "Vivipos:Main");


/* prefwindow prefs (see: MDC - Preferences System and bug 350528) */
pref("browser.preferences.animateFadeIn", "false");
pref("browser.preferences.instantApply", "false");

/* debugging prefs */
pref("browser.dom.window.dump.enabled", false);
pref("javascript.options.showInConsole", false);
pref("javascript.options.strict", false);
pref("nglayout.debug.disable_xul_cache", true);
pref("nglayout.debug.disable_xul_fastload", true);

//
// Advanced DOM JavaScript preferences
//
pref("dom.disable_window_move_resize", true);
pref("dom.disable_window_flip", true);
pref("dom.event.contextualmenu.enabled", false);
pref("dom.disable_window_open_feature.status", true);
pref("dom.disable_window_status_change", true);


pref("dom.max_script_run_time", 180);


/* TraceMonkey JIT 1.9.1 */
pref("javascript.options.jit.content", true);
pref("javascript.options.jit.chrome", true);

/* added to allow <label class="text-links" ... /> to work */
pref("network.protocol-handler.expose.http", false);
pref("network.protocol-handler.warn-external.http", false);

/* extension prefs - turn off extension updating for now */
pref("extensions.update.enabled", true);
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

pref("general.autoScroll", true);
pref("general.smoothScroll", false);
pref("extensions.ignoreMTimeChanges", false);
pref("extensions.logging.enabled", false);
pref("general.skins.selectedSkin", "classic/1.0");

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

pref("vivipos.fec.mainscreen.width", 800);
pref("vivipos.fec.mainscreen.height", 600);
pref("vivipos.fec.mainscreen.hidechrome", false);

pref("vivipos.fec.debug.disable_bottombox", false);
pref("vivipos.fec.debug.disable_extension_manager", false);
pref("vivipos.fec.debug.disable_jsconsole", false);
pref("vivipos.fec.debug.disable_inspector", false);
pref("vivipos.fec.debug.disable_debugger", false);





