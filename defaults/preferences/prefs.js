pref("toolkit.defaultChromeURI", "chrome://vivipos/content/vivipos.xul");

/* prefwindow prefs (see: MDC - Preferences System and bug 350528) */
pref("browser.preferences.animateFadeIn", "false");
pref("browser.preferences.instantApply", "false");

/* debugging prefs */
pref("browser.dom.window.dump.enabled", true);
pref("javascript.options.showInConsole", true);
pref("javascript.options.strict", true);
pref("nglayout.debug.disable_xul_cache", true);
pref("nglayout.debug.disable_xul_fastload", true);

/* TraceMonkey JIT */
pref("javascript.options.jit.content", true);
pref("javascript.options.jit.chrome", true);

/* added to allow <label class="text-links" ... /> to work */
pref("network.protocol-handler.expose.http", false);
pref("network.protocol-handler.warn-external.http", false);

/* extension prefs - turn off extension updating for now */
pref("extensions.update.enabled", false);
pref("extensions.update.interval", 86400);

// pref("xpinstall.dialog.confirm", "chrome://vivipos/content/xpinstall/xpinstallConfirm.xul");
pref("xpinstall.dialog.progress.skin", "chrome://mozapps/content/extensions/extensions.xul?view=installs");
pref("xpinstall.dialog.progress.chrome", "chrome://mozapps/content/extensions/extensions.xul?view=installs");
pref("xpinstall.dialog.progress.type.skin", "Extension:Manager");
pref("xpinstall.dialog.progress.type.chrome", "Extension:Manager");

pref("extensions.dss.enabled", false);
pref("extensions.dss.switchPending", false);
pref("extensions.ignoreMTimeChanges", false);
pref("extensions.logging.enabled", false);
pref("general.skins.selectedSkin", "classic/1.0");
// NB these point at AMO
// pref("extensions.update.url", "chrome://mozapps/locale/extensions/extensions.properties");
// pref("extensions.getMoreExtensionsURL", "chrome://mozapps/locale/extensions/extensions.properties");
// pref("extensions.getMoreThemesURL", "chrome://mozapps/locale/extensions/extensions.properties");


/* vivipos prefs */
pref("general.useragent.locale", "zh-TW");

