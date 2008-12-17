/**
 * GeckoJS.Application is a namespace for application-wide Singleton objects.
 * <br/>
 * @namespace 
 * @name GeckoJS.Application
 */
// GREUtils.define('GeckoJS.Application', GeckoJS.global);

/**
 * This is the Application Session singleton.<br/>
 * 
 * @public
 * @static
 * @property {GeckoJS.Application.Session} Session
 */ 
GeckoJS.Session.getInstance();
//GeckoJS.Application.Session = GeckoJS.Session.getInstance();

/**
 * This is the Application Configuration singleton.<br/>
 *
 * @public
 * @static
 * @property {GeckoJS.Application.Configure} Configure
 */ 
GeckoJS.Configure.getInstance();
//GeckoJS.Application.Configure = GeckoJS.Configure.getInstance();

// auto load vivipos preferences to configure entry
//GeckoJS.Application.Configure.loadPreferences('vivipos');

/**
 * This is the Application ClassRegistry singleton.<br/>
 * 
 * @public
 * @static
 * @property {GeckoJS.Application.ClassRegistry} ClassRegistry
 */
//GeckoJS.Application.ClassRegistry = GeckoJS.ClassRegistry.getInstance();

// GeckoJS.Application.Dispatcher = GeckoJS.Dispatcher.getInstance();

/**
 * This is the Application StringBundle singleton.<br/>
 *
 * @public
 * @static
 * @property {GeckoJS.Application.StringBundle} StringBundle
 */ 
GeckoJS.StringBundle.getInstance();
//GeckoJS.Application.StringBundle = GeckoJS.StringBundle.getInstance();

/**
 * This is the Application I18n singleton.<br/>
 * 
 * @public
 * @static
 * @property {GeckoJS.Application.I18n} I18n
 */ 
GeckoJS.I18n.getInstance();
// GeckoJS.Application.I18n = GeckoJS.I18n.getInstance();

/**
 * This is the Application ConnectionManager singleton.<br/>
 * 
 * @public
 * @static
 * @property {GeckoJS.Application.I18n} ConnectionManager Application ConnectionManager Singleton
 */ 
GeckoJS.ConnectionManager.getInstance();
//GeckoJS.Application.ConnectionManager = GeckoJS.ConnectionManager.getInstance();


/*
 * Initial Logging System
 */
GeckoJS.Log.init("WARN");
GeckoJS.Log.addAppender('console', new GeckoJS.Log.ConsoleAppender(GeckoJS.Log['WARN']));

