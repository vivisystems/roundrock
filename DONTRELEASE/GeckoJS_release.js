/*
 * GeckoJS is simple and easy framework for XULRunner Application.
 * 
 * it base on GREUtils - is simple and easy use APIs libraries for GRE (Gecko Runtime Environment).
 *
 * Copyright (c) 2008 Rack Lin (racklin@gmail.com)
 *
 */
/**
 * GeckoJS is a simple, easy-to-use, and powerful framework for developing
 * XULRunner applications with support for inheritance and Model-View-Controller
 * design pattern.<br/>
 *  
 * @public
 * @namespace
 */
var GeckoJS = GeckoJS || {version: "1.2.5"}; // Check to see if already defined in current scope

/**
 * This is a reference to the global context, which is normally the "window" object.
 *
 * @name GeckoJS.global
 * @public
 * @static
 * @field global    
 */
//GeckoJS.global = this;
GeckoJS.global = (typeof window != 'undefined') ? window : this;


/**
 * Returns the hash code of an object. If the object does not have a hash code, a
 * unique hash code is created for it.
 *
 * @name GeckoJS.getHashCode
 * @public
 * @static 
 * @function  
 * @param {Object} obj      This is the object for which to get the hash code
 * @return {Number}          The hash code for the object.
 */
GeckoJS.getHashCode = function(obj) {
  if (obj.hasOwnProperty && obj.hasOwnProperty(GeckoJS.HASH_CODE_PROPERTY)) {
    return obj[GeckoJS.HASH_CODE_PROPERTY];
  }
  if (!obj[GeckoJS.HASH_CODE_PROPERTY]) {
    obj[GeckoJS.HASH_CODE_PROPERTY] = ++GeckoJS.hashCodeCounter;
  }
  return obj[GeckoJS.HASH_CODE_PROPERTY];
};


/**
 * Removes the hash code of an object.
 *
 * @name GeckoJS.removeHashCode
 * @public
 * @static 
 * @function  
 * @param {Object} obj        This is the object from which to remove the hash code
 */
GeckoJS.removeHashCode = function(obj) {
  if ('removeAttribute' in obj) {
    obj.removeAttribute(GeckoJS.HASH_CODE_PROPERTY);
  }
  /** @preserveTry */
  try {
    delete obj[GeckoJS.HASH_CODE_PROPERTY];
  } catch (ex) {
  }
};


/**
 * @name GeckoJS.HASH_CODE_PROPERTY
 * @field
 * @type {String} Name for hash code property
 * @private
 */
GeckoJS.HASH_CODE_PROPERTY = '__GeckoJS_hashCode__';


/**
 * @name GeckoJS.hashCodeCounter
 * @field
 * @type {Number} Counter for hash codes.
 * @private
 */
GeckoJS.hashCodeCounter = 0;


/**
 * Creates a namespace in a context. The namespace is also declared in the
 * GREUtils global context, overriding any previously declared namespace of the
 * same name.  
 * 
 * This is an alias for GREUtils.define().
 *
 * @name GeckoJS.define
 * @public
 * @static 
 * @function
 * @param {String} name       This is the name of the namespace
 * @param {Object} context    This is the context in which to declare the namespace; defaults to the GREUtils global context
 */
GeckoJS.define = function(name, context) {

  GREUtils.define.apply(null, arguments);

};


/**
 * Synchronously loads and executes the script from the specified URL in a given
 * scope.
 * 
 * The default scope is the GREUtils.global. 
 *
 * If the script is executed successfully, this method returns the NS_OK result code;
 * otherwise NS_ERROR_INVALID_ARG is returned.
 * 
 * This is an alias for GREUtils.include()
 *
 * @name GeckoJS.include
 * @public
 * @static
 * @function 
 * @param {String} scriptSrc          This is a URL specifying the location of the script
 * @param {Object} scope              This is the scope in which to execute the script
 * @return {Object}                    A NSResult return code
 */
GeckoJS.include = function (scriptSrc, scope) {

	return GREUtils.include.apply(null, arguments);

};


/**
 * Synchronously loads and executes the script from the specified URL in a given
 * scope. The default scope is the GREUtils.global. 
 *
 * If the script is executed successfully, this method returns the NS_OK result code;
 * otherwise NS_ERROR_INVALID_ARG is returned. Once thes cript has been successfully
 * executed, this method will not execute the script again on subsequent calls; it will
 * simply return NS_OK.   
 *
 * This is an alias for GREUtils.include_once()
 *
 * @name GeckoJS.include_once
 * @public
 * @static
 * @function 
 * @param {String} scriptSrc          This is the URL specifying the location of the script
 * @param {Object} scope              This is the the scope in which to execute the script
 * @return {Object}                   An NSResult return code  
 */
GeckoJS.include_once = function(scriptSrc, scope) {

	return GREUtils.include_once.apply(null, arguments);

};

/**
 * GeckoJS.Singleton provides support for the Singleton pattern.<br/>
 * <br/>
 * The Singleton pattern ensures that when a Singleton class has only a single
 * instance and has a global point of access to that instance.<br/>
 *
 * @name GeckoJS.Singleton
 * @class GeckoJS.Singleton provides support for the Singleton pattern
 */
GREUtils.define('GeckoJS.Singleton', GeckoJS.global);

GeckoJS.Singleton = {

/**
 * Gets an instance of the Singleton class.<br/>
 * <br/>
 * This is a dummy method and is overridden in individual Singleton classes.<br/>
 *
 * @name GeckoJS.Singleton.getInstance
 * @public
 * @static
 * @function
 * @return {Object}         The Singleton instance of the class
 */
    getInstance: function getInstance(){
		// fake function for ducument only
	},

/**
 * Extends Singleton support to the target class.<br/>
 * <br/>
 * This method extends the target class with Singleton pattern, adding a
 * "getInstance()" method to the target class as the point of access to the
 * class singleton.<br/>
 *
 * @name GeckoJS.Singleton.support
 * @public
 * @static
 * @function
 * @param {Object} target   This the class to be extended with Singleton pattern
 */
	support: function(target){

		GREUtils.extend(target, {

			// return single instance
			getInstance: function getInstance(){

				if (this.__instance__ == null || typeof(this.__instance__) == "undefined") {
					this.__instance__ = new this();
				}

				return this.__instance__;
			}
		});
	}
};
/**
 * Defines the GeckoJS.Class namespace
 * @public
 * @namespace 
 */
/**
 * Creates a new GeckoJS.Class instance.
 * 
 * @class GeckoJS.Class is the foundation class upon which a simple class
 * inheritance scheme is built. All other classes in the VIVIPOS APP Engine
 * are direct or indirect descendants of GeckoJS.Class.<br/>
 * <br/>
 * This implementation provides class-level inheritance, class initialization
 * callbacks, introspection, and different accesses to the instance's class and
 * super-classes.<br/>
 * 
 * @name GeckoJS.Class
 */
(function(){
    var initializing = false, fnTest = /xyz/.test(function(){
        xyz;
    }) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)

    GeckoJS.Class = function(){
    };

    /**
     * Base Class static init function.
     *
     * @name GeckoJS.Class.init
     * @public
     * @static
     * @function
     */
    GeckoJS.Class.init = function(){
    }

/**
 * Creates a new class that inherits from this class.<br/>
 * <br/>
 * This method creates a new class by extending the current class with new properties
 * and methods. It normally takes a single parameter: a "proto" object containing the
 * set of instance properties and methods with which to extend the current class. If
 * two parameters are given, then the first parameter ("klass") should be an object
 * containing the set of class properties and methods, and the second parameter ("proto")
 * should be the set of instance properties and methods.<br/>
 *
 * @name GeckoJS.Class.extend
 * @public
 * @static
 * @function
 * @param {Object} klass          This is the set of class properties and methods with which to extend the current class
 * @param {Object} proto          This is the set of instance properties and methods with which to extend the current class
 * @return {Object}               The new class
 */
    GeckoJS.Class.extend = function(klass, proto){
        if (!proto) {
            proto = klass;
            klass = null;
        }
        var _super_class = this;
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in proto) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof proto[name] == "function" &&
            typeof _super[name] == "function" &&
            fnTest.test(proto[name]) ? (function(name, fn){
                return function(){
                    var tmp = this._super;

                    // Add a new ._super() method that is the same method
                    // but on the super-class
                    this._super = _super[name];

                    // The method only need to be bound temporarily, so we
                    // remove it when we're done executing
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;

                    return ret;
                };
            })(name, proto[name]) : proto[name];
        }

        // The dummy class constructor
        function Class(){
            // All construction is actually done in the init method
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }
        // Populate our constructed prototype object
        Class.prototype = prototype;
        Class.prototype.Class = Class;
        Class.prototype.superclass = _super_class;
        // Enforce the constructor to be what we expect
        Class.constructor = Class;
        // And make this class extendable

        for (var name in this) {
            if (this.hasOwnProperty(name) && name != 'prototype') {
                Class[name] = this[name];
            }
        }

        // klass is string for class name default
        if(typeof klass == 'string') {
            klass = {className: klass};
        }

        for (var name in klass) {
            Class[name] = typeof klass[name] == "function" &&
            typeof Class[name] == "function" &&
            fnTest.test(klass[name]) ? (function(name, fn){
                return function(){
                    var tmp = this._super;
                    this._super = _super_class[name];
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;
                    return ret;
                };
            })(name, klass[name]) : klass[name];
        };


        Class.extend = arguments.callee;

        if (Class.init)
            Class.init(Class);
        if (_super_class.extended)
            _super_class.extended(Class)

        return Class;
    };
})();
/**
 * Defines the GeckoJS.BaseObject namespace.
 *
 * @public
 * @namespace 
 */
GREUtils.define('GeckoJS.BaseObject', GeckoJS.global);

/**
 * Creates a new GeckoJS.BaseObject instance.
 * 
 * @class GeckoJS.BaseObject is the base object class upon which other GeckoJS classes
 * are built. It defines a basic set of common methods which may be overridden
 * by inheriting classes.<br/>
 * 
 * @extends GeckoJS.Class
 * @name GeckoJS.BaseObject
 */
GeckoJS.BaseObject = GeckoJS.Class.extend('BaseObject', {});


/**
 * Clones an object.
 *
 * @name GeckoJS.BaseObject.clone
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object to clone
 * @return {Object}         A clone of the object
 */
GeckoJS.BaseObject.clone = function(obj){

    var res = {};
    for (var key in obj) {
        res[key] = obj[key];
    }
    return res;
};


/**
 * Clones an object.
 *
 * @name GeckoJS.BaseObject#clone
 * @public
 * @function
 * @param {Object} obj      This is the object to clone , defaults to this instance
 * @return {Object}         A clone of this GeckoJS.BaseObject
 */
GeckoJS.BaseObject.prototype.clone = function(obj){
    return GeckoJS.BaseObject.clone((obj || this));
};


/**
 * Logs a message.<br/>
 * <br/>
 * examples:<br/>
 * <pre>
 *      GeckoJS.BaseObject.log(message)
 *      GeckoJS.BaseObject.log(level, message)
 *      GeckoJS.BaseObject.log(className, level, message)
 *      GeckoJS.BaseObject.log(className, level, message, exception)
 * </pre>
 *
 * @name GeckoJS.BaseObject.log
 * @public
 * @static
 * @function
 * @param {String} className  		This is the class name
 * @param {GeckoJS.Log.Level||String} level This is the level of the message
 * @param {String} message   		This is the message to log
 * @param {Object} [exception]      This is an optional exception to use
 * @return {GeckoJS.Log.ClassLogger} An instance of the class-specific logger
 */
GeckoJS.BaseObject.log = function(className, level, message, exception){

    // only mainThread logging... for threadsafe.
    var currentThread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
    var mainThread = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;

    // @FIXME
    if (currentThread !== mainThread) {
        if(typeof dump == 'function' && (level !='TRACE' && level !='DEBUG' && level !='INFO' ) ) {
            dump(className + ' ' + level + ' ' + message + '\n');
        }
        return ;
    }

    if (arguments.length == 1) {
        message = arguments[0];
        level = GeckoJS.Log.defaultClassLevel;
        className = null;
        exception = null;
    }else if (arguments.length == 2) {
        message = arguments[1];
        level = arguments[0];
        className = null;
        exception = null;
    }else if (arguments.length == 3) {
        message = arguments[2];
        level = arguments[1];
        className = arguments[0];
        exception = null;
    }

    if (typeof level =='string') {
        if(GeckoJS.Array.inArray(level , GeckoJS.Log.levels) != -1) {
            level = GeckoJS.Log[level.toUpperCase()];
        }else {
            level = GeckoJS.Log.defaultClassLevel;
        }
    }

    className = (className) ? className : GeckoJS.BaseObject.getClassName(this);
    var logger = GeckoJS.Log.getLoggerForClass(className);

    return logger.log(level, message, exception);
};


/**
 * Logs a message.<br/>
 * <br/>
 * example:<br/>
 * <pre/>
 *      this.log(message)
 *      this.log(level, message)
 *      this.log(level, message, exception)
 * </pre>
 *
 * @name GeckoJS.BaseObject#log
 * @public
 * @function
 * @param {GeckoJS.Log.Level} level This is the level of the message
 * @param {String} message   		This is the message to log
 * @param {Object} [exception]      This is an optional exception to use
 * @return {GeckoJS.Log.ClassLogger} An instance of the class specific logger
 */
GeckoJS.BaseObject.prototype.log = function(level, message, exception) {

    // only mainThread logging... for threadsafe.
    var currentThread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
    var mainThread = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;

    // @FIXME 
    if (currentThread !== mainThread) {
        if(typeof dump == 'function' && (level !='TRACE' && level !='DEBUG' && level !='INFO' ) ) {
            dump(this.getClassName() + ' ' + level + ' ' + message + '\n');
        }
        return ;
    }

    if (arguments.length == 1) {
        message = arguments[0];
        level = GeckoJS.Log.defaultClassLevel;
        exception = null;
    }else if (arguments.length == 2) {
        message = arguments[1];
        level = arguments[0];
        exception = null;
    }

    return GeckoJS.BaseObject.log(this.getClassName(), level, message, exception);
};


/**
 * Gets a class-specific logger for this object class.
 *
 * @name GeckoJS.BaseObject.getLogger
 * @public
 * @static
 * @function
 * @return {GeckoJS.Log.ClassLogger}   The class-specific logger
 */
GeckoJS.BaseObject.getLogger = function() {

    return GeckoJS.Log.getLoggerForClass(GeckoJS.Baseobject.getClassName(this));

};


/**
 * Get a class-specific logger for this object class.
 *
 * @name GeckoJS.BaseObject#getLogger
 * @public
 * @function
 * @return {GeckoJS.Log.ClassLogger}   The class-specific logger
 */
GeckoJS.BaseObject.prototype.getLogger = function() {

    return GeckoJS.Log.getLoggerForClass(this.getClassName());
    
};


/**
 * Dispatches a command to a controller.
 *
 * @name GeckoJS.BaseObject#requestCommand
 * @public
 * @function
 * @param {String} command              This is the command to dispatch
 * @param {Object} data                 This is the data to pass to the controller
 * @param {Object} context              This is the controller to dispatch the command to
 * @return {GeckoJS.BaseObject}
 */
GeckoJS.BaseObject.prototype.requestCommand = function(command, data, context, window) {
    var win = window || GeckoJS.global;
    context = context || this;
    GeckoJS.Dispatcher.dispatch(win, command, data, context);
    return this;
};


/**
 * Dispatches a command to a controller
 *
 * @name GeckoJS.BaseObject.requestCommand
 * @public
 * @static
 * @function
 * @param {String} command              This is the command to dispatch
 * @param {Object} data                 This is the data to pass to the controller
 * @param {Object} context              This is the controller to dispatch the command to
 * @return {GeckoJS.BaseObject}
 */
GeckoJS.BaseObject.requestCommand = function(command, data, context, window) {
    var win = window || GeckoJS.global;
    context = context || win;
    GeckoJS.Dispatcher.dispatch(win, command, data, context);
    return this;
};

/**
 * Serializes an object using JSON encoding.
 *
 * @name GeckoJS.BaseObject.serialize
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object to serialize
 * @return {String}         The JSON representation of the object
 */
GeckoJS.BaseObject.serialize = function(obj){

    var res = null;
    try {
        //res = GREUtils.Charset.convertFromUnicode(); // to UTF-8
        res =  GREUtils.JSON.encode(obj);
    }catch(e) {

    }
    return res;

};


/**
 * Serializes this GeckoJS.BaseObject instance using JSON encoding.
 *
 * @name GeckoJS.BaseObject#serialize
 * @public
 * @function
 * @param {String} obj      This is the object to serialize
 * @return {String}         The JSON representation of this BaseObject
 */
GeckoJS.BaseObject.prototype.serialize = function(obj){
    return GeckoJS.BaseObject.serialize(obj||this);
};

/**
 * Serializes an object using JSON encoding.
 *
 * @name GeckoJS.BaseObject.stringify
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object to serialize
 * @return {String}         The JSON representation of the object
 */
GeckoJS.BaseObject.stringify = GeckoJS.BaseObject.serialize;


/**
 * Serializes this GeckoJS.BaseObject instance using JSON encoding.
 *
 * @name GeckoJS.BaseObject#stringify
 * @public
 * @function
 * @return {String}                 The JSON representation of this BaseObject
 */
GeckoJS.BaseObject.prototype.stringify = GeckoJS.BaseObject.prototype.serialize;


/**
 * Recreates an object from its JSON encoding.
 *
 * @name GeckoJS.BaseObject.unserialize
 * @public
 * @static
 * @function
 * @param {String} str      The JSON representation of the object
 * @return {Object}         The object represented by the JSON string
 */
GeckoJS.BaseObject.unserialize = function(str){
    var res = null;
    try {
        /*GREUtils.Charset.convertToUnicode(str)*/
        res = GREUtils.JSON.decode(str);
    }catch(e) {

    }
    return res;

};


/**
 * Restores this GeckoJS.BaseOBject instance to the state represented by the JSON encoding.
 *
 * @name GeckoJS.BaseObject#unserialize
 * @public
 * @function
 * @param {String} str      The JSON representation of this BaseObject
 * @return {Object}         This BaseObject restored to state represented by the JSON encoding
 */
GeckoJS.BaseObject.prototype.unserialize = function(str){
    var res = GeckoJS.BaseObject.unserialize(str);
    return GREUtils.extend(this, res);
};


/**
 * Returns the name of an object's class.
 *
 * @name GeckoJS.BaseObject.getClassName
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object for which to return the class name
 * @return {String}         The object's class name
 */
GeckoJS.BaseObject.getClassName = function(obj){

    if (GREUtils.isFunction(obj)) {
        return (obj.className || obj.name);
    }
    else
    if (GREUtils.isObject(obj)) {
        if (obj instanceof GeckoJS.Class) {
            return (obj.Class.className || obj.name);
        //if(obj.Class.name == 'Class' && typeof obj.name != 'undefined') return obj.name;
        //else return obj.Class.name || obj.name ;
        }else {
            return obj.constructor.name;
        }
    }
    return "";
};

/**
 * Returns the name of this GeckoJS.BaseObject instance's class.
 *
 * @name GeckoJS.BaseObject#getClassName
 * @public
 * @function
 * @return {String}         This BaseObject's class name
 */
GeckoJS.BaseObject.prototype.getClassName = function(){
    return GeckoJS.BaseObject.getClassName(this);
};


/**
 * Returns in an array the values contained in an object.
 *
 * @name GeckoJS.BaseObject.getValues
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object for which to return the values
 * @return {Array}          An array of values contained in the object
 */
GeckoJS.BaseObject.getValues = function(obj) {
    var res = [];
    for (var key in obj) {
        if(obj[key] !== Object.prototype[key]) {
            res.push(obj[key]);
        }
    }
    return res;
};


/**
 * Returns in an array the keys contained in an object.
 *
 * @name GeckoJS.BaseObject.getKeys
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object for which to return the keys
 * @return {Array}          An array of keys contained in the object
 */
GeckoJS.BaseObject.getKeys = function(obj) {
    var res = [];
    for (var key in obj) {
        if(obj[key] !== Object.prototype[key]) {
            res.push(key);
        }
    }
    return res;
};


/**
 * Dumps the content of an object or array in a human-readable format.
 *
 * @name GeckoJS.BaseObject.dump
 * @public 
 * @static
 * @function  
 * @param {Object} array     This is the object to dump
 * @param {Number} recursive This is the deep of recursive , default 8
 * @return {String}          The formatted dump output
 *
 */
GeckoJS.BaseObject.dump = function ( array, recursive) {

    var output = "";
    var pad_char = " ";
    var pad_val = 4;
    var recursive = recursive || 8;

    var formatArray = function (obj, cur_depth, pad_val, pad_char) {
        if (cur_depth > 0) {
            cur_depth++;
        }

        var base_pad = repeat_char(pad_val*cur_depth, pad_char);
        var thick_pad = repeat_char(pad_val*(cur_depth+1), pad_char);
        var str = "";

        if(obj == null) return str;
        
        // TODO recursive depth use setting ?
        if(cur_depth > recursive) return "** too many recursive **" + "\n";

        if ( (typeof obj == "object") || (typeof obj == "array"))  {
            str += obj.constructor.name + "\n" + base_pad + "{" + "\n";
            for (var key in obj) {
                
                if ( obj.hasOwnProperty(key) && (typeof obj[key] == "object" || typeof obj[key] == "array" || typeof obj[key] == "function") ) {

                    if ( obj[key] == null) {
                        str += thick_pad + "'"+key+"': "+ 'null' + "\n";
                    }else {
                        str += thick_pad + "'"+key+"': "+formatArray(obj[key], cur_depth+1, pad_val, pad_char);
                    }

                } else if(obj.hasOwnProperty(key)) {
                    str += thick_pad + "'"+key+"': " + obj[key] + "\n";
                }
            }
            str += base_pad + "}" + "\n";
        }else if (typeof obj == "function" ) {
            str = obj.constructor.name + "\n" || 'Function' + "\n" ;
        }else {
            str = obj.toString();
        }

        return str;
    };

    var repeat_char = function (len, pad_char) {
        var str = "";
        for(var i=0; i < len; i++) {
            str += pad_char;
        }
        return str;
    };
    
    output = formatArray(array, 0, pad_val, pad_char);

    return output;

};


/**
 * Dumps the content of an object or array in a human-readable format.
 *
 * @name GeckoJS.BaseObject#dump
 * @public 
 * @function  
 * @param {Object} array     This is the object to dump
 * @param {Number} recursive This is the deep of recursive
 * @return {String}          The formatted dump output
 *
 */
GeckoJS.BaseObject.prototype.dump = function (array, recursive) {

    var obj = array || this;
    return GeckoJS.BaseObject.dump(obj, recursive);

};

/**
 * sleep milliseconds in current Thread.
 *
 * @name GeckoJS.BaseObject.sleep
 * @public
 * @static
 * @function
 * @param {Number} milliseconds     milliseconds to sleep
 * @return {Boolean} always true
 */
GeckoJS.BaseObject.sleep = function (milliseconds) {

  var hwindow = Components.classes["@mozilla.org/appshell/appShellService;1"]
                .getService(Components.interfaces.nsIAppShellService)
                .hiddenDOMWindow;

  var self = {};

  // We basically just call this once after the specified number of milliseconds
  function wait() {
    self.timeup = true;
  }

  // Calls repeatedly every X milliseconds until clearInterval is called
  var interval = hwindow.setInterval(wait, milliseconds);

  var thread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
  // This blocks execution until our while loop condition is invalidated.  Note
  // that you must use a simple boolean expression for the loop, a function call
  // will not work.
  while(!self.timeup)
    thread.processNextEvent(true);

  hwindow.clearInterval(interval);
  delete self;

  return true;
};


/**
 * sleep milliseconds in current Thread.
 *
 * @name GeckoJS.BaseObject#sleep
 * @public
 * @function
 * @param {Number} milliseconds     milliseconds to sleep
 * @return {Boolean} always true
 */
GeckoJS.BaseObject.prototype.sleep = function (milliseconds) {
    return GeckoJS.BaseObject.sleep(milliseconds);
};

/**
 * Defines the GeckoJS.Map namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Map', GeckoJS.global);

/**
 * Creates a new GeckoJS.Map instance.
 * 
 * @class GeckoJS.Map implements the Map data structure, which is a collectin
 * of key-value pairs containing no duplicate keys.<br/>
 *
 * @name GeckoJS.Map
 * @extends GeckoJS.BaseObject
 */
GeckoJS.Map = GeckoJS.BaseObject.extend('Map',
/** @lends GeckoJS.Map.prototype */
{

    /**
     * Map contructor
     *
     * @name GeckoJS.Map#init
     * @public
     * @function
     */
    init: function(){

        this._obj = {};
        this._keys = [];
        this._count = 0;

    }
});


/**
 * Returns the number of elements in a Map.
 *
 * @name GeckoJS.Map.getCount
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the Map object, or a function with getCount() method
 * @return {Number}         The number of elements in the Map
 */
GeckoJS.Map.getCount = function(obj){

	if (typeof obj.getCount == 'function') {
    	return obj.getCount();
  	}

    var rv = 0;
    for (var key in obj) {
        rv++;
    }
    return rv;
};


/**
 * Returns the number of elements in this GeckoJS.Map instance.
 *
 * @name GeckoJS.Map#getCount
 * @public
 * @function
 * @return {Number}         The number of elements in this Map
 */
GeckoJS.Map.prototype.getCount = function(){
    return this._count;
};


/**
 * Checks whether an object/hash/map contains the given object as a value.
 *
 * @name GeckoJS.Map.contains
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object in which to look for val
 * @param {Object} val      The object for which to check
 * @return {Boolean}        "true" if "val" is contained in "obj"
 */
GeckoJS.Map.contains = function(obj, val){
    return GeckoJS.Map.containsValue(obj, val);
};


/**
 * Checks whether this Map contains the given object as a value.
 *
 * @name GeckoJS.Map#contains
 * @public
 * @function
 * @param {Object} obj      This is the object in which to look for val
 * @param {Object} val      The object for which to check
 * @return {Boolean}        "true" if this Map contains "val"
 */
GeckoJS.Map.prototype.contains = function(val){
    return GeckoJS.Map.contains(this, val);
};


/**
 * Checks whether an object/hash/map contains the given key.
 *
 * @name GeckoJS.Map.containsKey
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object in which to look for key
 * @param {String} key      The key for which to check
 * @return {Boolean}        "true" if "key" is contained in "obj"
 */
GeckoJS.Map.containsKey = function(obj, key){
    // return key in obj && obj[key] !== Object.prototype[key] ;
    
    if(obj === null || key === null || typeof obj == 'undefined' || typeof key == 'undefined') return false;

    return obj.hasOwnProperty(key);

};


/**
 * Checks whether this Map contains the given key.
 *
 * @name GeckoJS.Map#containsKey
 * @public
 * @function
 * @param {Object} key      The key for which to check
 * @return {Boolean}        "true" if this Map contains "key"
 */
GeckoJS.Map.prototype.containsKey = function(key){
    return GeckoJS.Map.containsKey(this._obj, key);
};


/**
 * Checks whether an object/hash/map contains the given object as a value.
 *
 * @name GeckoJS.Map.containsValue
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object in which to look for val
 * @param {Object} val      The object for which to check
 * @return {Boolean}        "true" if "val" is contained in "obj"
 */
GeckoJS.Map.containsValue = function(obj, val){

	if(typeof obj.containsValue == 'function') {
		return obj.containsValue(val);
	}

    for (var key in obj) {
        if (obj[key] == val) {
            return true;
        }
    }
    return false;
};


/**
 * Checks whether this Map contains the given object as a value.
 *
 * @name GeckoJS.Map#containsValue
 * @public
 * @function
 * @param {Object} obj      This is the object in which to look for val
 * @param {Object} val      The object for which to check
 * @return {Boolean}        "true" if this Map contains "val"
 */
GeckoJS.Map.prototype.containsValue = function(val){

  for (var i = 0; i < this._keys.length; i++) {
    var key = this._keys[i];
    if (this.containsKey(key) && this._obj[key] == val) {
      return true;
    }
  }
  return false;

};


/**
 * Returns in an array the values contained in an object/hash/map.
 *
 * @name GeckoJS.Map.getValues
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object for which to return the values
 * @return {Object}         An array of values contained in the object
 */
GeckoJS.Map.getValues = function(obj){

	if(typeof obj.getValues == 'function') {
		return obj.getValues();
	}

    var res = [];
    for (var key in obj) {
        res.push(obj[key]);
    }
    return res;
};


/**
 * Returns in an array the values contained in this Map.
 *
 * @name GeckoJS.Map#getValues
 * @public
 * @function
 * @return {Object}         An array of values contained in this Map
 */
GeckoJS.Map.prototype.getValues = function(){
	this.updateKeysArray();

	var rv = [];
	for (var i = 0; i < this._keys.length; i++) {
    	var key = this._keys[i];
	    rv.push(this._obj[key]);
  	}
    return rv;
};


/**
 * Returns in an array the keys contained in an object/hash/map.
 *
 * @name GeckoJS.Map.getKeys
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object for which to return the keys
 * @return {Array}          An array of keys contained in the object
 */
GeckoJS.Map.getKeys = function(obj){

	if (typeof obj.getKeys == 'function') {
		return obj.getKeys();
	}

    var res = [];
    for (var key in obj) {
		if(obj[key] !== Object.prototype[key]) res.push(key);
    }
    return res;
};


/**
 * Returns in an array the values contained in this Map.
 *
 * @name GeckoJS.Map#getKeys
 * @public
 * @function
 * @return {Array}          An array of keys contained in this Map
 */
GeckoJS.Map.prototype.getKeys = function(){

	this.updateKeysArray();
	return this._keys.concat();

};


/**
 * Checks whether an object/hash/map is empty.
 *
 * @name GeckoJS.Map.isEmpty
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object to check
 * @return {Boolean}        "true" if the object is empty
 */
GeckoJS.Map.isEmpty = function(obj){

	if(typeof obj.isEmpty == 'function') {
		return obj.isEmpty();
	}

    for (var key in obj) {
        if(obj[key] !== Object.prototype[key]) return false;
    }
    return true;
};


/**
 * Checks whether this Map is empty.
 *
 * @name GeckoJS.Map#isEmpty
 * @public
 * @function
 * @return {Boolean}        "true" if this Map is empty
 */
GeckoJS.Map.prototype.isEmpty = function(){
    return this._count == 0;
};


/**
 * Removes all key-value pairs from an object/hash/map.
 *
 * @name GeckoJS.Map.clear
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object from which to remove all key-value pairs
 */
GeckoJS.Map.clear = function(obj){
	if (typeof obj.clear =='function') {
		return obj.clear();
	}

    var keys = GeckoJS.Map.getKeys(obj);
    for (var i = keys.length - 1; i >= 0; i--) {
        GeckoJS.Map.remove(obj, keys[i]);
    }
};


/**
 * Removes all key-value pairs from this Map.
 *
 * @name GeckoJS.Map#clear
 * @public
 * @function
 */
GeckoJS.Map.prototype.clear = function(){

      // delete old reference
      // delete this._obj;

      // reset
	  this._obj = {};
	  this._keys.length = 0;
	  this._count = 0;

};


/**
 * Removes a key-value pair from an object/hash/map based on the key.
 *
 * @name GeckoJS.Map.remove
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object from which to remove a key-value pair
 * @param {String} key      This is the key to remove
 * @return {Boolean}        "true" if the key-value pair is removed, "false" otherwise
 */
GeckoJS.Map.remove = function(obj, key){

	if (typeof obj.remove == 'function') {
		return obj.remove(key);
	}

    if ((key in obj && obj[key] !== Object.prototype[key])) {
        delete obj[key];
		return true;
    }
};


/**
 * Removes a key-value pair from this Map based on the key.
 *
 * @name GeckoJS.Map#remove
 * @public
 * @function
 * @param {String} key      This is the key to remove
 * @return {Boolean}        "true" if the key-value pair is removed, "false" otherwise
 */
GeckoJS.Map.prototype.remove = function(key){

  if (this.containsKey(key)) {
    delete this._obj[key];
    this._count--;

    // clean up the keys array if the threshhold is hit
    if (this._keys.length > 2 * this._count) {
      this.updateKeysArray();
    }

    return true;
  }
  return false;
};


/**
 * Cleans up the temp keys array by removing entries that are no longer in the
 * map.
 *
 * @name GeckoJS.Map#updateKeysArray
 * @private
 * @function
 */
GeckoJS.Map.prototype.updateKeysArray = function() {
  if (this._count != this._keys.length) {
    // First remove keys that are no longer in the map.
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this._keys.length) {
      var key = this._keys[srcIndex];
      if (this.containsKey(key)) {
        this._keys[destIndex++] = key;
      }
      srcIndex++;
    }
    this._keys.length = destIndex;
  }

  if (this._count != this._keys.length) {
    // If the count still isn't correct, that means we have duplicates. This can
    // happen when the same key is added and removed multiple times. Now we have
    // to allocate one extra Object to remove the duplicates. This could have
    // been done in the first pass, but in the common case, we can avoid
    // allocating an extra object by only doing this when necessary.
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this._keys.length) {
      var key = this._keys[srcIndex];
      if (!(GeckoJS.Map.prototype.containsKey(seen, key))) {
        this._keys[destIndex++] = key;
        seen[key] = 1;
      }
      srcIndex++;
    }
    this._keys.length = destIndex;
  }
};

/**
 * Adds a key-value pair to an object/hash/map. If the object/hash/map already
 * contains the key, an Error exception is thrown.<br/>
 * <br/>
 * Use the set() method to replace an existing key-value pair.
 *
 * @name GeckoJS.Map.add
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object to which to add a key-value pair
 * @param {String} key      This is the key to add
 * @param {Object} val      This is the value to add
 */
GeckoJS.Map.add = function(obj, key, val){
	if(GeckoJS.Map.containsKey(obj, key)) {
        throw Error('The object already contains the key "' + key + '"');
    }
    GeckoJS.Map.set(obj, key, val);
};


/**
 * Adds a key-value pair to this Map. If the key already exists, an Error
 * exception is thrown.<br/>
 * <br/>
 * Use the set() method to replace an existing key-value pair.
 *
 * @name GeckoJS.Map#add
 * @public
 * @function
 * @param {String} key      This is the key to add
 * @param {Object} val      This is the value to add
 */
GeckoJS.Map.prototype.add = function(key, val){
    GeckoJS.Map.add(this, key, val);
};


/**
 * Returns the value for a given key from an object/hash/map. If the key is not
 * found in the object/hash/map, "opt_val" is returned.
 *
 * @name GeckoJS.Map.get
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object from which to get the value
 * @param {String} key      This is the key for which to get the value
 * @param {Object} opt_val  This is the value to return if key is not found; defaults to null
 * @return {Object}         The value for the given key in the object
 */
GeckoJS.Map.get = function(obj, key, opt_val){
	var opt = opt_val || null;
	if(GeckoJS.Map.containsKey(obj, key)) {
        return obj[key];
    }
    return opt;
};


/**
 * Returns the value for a given key from this Map. If the key is not found
 * in the object/hash/map, "opt_val" is returned.
 *
 * @name GeckoJS.Map#get
 * @public
 * @function
 * @param {String} key      This is the key for which to get the value
 * @param {Object} opt_val  This is the value to return if key is not found; defaults to null
 * @return {Object}         The value for the given key in this Map
 */
GeckoJS.Map.prototype.get = function(key, opt_val){
    return GeckoJS.Map.get(this._obj, key, opt_val);
};


/**
 * Adds a key-value pair to an object/hash/map. If the object/hash/map already
 * contains the key, replaces its current value wih the new value.
 *
 * @name GeckoJS.Map.set
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object to which to add a key-value pair
 * @param {String} key      This is the key to add
 * @param {Object} val      This is the value to add
 */
GeckoJS.Map.set = function(obj, key, value){
	if(typeof obj.set == 'function') {
		obj.set(key, value);
		return;
	}
    obj[key] = value;
	return;
};


/**
 * Adds a key-value pair to this Map. If the key already exists, replaces its
 * current value with the new value.
 *
 * @name GeckoJS.Map#set
 * @public
 * @function
 * @param {String} key      This is the key to add
 * @param {Object} val      This is the value to add
 */
GeckoJS.Map.prototype.set = function(key, value){

  if (!this.containsKey(key)) {
    this._count++;
    this._keys.push(key);
  }
  this._obj[key] = value;

};


/**
 * Adds multiple key-value pairs to this Map from another Map or Object.
 *
 * @name GeckoJS.Map#addAll
 * @public
 * @function
 * @param {Object} map      This is the Map or Object containing the key-value pairs to add
 */
GeckoJS.Map.prototype.addAll = function(map) {
  var keys, values;
  if (map instanceof GeckoJS.Map) {
    keys = map.getKeys();
    values = map.getValues();
  } else {
    keys = GeckoJS.BaseObject.getKeys(map);
    values = GeckoJS.BaseObject.getValues(map);
  }
  for (var i = 0; i < keys.length; i++) {
    this.set(keys[i], values[i]);
  }
};


/**
 * Serializes this Map using JSON encoding.
 *
 * @name GeckoJS.Map#serialize
 * @public
 * @function
 * @return {String}         The JSON representation of this Set
 */
GeckoJS.Map.prototype.serialize = function(){
	return GeckoJS.BaseObject.serialize(this._obj);
};


/**
 * Restores this Map to the state represented by the JSON string.
 *
 * @name GeckoJS.Map#unserialize
 * @public
 * @function
 * @param {String} str      The JSON representation of this Set
 * @return {Object}         The Set represented by the JSON string
 */
GeckoJS.Map.prototype.unserialize = function(str) {
	var res = GeckoJS.BaseObject.unserialize(str);
	this.clear();
	return this.addAll(res);
};

/**
 * Defines the GeckoJS.Set namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Set', GeckoJS.global);

/**
 * Creates a new GeckoJS.Set instance and initializes it with an empty set.
 * 
 * @class GeckoJS.Set implements the Set data structure, which is a collection
 * that contains no duplicate elements.<br/>
 *
 * @name GeckoJS.Set
 * @extends GeckoJS.BaseObject
 */
GeckoJS.Set = GeckoJS.BaseObject.extend('Set',
/** @lends GeckoJS.Set.prototype */
{

    /**
     * Set contructor
     *
     * @name GeckoJS.Set#init
     * @public
     * @function
     */
    init: function(){

        this._map = new GeckoJS.Map();

    }
});


/**
 * This is used to get the key or the hash. We are not using getHashCode
 * because it only works with objects
 *
 * @name GeckoJS.Set.getKey
 * @public
 * @static
 * @function
 * @param {*} val Object or primitive value to get a key for.
 * @return {string} A unique key for this value/object.
 */
GeckoJS.Set.getKey = function(val) {
  var type = typeof val;
  if (type == 'object') {
    return 'o' + GeckoJS.getHashCode(val);
  } else {
    return type.substr(0, 1) + val;
  }
};


/**
 * Returns the number of elements in the Set.
 *
 * @name GeckoJS.Set#getCount
 * @public
 * @function
 * @return {Number}         The number of elements in the Set
 */
GeckoJS.Set.prototype.getCount = function(){
    return this._map.getCount();
};


/**
 * Checks if an object is in the Set.
 *
 * @name GeckoJS.Set#contains
 * @public
 * @function
 * @param {Object} val      This is the object to check
 * @return {Boolean}        "true" if the object is in the Set; "false" otherwise
 */
GeckoJS.Set.prototype.contains = function(val){
    return this._map.containsKey(GeckoJS.Set.getKey(val));
};


/**
 * Returns all elements of the Set in an array.
 *
 * @name GeckoJS.Set#getValues
 * @public
 * @function
 * @return {Object}          An array containing all the elements of the Set
 */
GeckoJS.Set.prototype.getValues = function(){
    return this._map.getValues();
};


/**
 * Checks if the Set is empty.
 *
 * @name GeckoJS.Set#isEmpty
 * @public
 * @function
 * @return {Boolean}        "true" if the Set if empty; "false" otherwise
 */
GeckoJS.Set.prototype.isEmpty = function(){
    return this._map.isEmpty();
};


/**
 * Clears the Set (i.e. removes all elements of the Set, making it empty).
 *
 * @name GeckoJS.Set#clear
 * @public
 * @function
 */
GeckoJS.Set.prototype.clear = function(){
    this._map.clear();
};


/**
 * Removes an object from the Set.
 *
 * @name GeckoJS.Set#remove
 * @public
 * @function
 * @param {Object} obj      This is the object to remove from the Set
 * @return {Boolean}        "true" if the object exists in and is removed from the Set; "false" otherwise
 */
GeckoJS.Set.prototype.remove = function(obj){
    return this._map.remove( GeckoJS.Set.getKey(obj));
};


/**
 * Adds an object to the Set.<br/>
 * <br/>
 * If the object is already in the Set then no action takes place.
 *
 * @name GeckoJS.Set#add
 * @public
 * @function
 * @param {Object} obj      This is the object to add to the Set
 */
GeckoJS.Set.prototype.add = function(obj){
    this._map.set(GeckoJS.Set.getKey(obj), obj);
};


/**
 * Adds an object to the Set.<br/>
 * <br/>
 * If the object is already in the Set then no action takes place.
 *
 * @name GeckoJS.Set#set
 * @public
 * @function
 * @param {Object} obj}     This is the object to add to the Set
 */
GeckoJS.Set.prototype.set = function(obj){
    this._map.set(GeckoJS.Set.getKey(obj), obj);
};


/**
 * Adds all the elements from another Set.
 *
 * @name GeckoJS.Set#addAll
 * @public
 * @function
 * @param {Object} set      This is the Set containing the elements to add
 */
GeckoJS.Set.prototype.addAll = function(set) {
  var values;
  if (set instanceof GeckoJS.Set) {
    values = set.getValues();
  } else {
    values = GeckoJS.BaseObject.getValues(set);
  }
  for (var i = 0; i < values.length; i++) {
    this.set(values[i]);
  }
};


/**
 * Serializes the Set using JSON encoding.
 *
 * @name GeckoJS.Set#serialize
 * @public
 * @function
 * @return {String}         The JSON representation of this Set
 */
GeckoJS.Set.prototype.serialize = function(){
	return this._map.serialize();
};


/**
 * Restores this Set to the state represented by the JSON string.
 *
 * @name GeckoJS.Set#unserialize
 * @public
 * @function
 * @param {String} str      The JSON representation of this Set
 */
GeckoJS.Set.prototype.unserialize = function(str) {
	return this._map.unserialize(str);
};

/**
 * Defines the GeckoJS.Log namespace.
 *
 */
GREUtils.define('GeckoJS.Log', GeckoJS.global);

/**
 * Creates a static GeckoJS.Log instance.
 * 
 * @class GeckoJS.Log is a static object meant to be shared across the framework
 * and perhaps even the user's code. Its purpose is to provide a level-based
 * logging mechanism that can record log entris to multiple destinations of
 * various types.<br/>
 * <br/>
 * Under this scheme, each log destination is represented by an instance of
 * a GeckoJS.Log.Appender, and GeckoJS.Log acts as a central point of
 * dispatch that sends the log messages to the appropriate appenders. The log
 * level is used as the switch: when a message is logged as a certain level,
 * it is dispatched only to appenders whose log level is the same or higher.
 * This allows you to easily stream log messages to different output devices
 * and/or destinations.<br/>
 * <br/>
 * Finally, GeckoJS.Log can also used to instantiate class-specific loggers that
 * tag each log entry with a class identification string.<br/>
 * <pre>
 * - TRACE
 * - DEBUG
 * - INFO
 * - WARN
 * - ERROR
 * - FATAL
 * </pre>
 * @property {Object} classes            This is used to hold the class-specific loggers
 * @property {Object} levels             This is the list of built-in log levels
 * @property {Object} defaultClassLevel  This is the default log level used when creating class-specific loggers
 * @property {Object} appenders          This is used to hold the appenders
 * @property {GeckoJS.Log.defaultLogger} This is the default "GeckoJS" logger
 * @name GeckoJS.Log
 */
GeckoJS.Log = GeckoJS.Class.extend('Log', {});

// init static variables
/*
// FUEL's SessionStorage support
if (Application.storage.has("GeckoJS_Log_classes")) {
    GeckoJS.Log.classes = Application.storage.get("GeckoJS_Log_classes", (new GeckoJS.Map()) );
}else {
    GeckoJS.Log.classes = new GeckoJS.Map();
    Application.storage.set("GeckoJS_Log_classes", GeckoJS.Log.classes);
}*/
GeckoJS.Log.classes = new GeckoJS.Map();

/*
if (Application.storage.has("GeckoJS_Log_appenders")) {
    GeckoJS.Log.appenders = Application.storage.get("GeckoJS_Log_appenders", (new GeckoJS.Map()) );
}else {
    GeckoJS.Log.appenders = (new GeckoJS.Map());
    Application.storage.set("GeckoJS_Log_appenders", GeckoJS.Log.appenders);
}*/
GeckoJS.Log.appenders = new GeckoJS.Map();

GeckoJS.Log.defaultClassLevel = null;
GeckoJS.Log.defaultLogger = {};

GeckoJS.Log.levels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"];

/**
 * Returns in an array the built-in log levels.
 *
 * @name GeckoJS.Log.getLevels
 * @public
 * @static
 * @function
 * @return {Object}     An array of built-in log levels
 */
GeckoJS.Log.getLevels = function () {
    return GeckoJS.Log.levels;
};


/**
 * Creates a logger for the given class if such a logger has not already
 * been created, and returns it. This GeckoJS.Log.ClassLogger instance will log
 * entries marked as belonging to that specific class.<br/>
 * <br/>
 * The class is used only for identification purposes and is not related to
 * any GeckoJS classes or objects.
 *
 * @name GeckoJS.Log.getLoggerForClass
 * @public
 * @static
 * @function
 * @param {String} className  		This is the name of the class (just an identifier string).
 * @return {GeckoJS.Log.ClassLogger} 	A class-specific logger
 */
GeckoJS.Log.getLoggerForClass = function (className) {
    if (!GeckoJS.Log.classes.containsKey(className))
    {
        GeckoJS.Log.classes.set(className, new GeckoJS.Log.ClassLogger(className, GeckoJS.Log.defaultClassLevel));

        // resource release guarder
        /*
        window.addEventListener('unload', function(evt) {
            GeckoJS.Log.classes.remove(className);
        }, true);
        */

    }
    return GeckoJS.Log.classes.get(className);
};


/**
 * Checks if a class-specific logger already exists for a given class.
 *
 * @name GeckoJS.Log.hasLoggerForClass
 * @public
 * @static
 * @function
 * @param {String} className		This is the name of the class to look up
 * @return {Boolean}                  "true" if a logger already exists for the given class; "false" otherwise
 */
GeckoJS.Log.hasLoggerForClass = function (className) {
    return GeckoJS.Log.classes.containsKey(className);
};


/**
 * Adds a Log appender.
 *
 * @name GeckoJS.Log.addAppender
 * @public
 * @static
 * @function
 * @param {String} name 		This is the name of the appender
 * @param {GeckoJS.Log.Appender} appender     The instance of the Log appender to add
 */
GeckoJS.Log.addAppender = function (name, appender) {
    if(!GeckoJS.Log.appenders.containsKey(name)) {
        GeckoJS.Log.appenders.set(name, appender);

        // resource release guarder
        /*
        window.addEventListener('unload', function(evt) {
            GeckoJS.Log.appenders.remove(name);
        }, true);
        */
    }
};

/**
 * Removes the specified appender.
 *
 * @name GeckoJS.Log.removeAppender
 * @public
 * @static
 * @function
 * @param {String} name 		This is the name of the appender to remove
 */
GeckoJS.Log.removeAppender = function (name) {
    GeckoJS.Log.appenders.remove(name);
};

/**
 * Retrieves the given appender.
 *
 * @name GeckoJS.Log.getAppender
 * @public
 * @static
 * @function
 * @param {String} name 		This is the name of the appender to look for
 * @return {GeckoJS.Log.Appender}    		The appender instance
 */
GeckoJS.Log.getAppender = function (name) {
    return GeckoJS.Log.appenders.get(name);
};


/**
 * Dispatches the log message to the appropriate appenders for recording.
 *
 * @name GeckoJS.Log.log
 * @public
 * @static
 * @function
 * @param {String} className  		This is the associated log class
 * @param {GeckoJS.Log.Level} level This is the log level of the message
 * @param {String} message   		This is the message to log
 * @param {Object} [exception]      This is an optional exception to use
 * @return {GeckoJS.Log}            The GeckoJS.Log object;
 */
GeckoJS.Log.log = function (className, level, message, exception) {

    var appenders = GeckoJS.Log.appenders.getKeys();

    appenders.forEach(function(appenderName){
        var appender = GeckoJS.Log.appenders.get(appenderName);
        try {
              if (level.isAtLeast(appender.getLevel())) {
                  appender.append(className, level, message, exception);
              }
        }catch(ex){ 
            if (ex.name == "ReferenceError") {
                // maybe append at openwindow, and window closed
                GeckoJS.Log.appenders.remove(appenderName);
            }else {
                GREUtils.log(appenderName + ", " + ex );
            }
        }
    });

    return GeckoJS.Log;
    
};


/**
 * Initializes GeckoJS.Log and instantiates a default Logger of class "GeckoJS".
 *
 * @name GeckoJS.Log.init
 * @private
 * @function
 * @param {String} defClassLevel        The default level to use
 */
GeckoJS.Log.init = function (defClassLevel)
{
    var levels = GeckoJS.Log.getLevels();
    for (var i=0; i<levels.length; i++)	{
        var levelName = levels[i];
        GeckoJS.Log[levelName] = new GeckoJS.Log.Level(levelName, i);
    }
    GeckoJS.Log.defaultClassLevel = GeckoJS.Log[defClassLevel];

    GeckoJS.Log.defaultLogger = GeckoJS.Log.getLoggerForClass("GeckoJS");

};


/**
 * Logs a message at the "TRACE" level.
 *
 * @name GeckoJS.Log.trace
 * @public
 * @static
 * @function
 * @param {String} message		This is the message to append to the log.
 * @param {Error} [exception]   This is an optional error or exception to be logged
 * @return {GeckoJS.Log.ClassLogger}    The default logger object
 */
GeckoJS.Log.trace = function () {
    return GeckoJS.Log.defaultLogger.trace.apply(GeckoJS.Log.defaultLogger, arguments);
};

/**
 * Logs a message at the "DEBUG" level.
 *
 * @name GeckoJS.Log.debug
 * @public
 * @static
 * @function
 * @param {String} message		This is the message to append to the log.
 * @param {Error} [exception]   This is an optional error or exception to be logged
 * @return {GeckoJS.Log.ClassLogger}    The default logger object
 */
GeckoJS.Log.debug = function () {
    return GeckoJS.Log.defaultLogger.debug.apply(GeckoJS.Log.defaultLogger, arguments);
};

/**
 * Logs a message at the "INFO" level.
 *
 * @name GeckoJS.Log.info
 * @public
 * @static
 * @function
 * @param {String} message		This is the message to append to the log.
 * @param {Error} [exception]   This is an optional error or exception to be logged
 * @return {GeckoJS.Log.ClassLogger}    The default logger object
 */
GeckoJS.Log.info = function () {
    return GeckoJS.Log.defaultLogger.info.apply(GeckoJS.Log.defaultLogger, arguments);
};

/**
 * Logs a message at the "WARN" level.
 *
 * @name GeckoJS.Log.warn
 * @public
 * @static
 * @function
 * @param {String} message		This is the message to append to the log.
 * @param {Error} [exception]   This is an optional error or exception to be logged
 * @return {GeckoJS.Log.ClassLogger}    The default logger object
 */
GeckoJS.Log.warn = function () {
    return GeckoJS.Log.defaultLogger.warn.apply(GeckoJS.Log.defaultLogger, arguments);
};

/**
 * Logs a message at the "ERROR" level.
 *
 * @name GeckoJS.Log.error
 * @public
 * @static
 * @function
 * @param {String} message		This is the message to append to the log.
 * @param {Error} [exception]   This is an optional error or exception to be logged
 * @return {GeckoJS.Log.ClassLogger}    The default logger object
 */
GeckoJS.Log.error = function () {
    return GeckoJS.Log.defaultLogger.error.apply(GeckoJS.Log.defaultLogger, arguments);
};

/**
 * Logs a message at the "FATAL" level.
 *
 * @name GeckoJS.Log.fatal
 * @public
 * @static
 * @function
 * @param {String} message		This is the message to append to the log.
 * @param {Error} [exception]   This is an optional error or exception to be logged
 * @return {GeckoJS.Log.ClassLogger}    The default logger object
 */
GeckoJS.Log.fatal = function () {
    return GeckoJS.Log.defaultLogger.fatal.apply(GeckoJS.Log.defaultLogger, arguments);
};
/**
 * Creates a new GeckoJS.Log.Level instance with the given name and severity.
 *
 * @class GeckoJS.Log.Level is used to define logging levels. Each level is
 * associated with a name and a numeric value representing severity (higher
 * is more severe.)<br/>
 *
 * @name GeckoJS.Log.Level
 * @param {String} name		This is the name of the logging level
 * @param {Number} value	This is the severity
 */
GeckoJS.Log.Level = function (name, value) {
	this.name = name.toUpperCase();
	this.value = value;
};

/**
 * Returns the textual representation of the logging level, namely its name.
 *
 * @name GeckoJS.Log.Level#toString
 * @public
 * @function
 * @return {String} The textual representation of the logging level
 */
GeckoJS.Log.Level.prototype.toString = function () {
	return this.name;
};

/**
 * A common comparison operator on Level objects: is the current level
 * at or above the given level?
 *
 * @name GeckoJS.Log.Level#isAtLeast
 * @public
 * @function
 * @param {Number} otherLevel  the severity level to compare against
 * @return {Boolean} 		"true" if this logging level matches or is above the given level
 */
GeckoJS.Log.Level.prototype.isAtLeast = function (otherLevel) {
	return this.value >= otherLevel.value;
};

/**
 * A common comparison operator on Level objects: is the current level
 * at or below the given level?
 *
 * @name GeckoJS.Log.Level#isAtOrBelow
 * @public
 * @function
 * @param {Number} otherLevel  the severity level to compare against
 * @return {Boolean} 		"true" if this logging level matches or is below the given level
 */
GeckoJS.Log.Level.prototype.isAtOrBelow = function (otherLevel) {
	return this.value <= otherLevel.value;
};

/**
 * A common comparison operator on Level objects: is the current level
 * below the given level?
 *
 * @name GeckoJS.Log.Level#isBelow
 * @public
 * @function
 * @param {Number} otherLevel  the severity level to compare against
 * @return {Boolean} 		"true" if this logging level is below the given level
 */
GeckoJS.Log.Level.prototype.isBelow = function (otherLevel) {
	return this.value < otherLevel.value;
};

/**
 * Creates a new GeckoJS.Log.ClassLogger instance and initializes it with
 * a class name and a log level.
 * 
 * @class GeckoJS.Log.ClassLogger is used to log class-specific messages.
 * Each GeckoJS.Log.ClassLogger instance is associated with a class name and
 * a log level. The class logger will only record log messages at or above
 * its level, and each log entry will be tagged with its class name.<br/>
 *
 * @name GeckoJS.Log.ClassLogger
 * @param {String} name 		This is the class name
 * @param {GeckoJS.Log.Level} level     This is the log level
 */
GeckoJS.Log.ClassLogger = function (name, level) {
    this.className = name;
    this.level = level || GeckoJS.Log.defaultClassLevel;
};

/**
 * Logs a message.
 *
 * @name GeckoJS.Log.ClassLogger#log
 * @public
 * @function
 * @param {GeckoJS.Log.Level} level 		This is the level at which to log the message
 * @param {String} message           		This is the message (the module and caller will be prepended automatically)
 * @param {Exception} [exception]           This is an optional exception to log
 * @return {GeckoJS.Log.ClassLogger}        This GeckoJS.Log.ClassLogger instance
 */
GeckoJS.Log.ClassLogger.prototype.log = function (level, message, exception)
{
    if (level.isBelow(this.level))
    {
        return this;
    }
    // message = "[" + this.className + "] " + message;
    try {
        GeckoJS.Log.log(this.className, level, message, exception); 
    }catch(e) {
    }
    return this;
    
};


/**
 * Returns the current log level.
 *
 * @name GeckoJS.Log.ClassLogger#getLevel
 * @public
 * @function
 * @return {GeckoJS.Log.Level}		The current log level
 */
GeckoJS.Log.ClassLogger.prototype.getLevel = function getLevel()
{
    return this.level;
};

/**
 * Sets the log level.
 *
 * @name GeckoJS.Log.ClassLogger#setLevel
 * @public
 * @function
 * @param {GeckoJS.Log.Level} level     This is the log level to set this instance to
 * @return {GeckoJS.Log.ClassLogger}    This GeckoJS.Log.ClassLogger instance
 */
GeckoJS.Log.ClassLogger.prototype.setLevel = function setLevel(level)
{
    this.level = level;
    
    return this;
};


/**
 * Logs a message at the "TRACE" level.
 *
 * @name GeckoJS.Log.ClassLogger#trace
 * @public
 * @function
 * @param {String} message		This is the message to append to the log.
 * @param {Error} [exception]   This is an optional error or exception to be logged
 * @return {GeckoJS.Log.ClassLogger}        This GeckoJS.Log.ClassLogger instance
 */
GeckoJS.Log.ClassLogger.prototype.trace = function(message, exception) {
    return this.log(GeckoJS.Log.TRACE, message, exception);
};

/**
 * Logs a message at the "DEBUG" level.
 *
 * @name GeckoJS.Log.ClassLogger#debug
 * @public
 * @function
 * @param {String} message		This is the message to append to the log.
 * @param {Error} [exception]   This is an optional error or exception to be logged
 * @return {GeckoJS.Log.ClassLogger}        This GeckoJS.Log.ClassLogger instance
 */
GeckoJS.Log.ClassLogger.prototype.debug = function(message, exception) {
    return this.log(GeckoJS.Log.DEBUG, message, exception);
};

/**
 * Logs a message at the "INFO" level.
 *
 * @name GeckoJS.Log.ClassLogger#info
 * @public
 * @function
 * @param {String} message		This message to append to the log.
 * @param {Error} [exception]   This is an optional error or exception to be logged
 * @return {GeckoJS.Log.ClassLogger}        This GeckoJS.Log.ClassLogger instance
 */
GeckoJS.Log.ClassLogger.prototype.info = function(message, exception) {
    return this.log(GeckoJS.Log.INFO, message, exception);
};

/**
 * Logs a message at the "WARN" level.
 *
 * @name GeckoJS.Log.ClassLogger#warn
 * @public
 * @function
 * @param {String} message		This is the message to append to the log.
 * @param {Error} [exception]   This is an optional error or exception to be logged
 * @return {GeckoJS.Log.ClassLogger}        This GeckoJS.Log.ClassLogger instance
 */
GeckoJS.Log.ClassLogger.prototype.warn = function(message, exception) {
    return this.log(GeckoJS.Log.WARN, message, exception);
};

/**
 * Logs a message at the "ERROR" level.
 *
 * @name GeckoJS.Log.ClassLogger#error
 * @public
 * @function
 * @param {String} message		This is the message to append to the log.
 * @param {Error} [exception]   This is an optional error or exception to be logged
 * @return {GeckoJS.Log.ClassLogger}        This GeckoJS.Log.ClassLogger instance
 */
GeckoJS.Log.ClassLogger.prototype.error = function(message, exception) {
    return this.log(GeckoJS.Log.ERROR, message, exception);
};

/**
 * Logs a message at the "FATAL" level.
 *
 * @name GeckoJS.Log.ClassLogger#fatal
 * @public
 * @function
 * @param {String} message		This is the message to append to the log.
 * @param {Error} [exception]   This is an optional error or exception to be logged
 * @return {GeckoJS.Log.ClassLogger}        This GeckoJS.Log.ClassLogger instance
 */
GeckoJS.Log.ClassLogger.prototype.fatal = function(message, exception) {
    return this.log(GeckoJS.Log.FATAL, message, exception);
};

/**
 * Creates a new GeckoJS.Log.Appender instance and initializes it with a
 * log level.
 *
 * @class GeckoJS.Log.Appender is the base Log Appender class. A log appender
 * performs the recording of log messages to an output device, which may be
 * the console, a file, or a network end-point, for example. <br/>
 * <br/>
 * Each appender is assigned a log level; the appender will only process
 * messages at or above its assigned level.<br/>
 * <br/>
 * This is an abstract class and should be extended by sub-classes that
 * implement the actual writing of the log messages to specific output
 * devices.<br/>
 * 
 * @name GeckoJS.Log.Appender
 * @param {GeckoJS.Log.Level} level  This is the log level
 */
GeckoJS.Log.Appender = GeckoJS.Class.extend('Appender', 
/** @lends GeckoJS.Log.Appender.prototype */
{
    /**
     * GeckoJS.Log.Appender contructor
     *
     * @name GeckoJS.Log.Appender#init
     * @public
     * @function
     */
    init: function (level) {
        this.level = level;
    }
});

/**
 * Formats a log message for output.
 *
 * @name GeckoJS.Log.Appender#getFormattedMessage
 * @public
 * @function
 * @param {String} className 		This is the name of the class to use
 * @param {GeckoJS.Log.Level} level	This is the level to use for this message
 * @param {String} message   		This is the message to log
 * @param {Object} [exception] 		This is an optional exception object to use
 * @return {String} formattedMessage     The appropriately formatted log message
 */
GeckoJS.Log.Appender.prototype.getFormattedMessage = function (className, level, message, exception) {

    level = level || this.level || GeckoJS.Log.defaultClassLevel;

    var today = new Date();
    var formattedDate = today.getFullYear() + "-" + GeckoJS.String.padLeft((today.getMonth() +1) , 2) + "-" + GeckoJS.String.padLeft(today.getDate(), 2) + " " +
    GeckoJS.String.padLeft(today.getHours(), 2) + ":" + GeckoJS.String.padLeft(today.getMinutes(), 2) + ":" + GeckoJS.String.padLeft(today.getSeconds(), 2);

    var formattedException = '';
    if(exception) {
        // delete exception.stack;
        // delete exception.source;

        formattedException = '; ' + GeckoJS.BaseObject.dump(exception);

        var stack = Components.stack.caller;

        var iterations = 0;
        var stackTrace = [];
        var MAX_ITERATIONS = 50;
        while (stack && (iterations < MAX_ITERATIONS))
        {
            if (stack==null || typeof stack == 'undefined') break;

            var name = (stack.name == null) ? '<no name>' : stack.name;

            // skip geckojs / greutils and binding
            if (stack.filename != null && stack.filename.match(/geckojs|greutils/i)) {
                
            }else {
                stackTrace.push("[name: " + name + "] [line: " + stack.lineNumber + "] [filename: " + stack.filename + "]");
            }
            stack = stack.caller;
            iterations++;
        }

        formattedException += "; Components.stack.caller \n" + GeckoJS.BaseObject.dump(stackTrace);

    }

    var formattedMessage = formattedDate + " : [" + level + "] [" + className + "] " + message + formattedException + "\n";
    
    return formattedMessage;
};


/**
 * Appends a log message
 *
 * @name GeckoJS.Log.Appender#append
 * @public
 * @function
 * @param {String} className 		This is the name of the class to use
 * @param {GeckoJS.Log.Level} level	This is the level to use for this message
 * @param {String} message   		This is the message to log
 * @param {Object} [exception] 		This is the optional exception object to use
 */
GeckoJS.Log.Appender.prototype.append = function (className, level, message, exception) {
};


/**
 * Returns the log level to which this appender is set. Messages below this
 * level will not be logged.
 *
 * @name GeckoJS.Log.Appender#getLevel
 * @public
 * @function
 * @return {GeckoJS.Log.Level} 		The current log level
 */
GeckoJS.Log.Appender.prototype.getLevel = function () {
    return this.level;
};

/**
 * Sets the appender's log level. The appender will not log messages below this
 * level.
 *
 * @name GeckoJS.Log.Appender#setLevel
 * @public
 * @function
 * @param {GeckoJS.Log.Level} level  This is the log level to assign to the appender
 */
GeckoJS.Log.Appender.prototype.setLevel = function setLevel(level) {
    this.level = level;
};



/**
 * Returns the appender's name.
 *
 * @name GeckoJS.Log.Appender#toString
 * @public
 * @function
 * @return {String} 		The appender's name
 */
GeckoJS.Log.Appender.prototype.toString = function() {
    return "["+ this.getClassName() +"]";
};

/**
 * Creates a new GeckoJS.Log.ConsoleAppender instance and initializes it with
 * a log level.
 *
 * @class GeckoJS.Log.ConsoleAppender is a log appender that records log
 * messages to the console.<br/>
 * <br/>
 * Each GeckoJS.Log.ConsoleAppender is assigned a log level; the appender will
 * only output to the console messages at or above its assigned level.<br/>
 *
 * @name GeckoJS.Log.ConsoleAppender
 * @extends GeckoJS.Log.Appender
 *
 * @param {GeckoJS.Log.Level} level  This is the logl level
 */
GeckoJS.Log.ConsoleAppender = GeckoJS.Log.Appender.extend('ConsoleAppender',
/** @lends GeckoJS.Log.ConsoleAppender.prototype */
{
    /**
     * GeckoJS.Log.ConsoleAppender contructor
     *
     * @name GeckoJS.Log.ConsoleAppender#init
     * @public
     * @function
     * @param {String} level
     */
    init: function(level) {
        this.level = level;
    }
});


/**
 * Logs a message by appending it to the end of the console device.
 *
 * @name GeckoJS.Log.ConsoleAppender#append
 * @public
 * @function
 * @param {String} className 		This is the name of the class to use
 * @param {GeckoJS.Log.Level} level	This is the log level to use for this message
 * @param {String} message   		This is the message to log
 * @param {Object} [exception] 		This is an optional exception object to use
 * @return {GeckoJS.Log.ConsoleAppender} This GeckoJS.Log.ConsoleAppender instance
 */
GeckoJS.Log.ConsoleAppender.prototype.append = function (className, level, message, exception) {

    // only mainThread logging... for threadsafe.
    var currentThread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
    var mainThread = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;

    if (currentThread === mainThread ) {
        GREUtils.XPCOM.getUsefulService("consoleservice").logStringMessage(this.getFormattedMessage(className, level, message, exception));
    }else {
        // @todo use dump ??
        // GREUtils.XPCOM.getUsefulService("consoleservice").logStringMessage(this.getFormattedMessage(className, level, message, exception));
        if(typeof dump == 'function') dump(className + ' ' + level + ' ' + message + '\n\n');
        // Components.utils.reportError(message);
    }
    return this;

};

/**
/**
 * Creates a new GeckoJS.Log.FileAppender instance and initializes it with a
 * log level and the path to the log file.
 *
 * @class GeckoJS.Log.ConsoleAppender is a log appender that records log
 * messages to a file.<br/>
 * <br/>
 * Each GeckoJS.Log.FileAppender is assigned a log level; the appender will
 * only output to the log file messages at or above its assigned level.<br/>
 *
 * @name GeckoJS.Log.FileAppender
 * @extends GeckoJS.Log.Appender
 *
 * @param {GeckoJS.Log.Level} level  This is the log level
 * @param {String} logFile   		This is the path to the log file
 */
GeckoJS.Log.FileAppender = GeckoJS.Log.Appender.extend('FileAppender',
/** @lends GeckoJS.Log.FileAppender.prototype */
{
    
    /**
     * GeckoJS.Log.FileAppender contructor
     *
     * @name GeckoJS.Log.FileAppender#init
     * @public
     * @function
     * @param {String} level
     * @param {String} logFile
     */
    init: function(level, logFile) {
        this.level = level;
        this.logFile = logFile || null;
    }
});


/**
 * Logs a message by appending it to the end of the log file.
 *
 * @name GeckoJS.Log.FileAppender#append
 * @public
 * @function
 * @param {String} className 		This is the name of the class to use
 * @param {GeckoJS.Log.Level} level	This is the level to use for this message
 * @param {String} message   		This is the message to log
 * @param {Object} [exception] 		This is an optional exception object to use
 * @return {GeckoJS.Log.FileAppender} This GeckoJS.Log.FileAppender instance
 */
GeckoJS.Log.FileAppender.prototype.append = function (className, level, message, exception) {
    GeckoJS.File.appendLine(this.logFile, this.getFormattedMessage(className, level, message, exception));
    return this;
};
/**
 * Defines the GeckoJS.EventItem namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.EventItem', GeckoJS.global);

/**
 * Creates a new GeckoJS.EventItem instance and initializes its type, data, and
 * target fields.
 * 
 * @class GeckoJS.EventItem represents an occurrence of an event in VIVIPOS
 * APP Engine MVC Framework.<br/>
 *
 * @name GeckoJS.EventItem
 * @property {Boolean} cancel       The cancel status of the event item; initially "false"; changes to "true" when preventDefault() is invoked on the EventItem instance (read-only)
 *     
 * @param {String} type             This is the event type
 * @param {Object} data             This is the event data
 * @param {Object} target           This is the event target
 */
GeckoJS.EventItem = function(type, data, target){

    this.type = type;
    this.data = (typeof data != 'undefined') ? data : null;
	this.target = target || this;

	// is Event Cancel
        
    this._cancel = false;

};

// cancel getter
GeckoJS.EventItem.prototype.__defineGetter__('cancel', function(){
    return this._cancel;
});

/**
 * Returns the event name of this event item.
 *
 * @public
 * @function
 * @return {String}         The event name of this event item
 */
GeckoJS.EventItem.prototype.getType = function() {
	return this.type;
};


/**
 * Returns the event data of this event item.
 *
 * @name GeckoJS.EventItem#getData
 * @public
 * @function
 * @return {Object}         The event data of this event item
 */
GeckoJS.EventItem.prototype.getData = function() {
	return this.data;
};

/**
 * Returns the event target of this event item.
 *
 * @name GeckoJS.EventItem#getTarget
 * @public
 * @function
 * @return {Object}         The event target of this event item
 */
GeckoJS.EventItem.prototype.getTarget = function() {
	return this.target;
};

/**
 * Returns the cancel status of this event item (i.e. whether preventDefault()
 * has been invoked on this event item.) 
 *
 * @name GeckoJS.EventItem#isCancel
 * @public
 * @function
 * @return {Boolean}         The cancel status of this event item
 */
GeckoJS.EventItem.prototype.isCancel = function() {
	return this.cancel;
};

/**
 * Causes the Event dispatcher that created this EventItem instance to return
 * "false" to the dispatcher's caller.
 *
 * @name GeckoJS.EventItem#preventDefault
 * @public
 * @function
 */
GeckoJS.EventItem.prototype.preventDefault = function(){
    this._cancel = true;
};

/**
 * Defines the GeckoJS.Event namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Event', GeckoJS.global);

/**
 * Creates a new GeckoJS.Event instance and initializes it with an empty list
 * of listeners.
 * 
 * @class GeckoJS.Event is used to associate MVC events with event listeners in
 * the GeckoJS APP Engine.<br/>
 * <br/>
 * GeckoJS.Event provides a mechanism for global callbacks to be hooked into
 * the event dispatching flow. A global callback may be of type "before" or
 * "after". Before dispatching any event, GeckoJS.Event will invoke each of the
 * callbacks in turn, and will stop when either all the callbacks have been
 * invoked, or if a callback cancels the callback chain by calling
 * preventDefault() on the EventItem. Similarly, "after" callbacks are invoked
 * after the event has been dispatched (the event is dispatched regardless of
 * the results of the "before" callbacks.)<br/>
 * <br/>
 * Each callback may be an object or a function; if an object, it should have
 * a "handleEvent" property containing a function. GeckoJS.Event will invoke
 * the callback in the scope given when the callback is added (through
 * "addCallback" with an EventItem argument containing the name, data, and
 * target of the event being dispatched.<br/>
 * 
 * @name GeckoJS.Event
 *
 * @property {Object} listeners   An array of event listeners (read-only)
 *
 */

GeckoJS.Event = GeckoJS.BaseObject.extend('Event',
/** @lends GeckoJS.Event.prototype */
{
    /**
     * Event contructor
     *
     * @name GeckoJS.Event#init
     * @public
     * @function
     * @param {Array} listeners
     */
    init: function(listeners){
        this.listeners = listeners || [];
    }
});
/*
GeckoJS.Event = function(){
    this.listeners = [];
};
*/

/**
 * An array of global event callbacks
 *
 * @name GeckoJS.Event.callbacks
 * @public
 * @static
 * @field {Object} callbacks
 */
GeckoJS.Event.callbacks = [];
/*
if (Application.storage.has("GeckoJS_Event_callbacks")) {
    GeckoJS.Event.callbacks = Application.storage.get("GeckoJS_Event_callbacks", (new Array()) );
}else {
    GeckoJS.Event.callbacks = (new Array());
    Application.storage.set("GeckoJS_Event_callbacks", GeckoJS.Event.callbacks);
}
*/

/**
 * Adds a global event callback.<br/>
 * <br/>
 * This method checks if the same event-callback combination already exists
 * before adding a new callback.
 *
 * @name GeckoJS.Event.addCallback
 * @public
 * @static
 * @function
 * @param {String} aType          This is the type of callback to add ("before" or "after")
 * @param {Object} aCallback    This is the callback function or object
 * @param {Object} thisObj        Locking its execution scope to this object
 */
GeckoJS.Event.addCallback = function(aType, aCallback, thisObj){

    if(!aType || !aCallback) return;

    if (GeckoJS.Event.callbacks.some(function(element){
        return element.type == aType && element.callback == aCallback;
    })) return;

    // add id
    if(!aCallback.__hashCode) aCallback.__hashCode = GeckoJS.String.uuid();

    GeckoJS.Event.callbacks.push({
        type: aType.toLowerCase(),
        callback: aCallback,
        thisObj: thisObj || GeckoJS.global
    });

    // resource release guarder
    /*
    if(typeof window != 'undefined') {
        var self = this;
        window.addEventListener('unload', function(evt) {
            GeckoJS.Event.removeCallback(aType, aCallback);
        }, true);
    }*/

};

/**
 * Removes a global event callback.<br/>
 *
 * @name GeckoJS.Event.removeCallback
 * @public
 * @static
 * @function
 * @param {String} aType          This is the event for type of callback is to be added , before or after
 * @param {Function} aCallback    This is the callback function to add
 */
GeckoJS.Event.removeCallback = function(aType, aCallback){

    for (var i = GeckoJS.Event.callbacks.length -1; i >0; i--) {
        var element = GeckoJS.Event.callbacks[i];
        if ( element.type == aType && (element.callback == aCallback || element.callback.__hashCode == aCallback.__hashCode) ) {
            this.GeckoJS.Event.callbacks.splice(i,1);
        }

    }
    /*
    GeckoJS.Event.callbacks = GeckoJS.Event.callbacks.filter(function(element){
        return element.type != aType && element.callback != aCallback;
    });
    */

};

/**
 * Invokes global event callbacks.<br/>
 * <br/>
 * Callbacks are invoked in turn until a callback stops the chain by calling
 * preventDefault() on the EventItem or until all the callbacks have been
 * invoked.
 *
 * @name GeckoJS.Event.processCallback
 * @public
 * @static
 * @function
 * @param {String} aType          This is the type of callback to invoke ("before" or "after")
 * @param {GeckoJS.EventItem} aEventItem     This is the EventItem to pass to the callbacks
 */
GeckoJS.Event.processCallback = function(aType, aEventItem){
    
    GeckoJS.Event.callbacks.forEach(function(key){
        if (key.type == aType && !aEventItem.cancel) {

            try {
                key.callback.handleEvent ? key.callback.handleEvent.call(key.thisObj, aEventItem) : key.callback.call(key.thisObj, aEventItem);
            }catch(ex) {
                if (ex.name == "ReferenceError") {
                    GeckoJS.Event.removeCallback(key.type, key.callback);
                }else {
                    GeckoJS.Event.log('Event', 'ERROR', 'GeckoJS.Event.processCallback', ex);
                }
            }
        }
    });
    
};


/**
 * Adds a listener for an event.<br/>
 * <br/>
 * This method checks if the same event-listener combination already exists
 * before adding a new listener.
 *
 * @name GeckoJS.Event#addListener
 * @public
 * @function
 * @param {String} aEvent         This is the event for which a listener is to be added
 * @param {Function} aListener    This is the listener function to add
 * @param {Object} thisObj        Locking its execution scope to this object
 */
GeckoJS.Event.prototype.addListener = function(aEvent, aListener, thisObj){
    
    if(!aEvent || !aListener) return;

    if (this.listeners.some(function(element){
        return element.event == aEvent && element.listener == aListener;
    })) return;

    // add id
    if(!aListener.__hashCode) aListener.__hashCode = GeckoJS.String.uuid();
    
    this.listeners.push({
        event: aEvent,
        listener: aListener,
        thisObj: thisObj || GeckoJS.global
    });

    // resource release guarder
    /*
    if(typeof window != 'undefined') {
        var self = this;
        window.addEventListener('unload', function(evt) {
            self.removeListener(aEvent, aListener);
        }, true);
    }*/
/*
    function hasFilter(element){
        return element.event == aEvent && element.listener == aListener;
    }*/
};

/**
 * Removes a listener for an event.<br/>
 *
 * @name GeckoJS.Event#removeListener
 * @public
 * @function
 * @param {String} aEvent         This is the event for which a listener is to be removed
 * @param {Function} aListener    This is the listener function to be removed
 */
GeckoJS.Event.prototype.removeListener = function(aEvent, aListener){

    for (var i = this.listeners.length -1; i >=0; i--) {
        var element = this.listeners[i];
        if ( element.event == aEvent && (element.listener == aListener || element.listener.__hashCode == aListener.__hashCode) ) {
            this.listeners.splice(i,1);
        }
    }

};

/**
 * Dispatches an event to all listeners of that event.<br/>
 * <br/>
 * This method creates an EventItem instance from the input parameters to pass
 * to the event listeners. If any of the listeners invokes the preventDefault()
 * method on the EventItem instance, this method will return "false". Otherwise
 * it returns "true".
 *
 * @name GeckoJS.Event#dispatch
 * @public
 * @function
 * @param {String} aEvent         This is the name of the event to dispatch
 * @param {Object} aEventData     This is the event data to dispatch
 * @param {Object} aTarget        This is the event target
 * @return {Boolean}              Whether preventDefault() has been invoked on the event
 */
GeckoJS.Event.prototype.dispatch = function(aEvent, aEventData, aTarget){

    /*
     * if workerThread , disable dispatch and process callback .
     * This will prevent listener update UI in worker thread.
     */
    try {
        var curThread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
        var mainThread = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;

        if (curThread !== mainThread) {
            dump('WARN: Dispatch Event in worker Thread !!! \n');
            return false;
        }

    }catch(e) {
        return false;
    }

    var eventItem = new GeckoJS.EventItem(aEvent, aEventData, aTarget);

    var self = this;
    this.listeners.forEach(function(key){
        GeckoJS.Event.processCallback("before", eventItem);
        
        if (key.event == aEvent && !eventItem.cancel) {

            try {
                key.listener.handleEvent ? key.listener.handleEvent.call(key.thisObj, eventItem) : key.listener.call(key.thisObj, eventItem);
            }catch(ex){              
                if (ex.name == "ReferenceError") {
                    self.removeListener(key.event, key.listener);
                }else {
                    GeckoJS.Event.log('Event', 'ERROR', 'GeckoJS.Event.dispatch (' + key.event +') ', ex);
                }
            }

        }
        
        GeckoJS.Event.processCallback("after", eventItem);
    });

    return !eventItem.cancel;
};

/**
 * Defines the GeckoJS.Filter namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Filter', GeckoJS.global);

/**
 * Creates a new GeckoJS.Filter instance and initializes it with an empty
 * list of callbacks.
 *
 * @deprecated Use GeckoJS.Event instead
 *
 * @class [deprecated] GeckoJS.Filter is used to associate MVC actions with a chain of
 * filter functions in the GeckoJS App Engine.<br/>
 *
 * @name GeckoJS.Filter
 * @property {Object} callbacks   An array of filter functions
 */
GeckoJS.Filter = function(){
    this.callbacks = [];
};

/**
 * Adds a filter for an action to the filter chain.<br/>
 * <br/>
 * This method checks if the same filter type/callback combination already exists
 * before adding a new filter.
 *
 * @deprecated Use GeckoJS.Event instead
 * @name GeckoJS.Filter#addFilter
 * @public
 * @function
 * @param {Object} aType          This is the type of filter to add
 * @param {Function} aFilter      This is the filter function to add
 */
GeckoJS.Filter.prototype.addFilter = function(aType, aFilter){
    if (this.callbacks.some(hasFilter))
        return;

    this.callbacks.push({
        type: aType,
        filter: aFilter
    });

    function hasFilter(element){
        return element.type == aType && element.filter == aFilter;
    }
};

/**
 * Removes a filter from the filter chain.
 *
 * @deprecated Use GeckoJS.Event instead
 * @name GeckoJS.Filter#removeFilter
 * @public
 * @function
 * @param {Object} aType          This is the type of filter to remove
 * @param {Function} aFilter      This is the filter function to removed
 */
GeckoJS.Filter.prototype.removeFilter = function(aType, aFilter){
    this.callbacks = this.callbacks.filter(function(element){
        return element.type != aType && element.filter != aFilter;
    });
};

/**
 * Processes each filter of a given type in the filter chain in order.<br/>
 * <br/>
 * This method creates an EventItem instance from the input parameters to pass
 * to the filter functions. If any of the filters fails (i.e. returns "false")
 * then the chain is broken, subsequent filters are not called, and "false" is
 * returned.<br/>
 * <br/>
 * Otherwise "true" is returned.s
 *
 * @deprecated Use GeckoJS.Event instead
 * @name GeckoJS.Filter#process
 * @public
 * @function
 * @param {String} aType          This is the type of filters to process
 * @param {Object} aEventData     This is the data to pass to the filter functions
 * @param {Object} aTarget        This is the target to pass to the filter functions
 * @return {Boolean}              Whether all filters pass (i.e. return "true")
 */
GeckoJS.Filter.prototype.process = function(aType, aEventData, aTarget) {
	var eventItem = new GeckoJS.EventItem(aType, aEventData, aTarget);

    var filterChain = true;

    this.callbacks.forEach(function(key){

        if (key.type == aType && filterChain == true) {

			try {
            	filterChain = key.filter.handleFilter ? key.filter.handleFilter(eventItem) : key.filter(eventItem);
			}catch(e) {
				this.log('[Error] GeckoJS.Filter.process ' + e.message);
				// make other filter to run
				filterChain = true;
			}
        }

    });
    return filterChain;
};

/**
 * Defines the  GeckoJS.Inflector namespace
 * 
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Inflector', GeckoJS.global);


/**
 * Creates a new GeckoJS.Inflector instance.
 * 
 * @class GeckoJS.Inflector provides a Rails-like set of methods for inflecting
 * natural language words.<br/>
 *
 * @public
 * @name GeckoJS.Inflector
 * @class
 */
GeckoJS.Inflector = function(){
    };

// GREUtils.inherits(GeckoJS.Inflector, GeckoJS.BaseObject);

/**
 * Inflections
 *
 * @name GeckoJS.Inflector.Inflections
 * @private
 * @field Inflections
 */
GeckoJS.Inflector.Inflections = {
    plural: [
    [/(s)tatus$/i,               "$1tatuses"  ],
    [/(quiz)$/i,               "$1zes"  ],
    [/^(ox)$/i,                "$1en"   ],
    [/([m|l])ouse$/i,          "$1ice"  ],
    [/(matr|vert|ind)ix|ex$/i, "$1ices" ],
    [/(x|ch|ss|sh)$/i,         "$1es"   ],
    [/([^aeiouy]|qu)y$/i,      "$1ies"  ],
    [/(hive)$/i,               "$1s"    ],
    [/(?:([^f])fe|([lr])f)$/i, "$1$2ves"],
    [/sis$/i,                  "ses"    ],
    [/([ti])um$/i,             "$1a"    ],
    [/(p)erson$/i,             "$1eople"],
    [/(m)an$/i,                "$1en"   ],
    [/(c)hild$/i,              "$1hildren"   ],
    [/(buffal|tomat)o$/i,      "$1oes"  ],
    [/(alumn|bacill|cact|foc|fung|nucle|radi|stimul|syllab|termin|vir)us$/i,                "$1i"  ],
    [/us$/i,                "uses"  ],
    [/(alias)$/i,       "$1es"   ],
    [/(octop|vir)us$/i,        "$1i"    ],
    [/(ax|cri|test)is$/i,      "$1es"   ],
    [/s$/i,                    "s"      ],
    [/$/,                      "s"      ]
    ],

    singular: [
    [/(s)tatuses$/i,                                                    "$1tatus"     ],
    [/^(.*)(menu)s$/i,                                                    "$1$2"     ],
    [/(quiz)zes$/i,                                                    "$1"     ],
    [/(matr)ices$/i,                                                   "$1ix"   ],
    [/(vert|ind)ices$/i,                                               "$1ex"   ],
    [/^(ox)en/i,                                                       "$1"     ],
    [/(alias)(es)*$/i,                                             "$1"     ],
    [/(alumn|bacill|cact|foc|fung|nucle|radi|stimul|syllab|termin|viri?)i$/i,   "$1us"     ],
    [/(cris|ax|test)es$/i,                                             "$1is"   ],
    [/(shoe)s$/i,                                                       "$1"],
    [/(octop|vir)i$/i,                                                 "$1us"   ],
    [/ouses$/i,                                                        "ouse"   ],
    [/uses$/i,                                                         "us"     ],
    [/([m|l])ice$/i,                                                   "$1ouse" ],
    [/(x|ch|ss|sh)es$/i,                                               "$1"     ],
    [/(m)ovies$/i,                                                     "$1ovie" ],
    [/(s)eries$/i,                                                     "$1eries"],
    [/([^aeiouy]|qu)ies$/i,                                            "$1y"    ],
    [/([lr])ves$/i,                                                    "$1f"    ],
    [/(tive)s$/i,                                                      "$1"     ],
    [/(hive)s$/i,                                                      "$1"     ],
    [/(drive)s$/i,                                                     "$1"       ],
    [/([^f])ves$/i,                                                    "$1fe"   ],
    [/(^analy)ses$/i,                                                  "$1sis"  ],
    [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, "$1$2sis"],
    [/([ti])a$/i,                                                      "$1um"   ],
    [/(p)eople$/i,                                                      "$1erson" ],
    [/(m)en$/i,                                                         "$1an" ],
    [/(c)hildren$/i,                                                    "$1hild" ],
    [/(n)ews$/i,                                                       "$1ews"  ],
    [/(shoe)s$/i,                                                      "$1"     ],
    [/(bus)es$/i,                                                      "$1"     ],
    [/^(.*us)$/i,                                                      "$1"     ],
    [/s$/i,                                                            ""       ]
    ],

    irregularPlural: [
    ['atlas',   'atlases'   ],
    ['beef',    'beefs'   ],
    ['brother',  'brothers'],
    ['child',    'children'     ],
    ['corpus', 'corpuses'  ],
    ['cow', 'cows'  ],
    ['ganglion', 'ganglions'  ],
    ['genie', 'genies'  ],
    ['genus', 'genera'  ],
    ['graffito', 'graffiti'  ],
    ['hoof', 'hoofs'  ],
    ['loaf', 'loaves'  ],
    ['man', 'men'  ],
    ['money', 'monies'  ],
    ['mongoose', 'mongooses'  ],
    ['move', 'moves'  ],
    ['mythos', 'mythoi'  ],
    ['numen', 'numina'  ],
    ['occiput', 'occiputs'  ],
    ['octopus', 'octopuses'  ],
    ['opus', 'opuses'  ],
    ['ox', 'oxen'  ],
    ['penis', 'penises'  ],
    ['person', 'people'  ],
    ['sex', 'sexes'  ],
    ['soliloquy', 'soliloquies'  ],
    ['testis', 'testes'  ],
    ['trilby', 'trilbys'  ],
    ['turf', 'turfs'  ],
    ['tax', 'taxes'  ]
    ],

    irregularSingular: [
    ['atlases',   'atlas'   ],
    ['beefs',    'beef'   ],
    ['brothers',  'brother'],
    ['children',    'child'     ],
    ['corpuses', 'corpus'  ],
    ['cows', 'cow'  ],
    ['ganglions', 'ganglion'  ],
    ['genies', 'genie'  ],
    ['genera', 'genus'  ],
    ['graffiti', 'graffito'  ],
    ['hoofs', 'hoof'  ],
    ['loaves', 'loaf'  ],
    ['men', 'man'  ],
    ['monies', 'money'  ],
    ['mongooses', 'mongoose'  ],
    ['moves', 'move'  ],
    ['mythoi', 'mythos'  ],
    ['numina', 'numen'  ],
    ['occiputs', 'occiput'  ],
    ['octopuses', 'octopus'  ],
    ['opuses', 'opus'  ],
    ['oxen', 'ox'  ],
    ['penises', 'penis'  ],
    ['people', 'person'  ],
    ['sexes', 'sex'  ],
    ['soliloquies', 'soliloquy'  ],
    ['testes', 'testis'  ],
    ['trilbys', 'trilby'  ],
    ['turfs', 'turf'  ],
    ['taxes', 'tax'  ]
    ],

    uncountable: [
    "sheep", "fish", "series", "species", "money", "rice", "information", "equipment", 'moose', 'deer',	'news', 'Amoyese',
    'bison', 'Borghese', 'bream', 'breeches', 'britches', 'buffalo', 'cantus', 'carp', 'chassis', 'clippers',
    'cod', 'coitus', 'Congoese', 'contretemps', 'corps', 'debris', 'diabetes', 'djinn', 'eland', 'elk',
    'equipment', 'Faroese', 'flounder', 'Foochowese', 'gallows', 'Genevese', 'Genoese', 'Gilbertese', 'graffiti',
    'headquarters', 'herpes', 'hijinks', 'Hottentotese', 'information', 'innings', 'jackanapes', 'Kiplingese',
    'Kongoese', 'Lucchese', 'mackerel', 'Maltese', 'media', 'mews', 'moose', 'mumps', 'Nankingese', 'news',
    'nexus', 'Niasese', 'Pekingese', 'Piedmontese', 'pincers', 'Pistoiese', 'pliers', 'Portuguese', 'proceedings',
    'rabies', 'rice', 'rhinoceros', 'salmon', 'Sarawakese', 'scissors', 'sea[- ]bass', 'series', 'Shavese', 'shears',
    'siemens', 'species', 'swine', 'testes', 'trousers', 'trout', 'tuna', 'Vermontese', 'Wenchowese',
    'whiting', 'wildebeest', 'Yengeese'
    ]
};

/**
 * Turns a number into an ordinal string used to denote the position in an ordered
 * sequence such as 1st, 2nd, 3rd, 4th...
 *
 * @name GeckoJS.Inflector.ordinalize
 * @public
 * @static
 * @function
 * @param {Int} number        This is an integer to ordinalize
 * @return {String}           An ordinal string
 */
GeckoJS.Inflector.ordinalize = function(number) {
    if (11 <= parseInt(number) % 100 && parseInt(number) % 100 <= 13) {
        return number + "th";
    } else {
        switch (parseInt(number) % 10) {
            case  1: return number + "st";
            case  2: return number + "nd";
            case  3: return number + "rd";
            default: return number + "th";
        }
    }
};

/**
 * Returns the plural form of a word.
 *
 * @name GeckoJS.Inflector.pluralize
 * @public
 * @static
 * @function
 * @param {String} word       This is the word to pluralize
 * @return {String}           The plural form of the word
 */
GeckoJS.Inflector.pluralize = function(word) {
    for (var i = 0; i < GeckoJS.Inflector.Inflections.uncountable.length; i++) {
        var uncountable = GeckoJS.Inflector.Inflections.uncountable[i];
        if (word.toLowerCase() == uncountable) {
            return uncountable;
        }
    }
    for (var i = 0; i < GeckoJS.Inflector.Inflections.irregularPlural.length; i++) {
        var singular = GeckoJS.Inflector.Inflections.irregularPlural[i][0];
        var plural   = GeckoJS.Inflector.Inflections.irregularPlural[i][1];
        if ((word.toLowerCase() == singular) || (word.toLowerCase() == plural)) {
            return plural;
        }
    }
    for (var i = 0; i < GeckoJS.Inflector.Inflections.plural.length; i++) {
        var regex          = GeckoJS.Inflector.Inflections.plural[i][0];
        var replace_string = GeckoJS.Inflector.Inflections.plural[i][1];
        if (regex.test(word)) {
            return word.replace(regex, replace_string);
        }
    }

    // not match anymore
    return word;
};


/**
 * Returns the singular form of a word.
 *
 * @name GeckoJS.Inflector.singularize
 * @public
 * @static
 * @function
 * @param {String} word       This is the word to singularize
 * @return {String}           The singular form of the word
 */
GeckoJS.Inflector.singularize = function(word) {
    for (var i = 0; i < GeckoJS.Inflector.Inflections.uncountable.length; i++) {
        var uncountable = GeckoJS.Inflector.Inflections.uncountable[i];
        if (word.toLowerCase() == uncountable) {
            return uncountable;
        }
    }
    for (var i = 0; i < GeckoJS.Inflector.Inflections.irregularSingular.length; i++) {
        var plural = GeckoJS.Inflector.Inflections.irregularSingular[i][0];
        var singular = GeckoJS.Inflector.Inflections.irregularSingular[i][1];
        if ((word.toLowerCase() == singular) || (word.toLowerCase() == plural)) {
            return singular;
        }
    }
    for (var i = 0; i < GeckoJS.Inflector.Inflections.singular.length; i++) {
        var regex          = GeckoJS.Inflector.Inflections.singular[i][0];
        var replace_string = GeckoJS.Inflector.Inflections.singular[i][1];
        if (regex.test(word)) {
            return word.replace(regex, replace_string);
        }
    }
    
    // not match anymore
    return word;
};

/**
 * Returns the Camelized form of a string.
 *
 * @name GeckoJS.Inflector.camelize
 * @public
 * @static
 * @function
 * @param {String} word       This is the string to camelize
 * @return {String}           The camelized form of the string
 */
GeckoJS.Inflector.camelize = function (word) {
    var rep_words = function(str) {
        return str.replace(/^(.)|_(.)/g, function ( $1 ) {
            return $1.toUpperCase();
        } );
    };

    var replace = rep_words(word).replace(/_/g,"");
    return replace;
};


/**
 * Returns the underscored (the reverse of Camelized) form of a string.
 *
 * @name GeckoJS.Inflector.underscore
 * @public
 * @static
 * @function
 * @param {String} word       This is the string to underscore
 * @return {String}           The underscored form of the string
 */
GeckoJS.Inflector.underscore = function(word) {
    var replace = word.replace(/([A-Z])/g, '_$1').toLowerCase().substr(1);
    return replace;
};

/**
 * Returns a human-readable string from word, by replacing underscores with space
 * and upper-casing the initial characters.
 *
 * @name GeckoJS.Inflector.humanize
 * @public
 * @static
 * @function
 * @param {String} word       This is the string to make more human-readable
 * @return {String}           The human-readable form of the string
 */
GeckoJS.Inflector.humanize = function(word) {
    var rep_words = function(str) {
        return str.replace(/^(.)|_(.)/g, function ( $1 ) {
            return $1.toUpperCase();
        } );
    };

    var replace = rep_words(word);
    return replace;
};

/**
 * Returns the corresponding table name for a class name by first underscoring
 * and then pluralizing the class name.
 *
 * @name GeckoJS.Inflector.tableize
 * @public
 * @static
 * @function
 * @param {String} className  This is the string to tableize
 * @return {String}           The tableized form of the string
 *
 * @example
 *      tableize("RawScaledScorer") returns "raw_scaled_scorers"
 *
 */
GeckoJS.Inflector.tableize = function(className) {
    var replace = GeckoJS.Inflector.pluralize(GeckoJS.Inflector.underscore(className));
    return replace;
};

/**
 * Returns the corresponding class name for a table name by first singularizing
 * and then camelizing the table name.
 *
 * @name GeckoJS.Inflector.classify
 * @public
 * @static
 * @function
 * @param {String} tableName  This is the string to classify
 * @return {String}           The classified form of the string
 * @type                      String
 *
 * @example
 *       classify("posts") returns "Post".
 */
GeckoJS.Inflector.classify = function(tableName) {
    var replace = GeckoJS.Inflector.camelize(GeckoJS.Inflector.singularize(tableName));
    return replace;
};

/**
 * GeckoJS.String provides a set of common string manipulation functions.
 * <br/>
 *
 * @public
 * @class GeckoJS.String provides a set of common string manipulation functions
 * @name GeckoJS.String
 */
GREUtils.define('GeckoJS.String', GeckoJS.global);


/**
 * Generates a globally unique ID.
 *
 * @name GeckoJS.String.uuid
 * @public
 * @static
 * @function
 * @return {String}           A globally unique ID
 */
GeckoJS.String.uuid = function(){
    return GREUtils.uuid();
};

/**
 * Creates a base-64 encoding of a string.
 *
 * @name GeckoJS.String.base64Encode
 * @public
 * @static
 * @function
 * @param {String} str            This is the string to encode
 * @return {String}               The base-64 encoded ASCII string
 */
GeckoJS.String.base64Encode = function(str){
    return GREUtils.base64Encode(str);
};

/**
 * Decodes a string of data which has been encoded using base-64 encoding.
 *
 * @name GeckoJS.String.base64Decode
 * @public
 * @static
 * @function
 * @param {String} str            This is the base-64 encoded string data
 * @return {String}               The decoded string
 * @type                          String
 */
GeckoJS.String.base64Decode = function(str){
    return GREUtils.base64Decode(str);
};


/**
 * Converts the first character of each word in a string to upper case.
 *
 * @name GeckoJS.String.ucwords
 * @public
 * @static
 * @function
 * @param {String} word           This is the string of words
 * @return {String}               The string with first character of each word converted to upper case
 */
GeckoJS.String.ucwords = function(word){
    return (word+'').replace(/^(.)|\s(.)/g, function ( $1 ) { return $1.toUpperCase ( ); } );
};


/**
 * Converts the first character of a string to upper case.
 *
 * @name GeckoJS.String.ucfirst
 * @public
 * @static
 * @function
 * @param {String} word           This is the string
 * @return {String}               The string with the first character converted to upper case
 */
GeckoJS.String.ucfirst = function(word){
    var f = (word+'').charAt(0).toUpperCase();
    return f + word.substr(1);
};


/**
 * Converts the first character of a string to lower case.
 *
 * @name GeckoJS.String.lcfirst
 * @public
 * @static
 * @function
 * @param {String} word           This is the string
 * @return {String}               The string with the first character converted to upper case
 */
GeckoJS.String.lcfirst = function(word){
    var f = (word+'').charAt(0).toLowerCase();
    return f + word.substr(1);
};


/**
 * Trims white spaces to the left and right of a string.
 *
 * @name GeckoJS.String.trim
 * @public
 * @static
 * @function
 * @param {String} str            This is the string to trim
 * @return {String}               The trimmed string
 */
GeckoJS.String.trim = function(str){
    // if javascript 1.8.1 use native trim
    if (str.trim) {
        return str.trim();
    }else {
        // include it in the regexp to enforce consistent cross-browser behavior.
        return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    }
};


/**
 * Trims white spaces at the left end of a string.
 *
 * @name GeckoJS.String.trimLeft
 * @public
 * @static
 * @function
 * @param {String} str            This is the string to trim
 * @return {String}               The trimmed string
 */
GeckoJS.String.trimLeft = function(str){
    // if javascript 1.8.1 use native trimLeft
    if (str.trimLeft) {
        return str.trimLeft();
    }else {
        // include it in the regexp to enforce consistent cross-browser behavior.
        return str.replace(/^[\s\xa0]+/, '');
    }
};


/**
 * Trims white spaces at the right end of a string.
 *
 * @name GeckoJS.String.trimRight
 * @public
 * @static
 * @function
 * @param {String} str            This is the string to trim
 * @return {String}               The trimmed string
 */
GeckoJS.String.trimRight = function(str){
    // if javascript 1.8.1 use native trimRight
    if (str.trimRight) {
        return str.trimRight();
    }else {
        // include it in the regexp to enforce consistent cross-browser behavior.
        return str.replace(/[\s\xa0]+$/, '');
    }
};


/**
 * Pads a string 'on the left' to the specified length by prepending the string
 * with the given padding character. 
 *
 * @name GeckoJS.String.padLeft
 * @public
 * @static
 * @function
 * @param {String} num                   This is the string to pad
 * @param {Number} totalChars            This is the length to pad the string to
 * @param {String} padWith               This is the padding charactor
 * @return {String}                      The padded string
 */
GeckoJS.String.padLeft = function(num, totalChars, padWith) {
    num = num + "";
    totalChars = totalChars <num.length ? num.length : totalChars;
    
    padWith = (padWith) ? padWith : "0";
    if (num.length < totalChars) {
        while (num.length < totalChars) {
            num = padWith + num;
        }
    } else {}
     
    if (num.length > totalChars) { //if padWith was a multiple character string and num was overpadded
        num = num.substring((num.length - totalChars), totalChars);
    } else {}
    
    return num;
};


/**
 * Pads a string 'on the right' to the specified length by appending the string
 * with the given padding character. 
 *
 * @name GeckoJS.String.padRight
 * @public
 * @static
 * @function
 * @param {String} num                   This is the string to pad
 * @param {Number} totalChars            This is the length to pad the string to
 * @param {String} padWith               This is the padding charactor
 * @return {String}                      The padded string
 */
GeckoJS.String.padRight = function(num, totalChars, padWith) {
    num = num + "";
    totalChars = totalChars <num.length ? num.length : totalChars;
    
    padWith = (padWith) ? padWith : "0";
    if (num.length < totalChars) {
        while (num.length < totalChars) {
            num = num + padWith;
        }
    } else {}
     
    if (num.length > totalChars) { //if padWith was a multiple character string and num was overpadded
        num = num.substring(0, totalChars);
    } else {}
    
    return num;
};


/**
 * Converts a string to a form suitable for use in a URL.
 *
 * @name GeckoJS.String.urlEncode
 * @public
 * @static
 * @function
 * @param {String} str            This is the string to URL-encode
 * @return {String}               The URL-encoded string
 */
GeckoJS.String.urlEncode = function(str){
    str = String(str);
    return encodeURIComponent(str);
};


/**
 * Converts a string from its URL-encoded form.
 *
 * @name GeckoJS.String.urlDecode
 * @public
 * @static
 * @function
 * @param {String} str            This is the string to URL-decode
 * @return {String}               The URL-decoded string
 */
GeckoJS.String.urlDecode = function(str){
    return decodeURIComponent(str.replace(/\+/g, ' '));
};


/**
 * Checks whether a string contains a given substring.
 *
 * @name GeckoJS.String.contains
 * @public
 * @static
 * @function
 * @param {String} s              This is the string to check
 * @param {String} ss             This is the substring to look for in the string
 * @return {Boolean}              "true" if the string contains the substring; "false" otherwise
 */
GeckoJS.String.contains = function(s, ss){
    return s.indexOf(ss) != -1;
};


/**
 * Returns a string with at least 64-bits of randomness.
 *
 * @name GeckoJS.String.getRandomString
 * @public
 * @static
 * @function
 * @return {String}               A random string
 */
GeckoJS.String.getRandomString = function(){
    return Math.floor(Math.random() * 2147483648).toString(36) +
    (Math.floor(Math.random() * 2147483648) *
    (new Date).getTime()).toString(36);
};


/**
 * Converts a string from one character set encoding to another.<br/>
 * <br/>
 * This method takes a string encoded in character set "in_charset"
 * and returns the corresponding string encoded in character set "out_charset".
 *
 * @name GeckoJS.String.iconv
 * @public
 * @static
 * @function
 * @param {String} in_charset     This is the character set used to encode the string
 * @param {String} out_charset    This is the character set encoding the string is to be converted to
 * @param {String} str            This is the string to convert
 * @return {String}               A string encoded using the given character set "out_charset" if conversion succeeds; otherwise the original string is returned
 */
GeckoJS.String.iconv = function(in_charset, out_charset, str){
    return GREUtils.Charset.convertCharset(str, in_charset, out_charset);
};


/**
 * Generates a URL-encoded query string.<br/>
 * <br/>
 * This method builds a URL-encoded query string out of the elements of
 * "formdata". Each element of formdata should be a name-value pair, which is
 * converted into a field-value pair in the query string. The field name used
 * is normally the same as the element name, but if numeric_prefix is
 * specified, then each field is assigned a numeric ID prefixed with
 * numeric_prefix. Finally, arg_separator is used to delimite field-value pairs
 * in the query string.
 *
 *
 * @name GeckoJS.String.httpBuildQuery
 * @public
 * @static
 * @function
 * @param {Object} formdata       This is an object containing name-value pairs
 * @param {String} numeric_prefix This is the prefix for auto-generated field names
 * @param {String} arg_separator  This is the separator delimiting field-value pairs in the query string; defaults to "&"
 * @return {String}               A URL-encoded query string
 *
 * @example
 * <pre>
 *     GeckoJS.String.httpBuildQuery({ foo: 'bar',
 *                                     baz: 'boom',
 *                                     cow: 'milk',
 *                                     php: 'hypertext processor' }, '', '&');
 *     => 'foo=bar&baz=boom&cow=milk&php=hypertext+processor'
 * </pre>
 * @example
 * <pre>
 *     GeckoJS.String.httpBuildQuery({ 0: 'foo',
 *                                     1: 'bar',
 *                                     2: 'baz',
 *                                     3: 'boom',
 *                                     cow: 'milk',
 *                                     php :'hypertext processor'}, 'myvar_');
 *     => 'myvar_0=foo&myvar_1=bar&myvar_2=baz&myvar_3=boom&cow=milk&php=hypertext+processor'
 * </pre>
 */
GeckoJS.String.httpBuildQuery = function(formdata, numeric_prefix, arg_separator){

    arg_separator = arg_separator || '&';

    var key, use_val, use_key, i = 0, s = [];

    // If an array was passed in, assume that it is an array of form elements
    if (formdata.constructor == Array) {
        // Serialize the form elements
        formdata.forEach(function(data){
            use_key = encodeURIComponent(data.name);
            use_val = encodeURIComponent(data.value);
            use_val = use_val.replace(/%20/g, '+');

			if(numeric_prefix && !isNaN(use_key)){
            	use_key = numeric_prefix + s.length;
        	}
            s.push(use_key + "=" + use_val);
        });
    }
    else {
        for (var key in formdata) {

			use_key = encodeURIComponent(key);

			if(numeric_prefix && !isNaN(key)){
            	use_key = numeric_prefix + s.length;
        	}

            // If the value is an array then the key names need to be repeated
            if (formdata[key] && formdata[key].constructor == Array) {
                formdata[key].forEach(function(data){
		            use_val = encodeURIComponent(data);
		            use_val = use_val.replace(/%20/g, '+');
		            s.push(use_key + "=" + use_val);
                });
            }
            else {
	            use_val = encodeURIComponent(formdata[key]);
	            use_val = use_val.replace(/%20/g, '+');
                s.push(use_key + "=" + use_val);
            }
        }
    }
    // Return the resulting serialization
    return s.join(arg_separator);
};


/**
 * Parses a query string into property-value pairs.<br/>
 * <br/>
 * This method parses the field-values pairs in the query string "str" and
 * converts them into properties of the "array" object. The field name is used
 * as the property name and the value of the field is stored as the value of
 * the corresponding property.<br/>
 * <br/>
 * If "array" is not specified then a new object is created to store the parsed
 * results.
 *
 * @name GeckoJS.String.parseStr
 * @public
 * @static
 * @function
 * @param {String} str            This is the query string to parse
 * @param {Object} array          This is the object in which to store the parsed field-value pairs
 * @return {Object}                An object containing the field-value pairs from the query string
 *
 * @example
 *     example 1: GeckoJS.String.parseStr('first=foo&second=bar');
 *     returns 1: { first: 'foo', second: 'bar' }
 *     example 2: GeckoJS.String.parseStr('str_a=Jack+and+Jill+didn%27t+see+the+well.');
 *     returns 2: { str_a: "Jack and Jill didn't see the well." }
 *
 */
GeckoJS.String.parseStr = function (str, array){

    var glue1 = '=';
    var glue2 = '&';

    var array2 = str.split(glue2);
    var array3 = {};
    for(var x=0; x<array2.length; x++){
        var tmp = array2[x].split(glue1);
        array3[unescape(tmp[0])] = unescape(tmp[1]).replace(/[+]/g, ' ');
    }

    if(array){
        array = array3;
    } else{
        return array3;
    }
};


/**
 * Formats a number with grouped thousands.
 *
 * @name GeckoJS.String.numberFormat
 * @public
 * @static
 * @function   
 * @param {Number} number           This is the number to format   
 * @param {Number} decimals         This is the number of decimal places
 * @param {String} dec_point        This is the decimal point symbol
 * @param {String} thousands_sep    This is the grouped thousands separator
 * @return {String}
 *  
 * @example
 *   number_format(1234.5678, 2, '.', '') returns 1234.57
 *   number_format(1234.5678, 2, '.', ',') returns 1,234.57      
 *
 */
GeckoJS.String.numberFormat = function ( number, decimals, dec_point, thousands_sep ) {
    // Format a number with grouped thousands
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_number_format/
    // +       version: 806.816
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     bugfix by: Michael White (http://crestidg.com)
    // +     bugfix by: Benjamin Lupton
    // +     bugfix by: Allan Jensen (http://www.winternet.no)
    // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +     bugfix by: Howard Yeend
    // *     example 1: number_format(1234.5678, 2, '.', '');
    // *     returns 1: 1234.57     

    var n = number, c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
    var d = dec_point == undefined ? "." : dec_point;
    var t = thousands_sep == undefined ? "," : thousands_sep, s = n < 0 ? "-" : "";
    var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
    
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

/**
 * parse CSV Format Text to Array
 *
 * @name GeckoJS.String.parseCSV
 * @public
 * @static
 * @function
 * @param {Number} text             This is the csv format text
 * @param {Number} delim            This is the column delimeter
 * @param {String} quote            This is the quote
 * @param {String} linedelim        This is the line delimeter
 * @return {Array}
 *
 */
GeckoJS.String.parseCSV = function(text, delim, quote, linedelim) {

        delim = typeof delim == "string" ? new RegExp( "[" + (delim || ","   ) + "]" ) : typeof delim == "undefined" ? ","    : delim;
        quote = typeof quote == "string" ? new RegExp("^[" + (quote || '"'   ) + "]" ) : typeof quote == "undefined" ? '"'    : quote;
        linedelim = typeof linedelim == "string" ? new RegExp( "[" + (linedelim || "\r\n") + "]+") : typeof linedelim == "undefined" ? "\r\n" : linedelim;

        function splitline (v) {
            // Split the line using the delimitor
            var arr  = v.split(delim),
                out = [], q;
            for (var i=0, l=arr.length; i<l; i++) {
                if (q = arr[i].match(quote)) {
                    for (var j=i; j<l; j++) {
                        if (arr[j].charAt(arr[j].length-1) == q[0]) { break; }
                    }
                    var s = arr.slice(i,j+1).join(delim);
                    out.push(s.substr(1,s.length-2));
                    i = j;
                }
                else { out.push(arr[i]); }
            }

            return out;
        }

        var lines = text.split(linedelim);
        
        for (var k=0, ll=lines.length; k<ll; k++) {
            lines[k] = splitline(lines[k]);
        }
        
        return lines;

};


/**
 * Parses a string or boolean or object into Boolean value.
 * <br/>
 *
 * returns false when the passed value to the object is any one of the following:
 *
 *   0 / "" / false / undefined / NaN / "false" / "0"
 *
 * @name GeckoJS.String.parseBoolean
 * @public
 * @static
 * @function
 * @param {Boolean|String|Object} bool            This is the value to parse
 * @return {Boolean}
 *
 */
GeckoJS.String.parseBoolean = function(bool) {

    if (bool == 0 || bool == null) {
        return false;
    }else if (bool == 1) {
        return true;
    }else if (typeof bool == 'string' ) {
        return (bool.length == 0 || bool.toUpperCase() == '0' || bool.toUpperCase() == 'FALSE' || bool.toUpperCase() == 'NULL') ? false : true;
    }else {
        return new Boolean(bool).valueOf();
    }
};


/**
 * Escapes an input string for use with SQL
 *
 * @name GeckoJS.String.escapeForSQL
 * @public
 * @static
 * @function
 * @param {String} raw
 * 		The source string
 * @return {String}
 * 		The escaped string suitable for use in a SQL query
 */
GeckoJS.String.escapeForSQL = function (raw)
{
	var regex = /['\\\t\r\n]/g;
	var escaped = raw.replace(regex, function(a) {
		switch (a)
		{
			case '\'':
				return "\\'";
				break;

			case '\\':
				return "\\\\";
				break;

			case '\r':
				return "\\r";
				break;

			case '\n':
				return "\\n";
				break;

			case '\t':
				return "\\t";
				break;
		}
	});

	return escaped;
};

/**
 * Surround the provided string in single quotation marks
 *
 * @name GeckoJS.String.singleQuote
 * @public
 * @static
 * @function
 * @param {String} text
 * 		The original string
 * @return {String}
 * 		The original string encased in single quotes
 */
GeckoJS.String.singleQuote = function(text)
{
	return "'" + text + "'";
};

/**
 *  Returns a string produced according to the formatting string format .
 *
 *  PHP sprintf like
 *
 * @name GeckoJS.String.sprintf
 * @public
 * @static
 * @function
 * @param {String} format
 * @param {Object} args
 * @return {String} Return a formatted string
 */
GeckoJS.String.sprintf = function() {

    // Return a formatted string
    //
    // version: 903.3016
    // discuss at: http://phpjs.org/functions/sprintf
    // +   original by: Ash Searle (http://hexmen.com/blog/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Paulo Ricardo F. Santos
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brettz9.blogspot.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: sprintf("%01.2f", 123.1);
    // *     returns 1: 123.10
    // *     example 2: sprintf("[%10s]", 'monkey');
    // *     returns 2: '[    monkey]'
    // *     example 3: sprintf("[%'#10s]", 'monkey');
    // *     returns 3: '[####monkey]'
    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments, i = 0, format = a[i++];

    // pad()
    var pad = function(str, len, chr, leftJustify) {
        if (!chr) chr = ' ';
        var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
        return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function(value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length;
        if (diff > 0) {
            if (leftJustify || !zeroPad) {
                value = pad(value, minWidth, customPadChar, leftJustify);
            } else {
                value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
        }
        return value;
    };

    // formatBaseX()
    var formatBaseX = function(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function(value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision != null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    };

    // doFormat()
    var doFormat = function(substring, valueIndex, flags, minWidth, _, precision, type) {
        var number;
        var prefix;
        var method;
        var textTransform;
        var value;

        if (substring == '%%') return '%';

        // parse flags
        var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false, customPadChar = ' ';
        var flagsl = flags.length;
        for (var j = 0; flags && j < flagsl; j++) switch (flags.charAt(j)) {
            case ' ': positivePrefix = ' '; break;
            case '+': positivePrefix = '+'; break;
            case '-': leftJustify = true; break;
            case "'": customPadChar = flags.charAt(j+1); break;
            case '0': zeroPad = true; break;
            case '#': prefixBaseX = true; break;
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
            minWidth = 0;
        } else if (minWidth == '*') {
            minWidth = +a[i++];
        } else if (minWidth.charAt(0) == '*') {
            minWidth = +a[minWidth.slice(1, -1)];
        } else {
            minWidth = +minWidth;
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if (!isFinite(minWidth)) {
            throw new Error('sprintf: (minimum-)width must be finite');
        }

        if (!precision) {
            precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : void(0);
        } else if (precision == '*') {
            precision = +a[i++];
        } else if (precision.charAt(0) == '*') {
            precision = +a[precision.slice(1, -1)];
        } else {
            precision = +precision;
        }

        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

        switch (type) {
            case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
            case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
            case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
            case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'i':
            case 'd': {
                number = parseInt(+value);
                prefix = number < 0 ? '-' : positivePrefix;
                value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            }
            case 'e':
            case 'E':
            case 'f':
            case 'F':
            case 'g':
            case 'G': {
                number = +value;
                prefix = number < 0 ? '-' : positivePrefix;
                method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                value = prefix + Math.abs(number)[method](precision);
                return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
            }
            default: return substring;
        }
    };

    return format.replace(regex, doFormat);

};


/**
 * Checks if a string contains all letters.
 *
 * @name GeckoJS.String.isAlpha
 * @public
 * @static
 * @function
 * @param {String} str string to check.
 * @return {Boolean} true if str consists entirely of letters.
 */
GeckoJS.String.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};


/**
 * Checks if a string contains only numbers.
 *
 * @name GeckoJS.String.isNumeric
 * @public
 * @static
 * @function
 * @param {String} str string to check.
 * @return {Boolean} true if str is numeric.
 */
GeckoJS.String.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};


/**
 * Checks if a string contains only numbers or letters.
 * 
 * @name GeckoJS.String.isAlphaNumeric
 * @public
 * @static
 * @function
 * @param {String} str string to check.
 * @return {Boolean} true if str is alphanumeric.
 */
GeckoJS.String.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};

/**
 * GeckoJS.Array provides a set of functions for manipulating arrays.<br/>
 * 
 * @public
 * @class GeckoJS.Array provides a set of functions for manipulating arrays
 * @name GeckoJS.Array
 */
GREUtils.define('GeckoJS.Array', GeckoJS.global);


/**
 * Checks if an object is an array.
 *
 * @name GeckoJS.Array.isArray
 * @public
 * @static
 * @function
 * @param {Object} obj               This is the object to check
 * @return {Boolean}                  "true" if the object is an array; "false" otherwise
 */
GeckoJS.Array.isArray =  function( obj ) {
    return (typeof obj == 'object' && obj.constructor.name == "Array");
};

/**
 * Creates a copy of an array.<br/>
 * <br/>
 * If the object passed in is not an array, a new array with the object as its
 * only element is returned.<br/>
 *
 * @name GeckoJS.Array.makeArray
 * @public
 * @static
 * @function
 * @param {Object} array       This is an array object
 * @return {Object}            A copy of the array object
 */
GeckoJS.Array.makeArray = function( array ) {
	var ret = [];

	if( array != null ){
		var i = array.length;
		//the window, strings and functions also have 'length'
		if( i == null || array.split || array.setInterval || array.call )
			ret[0] = array;
		else
			while( i )
				ret[--i] = array[i];
	}

	return ret;
};


/**
 * Returns the index of an element in an array.<br/>
 * <br/>
 * This method returns -1 if the element is not found.<br/>
 *
 * @name GeckoJS.Array.inArray
 * @public
 * @static
 * @function
 * @param {Object} elem       This is the element to look for in the array
 * @param {Object} array      This is the array
 * @return {Number}          The index of the element
 */
GeckoJS.Array.inArray =  function( elem, array ) {

        if (!GeckoJS.Array.isArray(array)) return -1;

        // use javascript 1.6 
        return array.indexOf(elem);

        /*
	for ( var i = 0, length = array.length; i < length; i++ )
	// Use === because on IE, window == document
		if ( array[ i ] === elem )
			return i;

	return -1;
        */

};


/**
 * Merges two arrays.<br/>
 * <br/>
 * This method appends the second array to the end of the first array.<br/>
 *
 * @name GeckoJS.Array.merge
 * @public
 * @static
 * @function
 * @param {Object} first      This is the first array
 * @param {Object} second     This is the second array
 * @return {Object}           The merged array
 */
GeckoJS.Array.merge =  function( first, second ) {

    var i = 0, elem, pos = first.length;

    while ( elem = second[ i++ ] )
        first[ pos++ ] = elem;

    return first;
};


/**
 * Returns an array containing only unique elements.<br/>
 * <br/>
 * This method takes an array and returns a new array containing only unique
 * elements from that array.<br/>
 *
 * @name GeckoJS.Array.unique
 * @public
 * @static
 * @function
 * @param {Object} array      This is the array
 * @return {Object}           A new array containing only unique elements
 */
GeckoJS.Array.unique = function( array ) {
	var ret = [], done = {};

	try {

		for ( var i = 0, length = array.length; i < length; i++ ) {
            var id ="";
            var serialize = null;

            // native type , just to string
            if (typeof array[i] != 'object' && typeof array[i] != 'function') {
                id = "" + array[i];
            }else {
                serialize = GREUtils.JSON.encode( array[ i ] );
                serialize = serialize || String(array[i]);
                id = GREUtils.CryptoHash.md5(serialize);
            }

			if ( !done[ id ] ) {
				done[ id ] = true;
				ret.push( array[ i ] );
			}
		}

	} catch( e ) {
		ret = array;
	}

	return ret;
};


/**
 * Applies a validator function on each element of an array, and returns a new
 * array containing only those elements that pass the validator function.<br/>
 * <br/>
 * The validator function is invoked with two arguments: the array element,
 * and the element index, and should return "true" or "false". This method
 * returns array elements that return "true" from the validator function if "inv"
 * is "false"; otherwise, array elements that return "false" from the validator
 * function are returned.<br/>
 *
 * @name GeckoJS.Array.grep
 * @public
 * @static
 * @function
 * @param {Object} array       This is the array
 * @param {Function} callback This is the validator function
 * @param {Boolean} inv       This is the validation flag
 * @return {Object}            An array containing only validated elements
 */
GeckoJS.Array.grep = function( elems, callback, inv ) {
	var ret = [];

	// Go through the array, only saving the items
	// that pass the validator function
	for ( var i = 0, length = elems.length; i < length; i++ )
		if ( !inv != !callback( elems[ i ], i ) )
			ret.push( elems[ i ] );

	return ret;
};


/**
 * Applies a function on each element of an array, and returns an array containing
 * the results of the function calls.<br/>
 * <br/>
 * The function will be invoked with two arguments: the array element,
 * and the element index. "null" return values are ignored.<br/>
 *
 * @name GeckoJS.Array.map
 * @public
 * @static 
 * @function  
 * @param {Object} array       This is the array
 * @param {Function} callback This is the function to apply to each element
 * @return {Object}            An array containing results from applying the function to each element
 */
GeckoJS.Array.map = function( elems, callback ) {
    var ret = [];

    // Go through the array, translating each of the items to their
    // new value (or values).
    for ( var i = 0, length = elems.length; i < length; i++ ) {
        var value = callback( elems[ i ], i );

        if ( value != null )
            ret[ ret.length ] = value;
    }

    return ret.concat.apply( [], ret );
};


/**
 * Extracts from an array or object the value that is contained in a given path
 * within the array or object indicated by an array path. Each component in the
 * array path syntax is delimited with ".", and may be:<br/><br/>
 * <em>{n}</em> matching a numeric key, <br/>
 * <em>{s}</em> matching a literal key, <br/>
 * <em>a string literal</em>, or<br/>
 * <em>{[a-z]+}</em> representing a regular expression<br/><br/>
 * The following is an example of an array path:
 * <em>"{n}.Person.{[a-z]+}"</em>
 *
 * @name GeckoJS.Array.objectExtract
 * @public
 * @static
 * @param {Object} data     This is the object from which to extract
 * @param {String} path     This is a dot-separated string identifying the data to extract
 * @return {Object}          An array holding the extracted data
 * @access public

 */
GeckoJS.Array.objectExtract = function (data, path) {
    if (!path) {
        return data;
    }

    if (typeof data != 'object') {
        return data;
    }

    var paths = (typeof path == 'string') ? path.split('.') : path;
    var tmp = [];

    if (paths.length == 0) {
        return null;
    }

    for (var i in paths) {
        var key = paths[i];

        if (parseInt(key) > 0 || key == '0' ) {
            if (typeof  data[parseInt(key)]  != 'undefined') {
                data = data[parseInt(key)];
            }else {
                return null;
            }
        }else if (key == '{n}') {
            var tmp = [];
            for (var j in data) {
                var val = data[j];

                if (!isNaN(parseInt(j))) {
                    var tmpPath = paths.slice(i+1);
                    if (tmpPath.length == 0) {
                        tmp.push(val);
                    } else {
                        tmp.push(GeckoJS.Array.objectExtract(val, tmpPath));
                    }
                }
            }
            return tmp;

        }else if (key == '{s}') {
            var tmp = [];
            for (var j in data) {
                var val = data[j];

                if (typeof j =='string') {
                    var tmpPath = paths.slice(i+1);
                    if (tmpPath.length == 0) {
                        tmp.push(val);
                    } else {
                        tmp.push(GeckoJS.Array.objectExtract(val, tmpPath));
                    }
                }
            }
            return tmp;

        } else {
            if (typeof data[key] != 'undefined') {
                data = data[key];
            } else {
                return null;
            }
        }
    }
    return data;

};


/**
 * Gets a value from an array or object that is contained in a given path using an array path syntax, i.e.:
 * "{n}.Person.{[a-z]+}" - Where "{n}" represents a numeric key, "Person" represents a string literal,
 * and "{[a-z]+}" (i.e. any string literal enclosed in brackets besides {n} and {s}) is interpreted as
 * a regular expression.
 *
 * @name GeckoJS.Array.objectCombine
 * @public
 * @static
 * @function
 * @param {Object|Array} data Array Or Data from where to extract
 * @param {String} pathKey  dot-separated string.
 * @param {String} pathValue  dot-separated string.
 * @return {Object} Extracted data
 */
GeckoJS.Array.objectCombine = function (data, pathKey, pathValue) {
    if (!pathKey || !pathValue) {
        return data;
    }

    if (typeof data != 'object') {
        return data;
    }
    
    var obj = {};
    var keyArray = GeckoJS.Array.objectExtract(data, pathKey);
    var valArray = GeckoJS.Array.objectExtract(data, pathValue);
    
    for(var i=0; i<keyArray.length; i++) {
        obj[keyArray[i]] = valArray[i];
    }
    return obj;
    
};

/**
 * Defines the GeckoJS.File namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.File', GeckoJS.global);

/**
 * Creates a new GeckoJS.File() instance and initializes it by associating it
 * with a file path.<br/>
 * <br/>
 * If "autoCreate" is "true", the file is created if it does not already exist.
 *
 * @class GeckoJS.File provides a logical representation of a file or directory
 * at a location in the local file system. Through GeckoJS.File, local files
 * and directories may be created, read, written to, queried, and otherwise
 * manipulated.<br/>
 *
 * @name GeckoJS.File 
 * 
 * @property {nsIFile} file         A reference to the file location (read-only)
 * @property {String} path          The full file path (read-only)
 * @property {String} leafName      The file name without any directory components (read-only)
 * @property {Int} size             The size of the file (read-only)
 * @property {String} permissions   The Unix-style file permission bits (read-only)
 * @property {String} dateModified  The time when the file was last modified (read-only)
 * @property {String} ext           The file extension (read-only)
 *
 * @param {String} file             This is the file associated with this GeckoJS.File instance
 * @param {String} autoCreate       This flag indicates whether the file should be created if it does not exist; defaults to false
 */
GeckoJS.File = function(file, autoCreate){
	
	autoCreate = autoCreate || false;
	
	if(GREUtils.isXPCOM(file)) {
		this._file = file;
	}else {
		this._file = GREUtils.File.getFile(file, autoCreate, true);
	}
	
  this._Mode        = null;
  this._IsBinary    = false;
  this._OutStream   = null;
  this._InputStream = null;
  this._Position    = 0;
  this._OutputCharset = 'utf-8';
  this._InputCharset = 'utf-8';
	
};

GeckoJS.File.prototype.__defineGetter__('file', function(){
	return this._file;
});


GeckoJS.File.prototype.__defineGetter__('nsIFile', function(){
	return this._file;
});


GeckoJS.File.prototype.__defineGetter__('path', function(){
	if(this.file) {
		return this.file.path;
	}else {
		return "";
	}
	
});

GeckoJS.File.prototype.__defineGetter__('leafName', function(){
	if(this.file) {
		return this.file.leafName;
	}else {
		return "";
	}
	
});


GeckoJS.File.prototype.__defineGetter__('size', function(){
	if(this.file) {
		return this.file.fileSize;	
	}else {
		return -1;
	}
	
});


GeckoJS.File.prototype.__defineGetter__('permissions', function(){
	if(this.file) {
		return this.file.permissions.toString(8);	
	}else {
		return "000";
	}
});


GeckoJS.File.prototype.__defineGetter__('dateModified', function(){
	if(this.file) {
		return new Date(this.file.lastModifiedTime).toLocaleString();	
	}else {
		return new Date("1970-01-01 00:00:00").toLocaleString();
	}
});


GeckoJS.File.prototype.__defineGetter__('ext', function(){
	if(this.file) {
		var dotIndex = this.leafName.lastIndexOf('.');
		var ext = (dotIndex >= 0) ? this.leafName.substring(dotIndex + 1) : "";
		return ext;
	}else {
		return "";
	}
});



/**
 * Get File default input charset for text mode.
 *
 * @name GeckoJS.File#getInputCharset
 * @public
 * @function
 * @return {String} input charset.
 */
GeckoJS.File.prototype.getInputCharset = function() {
    return this._InputCharset;
};

/**
 * Set File default input charset for text mode.
 *
 * @name GeckoJS.File#setInputCharset
 * @public
 * @function
 * @param {String} charset      set input charset.
 */
GeckoJS.File.prototype.setInputCharset = function(charset) {
    this._InputCharset = charset;
};

/**
 * Get File default output charset for text mode.
 *
 * @name GeckoJS.File#getOutputCharset
 * @public
 * @function
 * @return {String} output charset.
 */
GeckoJS.File.prototype.getOutputCharset = function() {
    return this._OutputCharset;
};

/**
 * Set File default output charset for text mode.
 *
 * @name GeckoJS.File#setOutputCharset
 * @public
 * @function
 * @param {String} charset      set output charset.
 */
GeckoJS.File.prototype.setOutputCharset = function(charset) {
    this._OutputCharset = charset;
};



/**
 * Opens the file for reading/writing.<br/>
 * <br/>
 * This method opens the file associated with this GeckoJS.File instance with
 * the given mode and permission. The mode can be a valid combination of:<br/>
 * <br/>
 *  - "r" (read) <br/>
 *  - "w" (write) <br/>
 *  - "a" (append) <br/>
 *  - "b" (binary) <br/>
 * <br/>
 * If "r" is specified in the mode parameter, the file is opened for reading.
 * Otherwise the file is created if it does not already exist and is opened for
 * writing.
 *
 * @name GeckoJS.File#open
 * @public
 * @function
 * @param {String} aMode            This is the mode flag
 * @param {Number} aPerms           This is the permission with which to create the file (if needed); defaults to FILE_DEFAULT_PERMS
 */
GeckoJS.File.prototype.open = function(aMode, aPerms) {

	if (aMode.indexOf("b") != -1) {
		// binary mode
		this._IsBinary = true;
	}

	if(aMode.indexOf("r") != -1) {
		// read mode       
        if(!this._IsBinary) {
            var fis = GREUtils.XPCOM.createInstance("@mozilla.org/network/file-input-stream;1", "nsIFileInputStream");
            fis.init(this._file, 0x01, 0644, null);
            var is = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                               .createInstance(Components.interfaces.nsIConverterInputStream);
            is.init(fis, this._InputCharset, 1024, Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
            is.QueryInterface(Components.interfaces.nsIUnicharLineInputStream);
            this._InputStream = is;
        }else {
            var fis = GREUtils.File.getInputStream(this.file, aMode, aPerms);
            // fis.QueryInterface(Components.interfaces.nsILineInputStream);
            this._InputStream = fis;

        }
	}else {
		// write mode ?
		this.create(); // if not exists

        var fos = GREUtils.File.getOutputStream(this.file, aMode, aPerms);

        if(!this._IsBinary) {

            var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                               .createInstance(Components.interfaces.nsIConverterOutputStream);
            os.init(fos, this._OutputCharset, 1024, 0x0000);

            this._OutStream = os;
        }else {
            this._OutStream = fos;
        }
        
	}
};


/**
 * Closes the file.<br/>
 * <br/>
 * This method closes an open file. It has no effect on a file that is not
 * already open. 
 *
 * @name GeckoJS.File#close
 * @public
 * @function
 */
GeckoJS.File.prototype.close = function() {

    if (this._Mode)          this._Mode = null;
  
    if (this._OutStream) {
      this._OutStream.close();
      delete this._OutStream;
	  this._OutStream = null;
    }
  
    if (this._InputStream) {
      this._InputStream.close();
      delete this._InputStream;
	  this._InputStream = null;
    }
};


/**
 * Creates the file if it does not already exists.<br/>
 * <br/>
 * This method checks if the file already exists. If it does not, it is created
 * with the given permission.<br/>
 *
 * @name GeckoJS.File#create
 * @public
 * @function
 * @param {Number} perm             This is the permission with which to create the file (if needed); defaults to GREUtils.File.FILE_DEFAULT_PERMS
 * @return {Boolean}                "true" if the file has been created or already exists, "false" otherwise
 */
GeckoJS.File.prototype.create = function(perm){

	if(this.file == null) return false;
	if (!this.file.exists()) {
		this.file.create(GREUtils.File.NORMAL_FILE_TYPE, perm || GREUtils.File.FILE_DEFAULT_PERMS);
	}
	return this.file.exists();

};


/**
 * Creates the directory if it does not already exists.<br/>
 * <br/>
 * This method checks if the directory already exists. If it does not, it is created
 * with the given permission.<br/>
 *
 * @name GeckoJS.File#mkdir
 * @public
 * @function
 * @param {Number} perm             This is the permission with which to create the file (if needed); defaults to GREUtils.File.FILE_DEFAULT_PERMS
 * @return {Boolean}                "true" if the file has been created or already exists, "false" otherwise
 */
GeckoJS.File.prototype.mkdir = function(perm){

	if(this.file == null) return false;
	if (!this.file.exists()) {
		this.file.create(GREUtils.File.DIRECTORY_TYPE, perm || GREUtils.File.DIR_DEFAULT_PERMS);
	}
	return this.file.exists();

};


/**
 * Reads a given number of bytes from the file and closes the file.<br/>
 * <br/>
 * The file must already be open for reading before its content may be read. If
 * the file has been opened in binary mode, the content is returned as an array
 * of bytes. Otherwise the content is returned as a String.<br/>
 * <br/>
 * If errors occur while reading from the file, null is returned.
 *
 * @name GeckoJS.File#read
 * @public
 * @function
 * @param {Number} aSize            This is the number of bytes to read; defaults to the size of the file
 * @return {String|Object}          Data read from the file, either as a string or as an array of bytes
 */
GeckoJS.File.prototype.read = function (aSize) {

    var rv;
    try {
      if (!aSize)
        aSize = this.file.fileSize;

      if (this._IsBinary)
        rv = this._InputStream.readBytes(aSize);
      else {
          if (typeof  this._InputStream['readString'] == 'function') {

              var str = "" ;
              do {
                var data = {};
                rv = this._InputStream.readString(aSize, data);
                if(rv) {
                    str += data.value;
                }
              }while(rv>0);

              return str;
          }else {
            rv = this._InputStream.read(aSize);
          }
      }
              
      // this._InputStream.close();
    } catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.read ' + e.message);
		rv = null;
	}

    return rv;	
	
};


/**
 *  Reading line .<br/>
 * <br/>
 *
 * @name GeckoJS.File#readLine
 * @public
 * @function
 * @return {String}          String read from the file
 */
GeckoJS.File.prototype.readLine = function (hasNext) {

    hasNext = hasNext || {value: false};

    try {


      
      if (typeof this._InputStream['readLine'] == 'function') {

        var line = {};
        var cnt = this._InputStream.readLine(line);
        hasNext.value = cnt;

        return line.value;

      }else {

        return this.read(1024);
        
      }


    } catch (e) {
        GeckoJS.BaseObject.log('[Error] GeckoJS.File.readLine ' + e.message);
    }

    return false;

};


/**
 *  Reading All Lines .<br/>
 * <br/>
 *
 * @name GeckoJS.File#readAllLine
 * @public
 * @function
 * @return {Array}          String read from the file
 */
GeckoJS.File.prototype.readAllLine = function () {

    var rv;
    var lines = [];

    var hasNext = {value: false};

    try {

        do {
            rv = this.readLine(hasNext);
            lines.push(rv);
        }
        while (hasNext.value);

        return lines;

    } catch (e) {
        GeckoJS.BaseObject.log('[Error] GeckoJS.File.readLine ' + e.message);
		lines = [];
	}

    return lines;

};


/**
 * Writes the content of the given buffer to the file.<br/>
 * <br/>
 * The file must already be open for writing. Textual data is written to the
 * file using UTF-8 encoding. If the file has been opened in binary mode, the
 * buffer can be either an array of bytes or a string of bytes.
 *
 * @name GeckoJS.File#write
 * @public
 * @function
 * @param {Object|String} aBuffer    This is the buffer containing data to write to file
 * @return {Number}                 0 if successful, 1 otherwise
 */
GeckoJS.File.prototype.write = function (aBuffer) {

    var rv  = 0;
    try {
      if (this._IsBinary) {
	  	
	  	if(aBuffer.constructor.name == 'Array') this._OutStream.writeByteArray(aBuffer, aBuffer.length);
		else this._OutStream.write(aBuffer, aBuffer.length);
		
	  }else {
		// auto convert text output charset
		//var oBuffer = GREUtils.Charset.convertFromUnicode(aBuffer, this._OutputCharset);
		//this._OutStream.write(oBuffer, oBuffer.length);
        if (typeof this._OutStream['writeString'] == 'function') {
            rv = this._OutStream.writeString(aBuffer);
        }else {
            rv = this._OutStream.write(aBuffer, aBuffer.length);
        }
	  }
      this._OutStream.flush();
	  
    } catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.write ' + aBuffer.length); 
		rv = 1; 	
	}
  
    return rv;
};


/**
 * Checks if the file exists.
 *
 * @name GeckoJS.File#exists
 * @public
 * @function
 * @return {Boolean}                "true" if the file exists; "false" otherwise
 */
GeckoJS.File.prototype.exists = function(){

	if(this.file == null) return false;
	return this.file.exists();
	
};


/**
 * Checks if the given file exists.
 *
 * @name GeckoJS.File.exists
 * @public
 * @static
 * @function
 * @param {String} path             This is the full path of the file
 * @return {Boolean}                "true" if the file exists; "false" otherwise
 */
GeckoJS.File.exists = function(path){

    var file = new GeckoJS.File(path);
    return file.exists();

};



/**
 * Deletes the file from the file system.
 *
 * @name GeckoJS.File#remove
 * @public
 * @function
 * @return {Boolean}                "true" if the file is successfully removed; "false" otherwise
 */
GeckoJS.File.prototype.remove = function(){

	if(this.file == null) return false;
    
    var rv = GREUtils.File.remove(this.file);
	if (rv) {        

    	if (this._Mode)          this._Mode = null;
  
    	if (this._OutStream) {
      		delete this._OutStream;
	  		this._OutStream = null;
    	}
  
    	if (this._InputStream) {
	        delete this._InputStream;
	  		this._InputStream = null;
    	}
        return true;
    } 
    return rv;
};


/**
 * Deletes a file if it exists.
 *
 * @name GeckoJS.File.remove
 * @public
 * @static
 * @function
 * @param {String} path 		This is the full or partial (to be resolved) path of the file to delete
 */
GeckoJS.File.remove = function (path)
{
	var file = new GeckoJS.File(path);

	if (!file.isFile()) {
		return false;
	}

	if (file.exists())	{
		return file.remove();
	}
	return false;
};


/**
 * Copies the file to a new location.<br/>
 * <br/>
 * This method copies the file to a new location. If the new location is
 * a directory, that directory must already exist, and the file is copied into
 * that directory with the same file name.<br/>
 * <br/>
 * This method will not overwrite existing file; if a file already exists at the
 * new location then no copy takes place and the method returns "false".<br/>
 * <br/>
 * Returns "true" if the file is successfully copied, "false" otherwise.
 *
 * @name GeckoJS.File#copy
 * @public
 * @function
 * @param {String} aDest          This is the location to which to copy
 * @return {Boolean}              "true" if the copy succeeds; "false" otherwise
 */
GeckoJS.File.prototype.copy = function(aDest){

    if (!aDest) return false;
	
    if(this.file == null) return false;
    
    var rv = GREUtils.File.copy(this.file, aDest);

    return rv;
};


/**
 * Copies a file to a new location.<br/>
 * <br/>
 * This method copies a given file to a new location. If the new location is
 * a directory, that directory must already exist, and the file is copied into
 * that directory with the same file name.<br/>
 * <br/>
 * This method will not overwrite existing file; if a file already exists at the
 * new location then no copy takes place and the method returns "false".<br/>
 * <br/>
 * Returns "true" if the file is successfully copied, "false" otherwise.
 *
 * @name GeckoJS.File.copy
 * @public
 * @static
 * @function
 * @param {String} aSrc           This is the path of the source file
 * @param {String} aDest          This is the path to the destination
 * @return {Boolean}              "true" if the copy succeeds; "false" otherwise
 */
GeckoJS.File.copy = function(aSrc, aDest){

    var file = new GeckoJS.File(aSrc);
    if (!file.exists()) return false;
    if (!aDest) return false;

    return file.copy(aDest);
};


/**
 * Changes the current file path by appending a file name to it.<br/>
 * <br/>
 * This method is used to construct a descendant of the current file location.
 * If successful, the current GeckoJS.File instance will point to a new file
 * location constructed from appending the given filename to the original file
 * path. The original file path must corresponds to a directory for this method
 * to succeed.      
 *
 * @name GeckoJS.File#append
 * @public
 * @function
 * @param {String} aFileName      This is the file name to append to the directory
 * @return {Boolean}              Whether the file name has been successfully appended
 */
GeckoJS.File.prototype.append = function(aFileName){

	if(this.file == null || !this.exists()) return false;
	
    if (!aFileName) return false;
    
	var rv = false; 
    try {
		if(this.file.isDirectory()) {
	        this.file.append(aFileName);
			rv = true;
		}
    } 
    catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.append: '+e.message);
        return "";
    }
    
    return rv;
};


/**
 * Checks if this GeckoJS.File instance corresponds to a directory.
 *
 * @name GeckoJS.File#isDir
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is a directory; "false" otherwise
 */
GeckoJS.File.prototype.isDir = function(){

	if(this.file == null || !this.exists()) return false;
	    
	var rv = false; 
    try {
		rv = this.file.isDirectory();
    } 
    catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.isDir: '+e.message);
        rv = false;
    }
    return rv;
};

/**
 * Checks if path corresponds to a directory.
 *
 * @name GeckoJS.File.isDir
 * @public
 * @static
 * @function
 * @param {String} path 		This is the full or partial (to be resolved) path of the file
 */
GeckoJS.File.isDir = function(path){
    
    var file = new GeckoJS.File(path);
    
    return file.isDir();
};

/**
 * Checks if this GeckoJS.File instance corresponds to a file.
 *
 * @name GeckoJS.File#isFile
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is a file; "false" otherwise
 */
GeckoJS.File.prototype.isFile = function(){

	if(this.file == null || !this.exists()) return false;
	    
	var rv = false; 
    try {
		rv = this.file.isFile();
    } 
    catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.isFile: '+e.message);
        rv = false;
    }
    return rv;
};


/**
 * Checks if path corresponds to a file.
 *
 * @name GeckoJS.File.isFile
 * @public
 * @static
 * @function
 * @param {String} path 		This is the full or partial (to be resolved) path of the file
 */
GeckoJS.File.isFile = function(path){
    
    var file = new GeckoJS.File(path);

    return file.isFile();
};


/**
 * Checks if this GeckoJS.File instance corresponds to an executable file.
 *
 * @name GeckoJS.File#isExecutable
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is an executable file; "false" otherwise
 */
GeckoJS.File.prototype.isExecutable = function(){

	if(this.file == null || !this.exists()) return false;
	    
	var rv = false; 
    try {
		rv = this.file.isExecutable();
    } 
    catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.isExecutable: '+e.message);
        rv = false;
    }
    return rv;
};


/**
 * Checks if this GeckoJS.File instance corresponds to a symbolic link.
 *
 * @name GeckoJS.File#isSymlink
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is a symbolic link; "false" otherwise
 */
GeckoJS.File.prototype.isSymlink = function(){

	if(this.file == null || !this.exists()) return false;
	    
	var rv = false; 
    try {
		rv = this.file.isSymlink();
    } 
    catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.isSymlink: '+e.message);
        rv = false;
    }
    return rv;
};

/**
 * Checks if this GeckoJS.File instance corresponds to a file or directory that
 * may be modified by the user.
 *
 * @name GeckoJS.File#isWritable
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is writable; "false" otherwise
 */
GeckoJS.File.prototype.isWritable = function(){

	if(this.file == null || !this.exists()) return false;
	    
	var rv = false; 
    try {
		rv = this.file.isWritable();
    } 
    catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.isWritable: '+e.message);
        rv = false;
    }
    return rv;
};

/**
 * Checks if this GeckoJS.File instance corresponds to a file or directory that
 * is hidden.
 *
 * @name GeckoJS.File#isHidden
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is hidden; "false" otherwise
 */
GeckoJS.File.prototype.isHidden = function(){

	if(this.file == null || !this.exists()) return false;
	    
	var rv = false; 
    try {
		rv = this.file.isHidden();
    } 
    catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.isHidden: '+e.message);
        rv = false;
    }
    return rv;
};

/**
 * Checks if this GeckoJS.File instance corresponds to a file or directory that
 * may be read by the user.
 *
 * @name GeckoJS.File#isReadable
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is readable; "false" otherwise
 */
GeckoJS.File.prototype.isReadable = function(){

	if(this.file == null || !this.exists()) return false;
	    
	var rv = false; 
    try {
		rv = this.file.isReadable();
    } 
    catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.isReadable: '+e.message);
        rv = false;
    }
    return rv;
};

/**
 * Checks if this GeckoJS.File instance corresponds to a special system file,
 * that is, a file system object that isn't a regular file, directory, or
 * symbolic link. 
 *
 * @name GeckoJS.File#isSpecial
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is special; "false" otherwise
 */
GeckoJS.File.prototype.isSpecial = function(){

	if(this.file == null || !this.exists()) return false;
	    
	var rv = false; 
    try {
		rv = this.file.isSpecial();
    } 
    catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.isSpecial: '+e.message);
        rv = false;
    }
    return rv;
};

/**
 * Canonicalizes the path represented by this GeckoJS.File instance.<br/>
 * <br/>
 * If successful, "null" is returned.<br/>
 * <br/>
 * A return code of -1 is returned when the operation fails (i.e. the file path
 * does not exist or if read permission is denied for a component of the path
 * prefix. 
 *
 * @name GeckoJS.File#normalize
 * @public
 * @function
 * @return {Number}                -1 when exceptions occur; "null" otherwise
 */
GeckoJS.File.prototype.normalize = function(){

	if(this.file == null || !this.exists()) return -1;
	    
	var rv;
    try {
		rv = this.file.normalize();
    } 
    catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.normalize: '+e.message);
        rv = -1;
    }
    return rv;
};

/**
 * Spawns a new process to run an executable file.<br/>
 * <br/>
 * This method runs the executable file corresponding to this GeckoJS.File
 * instance in a newly spawned process. The "aArgs" parameter contains a array
 * of arguments to pass to this executable on its command line. The "blocking"
 * parameter controls whether to block until the process terminates.<br/>
 * <br/> 
 * Normally the process ID of the newly spawn process is returned. A negative
 * return value indicates an error condition:<br/>
 * <br/>
 *  -1: the file does not exist <br/>
 *  -2: the file path points to a directory <br/>
 *  -3: other exceptions <br/>
 *
 * @name GeckoJS.File#run
 * @public
 * @function
 * @param {Array} aArgs          This is the array of arguments to pass to the executable
 * @param {Boolean} blocking      If "true", the method blocks until the process terminates; defaults to false
 * @return {Number}               The process ID or 0 (blocking)
 */
GeckoJS.File.prototype.run = function(aArgs, blocking){

    if(this.file == null || !this.exists()) return -1;
    if (this.isDir()) return -2;
    
    blocking = blocking || false;
    var rv = 0;
    
    try {
        var process = GREUtils.XPCOM.createInstance("@mozilla.org/process/util;1", "nsIProcess");

        process.init(this.file);
        
        var len = 0;
        if (aArgs) 
            len = aArgs.length;
        else 
            aArgs = null;
        rv = process.run(blocking, aArgs, len);
        // if success return 0
        rv = blocking ? 0 : process.pid;

    } 
    catch (e) {
		GREUtils.log('[Error] GeckoJS.File.run: ' + e.message);
        rv = -3
    }
    return rv;
};


/**
 * Spawns a new process to run an executable file.<br/>
 * <br/>
 * This method runs the executable file corresponding to this GeckoJS.File
 * instance in a newly spawned process. The "aArgs" parameter contains a array
 * of arguments to pass to this executable on its command line. The "blocking"
 * parameter controls whether to block until the process terminates.<br/>
 * <br/>
 * Normally the process ID of the newly spawn process is returned. A negative
 * return value indicates an error condition:<br/>
 * <br/>
 *  -1: the file does not exist <br/>
 *  -2: the file path points to a directory <br/>
 *  -3: other exceptions <br/>
 *
 * @name GeckoJS.File.run
 * @public
 * @static
 * @function
 * @param {String} path           This is the full or partial (to be resolved) path of the file to run
 * @param {Array} aArgs          This is the array of arguments to pass to the executable
 * @param {Boolean} blocking      If "true", the method blocks until the process terminates; defaults to false
 * @return {Number}               The process ID
 */
GeckoJS.File.run = function(path, aArgs, blocking){

    var file = new GeckoJS.File(path);

    return file.run(aArgs, blocking);

};

/**
 * Adds a line to the end of an existing file.
 *
 * @name GeckoJS.File.appendLine
 * @public
 * @static
 * @function
 * @param {String} path     The full or partial (to be resolved) path of the file to append
 * @param {String} text		The text to append, as a new line
 * @param {String} charset	The charset of append line
*/
GeckoJS.File.appendLine = function(path, text, charset){

	var file = new GeckoJS.File(path, true);

	try
	{
		file.open('a', charset);
		for (var i=1; i<arguments.length; i++)
		{
			file.write(arguments[i].toString());
		}
	}
	finally
	{
		if (file)
		{
			file.close();
		}
	}

};

/**
 * Defines the GeckoJS.Dir namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Dir', GeckoJS.global);

/**
 * Creates a new GeckoJS.Dir instance and initializes it by associating it with
 * a directory path.<br/>
 * <br/>
 * If "autoCreate" is "true", the directory path is created if it does not
 * already exist.<br/>
 * 
 * @class GeckoJS.Dir provides a logical representation of a directory in the
 * local file system. Through GeckoJS.Dir, local directories may be created,
 * read, written to, queried, and otherwise manipulated.<br/>
 *
 * @name GeckoJS.Dir
 * @property {nsIFile} file         A reference to the directory location (read-only)
 * @property {String} path          The full path for the directory (read-only)
 * @property {String} leafName      The file name without any prefix components (read-only)
 * @property {String} permissions   The Unix-style file permission bits (read-only)
 * @property {String} dateModified  The time when the directory was last modified (read-only)
 *
 * @param {String} path             This is the directory path associated with this Dir instance
 * @param {String} autoCreate       This flag indicates whether the directory should be created if it does not exist; defaults to "false"
 */
GeckoJS.Dir = function(path, autoCreate){

	autoCreate = autoCreate || false;

	if(GREUtils.isXPCOM(path)) {
		this._file = path;
	}else {
		this._file = GREUtils.Dir.getFile(path, autoCreate);
	}

};

GeckoJS.Dir.prototype.__defineGetter__('file', function(){
	return this._file;
});

GeckoJS.Dir.prototype.__defineGetter__('nsIFile', function(){
	return this._file;
});


GeckoJS.Dir.prototype.__defineGetter__('path', function(){
	if(this.file) {
		return this.file.path;
	}else {
		return "";
	}
});

GeckoJS.Dir.prototype.__defineGetter__('leafName', function(){
	if(this.file) {
		return this.file.leafName;
	}else {
		return "";
	}
});

GeckoJS.Dir.prototype.__defineGetter__('permissions', function(){
	if(this.file) {
		return this.file.permissions.toString(8);
	}else {
		return "000";
	}
});

GeckoJS.Dir.prototype.__defineGetter__('dateModified', function(){
	if(this.file) {
		return new Date(this.file.lastModifiedTime).toLocaleString();
	}else {
		return new Date("1970-01-01 00:00:00").toLocaleString();
	}
});

/**
 * Checks if the directory exists.
 *
 * @name GeckoJS.Dir#exists
 * @public
 * @function
 * @return {Boolean}                "true" if the directory exists; "false" otherwise
 */
GeckoJS.Dir.prototype.exists = function() {
	if (this.file == null) return false ;
	try {
		return this.file.exists();
	}catch(e) {
		return false;
	}
    return false;

};

/**
 * Changes the current directory path by appending a file name to it.<br/>
 * <br/>
 * This method is used to construct a descendant of the current directory.
 * If successful, the current Dir instance will point to a new file location
 * constructed from appending the given filename to the original file path.
 *
 * @name GeckoJS.Dir#append
 * @public
 * @function
 * @param {String} aFileName      This is the file name to append to the directory
 * @return {String}               The new file path
 */
GeckoJS.Dir.prototype.append = function(aFileName){

	if(this.file == null) return false;

    if (!aFileName) return false;

	var rv = false;
    try {
		if(this.file.isDirectory()) {
	        this.file.append(aFileName);
			rv = true;
		}
    }
    catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.Dir.append: '+e.message);
        return "";
    }

    return rv;
};


/**
 * Removes the directory corresponding to this Dir instance.<br/>
 * <br/>
 * If aRecursive is "false", then the directory must be empty before it can be
 * deleted.<br/>
 * <br/>
 * If errors occur while attempting to remove the directory, this method returns
 * one of the following error code:<br/>
 * -1: path does not exist<br/>
 * -2: path is not a directory<br/>
 * -3: removal fails<br/>
 *
 * @name GeckoJS.Dir#remove
 * @public
 * @function
 * @param {Boolean} aRecursive          This flag indicates if directory is to be deleted if it is not empty
 * @return {Number}                      "null" if directory is successfully removed; an error code otherwise
 */
GeckoJS.Dir.prototype.remove = function(aRecursive){

	return GREUtils.Dir.remove(this.path, aRecursive);

};


/**
 * Tests whether a file is a descendant of this directory.<br/>
 * <br/>
 * This method will also return false if either file or the directory does not
 * exist.
 *
 * @name GeckoJS.Dir#contains
 * @public
 * @function
 * @param {String} aFile                This is the full path of the file to test
 * @return {Boolean}                    Returns "true" if the file is a descendant of this directory, "false" otherwise
 */
GeckoJS.Dir.prototype.contains = function(aFile){
	return GREUtils.Dir.contains(this.path, aFile);
};

/**
 * Reads directory entries.<br/>
 * <br/>
 * This method returns the directory entries as an array. Each array
 * element can be a string representing a file path, or an array of representing
 * a sub-directory.<br/>
 *
 * If the given path is not a directory an empty array is returned.
 *
 * @name GeckoJS.Dir.readDir
 * @public
 * @static
 * @function
 * @param {String} path                  This is the full path of the directory
 * @param {Object} filter                {recursive: true, type: [f|d], name: // }
 * @return {Object}                      Returns the directory entries as an array of strings containing file paths
 */
GeckoJS.Dir.readDir = function(path, filter){
    filter = filter || {recursive: false};
	var lists = GREUtils.Dir.readDir(path, filter.recursive);

    if (filter.type) {
        lists = lists.filter(function(file){
            switch(filter.type) {
                case "f":
                    return file.isFile();
                    break;
                case "d":
                    return file.isDirectory();
                    break;
            }

        });
    }

    if (filter.name) {
        lists = lists.filter(function(file){
            return file.leafName.match(filter.name);
        });
    }
    return lists;
};



/**
 * Reads directory entries.<br/>
 * <br/>
 * This method returns the directory entries as an array. Each array
 * element can be a string representing a file path, or an array of representing
 * a sub-directory.<br/>
 *
 * If the given path is not a directory an empty array is returned.
 *
 * @name GeckoJS.Dir#readDir
 * @public
 * @function
 * @param {Object} filter                {recursive: true, type: [f|d], name: // }
 * @return {Object}                      Returns the directory entries as an array of strings containing file paths
 */
GeckoJS.Dir.prototype.readDir = function(filter){
	return GREUtils.Dir.readDir(this.path, filter);
};

/**
 * Defines the GeckoJS.Configure namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Configure', GeckoJS.global);

/**
 * Creates a new GeckoJS.Configure instance and intializes the instance with
 * a set of built-in system configuration.<br/>
 * <br/>
 * The set of built-in configuration consists of the following:<br/>
 * <pre>
 * String             Meaning
 * --------------------------------------------------------------------------
 * ProfD              profile directory
 * DefProfRt          user (e.g., /root/.mozilla)
 * UChrm              %profile%/chrome
 * DefRt              %installation%/defaults
 * PrfDef             %installation%/defaults/pref
 * ProfDefNoLoc       %installation%/defaults/profile
 * APlugns            %installation%/plugins
 * AChrom             %installation%/chrome
 * ComsD              %installation%/components
 * CurProcD           installation (usually)
 * Home               OS root (e.g., /root)
 * TmpD               OS tmp (e.g., /tmp)
 * ProfLD             Local Settings on windows; where the network cache and fastload files are stored
 * resource:app       Application directory in a XULRunner app
 * Desk               Desktop directory (e.g. ~/Desktop on Linux, C:\Documents and Settings\username\Desktop on Windows)
 * Progs              User start menu programs directory (e.g., C:\Documents and Settings\username\Start Menu\Programs)
 * </pre>
 *
 * @class GeckoJS.Configure provides a Singleton configuration repository for
 * the GeckoJS App Engine. Each configuration entry consists of a key-value
 * pair. The configuration entries are stored in the "map" field.<br/>
 * <br/>
 * The configuration repository contains a read-only "events" field of type
 * GeckoJS.Event. This "events" field may be associated with event listeners
 * that are invoked whenever the repository is updated. Please see the
 * individual method description for information on the details of the various
 * update events.<br/>
 *
 * @name GeckoJS.Configure
 * @extends GeckoJS.BaseObject
 * @extends GeckoJS.Singleton
 *
 * @property {GeckoJS.Event} events   A set of event listeners for updates on the configuration repository (read-only)
 * @property {GeckoJS.Map} map        A collection of configuration key-value pairs stored in the repository (read-only)
 */
GeckoJS.Configure = GeckoJS.BaseObject.extend('Configure',
/** @lends GeckoJS.Configure.prototype */
{

    /**
     * Configure contructor
     *
     * @name GeckoJS.Configure#init
     * @public
     * @function
     */
    init: function(){

        this._events = new GeckoJS.Event();
        this._map = new GeckoJS.Map();
        this._hasLoadPreferences = {};
        
        // FUEL's SessionStorage support
        /*
        if (Application.storage.has('GeckoJS_Configure_events')) {
            var sessObj = Application.storage.get('GeckoJS_Configure_events', {listeners: []} );
            this._events.listeners = sessObj.listeners;
        }else {
            var sessObj = {listeners: []};
            this._events.listeners = sessObj.listeners;
            Application.storage.set('GeckoJS_Configure_events', sessObj);
        }*/

        /*
        if (Application.storage.has('GeckoJS_Configure_map')) {
            this._map = Application.storage.get('GeckoJS_Configure_map', (new GeckoJS.Map()) );
        }else {
            this._map = new GeckoJS.Map();
            Application.storage.set('GeckoJS_Configure_map', this._map);
        }*/

        /*
        if (Application.storage.has('GeckoJS_Configure_hasLoadPreferences')) {
            this._hasLoadPreferences = Application.storage.get('GeckoJS_Configure_hasLoadPreferences', {} );
        }else {
            this._hasLoadPreferences = {};
            Application.storage.set('GeckoJS_Configure_hasLoadPreferences', this._hasLoadPreferences);
        }*/

        // try add preference listener
        // if (!Application.storage.has('GeckoJS_Configure_PrefObserver')) {
        try {
            var prefs = GREUtils.Pref.getPrefService();
            prefs.QueryInterface(Components.interfaces.nsIPrefBranch);
            prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);

            var prefObserver =
            {

                observe: function(aSubject, aTopic, aData)
                {
                    if(aTopic != "nsPref:changed") return;
                    // aSubject is the nsIPrefBranch we're observing (after appropriate QI)
                    // aData is the name of the pref that's been changed (relative to aSubject)
                    try {
                        // if (GeckoJS.Configure.check(aData)) {
                            // update new value
                            aSubject.QueryInterface(Components.interfaces.nsIPrefBranch2);

                            // update configure 's data but don't save to preferences again!
                            GeckoJS.Configure.write(aData, GREUtils.Pref.getPref(aData, aSubject), false);

                        // }
                    }catch(e) {
                        GREUtils.log('[ERROR] [Configure] GeckoJS_Configure_PrefObserver ' + e);
                    }
                }
            };
            //Application.storage.set('GeckoJS_Configure_PrefObserver', prefObserver);
            //prefs.addObserver("", Application.storage.get('GeckoJS_Configure_PrefObserver', prefObserver), false);
            prefs.addObserver("", prefObserver, false);
            
            try {
                if(typeof window !='undefined') {
                    window.addEventListener('unload', function(){
                        prefs.removeObserver("", prefObserver);
                    }, true);
                }
            }catch(e) {
            //
            }

        }catch(e) {
            GREUtils.log( '[ERROR] [Configure] ' + e);
        }
        //}

        this.mPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
        this.mTimer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);

        var self = this;
        // set System PATH
        var directory_service = Components.classes["@mozilla.org/file/directory_service;1"]
        .getService(Components.interfaces.nsIProperties);

        ['ProfD', 'DefProfRt','UChrm','DefRt','PrfDef','ProfDefNoLoc','APlugns','AChrom','ComsD','CurProcD','Home','TmpD','ProfLD','resource:app','Desk'/*,'Progs'*/].forEach(function(key) {
            try {
                self.write(key, (directory_service.get(key, Components.interfaces.nsIFile)).path, false);
                self.write("CORE."+key, (directory_service.get(key, Components.interfaces.nsIFile)).path, false);
            }
            catch (e) {
                GREUtils.log('[Error] [Configure] GeckoJS.Configure directory_service;1 get [' + key +'] fail.');
            }
        });

    // auto load extension
    //        this.loadPreferences('extensions');
    }
});

// make Configure support singleton
GeckoJS.Singleton.support(GeckoJS.Configure);


//events getter
GeckoJS.Configure.prototype.__defineGetter__('events', function(){
    return this._events;
});


//map getter
GeckoJS.Configure.prototype.__defineGetter__('map', function(){
    return this._map;
});

/**
 * Returns the set of event listeners associated with the configuration repository.
 *
 * @name GeckoJS.Configure#getEvents
 * @public
 * @function
 * @return {GeckoJS.Event}            The set of event listeners associated with the repository
 */
GeckoJS.Configure.prototype.getEvents = function() {
    return this._events;
};


/**
 * Returns the collection of key-value pairs stored in the configuration repository.
 *
 * @name GeckoJS.Configure#getMap
 * @public
 * @function
 * @return {GeckoJS.Map}              The collection of the key-value pairs stored in the repository
 */
GeckoJS.Configure.prototype.getMap = function() {
    return this._map;
};

// We need shadow some method for event support.

/**
 * Adds a listener for a given event to this Configure instance.
 *
 * @name GeckoJS.Configure.addEventListener
 * @public
 * @static
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to add
 * @param {Object} thisObj          This is the execution scope to lock the listener to
 */
GeckoJS.Configure.addEventListener = function(aEvent, aListener, thisObj) {

    this.getInstance().addEventListener(aEvent, aListener, thisObj);

};


/**
 * Adds a listener for a given event to Configure.
 *
 * @name GeckoJS.Configure#addEventListener
 * @public
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to add
 * @param {Object} thisObj          This is the execution scope to lock the listener to
 */
GeckoJS.Configure.prototype.addEventListener = function(aEvent, aListener, thisObj) {
    try {
        thisObj = thisObj || GeckoJS.global;
        this.events.addListener(aEvent, aListener, thisObj);
    }catch(e) {
        this.log("ERROR", 'GeckoJS.Configure.addEventListener ' + aEvent , e);
    }

};


/**
 * Clears all entries from the configuration repository.<br/>
 * <br/>
 * This method clears all key-value entries stored in the configuration repository,
 * generating a "clear" event that is dispatched to all listeners of that event
 * after all the entries have been cleared. This Configure instance is passed to the
 * event listeners as the event data (in the field eventItem.data).
 *
 * @name GeckoJS.Configure#clear
 * @public
 * @function
 */
GeckoJS.Configure.prototype.clear = function() {
    this.map.clear();
    this.events.dispatch("clear", this);
};

/**
 * Clears all entries from the configuration repository.<br/>
 * <br/>
 * This method clears all key-value entries stored in the configuration repository,
 * generating a "clear" event that is dispatched to all listeners of that event
 * after all the entries have been cleared. This Configure instance is passed to the
 * event listeners as the event data (in the field eventItem.data).
 *
 * @name GeckoJS.Configure.clear
 * @public
 * @static
 * @function
 */
GeckoJS.Configure.clear = function() {
    GeckoJS.Configure.getInstance().clear();
};


/**
 * Removes a configuration entry from the repository.<br/>
 * <br/>
 * This method removes a configuration entry identified by the given key from the
 * repository, generating a "remove" event that is dispatched to all listeners of
 * that event after the configuration entry has been removed. The key is passed to
 * the event listeners as the event data (in the field "eventItem.data").<br/>
 * <br/>
 * Usage:<br/>
 * Configure::remove('Name'); will delete the entire Configure::Name<br/>
 * Configure::remove('Name.key'); will delete only the Configure::Name[key]<br/>
 *
 * @name GeckoJS.Configure#remove
 * @public
 * @function
 * @param {String} key                This is the key that identifies the configuration entry to remove
 * @param {Boolean} savePref          Save Configure to Preferences System
 */
GeckoJS.Configure.prototype.remove = function(key, savePref){

    savePref = (typeof savePref != 'undefined' )? savePref : true;
    
    var name = this.__configVarNames(key);

    if (name.length > 1) {
        var obj = this.map.get(name[0]);
        
        var cur = obj;

        for (var i=1; i<name.length ; i++ ) {
            var part = name[i];
            if ( i == (name.length-1)) {
                delete cur[part];
            } else if (cur[part]) {
                cur = cur[part];
            } else {
                break;
            }
        }
    // this.map.set(name[0], obj);

    }else {
        this.map.remove(name[0]);
    }

    if(savePref) {

        var prefServices =  GREUtils.Pref.getPrefService();
        prefServices.deleteBranch(key);


        var mPrefService = this.mPrefService ;
        var self = this;

        // Save preference file after one 1/2 second to delay in case another preference changes at same time as first
        this.mTimer.cancel();
        this.mTimer.initWithCallback({
            notify:function (aTimer) {
                mPrefService.savePrefFile(null);
                self.events.dispatch("savePrefFile", mPrefService);
            }
        }, 500, Components.interfaces.nsITimer.TYPE_ONE_SHOT);

    }

    this.events.dispatch("remove", key);
};


/**
 * Removes a configuration entry from the repository.<br/>
 * <br/>
 * This method removes a configuration entry identified by the given key from the
 * repository, generating a "remove" event that is dispatched to all listeners of
 * that event after the configuration entry has been removed. The key is passed to
 * the event listeners as the event data (in the field "eventItem.data").
 *
 * @name GeckoJS.Configure.remove
 * @public
 * @static
 * @function
 * @param {String} key                This is the key that identifies the configuration entry to remove
 * @param {Boolean} savePref          Save Configure to Preferences System
 */
GeckoJS.Configure.remove = function(key, savePref){
    GeckoJS.Configure.getInstance().remove(key, savePref);
};


/**
 * Adds a configuration entry to the repository.<br/>
 * <br/>
 * This method adds the given key-value pair to the repository. A "write" event
 * is dispatched to all listeners of that event after the entry has been added,
 * where the key-value pair is passed to the event listeners as named properties
 * of the event data object (i.e. as "eventItem.data.key" and
 * "eventItem.data.value").<br/>
 * <br/>
 * Any existing entry in the repository associated with the same key is replaced
 * with the new value.
 *
 * @name GeckoJS.Configure#write
 * @public
 * @function
 * @param {String} key                This is the configuration key
 * @param {Object} value              This is the configuration value
 * @param {Boolean} savePref          Save Configure to Preferences System
 */
GeckoJS.Configure.prototype.write = function(key, value, savePref) {

    savePref = (typeof savePref != 'undefined' )? savePref : true;

    var name = this.__configVarNames(key);
    
    if (name.length >1) {
        var obj = this.map.get(name[0]) == null ? {} : this.map.get(name[0]);

        var cur = obj;

        for (var i=1; i<name.length ; i++ ) {
            var part = name[i];
            if ( i == (name.length-1)) {
                cur[part] = value;
            } else if (cur[part]) {
                cur = cur[part];
            } else {
                cur = cur[part] = {};
            }
        }

        this.map.set(name[0], obj);

    }else {
        this.map.set(name[0], value);
    }
    
    if(savePref) {
        this.savePreferences(key);
        
        var mPrefService = this.mPrefService ;
        var self = this;

        // Save preference file after one 1/2 second to delay in case another preference changes at same time as first
        this.mTimer.cancel();
        this.mTimer.initWithCallback({
            notify:function (aTimer) {
                mPrefService.savePrefFile(null);
                self.events.dispatch("savePrefFile", mPrefService);
            }
            }, 500, Components.interfaces.nsITimer.TYPE_ONE_SHOT);

    }

    this.events.dispatch("write", {
        key: key,
        value: value
    });

};


/**
 * Adds a configuration entry to the repository.<br/>
 * <br/>
 * This method adds the given key-value pair to the repository. A "write" event
 * is dispatched to all listeners of that event after the entry has been added,
 * where the key-value pair is passed to the event listeners as named properties
 * of the event data object (i.e. as "eventItem.data.key" and
 * "eventItem.data.value").<br/>
 * <br/>
 * Any existing entry in the repository associated with the same key is replaced
 * with the new value.<br/>
 * <br/>
 * Usage:<br/>
 * Configure::write('key', 'value of the Configure::key');<br/>
 * Configure::write('One.key1', 'value of the Configure::One[key1]');<br/>
 * Configure::write('One', {'key1': 'value of the Configure::One[key1]', 'key2':'value of the Configure::One[key2]'});
 *
 * @name GeckoJS.Configure.write
 * @public
 * @static
 * @function
 * @param {String} key                This is the configuration key
 * @param {Object} value              This is the configuration value
 * @param {Boolean} savePref          Save Configure to Preferences System
 */
GeckoJS.Configure.write = function(key, value, savePref) {
    GeckoJS.Configure.getInstance().write(key, value, savePref);
};


/**
 * Retrieves the configuration value identified by the given key.<br/>
 * <br/>
 * This method returns null if the key does not exist in the configuration
 * repository.<br/>
 * <br/>
 * Usage:<br/>
 * Configure::read('Name'); will return all values for Name<br/>
 * Configure::read('Name.key'); will return only the value of Configure::Name[key]
 *
 * @name GeckoJS.Configure#read
 * @public
 * @function
 * @param {String} key                This is the key that identifies the object to retrieve
 * @return {Object}                   The configuration value
 */
GeckoJS.Configure.prototype.read = function(key){

    var name = this.__configVarNames(key);

    if(name.length >1) {
        var obj = this.map.get(name[0]);
        if (obj == null) return obj;
        
        var cur = obj;

        for (var i=1; i<name.length ; i++ ) {
            var part = name[i];

            if (typeof cur[part] != 'undefined') {
                cur = cur[part];
            }else {
                return null;
            }
        }
        if (cur == null || typeof cur == 'undefined') cur = null;

        return cur;

    }else {
        return this.map.get(name[0]);
    }
};


/**
 * Retrieves the configuration value identified by the given key.<br/>
 * <br/>
 * This method returns null if the key does not exist in the configuration repository.
 *
 * @name GeckoJS.Configure.read
 * @public
 * @static
 * @function
 * @param {String} key                This is the key that identifies the object to retrieve
 * @return {Object}                   The configuration value
 */
GeckoJS.Configure.read = function(key) {
    return GeckoJS.Configure.getInstance().read(key);
};


/**
 * Checks if the given key exists in the configuration repository.
 *
 * @name GeckoJS.Configure#check
 * @public
 * @function
 * @param {String} key                This is the key to check
 * @return {Boolean}                  "true" if the key exists, "false" otherwise
 */
GeckoJS.Configure.prototype.check = function(key) {

    var name = this.__configVarNames(key);

    if(name.length >1) {
        var obj = this.map.get(name[0]);
        if (obj == null) return false;
        var cur = obj;
        for (var i=1; i<name.length ; i++ ) {
            var part = name[i];

            if (typeof cur[part] != 'undefined') {
                cur = cur[part];
            }else {
                return false;
            }
        }
        return true;

    }else {
        return this.map.containsKey(name[0]);
    }
    
};


/**
 * Checks if the given key exists in the configuration repository.
 *
 * @name GeckoJS.Configure.check
 * @public
 * @static
 * @function
 * @param {String} key                This is the key to check
 * @return {Boolean}                  "true" if the key exists, "false" otherwise
 */
GeckoJS.Configure.check = function(key) {
    return GeckoJS.Configure.getInstance().check(key);
};


/**
 * Cloning of GeckoJS.Configure instances are not supported.<br/>
 * <br/>
 * The clone() method from GeckoJS.BaseObject is overridden in GeckoJS.Configure
 * with a dummy method.
 *
 * @name GeckoJS.Configure#clone
 * @public
 * @function
 */
GeckoJS.Configure.prototype.clone = function(){
    };


/**
 * Serializes the configuration repository using JSON encoding.
 *
 * @name GeckoJS.Configure#serialize
 * @public
 * @function
 * @return {String}         The JSON representation of the configuration repository
 */
GeckoJS.Configure.prototype.serialize = function(){
    return this.map.serialize();
};


/**
 * Serializes the configuration repository using JSON encoding.
 *
 * @name GeckoJS.Configure.serialize
 * @public
 * @static
 * @function
 * @return {String}         The JSON representation of the configuration repository
 */
GeckoJS.Configure.serialize = function(){
    return GeckoJS.Configure.getInstance().serialize();
};


/**
 * Restores the configuration repository from its JSON encoding. Event listeners
 * are not restored.  
 *
 * @name GeckoJS.Configure#unserialize
 * @public
 * @function
 * @param {String} str      The JSON representation of the configuration repository
 */
GeckoJS.Configure.prototype.unserialize = function(str) {
    return this.map.unserialize(str);
};

/**
 * Restores the configuration repository from its JSON encoding. Event listeners
 * are not restored.
 *
 * @name GeckoJS.Configure.unserialize
 * @public
 * @static
 * @function
 * @param {String} str      The JSON representation of the configuration repository
 */
GeckoJS.Configure.unserialize = function(str) {
    return GeckoJS.Configure.getInstance().unserialize(str);
};


/**
 * Loads XULRunner's and extensions' preferences into the configuration
 * repository.
 *
 * @name GeckoJS.Configure#loadPreferences
 * @public
 * @function
 * @param {String} startingAt                The point on the branch at which to start enumerating the child preferences. Pass in "" to enumerate all preferences referenced by this branch.
 */
GeckoJS.Configure.prototype.loadPreferences = function(startingAt){

    /* ifdef DEBUG 
    GREUtils.log('[Configure] loadPreferences ' + startingAt);
    /* endif DEBUG */

    if(!this._isLoadedPrefreences(startingAt)) {

        var prefs = GREUtils.Pref.getPrefService();
        var prefCount = {}, prefValues = {};

        prefValues = prefs.getChildList(startingAt, prefCount );
	
        for(var i=0; i<prefCount.value; i++) {
            this.write(prefValues[i], GREUtils.Pref.getPref(prefValues[i], prefs), false);
        }

        // update loaded
        this._setLoadedPrefreences(startingAt);

    }
};


/**
 * Loads XULRunner's and extensions' preferences into the configuration
 * repository.
 *
 * @name GeckoJS.Configure.loadPreferences
 * @public
 * @static
 * @function
 * @param {String} startingAt                The point on the branch at which to start enumerating the child preferences. Pass in "" to enumerate all preferences referenced by this branch. 
 */
GeckoJS.Configure.loadPreferences = function(startingAt){
    GeckoJS.Configure.getInstance().loadPreferences(startingAt);
};


/**
 * Save to XULRunner's and extensions' preferences from the configuration
 * repository.
 *
 * @name GeckoJS.Configure#savePreferences
 * @public
 * @function
 * @param {String} startingAt                The point on the branch at which to start enumerating the child preferences. Pass in "" to enumerate all preferences referenced by this branch.
 */
GeckoJS.Configure.prototype.savePreferences = function(startingAt){

    // GREUtils.log('GeckoJS_Configure_savePreferences :  ' + startingAt);

    var confValues = this.read(startingAt);
    if (confValues == null) return;
    
    var prefValues = {};

    var getPrefValues = function (key, values) {
        var type = typeof(values);

        switch(type) {
            case 'object':
                for (var key2 in values) {
                    getPrefValues(key+"."+key2, values[key2]);
                }
                break;

            case 'number':
            case 'boolean':
            case 'string':
                prefValues[key] = values;
                break;
        }

    };

    getPrefValues(startingAt, confValues);

    var prefServices =  GREUtils.Pref.getPrefService();

    for(var prefKey in prefValues) {
        GREUtils.Pref.addPref(prefKey, prefValues[prefKey], prefServices);
    }
    return ;

};


/**
 * Save to XULRunner's and extensions' preferences from the configuration
 * repository.
 *
 * @name GeckoJS.Configure.savePreferences
 * @public
 * @static
 * @function
 * @param {String} startingAt                The point on the branch at which to start enumerating the child preferences. Pass in "" to enumerate all preferences referenced by this branch.
 */
GeckoJS.Configure.savePreferences = function(startingAt){
    GeckoJS.Configure.getInstance().savePreferences(startingAt);
};


GeckoJS.Configure.prototype.__configVarNames = function (name) {
    if (typeof name == "string") {
        name = name.split(".");
    }
    return name;
};

GeckoJS.Configure.prototype._isLoadedPrefreences = function (startingAt) {

    /* ifdef DEBUG 
    GREUtils.log('[Configure] _isLoadedPrefreences ' + startingAt);
    /* endif DEBUG */

    startingAt = startingAt || "";
    var keyPairs = startingAt.split(".");
    var isLoaded = false;
    var prevKey = "", key = "" ;

    for (var i = 0; i < keyPairs.length; i++) {

        key = (prevKey.length > 0 ? prevKey+"."+keyPairs[i] : keyPairs[i]);
        isLoaded = (typeof this._hasLoadPreferences[key] != 'undefined');
        if(isLoaded) break;

        prevKey = key+"";
    }

    /* ifdef DEBUG 
    GREUtils.log('[Configure] _isLoadedPrefreences return: ' + isLoaded);
    /* endif DEBUG */

    return isLoaded;
};

GeckoJS.Configure.prototype._setLoadedPrefreences = function (startingAt) {

    /* ifdef DEBUG 
    GREUtils.log('[Configure] _setLoadedPrefreences ' + startingAt);
    /* endif DEBUG */

    startingAt = startingAt || "";

    if (startingAt.length <= 0) return;

    this._hasLoadPreferences[startingAt] = true;

};

/**
 * Defines the GeckoJS.Session namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Session', GeckoJS.global);

/**
 * Creates a new GeckoJS.Session instance and initializes this instance with
 * an empty list of event listeners and empty session data.
 * 
 * @class GeckoJS.Session provides a Singleton Session context for applications
 * running on the GeckoJS APP Engine.<br/>
 * <br/>
 * The Session context may be used to store session data as key-value pairs.
 * <br/>
 *
 * @name GeckoJS.Session
 * @extends GeckoJS.BaseObject
 * @extends GeckoJS.Singleton
 *
 * @property {GeckoJS.Event} events   A list of event listeners for updates on the Session context (read-only)
 * @property {GeckoJS.Map} map        A collection of session data stored in the Session context (read-only)
 */
GeckoJS.Session = GeckoJS.BaseObject.extend('Session',
/** @lends GeckoJS.Session.prototype */
{

    /**
     * Session contructor
     *
     * @name GeckoJS.Session#init
     * @public
     * @function
     */
    init: function(){

        this._events = new GeckoJS.Event();
        this._map = new GeckoJS.Map();

        /*
        // FUEL's SessionStorage support
        var sessObj;
        if (Application.storage.has('GeckoJS_Session_events')) {
            sessObj = Application.storage.get('GeckoJS_Session_events', {listeners: []} );
            this._events = new GeckoJS.Event(sessObj.listeners);
            // this._events.listeners = sessObj.listeners;
        }else {
            sessObj = {listeners: []};
            //this._events.listeners = sessObj.listeners;
            this._events = new GeckoJS.Event(sessObj.listeners);
            Application.storage.set('GeckoJS_Session_events', sessObj);
        }

        if (Application.storage.has('GeckoJS_Session_map')) {
            this._map = Application.storage.get('GeckoJS_Session_map',  (new GeckoJS.Map()) );
        }else {
            this._map = new GeckoJS.Map();
            Application.storage.set('GeckoJS_Session_map', this._map);
        }
        */

    }
});

// make Session support singleton
GeckoJS.Singleton.support(GeckoJS.Session);


//events getter
GeckoJS.Session.prototype.__defineGetter__('events', function(){
	return this._events;
});


//map getter
GeckoJS.Session.prototype.__defineGetter__('map', function(){
	return this._map;
});

/**
 * Returns the set of event listeners associated with the Session context.
 *
 * @name GeckoJS.Session#getEvents
 * @public
 * @function
 * @return {GeckoJS.Event}            The set of event listeners associated with the Session context
 */
GeckoJS.Session.prototype.getEvents = function() {
    return this._events;
};

/**
 * Returns the set of event listeners associated with the Session context.
 *
 * @name GeckoJS.Session.getEvents
 * @public
 * @static
 * @function
 * @return {GeckoJS.Event}            The set of event listeners associated with the Session context
 */
GeckoJS.Session.getEvents = function() {
    return this.getInstance().getEvents();
};


/**
 * Returns data stored in the Session context as key-value pairs.
 *
 * @name GeckoJS.Session#getMap
 * @public
 * @function
 * @return {GeckoJS.Map}              The collection of the key-value pairs stored in the Session context
 */
GeckoJS.Session.prototype.getMap = function() {
    return this._map;
};

// We need shadow some method for event support.

/**
 * Adds a listener for a given event to this Session instance.
 *
 * @name GeckoJS.Session.addEventListener
 * @public
 * @static
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to add
 * @param {Object} thisObj          This is the execution scope to lock the listener to
 */
GeckoJS.Session.addEventListener = function(aEvent, aListener, thisObj) {
    
    this.getInstance().addEventListener(aEvent, aListener, thisObj);

};


/**
 * Adds a listener for a given event to Session.
 *
 * @name GeckoJS.Session#addEventListener
 * @public
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to add
 * @param {Object} thisObj          This is the execution scope to lock the listener to
 */
GeckoJS.Session.prototype.addEventListener = function(aEvent, aListener, thisObj) {
    try {
        thisObj = thisObj || GeckoJS.global;
        this.events.addListener(aEvent, aListener, thisObj);
    }catch(e) {
        this.log("ERROR", 'GeckoJS.Session.addEventListener ' + aEvent , e);
    }

};


/**
 * Remove a listener for a given event to this Session instance.
 *
 * @name GeckoJS.Session.removeEventListener
 * @public
 * @static
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to remove
 */
GeckoJS.Session.removeEventListener = function(aEvent, aListener) {

    this.getInstance().removeEventListener(aEvent, aListener);

};


/**
 * Remove a listener for a given event to Session.
 *
 * @name GeckoJS.Session#removeEventListener
 * @public
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to remove
 */
GeckoJS.Session.prototype.removeEventListener = function(aEvent, aListener) {
    try {
        this.events.removeListener(aEvent, aListener);
    }catch(e) {
        this.log("ERROR", 'GeckoJS.Session.removeEventListener ' + aEvent , e);
    }

};



/**
 * Clears all entries from the Session context.<br/>
 * <br/>
 * This method clears all data entries stored in the Session context, generating
 * a "clear" event that is dispatched to all listeners of that event after all
 * the entries have been cleared. This Session instance is passed to the event
 * listeners as the event data (in the field eventItem.data).
 *
 * @name GeckoJS.Session#clear
 * @public
 * @static
 * @function
 */
GeckoJS.Session.prototype.clear = function() {
	this.map.clear();
	this.events.dispatch("clear", this);
};

/**
 * Clears all entries from the Session context.<br/>
 * <br/>
 * This method clears all data entries stored in the Session context, generating
 * a "clear" event that is dispatched to all listeners of that event after all
 * the entries have been cleared. This Session instance is passed to the event
 * listeners as the event data (in the field eventItem.data).
 *
 * @name GeckoJS.Session.clear
 * @public
 * @static
 * @function
 */
GeckoJS.Session.clear = function() {
	GeckoJS.Session.getInstance().clear();
};


/**
 * Removes a data entry from the Session context.<br/>
 * <br/>
 * This method removes a data entry identified by the given key from the
 * Session context, generating a "remove" event that is dispatched to all listeners
 * of that event after the data entry has been removed. The key is passed to the
 * event listeners as the event data (in the field "eventItem.data").
 *
 * @name GeckoJS.Session#remove
 * @public
 * @function
 * @param {String} key                This is the key that identifies the data entry to remove
 */
GeckoJS.Session.prototype.remove = function(key){
    if(this.map.containsKey(key)) {
        this.map.remove(key);
        this.events.dispatch("remove", key);
    }
};


/**
 * Removes a data entry from the Session context.<br/>
 * <br/>
 * This method removes a data entry identified by the given key from the
 * Session context, generating a "remove" event that is dispatched to all listeners
 * of that event after the data entry has been removed. The key is passed to the
 * event listeners as the event data (in the field "eventItem.data").
 *
 * @name GeckoJS.Session.remove
 * @public
 * @static
 * @function
 * @param {String} key                This is the key that identifies the data entry to remove
 */
GeckoJS.Session.remove = function(key){
	GeckoJS.Session.getInstance().remove(key);
};


/**
 * Adds a data entry to the Session context.<br/>
 * <br/>
 * This method stores the given data value in the Session context under the given
 * key. A "change" event is dispatched to all listeners of that event after the
 * data entry has been added, where the key-value pair is passed to the event
 * listeners as named properties of the event data object (i.e. as "eventItem.data.key"
 * and "eventItem.data.value").<br/>
 * <br/>
 * Any existing data entry in the Session context associated with the same key is
 * replaced with the new value.
 *
 * @name GeckoJS.Session#add
 * @public
 * @function
 * @param {String} key                This is the key under which to store the Session data
 * @param {Object} val                This is the data value
 */
GeckoJS.Session.prototype.add = function(key, val){
	this.set(key, val);
};


/**
 * Adds a data entry to the Session context.<br/>
 * <br/>
 * This method stores the given data value in the Session context under the given
 * key. A "change" event is dispatched to all listeners of that event after the
 * data entry has been added, where the key-value pair is passed to the event
 * listeners as named properties of the event data object (i.e. as "eventItem.data.key"
 * and "eventItem.data.value").<br/>
 * <br/>
 * Any existing data entry in the Session context associated with the same key is
 * replaced with the new value.
 *
 * @name GeckoJS.Session.add
 * @public
 * @static
 * @function
 * @param {String} key                This is the key under which to store the Session data
 * @param {Object} val                This is the data value
 */
GeckoJS.Session.add = function(key, val){
	GeckoJS.Session.getInstance().add(key, val);
};


/**
 * Adds a data entry to the Session context.<br/>
 * <br/>
 * This method stores the given data value in the Session context under the given
 * key. A "change" event is dispatched to all listeners of that event after the
 * data entry has been added, where the key-value pair is passed to the event
 * listeners as named properties of the event data object (i.e. as "eventItem.data.key"
 * and "eventItem.data.value").<br/>
 * <br/>
 * Any existing data entry in the Session context associated with the same key is
 * replaced with the new value.
 * <br/>
 * Usage:<br/>
 * Session::set('key', 'value of the Session::key');<br/>
 * Session::set('One.key1', 'value of the Session::One[key1]');<br/>
 * Session::set('One', {'key1': 'value of the Session::One[key1]', 'key2':'value of the Session::One[key2]'});
 *
 * @name GeckoJS.Session#set
 * @public
 * @function
 * @param {String} key                This is the key under which to store the Session data
 * @param {Object} value              This is the data value
 */
GeckoJS.Session.prototype.set = function(key, value) {

    var name = this.__configVarNames(key);

    if (name.length >1) {
        var obj = this.map.get(name[0]) == null ? {} : this.map.get(name[0]);

        var cur = obj;

        for (var i=1; i<name.length ; i++ ) {
            var part = name[i];
            if ( i == (name.length-1)) {
                cur[part] = value;
            } else if (cur[part]) {
                cur = cur[part];
            } else {
                cur = cur[part] = {};
            }
        }

        this.map.set(name[0], obj);

    }else {
        this.map.set(name[0], value);
    }

	this.events.dispatch("change", {key:key, value:value});
};


/**
 * Adds a data entry to the Session context.<br/>
 * <br/>
 * This method stores the given data value in the Session context under the given
 * key. A "change" event is dispatched to all listeners of that event after the
 * data entry has been added, where the key-value pair is passed to the event
 * listeners as named properties of the event data object (i.e. as "eventItem.data.key"
 * and "eventItem.data.value").<br/>
 * <br/>
 * Any existing data entry in the Session context associated with the same key is
 * replaced with the new value.
 * <br/>
 * Usage:<br/>
 * Session::set('key', 'value of the Session::key');<br/>
 * Session::set('One.key1', 'value of the Session::One[key1]');<br/>
 * Session::set('One', {'key1': 'value of the Session::One[key1]', 'key2':'value of the Session::One[key2]'});
 *
 * @name GeckoJS.Session.set
 * @public
 * @static
 * @function
 * @param {String} key                This is the key under which to store the Session data
 * @param {Object} value              This is the data value
 */
GeckoJS.Session.set = function(key, value) {
	GeckoJS.Session.getInstance().set(key, value);
};


/**
 * Retrieves the data value identified by the given key.<br/>
 * <br/>
 * This method returns null if the key does not exist in the Session context.
 * <br/>
 * Usage:<br/>
 * Session::get('Name'); will return all values for Name<br/>
 * Session::get('Name.key'); will return only the value of Session::Name[key]
 *
 * @name GeckoJS.Session#get
 * @public
 * @function
 * @param {String} key                This is the key that identifies the data to retrieve
 * @return {Object}                   The Session data stored under the given key
 */
GeckoJS.Session.prototype.get = function(key){

    var name = this.__configVarNames(key);

    if(name.length >1) {
        var obj = this.map.get(name[0]);
        if (obj == null) return obj;

        var cur = obj;

        for (var i=1; i<name.length ; i++ ) {
            var part = name[i];

            if (typeof cur[part] != 'undefined') {
                cur = cur[part];
            }else {
                return null;
            }
        }
        if (cur == null || typeof cur == 'undefined') cur = null;

        return cur;

    }else {
        return this.map.get(name[0]);
    }

};


/**
 * Retrieves the data value identified by the given key.<br/>
 * <br/>
 * This method returns null if the key does not exist in the Session context.
 * <br/>
 * Usage:<br/>
 * Session::get('Name'); will return all values for Name<br/>
 * Session::get('Name.key'); will return only the value of Session::Name[key]
 *
 * @name GeckoJS.Session.get
 * @public
 * @static
 * @function
 * @param {String} key                This is the key that identifies the data to retrieve
 * @return {Object}                   The Session data stored under the given key
 */
GeckoJS.Session.get = function(key){
    return GeckoJS.Session.getInstance().get(key);
};

/**
 * Checks if the given key exists in the Session context.
 *
 * @name GeckoJS.Session#has
 * @public
 * @function
 * @param {String} key                This is the key to check
 * @return {Boolean}                  "true" if the key exists, "false" otherwise
 */
GeckoJS.Session.prototype.has = function(key) {

    var name = this.__configVarNames(key);

    if(name.length >1) {
        var obj = this.map.get(name[0]);
        if (obj == null) return false;
        var cur = obj;
        for (var i=1; i<name.length ; i++ ) {
            var part = name[i];

            if (typeof cur[part] != 'undefined') {
                cur = cur[part];
            }else {
                return false;
            }
        }
        return true;

    }else {
        return this.map.containsKey(name[0]);
    }

};


/**
 * Checks if the given key exists in the Session context.
 *
 * @name GeckoJS.Session.has
 * @public
 * @static
 * @function
 * @param {String} key                This is the key to check
 * @return {Boolean}                  "true" if the key exists, "false" otherwise
 */
GeckoJS.Session.has = function(key) {
    return GeckoJS.Session.getInstance().has(key);
};


/**
 * Cloning of GeckoJS.Session instances is not supported.<br/>
 * <br/>
 * The clone() method from GeckoJS.BaseObject is overridden in GeckoJS.Session
 * with a dummy method.
 *
 * @name GeckoJS.Session#clone
 * @public
 * @function
 */
GeckoJS.Session.prototype.clone = function(){
};


/**
 * Serializes the Session context using JSON encoding. Event listeners are not
 * serialized. 
 *
 * @name GeckoJS.Session#serialize
 * @public
 * @function
 * @return {String}         The JSON representation of the Session data
 */
GeckoJS.Session.prototype.serialize = function(){
	return this.map.serialize();
};

/**
 * Restores the Session context from its JSON encoding. Event listeners
 * are not restored.
 *
 * @name GeckoJS.Session#unserialize
 * @public
 * @function
 * @param {String} str      The JSON representation of the Session context
 */
GeckoJS.Session.prototype.unserialize = function(str) {

    	this.map.unserialize(str);

        this.events.dispatch("unserialize", this);
        return this;

};

GeckoJS.Session.prototype.__configVarNames = function (name) {
    if (typeof name == "string") {
        name = name.split(".");
    }
    return name;
};
/**
 * Defines the GeckoJS.Dispatcher namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Dispatcher', GeckoJS.global);


/**
 * Creates a new GeckoJS.Dispatcher instance.
 * 
 * @class GeckoJS.Dispatcher is a Singleton that provides the mechanism via
 * which MVC UI events are dispatched to the appropriate controllers in the
 * Gecko APP Engine MVC Framework.<br/>
 *
 * @name GeckoJS.Dispatcher
 * @extends GeckoJS.BaseObject
 * @extends GeckoJS.Singleton
 * @property {GeckoJS.Event} events       A list of event listeners
 */
GeckoJS.Dispatcher = GeckoJS.BaseObject.extend('Dispatcher',
/** @lends GeckoJS.Dispatcher.prototype */
{
    /**
     * Dispatcher contructor
     *
     * @name GeckoJS.Dispatcher#init
     * @public
     * @function
     */
    init: function(){
        this._events = new GeckoJS.Event();
    }
});

// make ClassRegistry support singleton
GeckoJS.Singleton.support(GeckoJS.Dispatcher);


//events getter
GeckoJS.Dispatcher.prototype.__defineGetter__('events', function(){
    return this._events;
});
//callbacks setter
GeckoJS.Dispatcher.prototype.__defineSetter__('events', function(e){
    // do not things
    });


/**
 * Adds a listener for a given event to this Dispatcher instance.
 *
 * @name GeckoJS.Dispatcher.addEventListener
 * @public
 * @static
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to add
 * @param {Object} thisObj          This is the execution scope to lock the listener to
 */
GeckoJS.Dispatcher.addEventListener = function(aEvent, aListener, thisObj) {
    this.getInstance().addEventListener(aEvent, aListener, thisObj);
};


/**
 * Adds a listener for a given event to this Dispatcher instance.
 *
 * @name GeckoJS.Dispatcher#addEventListener
 * @public
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to add
 * @param {Object} thisObj          This is the execution scope to lock the listener to
 */
GeckoJS.Dispatcher.prototype.addEventListener = function(aEvent, aListener, thisObj) {
    try {
        /* ifdef DEBUG 
        this.log('DEBUG', 'GeckoJS.Dispatcher.addEventListener ' + aEvent);
        /* endif DEBUG */

        thisObj = thisObj || this;
        
        this.events.addListener(aEvent, aListener, thisObj);
    }catch(e) {
        this.log("ERROR", 'GeckoJS.Dispatcher.addEventListener ' + aEvent , e);
    }

};


/**
 * Remove a listener for a given event to this Dispatcher instance.
 *
 * @name GeckoJS.Dispatcher.removeEventListener
 * @public
 * @static
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to remove
 */
GeckoJS.Dispatcher.removeEventListener = function(aEvent, aListener) {
    this.getInstance().removeEventListener(aEvent, aListener);
};


/**
 * Remove a listener for a given event to this Dispatcher instance.
 *
 * @name GeckoJS.Dispatcher#removeEventListener
 * @public
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to remove
 */
GeckoJS.Dispatcher.prototype.removeEventListener = function(aEvent, aListener) {
    try {
        /* ifdef DEBUG 
        this.log('DEBUG', 'GeckoJS.Dispatcher.RemoveEventListener ' + aEvent);
        /* endif DEBUG */

        this.events.removeListener(aEvent, aListener);
    }catch(e) {
        this.log("ERROR", 'GeckoJS.Dispatcher.removeEventListener ' + aEvent , e);
    }

};


/**
 * Dispatches the given event to all listeners of that event.<br/>
 * <br/>
 * This method creates an EventItem instance from (sEvt, data, "this") to pass
 * to the event listeners. If any of the listeners invokes the preventDefault()
 * method on the EventItem instance, this method will return "false". Otherwise
 * it returns "true".
 *
 * @name GeckoJS.Dispatcher.dispatchEvent
 * @public
 * @static
 * @function
 * @param {String} sEvt             This is the event name
 * @param {Object} data             This is the event data
 * @return {Boolean}                Whether preventDefault() has been invoked
 */
GeckoJS.Dispatcher.dispatchEvent = function(sEvt, data ) {
    return this.getInstance().dispatchEvent(sEvt, data);
};


/**
 * Dispatches the given event to all listeners of that event.<br/>
 * <br/>
 * This method creates an EventItem instance from (sEvt, data, "this") to pass
 * to the event listeners. If any of the listeners invokes the preventDefault()
 * method on the EventItem instance, this method will return "false". Otherwise
 * it returns "true".
 *
 * @name GeckoJS.Dispatcher#dispatchEvent
 * @public
 * @function
 * @param {String} sEvt             This is the event name
 * @param {Object} data             This is the event data
 * @return {Boolean}                Whether preventDefault() has been invoked on the event
 */
GeckoJS.Dispatcher.prototype.dispatchEvent = function(sEvt, data ) {
    try {
        /* ifdef DEBUG 
        this.log('DEBUG', 'GeckoJS.Dispatcher.dispatchEvent ' + sEvt);
        /* endif DEBUG */

        return this.events.dispatch(sEvt, data, this);        
    }catch(e) {
        this.log('ERROR', 'GeckoJS.Dispatcher.dispatchEvent ' + sEvt , e);
        return false;
    }
};


/**
 * Dispatches the given command to a controller and invokes the command handler
 * of that controller. If the controller is not given, an appropriate controller
 * supporting the given command will be selected from the global context.
 *
 * @name GeckoJS.Dispatcher.dispatch
 * @public
 * @static
 * @function
 * @param {Object} win                  window object because jsmodules can't access window 
 * @param {String} command              This is the command to dispatch
 * @param {Object} data                 This is the command data to pass to the controller
 * @param {Object} context              This is the controller to handle the command
 * @return {GeckoJS.Dispatcher}
 */
GeckoJS.Dispatcher.dispatch = function(win, command, data, context){
    return this.getInstance().dispatch(win, command, data, context);
};


/**
 * Dispatches the given command to a controller and invokes the command handler
 * of that controller. If the controller is not given, an appropriate controller
 * supporting the given command will be selected from the global context.
 *
 * @name GeckoJS.Dispatcher#dispatch
 * @public
 * @function
 * @param {Object} win                  This is the window object because jsmodules can't access window 
 * @param {String} command              This is the command to dispatch; defaults to "index"
 * @param {Object} data                 This is the command data to pass to the controller
 * @param {Object} context              This is the controller to handle the command
 * @return {GeckoJS.Dispatcher}
 */
GeckoJS.Dispatcher.prototype.dispatch = function(win, command, data, context){

    try {

        //var window = win || window || GeckoJS.global;
	    //var document = window.document;
        
        command = command || 'index';
        data = (typeof data != 'undefined') ? data : null;
        context = context || null;

        var controller = null;

        if (context != null) {
            
            if (typeof context == 'string' ) {
                // get controller class from name
                context = win.GeckoJS.Controller.getControllerClass(context);
            }
            
            if(typeof context == 'function'){

                if ( typeof context['getInstance'] == 'function') {
                    // controller class ?
                    try {
                        controller = context.getInstance();
                    }catch(e) {
                        this.log('ERROR','GeckoJS.dispatch controller.getInstance ', e);
                    }
                    
                }else {
                    // not controller class
                    controller = null;
                }

            }else if(typeof context == 'object') {
                
                if(context instanceof GeckoJS.Controller || typeof context['isCommandEnabled'] == 'function') {
                    // controller object ?
                    controller = context;
                }else {
                    // not accept controller object
                    controller = null;
                }
            }
        }else {
            
            // nsIController and has been appendController .
            var win = win || GeckoJS.global;
            var top = win.top || GeckoJS.global.top;
            var doc = win.document || GeckoJS.global.document;
            var cmdDispatcher = doc.commandDispatcher || top.document.commandDispatcher || win.controllers;

            controller = cmdDispatcher.getControllerForCommand(command);

        }
        
        if (controller == null ){
            this.log('WARN', 'GeckoJS.dispatch controller not found for '+ command);

        }else if (controller.isCommandEnabled(command)) {
            // command enabled 
            
            try {

                // if wrappedJSObject exists , we can access property directly
                if(typeof controller.wrappedJSObject != 'undefined') {
                    controller.wrappedJSObject._data = data;
                    controller.wrappedJSObject._command = command;
                }

				// beforeDispatch 
				var beforeResult = this.dispatchEvent('beforeDispatch', controller);

				if (beforeResult) {

		            // dispatch dispatcher's event
		            this.dispatchEvent('onDispatch', controller);


		            /* ifdef DEBUG 
		            this.log('DEBUG', 'dispatch for ' + controller['name'] +'.'+ command );
		            /* endif DEBUG */

		            // invoke controller 's command
		            controller.doCommand(command);

					this.dispatchEvent('afterDispatch', controller);

				}

            }catch(e) {
                this.log('ERROR','GeckoJS.dispatch ', e);
            }

        }else if (typeof controller['scaffold'] != 'undefined') {
            // scaffold ?
            if (typeof controller.wrappedJSObject['Scaffold'] == 'undefined') {
                // always instance new for cross window controller
                //controller.wrappedJSObject['Scaffold'] = new win.GeckoJS.Scaffold(controller);
                /* ifdef DEBUG 
                this.log('TRACE', 'newScaffold for ' + controller['name'] +'.'+ command );
                /* endif DEBUG */
                controller.newScaffold();
            }
            controller.wrappedJSObject['Scaffold'].__invoke(command, data);

        }else {
            this.log('WARN', 'GeckoJS.dispatch command not found for '+ command);
        }
        
        return this;
    }catch (e) {
        this.log('ERROR', 'GeckoJS.dispatch to command' + command , e);
    }

    return this;
};


/**
 * Defines the GeckoJS.NSIRunnable namespace.
 *
 * @public
 * @namespace GeckoJS.NSIRunnable
 */
GREUtils.define('GeckoJS.NSIRunnable', GeckoJS.global);

/**
 * @class The GeckoJS.NSIRunnable interface is equivalent to the XPCOM
 * nsIRunnable interface and should be implemented by any class whose instances
 * are intended to be executed by a thread. The class must define a method of
 * no arguments called run().<br/>
 * <br/>
 * This interface is designed to provide a common protocol for objects that wish
 * to execute code while they are active. Thread is an example of a class that
 * implements this interface (being active simply means that a thread has been
 * started and has not yet been stopped.)<br/>
 * <br/>
 * GeckoJS.NSIRunnable is an interface and should not be instantiated under
 * normal circumstances. Classes that wish to implement the GeckoJS.NSIRunnable
 * interface should inherit (extend) the GeckoJS.NSIRunnable class.<br/>
 *
 * @name GeckoJS.NSIRunnable
 * @extends GeckoJS.BaseObject
 */
GeckoJS.NSIRunnable = GeckoJS.BaseObject.extend('NSIRunnable',
/** @lends GeckoJS.NSIRunnable.prototype */
{

    /**
     * NSIRunnable contructor
     *
     * @name GeckoJS.NSIRunnable#init
     * @public
     * @function
     */
    init: function(){

    }
});


/**
 * A class implementing the GeckoJS.NSIRunnable interface should provide its
 * own run() method to override the dummy GeckoJS.NSIRunnable.run() method.<br/>
 * <br/>
 * When an object that implements the GeckoJS.NSIRunnable interface is used to
 * create a thread, starting the thread causes the object's run() method to be
 * called in that separately executing thread.
 *
 * @name GeckoJS.NSIRunnable#run
 * @public
 * @function
 */
GeckoJS.NSIRunnable.prototype.run = function() {
};

/**
 * Returns an XPCOM nsIRunnable interface, letting the Thread Manager know that
 * this component implements the XPCOM nsIRunnable interface.<br/>
 * <br/>
 * If the "iid" parameter is not Components.Interfaces.nsIRunnable or
 * Components.Interfaces.nsISupports, this method throws the
 * Components.results.NS_ERROR_NO_INTERFACE exception.
 *
 * @name GeckoJS.NSIRunnable#QueryInterface
 * @public
 * @function
 * @param {nsIID} iid               The IID of the requested interface
 * @return {nsIRunnable}            The XPCOM nsIRunnable interface
 */
GeckoJS.NSIRunnable.prototype.QueryInterface = function(iid) {
	if (iid.equals(Components.Interfaces.nsIRunnable) || iid.equals(Components.Interfaces.nsISupports)) {
	    return this;
	}
	throw Components.results.NS_ERROR_NO_INTERFACE;
};

/**
 * Defines the GeckoJS.Thread namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Thread', GeckoJS.global);

/**
 * Creates a new GeckoJS.Thread instance and initializes it with a
 * GeckoJS.NSIRunnable object.
 *
 * @class GeckoJS.Thread represents a thread of execution. It implements the
 * GeckoJS.NSIRunnable interface, and is used to execute a GeckoJS.NSIRunnable
 * object in a worker thread.<br/>
 *
 * @name GeckoJS.Thread
 * @extends GeckoJS.NSIRunnable
 *
 * @property {GeckoJS.NSIRunnable} runnable   The GeckoJS.NSIRunnable object to execute (read-only)
 * @property {nsIThread} worker               An nsIThread worker thread to execute the runnable (read-only)
 * @property {nsIThread} main                 The main thread (read-only)
 * @property {Number} id                      The thread id (read-only)
 */
GeckoJS.Thread = GeckoJS.NSIRunnable.extend('Thread',
/** @lends GeckoJS.Thread.prototype */
{
    
    /**
     * Thread contructor
     *
     * @name GeckoJS.Thread#init
     * @public
     * @function
     * @param {GeckoJS.NSIRunnable} target
     */
    init: function(target){
	  this._runnable = target || this;
    }
});

/**
 * Thread active Count
 * @private
 */
GeckoJS.Thread._count = 0;

GeckoJS.Thread.prototype._runnable = null;

//runnable getter
GeckoJS.Thread.prototype.__defineGetter__('runnable', function() {
    this._runnable = this._runnable || this;
	return this._runnable;
});


GeckoJS.Thread.prototype._worker = null;

//worker thread getter
GeckoJS.Thread.prototype.__defineGetter__('worker', function(){
    this._worker = this._worker || GREUtils.Thread.createWorkerThread();
	return this._worker ;
});

GeckoJS.Thread.prototype._main = null;

//worker thread getter
GeckoJS.Thread.prototype.__defineGetter__('main', function(){
    this._main = this._main || GREUtils.Thread.getMainThread();
	return this._main;
});


GeckoJS.Thread.prototype._id = 0;

//worker thread getter
GeckoJS.Thread.prototype.__defineGetter__('id', function(){
    this._id = this._id || ++GeckoJS.Thread._count;
	return this._id;
});

/**
 * Starts the execution of the runnable object in the worker thread.<br/>
 * <br/>
 * This method dispatches the NSIRunnable object in the "runnable" field to the
 * worker thread and schedules it for normal execution. The method returns
 * immediately.
 *
 * @name GeckoJS.Thread#start
 * @public
 * @function
 */
GeckoJS.Thread.prototype.start = function() {
	var worker = this.worker;
    var aType = worker.DISPATCH_NORMAL;
	var aRunnable = this.runnable;

    try {
       worker.dispatch(aRunnable, aType);
    }catch (err) {
        GREUtils.Thread.reportError(err);
    }
};

/**
 * Defines the GeckoJS.NSIObserver namespace.
 *
 * @public
 * @namespace GeckoJS.NSIObserver
 */
GREUtils.define('GeckoJS.NSIObserver', GeckoJS.global);

/**
 * Creates a new GeckoJS.NSIObserver instance.
 * 
 * @class GeckoJS.NSIObserver is an interface that is normally implemented by
 * an object that wishes to observe notifications. These notifications are
 * often, though not always, broadcast via the nsIObserverService<br/>
 *
 * @name GeckoJS.NSIObserver
 * @extends GeckoJS.BaseObject
 */
GeckoJS.NSIObserver = GeckoJS.BaseObject.extend('NSIObserver',
/** @lends GeckoJS.NSIObserver.prototype */
{

    /**
     * NSIObserver contructor
     *
     * @name GeckoJS.NSIObserver#init
     * @public
     * @function
     */
    init: function(){

    }
});


/**
 * This method will be invoked when there is a notification for the topic that
 * the observer has registered for.<br/>
 * <br/>
 * In general, aSubject reflects the object whose change or action is being
 * observed, aTopic indicates the specific change or action, and aData is an
 * optional parameter or other auxiliary data further describing the change or
 * action.<br/>
 * <br/>
 * The specific values and meanings of the parameters provided varies widely,
 * though, according to where the observer was registered, and what topic is
 * being observed.<br/>
 * <br/>
 * A single nsIObserver implementation can observe multiple types of
 * notification, and is responsible for dispatching its own behavior on the
 * basis of the parameters for a given callback.<br/>
 * <br/>
 * In general, aTopic is the primary criterion for such dispatch; nsIObserver
 * implementations should take care that they can handle being called with
 * unknown values for aTopic.<br/>
 * <br/>
 * While some observer-registration systems may make this safe in specific
 * contexts, it is generally recommended that observe implementations not add
 * or remove observers while they are being notified.
 *
 * @name GeckoJS.NSIObserver#observe
 * @public
 * @function
 *
 * @param {nsISupports} aSubject
 * @param {String} aTopic
 * @param {String} aData
 *
 */
GeckoJS.NSIObserver.prototype.observe = function(aSubject, aTopic, aData) {
};


/**
 * Returns an XPCOM nsIObserver interface, letting the Observer services know
 * that this component implements the XPCOM nsIObserver interface.<br/>
 * <br/>
 * If the "iid" parameter is not Components.Interfaces.nsIObserver or
 * Components.Interfaces.nsISupports, this method throws the
 * Components.results.NS_ERROR_NO_INTERFACE exception.
 *
 * @name GeckoJS.NSIObserver#QueryInterface
 * @public
 * @function
 * @param {nsIID} iid               The IID of the requested interface
 * @return {nsIObserver}            The XPCOM nsIObserver interface
 */
GeckoJS.NSIObserver.prototype.QueryInterface = function(iid) {
	if (iid.equals(Components.Interfaces.nsIObserver) || iid.equals(Components.Interfaces.nsISupports)) {
	    return this;
	}
	throw Components.results.NS_ERROR_NO_INTERFACE;
};

/**
 * Defines the GeckoJS.Observer namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Observer', GeckoJS.global);


/**
 * Creates a new GeckoJS.Observer instance.
 *
 * @class GeckoJS.Observer represents a Observer services
 *
 * @name GeckoJS.Observer
 * @extends GeckoJS.NSIObserver
 *
 */
GeckoJS.Observer = GeckoJS.NSIObserver.extend('Observer',
/** @lends GeckoJS.Observer.prototype */
{
    
    /**
     * Observer contructor
     *
     * @name GeckoJS.Observer#init
     * @public
     * @function
     */
    init: function(){

    }
    
});


/**
 * This method is invoked when there is a notification for the topic that the
 * observer has registered for.<br/>
 * <br/>
 * In general, aSubject reflects the object whose change or action is being
 * observed, aTopic indicates the specific change or action, and aData is an
 * optional parameter or other auxiliary data further describing the change or
 * action.<br/>
 * <br/>
 * The specific values and meanings of the parameters provided varies widely,
 * though, according to where the observer was registered, and what topic is
 * being observed.<br/>
 * <br/>
 * A single nsIObserver implementation can observe multiple types of
 * notification, and is responsible for dispatching its own behavior on the
 * basis of the parameters for a given callback.<br/>
 * <br/>
 * In general, aTopic is the primary criterion for such dispatch; nsIObserver
 * implementations should take care that they can handle being called with
 * unknown values for aTopic.<br/>
 * <br/>
 * While some observer-registration systems may make this safe in specific
 * contexts, it is generally recommended that observe implementations not add
 * or remove observers while they are being notified.
 *
 * @name GeckoJS.Observer#observe
 * @public
 * @function
 *
 * @param {nsISupports} aSubject
 * @param {String} aTopic
 * @param {String} aData
 *
 */
GeckoJS.Observer.prototype.observe = function(aSubject, aTopic, aData) {
};

/**
 * Observe Topic for register
 *
 */
GeckoJS.Observer.prototype.topics = [];

/**
 * register this observer to Observer Service.
 *
 * @name GeckoJS.Observer#register
 * @public
 * @function
 * @param {Array} topics
 * @return {GeckoJS.Observer} this
 */
GeckoJS.Observer.prototype.register = function(topics) {

    var observerService = Components.classes["@mozilla.org/observer-service;1"]
    .getService(Components.interfaces.nsIObserverService);

    var self = this;
    topics = topics || this.topics;
    var newTopics = [] ;
    topics.forEach(function(topic) {
        try {
            observerService.addObserver(self, topic, false);
            newTopics.push(topic);
        }catch(e) {
            this.log('ERROR', 'addObserver for ' + topic + ' failure.');
        }
    });
    this.topics = newTopics;

    return this;

};


/**
 * unregister this observer from Observer Service.
 *
 * @name GeckoJS.Observer#unregister
 * @public
 * @function
 * @return {GeckoJS.Observer} this
 */
GeckoJS.Observer.prototype.unregister = function() {

    var observerService = Components.classes["@mozilla.org/observer-service;1"]
    .getService(Components.interfaces.nsIObserverService);


    var self = this;
    var topics = this.topics;
    topics.forEach(function(topic) {
        try {
            observerService.removeObserver(self, topic);
        }catch(e) {
            this.log('ERROR', 'removeObserver for ' + topic + ' failure.');
        }
    });

   return this;
};




/**
 * To signal the observers of a topic.
 * Calling this method will signal all registered observers of a given topic.
 *
 * @name GeckoJS.Observer.notify
 * @public
 * @function
 * @static
 * @param {Object} subject  Notification specific interface pointer.
 * @param {String} topic    The notification topic or subject.
 * @param {String} data         Notification specific wide string.
 *
 * @example
 * example: <pre>
 *   GeckoJS.Observer.notify(subject,"my-topic","add");
 * </pre>
 *
 */
GeckoJS.Observer.notify = function(subject, topic, data) {

    if (subject) {
        if (typeof subject.QueryInterface == 'undefined') {
            subject.wrappedJSObject = subject;
            subject.QueryInterface = function(iid) {
                if (iid.equals(Components.Interfaces.nsISupports)) {
                    return subject;
                }
                throw Components.results.NS_ERROR_NO_INTERFACE;
            };
        }
    }

    var observerService = Components.classes["@mozilla.org/observer-service;1"]
    .getService(Components.interfaces.nsIObserverService);

    observerService.notifyObservers(subject, topic, data);
};


/**
 * To signal the observers of a topic.
 * Calling this method will signal all registered observers of a given topic.
 *
 *
 * @name GeckoJS.Observer#notify
 * @public
 * @function
 * @param {Object} subject  Notification specific interface pointer.
 * @param {String} topic    The notification topic or subject.
 * @param {String} data         Notification specific wide string.
 *
 * @example
 * example: <pre>
 *   GeckoJS.Observer.notify(subject,"my-topic","add");
 * </pre>
 *
 */
GeckoJS.Observer.prototype.notify = function(subject, topic, data) {

    GeckoJS.Observer.notify(subject, topic, data);

};

/**
 * return new instance of observer
 *
 * proto is javascript object for quick implement observer
 *
 * @name GeckoJS.Observer.newInstance
 * @public
 * @function
 * @param {Object} proto
 *
  * @example
 * example: <pre>
 *  {
 *    topics: ['myTopic1', 'myTopic2'],
 *
 *    observe: function(aSubject, aTopic, aData) {
 *    }
 *  }
 *  </pre>
 *
 *  usage: <pre>
 *  var closeObserve = GeckoJS.Observer.newInstance({
 *          topics: ['quit-applicatio-requested','quit-application-granted', 'quit-application'],
 *          observe: function(aSubject, aTopic, aData) {
 *              this.unregister();
 *              // application quit.....
 *          }
 *          }).register();
 * </pre>
 *
 */
GeckoJS.Observer.newInstance = function(proto) {

    var klass = GeckoJS.Observer.extend(proto);
    return new klass;

};

/**
 * Defines GeckoJS.NSIController namespace
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.NSIController', GeckoJS.global);

/**
 * Creates a new GeckoJS.NSIController instance.
 * 
 * @class GeckoJS.NSIController implements the nsIController interface. This
 * class provides the basis for other Controller classes that actually do the
 * work.<br/>
 *       
 * @name GeckoJS.NSIController
 * @extends GeckoJS.BaseObject
 * @extends GeckoJS.Singleton
 */
GeckoJS.NSIController = GeckoJS.BaseObject.extend('NSIController',
/** @lends GeckoJS.NSIController.prototype */
{

    /**
     * NSIController contructor
     *
     * @name GeckoJS.NSIController#init
     * @public
     * @function
     */
    init: function(){
        // http://developer.mozilla.org/en/docs/wrappedJSObject
        this.wrappedJSObject = this;
		
        this._privateCommands =  {
            '_privateCommands': true,
            'supportsCommand': true,
            'isCommandEnabled': true,
            'doCommand': true,
            'onEvent': true,
			
            // from BaseObject
            'extend': true,
            'serialize': true,
            'unserialize': true,
            'log': true
        };
    }
});

// make Controller support singleton
GeckoJS.Singleton.support(GeckoJS.NSIController);


/**
 * Checks if the given command is supported by this controller.<br/>
 * <br/>
 * Returns "true" if the given command is supported, "false" otherwise.  
 *
 * @name GeckoJS.NSIController#supportsCommand
 * @public
 * @function
 * @param {String} sCmd             This is the command to check 
 * @return {Boolean}                Whether the given command is supported
 */
GeckoJS.NSIController.prototype.supportsCommand = function(sCmd){
    if ((!(sCmd in this._privateCommands)) && (sCmd in this) && typeof this[sCmd] == 'function') {
        return true;
    }
    this.log('WARN', 'GeckoJS.Controller.supportsCommand: [' + sCmd + '] return false');
    return false;
};


/**
 * Checks if the given command is enabled in this controller.<br/>
 * <br/>
 * Returns "true" if the given command is enabled, "false" otherwise.  
 *
 * @name GeckoJS.NSIController#isCommandEnabled
 * @public
 * @function
 * @param {String} sCmd             This is the command to check 
 * @return {Boolean}                Whether the given command is enabled
 */
GeckoJS.NSIController.prototype.isCommandEnabled = function(sCmd){
    if (this.supportsCommand(sCmd)) {
        return true;
    }
    return false;
};


/**
 * Performs the specified command.<br/>
 * <br/>
 * The specified command is performed only if it is supported by the Controller
 * and is enabled.
 *
 * @name GeckoJS.NSIController#doCommand
 * @public
 * @function
 * @param {String} sCmd             This is the command to perform
 */
GeckoJS.NSIController.prototype.doCommand = function(sCmd){
	
    try {
        if (this.supportsCommand(sCmd) && this.isCommandEnabled(sCmd)) {
            this[sCmd].apply(this, arguments);
        }
    }catch(e){
        this.log("FATAL", "An error occurred executing the " + sCmd + " command\n", e);
    }
	
};


/**
 * Provides a dummy onEvent() method that always returns "true".
 *
 * @name GeckoJS.NSIController#onEvent
 * @public
 * @function
 * @param {String} sCmd             This is the event name 
 * @return {Boolean}                "true" always
 */
GeckoJS.NSIController.prototype.onEvent = function(sEvt){
    return true;
};


/**
 * Appends an instance of this Controller to the list of global controllers.
 *
 * @name GeckoJS.NSIController.appendController
 * @public
 * @static 
 * @function
 */
GeckoJS.NSIController.appendController = function() {
    var win = typeof window != 'undefined' ? window : GeckoJS.global;
    win.controllers.appendController(this.getInstance());
};

 /**
 * Defines the GeckoJS.BaseController namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.BaseController', GeckoJS.global);


/**
 * Creates a new GeckoJS.BaseController instance.
 * 
 * @class GeckoJS.BaseController is the base Controller class for the VIVIPOS APP
 * Engine MVC Framework. The Controller in a Model-View-Controller design
 * pattern is responsible for processing and responding to events, such as
 * user actions, and invoking changes on the model.<br/>
 * <br/>
 * GeckoJS.BaseController inherits from NSIController and supports the
 * nsIController interface. It is a Singleton class.<br/>
 *
 * @name GeckoJS.BaseController
 * @extends GeckoJS.NSIController
 * @extends GeckoJS.Singleton
 *
 * @property {GeckoJS.Event} events       A list of event listeners (read-only)
 * @property {GeckoJS.Session} Session    A session context (read-only)
 * @property {ChromeWindow} activeWindow        activeWindow's window object || ChromeWindow (read-only)
 * @property {ChromeWindow} topmostWindow        topmost window object skip alert:alert window (read-only)
 * @property {Object} data                Data from gDispatch
 * @property {String} command             Command from gDispatch
 * @property {String} dispatchedEvents    Log of the dispatchedEvents
 * @property {String} name                Name of this Controller class
 */
GeckoJS.BaseController = GeckoJS.NSIController.extend('BaseController', 
/** @lends GeckoJS.BaseController.prototype */
{
    name: 'BaseController',

    /**
     * BaseController contructor
     *
     * @name GeckoJS.BaseController#init
     * @public
     * @function
     */
    init: function(){


        // set Default controller name
        this.name = this.name || "BaseController";

        /*
        // FUEL's SessionStorage support
        var eventKey = "GeckoJS_Controller_"+this.name+"_events";
        if (Application.storage.has(eventKey)) {
            this._events = Application.storage.get(eventKey, (new GeckoJS.Event()) );
        }else {
            this._events = new GeckoJS.Event();
            Application.storage.set(eventKey, this._events);
        }*/

        this._events = new GeckoJS.Event();

        this._session = GeckoJS.Session.getInstance();

        // http://developer.mozilla.org/en/docs/wrappedJSObject
        this.wrappedJSObject = this;

        // dispatchedEvents
        this.dispatchedEvents = {};
		
        // gDispatch set data to here
        this._data = null;

        // gDispatch set command to here
        this._command = "";

        // load Models
        this.modelClass = "";
        this.modelKey = "";
        this.uses = this.uses || [];
        this._loadModels();

        // auto register events from class prototype method
        this._addControllerEvents();

        // _addComponents
        this.components = this.components || [];
        this._addComponents();

        // _addHelpers
        this.helpers = this.helpers || [];
        this._addHelpers();

        this._privateCommands =  {
            '_privateCommands': true,
            'getCallbacks': true,
            'getEvents': true,
            'supportsCommand': true,
            'isCommandEnabled': true,
            'doCommand': true,
            'onEvent': true,

            // from BaseObject
            'extend': true,
            'serialize': true,
            'unserialize': true,
            'log': true,

            // for filter rule
            'beforeFilter': true,
            'afterFilter': true,

            'Session': true,
            'query': true,
            'addEventListener': true,
            'dispatchEvent': true,
            
            'Acl': true,
            'Form': true
            
        };


    }
});

// make Controller support singleton
GeckoJS.Singleton.support(GeckoJS.BaseController);


//events getter
GeckoJS.BaseController.prototype.__defineGetter__('events', function(){
    return this._events;
});

//session getter
GeckoJS.BaseController.prototype.__defineGetter__('Session', function(){
    return this._session;
});


//window object getter
GeckoJS.BaseController.prototype.__defineGetter__('activeWindow', function(){

    return GREUtils.XPCOM.getUsefulService("window-watcher").activeWindow;

});

GeckoJS.BaseController.prototype.__defineGetter__('topmostWindow', function(){

    // skip windowtype = alert:alert
    var win = GREUtils.XPCOM.getUsefulService("window-mediator").getMostRecentWindow(null);
    var doc = win.document;
    var winElement = doc.getElementsByTagName('window');
    var windowtype = '';
    if (winElement[0]) {
         windowtype = winElement[0].getAttribute('windowtype');
         if (windowtype != 'alert:alert') return win;
    }

    // enumerator all windows
    var enumerator = GREUtils.XPCOM.getUsefulService("window-mediator").getEnumerator(null);
    var winTmp = null;
    while(enumerator.hasMoreElements()) {

        winTmp = enumerator.getNext();

        doc = winTmp.document;
        winElement = doc.getElementsByTagName('window');
        if (winElement[0]) {
            windowtype = winElement[0].getAttribute('windowtype');
            if (windowtype != 'alert:alert') win = winTmp;
        }
    }

    return win || GREUtils.XPCOM.getUsefulService("window-mediator").getMostRecentWindow(null);

});


//dispatchData getter
GeckoJS.BaseController.prototype.__defineGetter__('data', function(){
    return this._data;
});

//dispatchData setter
GeckoJS.BaseController.prototype.__defineSetter__('data', function(d){
    this._data = d;
});

//dispatchData getter
GeckoJS.BaseController.prototype.__defineGetter__('command', function(){
    return this._command;
});

//dispatchData setter
GeckoJS.BaseController.prototype.__defineSetter__('command', function(d){
    this._command = d;
});


/**
 * _addControllerEvents
 *
 * @name GeckoJS.BaseController#_addControllerEvents
 * @private
 * @function
 */
GeckoJS.BaseController.prototype._addControllerEvents = function() {
    
    var events = this._events;
    var self = this;

    // ignore basecontroller or controller
    if (this.getClassName() == 'BaseController' || this.getClassName() == 'Controller' ) return;

    ['beforeFilter', 'afterFilter'].forEach(function(evt){
        if(typeof self[evt] == 'undefined') return;

        if (GREUtils.isFunction(self[evt])) {
            events.addListener(evt, self[evt], self);
        } else if (GREUtils.isObject(self[evt])) {
            self[evt].forEach(function(fn){
                if (typeof(fn) == 'function') {
                    events.addListener(evt, fn, self);
                }
            });
        }
    }, self);
    
};

/**
 * _addComponents
 *
 * @name GeckoJS.BaseController#_addComponents
 * @private
 * @function
 */
GeckoJS.BaseController.prototype._addComponents = function() {
    };

/**
 * _addHelpers
 *
 * @name GeckoJS.BaseController#_addHelpers
 * @private
 * @function
 */
GeckoJS.BaseController.prototype._addHelpers = function() {
    };

/**
 * _loadModels
 *
 * @name GeckoJS.BaseController#_loadModels
 * @private
 * @function
 */
GeckoJS.BaseController.prototype._loadModels = function() {
    };

/**
 * Returns the list of event listeners associated with this BaseController
 * instance.
 *
 * @name GeckoJS.BaseController#getEvents
 * @public
 * @function
 * @return {GeckoJS.Event}          The list of event listeners
 */
GeckoJS.BaseController.prototype.getEvents = function(){
    return this._events;
};



/**
 * Adds a listener for a given event to this BaseController instance.
 *
 * @name GeckoJS.BaseController.addEventListener
 * @public
 * @static
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to add
 * @param {Object} thisObj          This is the execution scope to lock the listener to
 */
GeckoJS.BaseController.addEventListener = function(aEvent, aListener, thisObj) {
    
    if (typeof aEvent == 'string' && typeof aListener == 'string') {

        var controller = null;
                
        // shift arguments
        thisObj = arguments[3] || GeckoJS.global;
        aListener = arguments[2];
        aEvent = arguments[1];
        var controllerName = arguments[0];

        controller = GeckoJS.BaseController.getInstanceByName(controllerName);
        if (controller) {
            controller.addEventListener(aEvent, aListener, thisObj);
        }
        
    }else {
        this.getInstance().addEventListener(aEvent, aListener, thisObj);
    }
};


/**
 * Adds a listener for a given event to this BaseController instance.
 *
 * @name GeckoJS.BaseController#addEventListener
 * @public
 * @function
 * @param {String|Array} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to add
 * @param {Object} thisObj          This is the execution scope to lock the listener to
 */
GeckoJS.BaseController.prototype.addEventListener = function(aEvent, aListener, thisObj) {
    try {
        thisObj = thisObj || this;
        if (aEvent.constructor.name == 'Array') {
            for (var idx in aEvent) {
                this.events.addListener(aEvent[idx], aListener, thisObj);
            }

        }else {
            this.events.addListener(aEvent, aListener, thisObj);
        }
       
    }catch(e) {
        this.log("ERROR", this.getClassName() + 'Controller.addEventListener ' + aEvent , e);
    }

};


/**
 * Remove a listener for a given event to this BaseController instance.
 *
 * @name GeckoJS.BaseController.removeEventListener
 * @public
 * @static
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to remove
 */
GeckoJS.BaseController.removeEventListener = function(aEvent, aListener) {

    if (typeof aEvent == 'string' && typeof aListener == 'string') {

        var controller = null;

        // shift arguments
        aListener = arguments[2];
        aEvent = arguments[1];
        var controllerName = arguments[0];

        controller = GeckoJS.BaseController.getInstanceByName(controllerName);
        if (controller) {
            controller.removeEventListener(aEvent, aListener);
        }

    }else {
        this.getInstance().removeEventListener(aEvent, aListener);
    }
};


/**
 * Remove a listener for a given event to this BaseController instance.
 *
 * @name GeckoJS.BaseController#removeEventListener
 * @public
 * @function
 * @param {String|Array} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to remove
 */
GeckoJS.BaseController.prototype.removeEventListener = function(aEvent, aListener) {
    
    try {
        if (aEvent.constructor.name == 'Array') {
            for (var idx in aEvent) {
                this.events.removeListener(aEvent[idx], aListener);
            }

        }else {
            this.events.removeListener(aEvent, aListener);
        }

    }catch(e) {
        this.log("ERROR", this.getClassName() + 'Controller.removeEventListener ' + aEvent , e);
    }

};


/**
 * Dispatches the given event to all listeners of that event.<br/>
 * <br/>
 * This method creates an EventItem instance from (sEvt, data, "this") to pass to
 * the event listeners. If any of the listeners invokes the preventDefault() method on
 * the EventItem instance, this method will return "false". Otherwise it returns
 * "true".
 *
 * @name GeckoJS.BaseController.dispatchEvent
 * @public
 * @function
 * @param {String} sEvt             This is the event name
 * @param {Object} data                 This is the event data
 * @return {Boolean}                Whether preventDefault() has been invoked
 */
GeckoJS.BaseController.dispatchEvent = function(sEvt, data) {
    return this.getInstance().dispatchEvent(sEvt, data);
};


/**
 * Dispatches the given event to all listeners of that event.<br/>
 * <br/>
 * This method creates an EventItem instance from (sEvt, data, "this") to pass to
 * the event listeners. If any of the listeners invokes the preventDefault() method on
 * the EventItem instance, this method will return "false". Otherwise it returns
 * "true".
 *
 * @name GeckoJS.BaseController#dispatchEvent
 * @public
 * @function
 * @param {String} sEvt             This is the event name
 * @param {Object} data             This is the event data
 * @return {Boolean}                The return value is false, if at least one of the event handlers which handled this event, called preventDefault. Otherwise it returns true. 
 */
GeckoJS.BaseController.prototype.dispatchEvent = function(sEvt, data ) {
    try {
        this.dispatchedEvents[sEvt] = true;
        return this.events.dispatch(sEvt, data, this);
    }catch(e) {
        this.log('ERROR',this.getClassName()  + 'Controller.dispatchEvent ' + sEvt , e);
        return false;
    }
};


/**
 * Checks if the given command is supported by this controller.<br/>
 * <br/>
 * Returns "true" if the given command is supported, "false" otherwise.
 *
 * Override NSIController 's supportCommand.
 * if scaffold is true , and dispatch to scaffold , don't warning messages.
 *
 * @name GeckoJS.BaseController#supportsCommand
 * @public
 * @function
 * @param {String} sCmd             This is the command to check
 * @return {Boolean}                Whether the given command is supported
 */
GeckoJS.BaseController.prototype.supportsCommand = function(sCmd){
    if ((!(sCmd in this._privateCommands)) && (sCmd in this) && typeof this[sCmd] == 'function') {
        return true;
    }else if (this['scaffold'] && (GeckoJS.Array.inArray(sCmd, GeckoJS.Scaffold.Actions) != -1) )  {
        // scaffold return false but no warnning.
        return false;
    }
    this.log('WARN', 'GeckoJS.Controller.supportsCommand: [' + sCmd + '] return false');
    return false;
};




/**
 * Executes a command.<br/>
 * <br/>
 * This method dispatches the "beforeFilter" event before invoking the requested
 * command. These events are called even if the given command is not supported
 * or enabled by this BaseController instance.<br/>
 * <br/>
 * If the "beforeFilter" event passes, the command is invoked if it is supported
 * and enabled, and an event is dispatched (regardless of whether the command is
 * actually invoked). The event name is constructed from concatenating "on" with
 * the camelized command name (i.e. a command of "btn_click" results in the
 * dispatch of event "onBtnClick".<br/>
 * <br/>
 * Finally the "afterFilter" event is dispatched.<br/>
 * <br/>
 * Events are passed the "command" string to the doCommand() call through the
 * event data field . The first element of this array is the command name.<br/>
 * <br/>
 * The command is invoked with the same set of arguments as this doCommand()
 * call.<br/>
 * <br/>
 * The event is dispatched with the arguments to this doCommand() call as the
 * event data.
 *
 * @name GeckoJS.BaseController#doCommand
 * @public
 * @function
 * @param {String} sCmd             This is the command to execute
 */
GeckoJS.BaseController.prototype.doCommand = function(sCmd){

    try {
        /* ifdef DEBUG 
        this.log('TRACE', 'doCommand > dispatchEvent(beforeFilter) : before (' + sCmd + ')');
        /* endif DEBUG */

        var beforeResult = this.dispatchEvent('beforeFilter', sCmd);
        
        /* ifdef DEBUG 
        this.log('TRACE', 'doCommand > dispatchEvent(beforeFilter) : after (' + beforeResult + ')');
        /* endif DEBUG */
        
        // if result invoke command
        if (beforeResult) {

            if (this.supportsCommand(sCmd) && this.isCommandEnabled(sCmd)) {
                try {
                    var args = [];
                    if (this.wrappedJSObject._data == null) {
                        
                    }else if (typeof this.wrappedJSObject._data == 'object' && typeof this.wrappedJSObject._data.constructor.name == 'Array') {
                        args = this.wrappedJSObject._data;
                    }else {
                        args.push(this.wrappedJSObject._data);
                    }

                    /* ifdef DEBUG 
                    this.log('DEBUG', 'doCommand > invoke apply (' + sCmd + ')');
                    /* endif DEBUG */

                    // invoke command
                    this[sCmd].apply(this, args);
                    
                }catch(e) {
                    this.log('ERROR', this.getClassName() + 'Controller.doCommand ' + sCmd , e);
                }
            }
			
            // check if user had dispatchEvent by itself
            var onActionEvent = 'on' + GeckoJS.Inflector.camelize(sCmd);

            if(this.dispatchedEvents[onActionEvent]) {
            // already dispatched onAction
            }else {
                /* ifdef DEBUG 
                this.log('TRACE', 'doCommand > auto dispatchEvent(' + onActionEvent + ') : before (' + sCmd + ')');
                /* endif DEBUG */

                this.dispatchEvent(onActionEvent, arguments);

                /* ifdef DEBUG 
                this.log('TRACE', 'doCommand > auto dispatchEvent(' + onActionEvent + ') : after (' + sCmd + ')');
            /* endif DEBUG */
            }

            /* ifdef DEBUG 
            this.log('TRACE', 'doCommand > clear dispatchedEvents Object at (' + sCmd + ')');
            /* endif DEBUG */

            // clear this.dispatchedEvents object
            for (var sEvt in this.dispatchedEvents) {
                delete this.dispatchedEvents[sEvt];
            }
		
        }

        /* ifdef DEBUG 
        this.log('TRACE', 'doCommand > dispatchEvent(afterFilter) : before (' + sCmd + ')');
        /* endif DEBUG */

        this.dispatchEvent('afterFilter', sCmd);

        /* ifdef DEBUG 
        this.log('TRACE', 'doCommand > dispatchEvent(afterFilter) : after (' + sCmd + ')');
    /* endif DEBUG */

    }
    catch (e) {
        this.log('ERROR' , this.getClassName() + '.doCommand error occurred executing the ' + sCmd, e);
    }

};

/**
 * Defines GeckoJS.Scaffold namespace
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Scaffold', GeckoJS.global);

/**
 * Creates a new GeckoJS.Scaffold instance and initializes it with controller,
 * command, and data.
 * 
 * @param {GeckoJS.Controller} controller       This is the controller requesting scaffolding support
 * @param {String} command                      This is the command to be handled by Scaffold
 * @param {Object} data                         This is the data from "gDispatch()"
 * 
 * @class Scaffolding provides automatic support for CRUD operations on models.
 * Controllers that only perform standard CRUD operations on models may leverage
 * scaffolding to reduce coding effort.<br/>
 * <br/>
 * If a Controller declares "scaffolding" to be "true", then the global
 * dispatcher will dispatch standard CRUD commands to the Scaffold object if
 * these commands are not handled by the Controller.<br/>
 * <br/>
 * Scaffold will dispatch a "beforeScaffold" event with the command name as the
 * event data to the controller before carrying out a command. After the command
 * has been carried out, Scaffold will dispatch a "afterScaffold<command>"
 * event to the controller. The event data for the "afterScaffold" event is
 * command dependent.<br/>
 * <br/>
 * The set of commands Scaffold supports are:<br/>
 * <br/>
 * <pre>
 * - index
 *   this command retrieves all the records from the Model, updates the Form
 *   with the first record, and passes all the records to the controller
 *   through the "afterScaffoldIndex" event.
 *     
 * - list
 *   identical to the "index" command 
 *  
 * - view 
 *   this command updates the Form with values from the Model, using the primary
 *   key from the Form. Before updating the form, the Scaffold dispatches a
 *   "beforeScaffoldView" event to the controller with the Model recod id. After
 *   updating the form, the Model record is passed to the "afterScaffoldView"
 *   event listeners. 
 *  
 * - add
 *   this command creates a new Model record using data gathered from the Form.
 *   Before adding the record, the Scaffold first dispatches a "beforeScaffoldAdd"
 *   event to the controller, followed by a "beforeScaffoldSave" event, both with
 *   the Form data. After saving the record, the Form data is first passed to the
 *   "afterScaffoldSave" event listeners, followed by the "afterScaffoldAdd"
 *   event listeners.
 *   
 * - create
 *   identical to the "add" command
 *     
 * - edit
 *   this command updates a Model record using data gathered from the Form.
 *   Before updating the record, the Scaffold first dispatches a "beforeScaffoldEdit"
 *   event to the controller, followed by a "beforeScaffoldSave" event, both with
 *   the Form data. After saving the record, the Form data is first passed to the
 *   "afterScaffoldSave" event listeners, followed by the "afterScaffoldEdit"
 *   event listeners.
 *   
 * - update
 *   identical to the "edit" command
 *  
 * - delete
 *   this command deletes the Model record identified by the Form data. Before
 *   deleting the record, the Scaffold dispatches a "beforeScaffoldDelete" event
 *   to the controller with the record id. After deleting the record, the
 *   record deleted is passed to the "afterScaffoldDelete" event listeners.  
 * </pre>
 * 
 * @name GeckoJS.Scaffold
 * @extends GeckoJS.BaseObject
 *
 * @property {GeckoJS.Controller} controller       The controller requesting scaffolding support
 * @property {String} command                      The command to be handled by Scaffold
 * @property {Object} data                         The data from "gDispatch()"
 */
GeckoJS.Scaffold = GeckoJS.BaseObject.extend('Scaffold',
/** @lends GeckoJS.Scaffold.prototype */
{

    /**
     * Scaffold contructor
     *
     * @name GeckoJS.Scaffold#init
     * @public
     * @function
     */
    init: function(controller){
        this._controller = controller || null;

        if(this._controller) this._addControllerEvents(this._controller);

        // this.scaffoldActions = ['index', 'list', 'view', 'add', 'create', 'edit', 'update', 'delete'];


        var klass = GeckoJS.BaseObject.getClassName(this.controller);

        this.modelClass = controller.modelClass || GeckoJS.Inflector.classify(klass);
        
        this.modelKey = GeckoJS.Inflector.underscore(this.modelClass);
        this.formId = this.modelKey + "Form";


        if (typeof this.controller[this.modelClass] == 'undefined' ) {
            this.log('ERROR', 'GeckoJS.Scaffold missingModel  '+ this.modelClass);
            return;
        }
        
        this.ScaffoldModel = this.controller[this.modelClass];

        this.currentData = null;
        
    // this._invoke(command);
    }
});

GeckoJS.Scaffold.Actions = ['index', 'list', 'view', 'add', 'create', 'edit', 'update', 'delete'];

GeckoJS.Scaffold.prototype.__defineGetter__('controller', function(){
    return this._controller;
});


GeckoJS.Scaffold.prototype.__defineGetter__('command', function(){
    return this._command;
});

GeckoJS.Scaffold.prototype.__defineGetter__('data', function(){
    return this._data;
});

GeckoJS.Scaffold.prototype.__defineGetter__('window', function(){
    return this._controller.window || window || GeckoJS.global;
});


/**
 * _addControllerEvents
 *
 * @name GeckoJS.Scaffold#_addControllerEvents
 * @private
 * @function
 */
GeckoJS.Scaffold.prototype._addControllerEvents = function(controller) {

    var self = controller;
    var events = controller._events;

    // ignore basecontroller or controller
    if (controller.getClassName() == 'BaseController' || controller.getClassName() == 'Controller' ) return;

    ['beforeScaffold', 'afterScaffoldIndex',
    'beforeScaffoldView', 'afterScaffoldView', 'beforeScaffoldSave', 'afterScaffoldSave',
    'beforeScaffoldAdd', 'afterScaffoldAdd', 'beforeScaffoldEdit', 'afterScaffoldEdit',
    'beforeScaffoldDelete', 'afterScaffoldDelete'].forEach(function(evt){

        if(typeof self[evt] == 'undefined') return;
        
        if (GREUtils.isFunction(self[evt])) {
            events.addListener(evt, self[evt], self);
        } else if (GREUtils.isObject(self[evt])) {
            self[evt].forEach(function(fn){
                if (typeof(fn) == 'function') {
                    events.addListener(evt, fn, self);
                }
            });
        }
    }, self);

};


/**
 * invoke scaffold action
 *
 * @name GeckoJS.Scaffold#__invoke
 * @private
 * @function
 * @param {String} command
 * @param {Object} data
 */
GeckoJS.Scaffold.prototype.__invoke = function(command, data) {
    
    this._command = command || null;
    this._data = typeof data != 'undefined' ? data : null;

    if (GeckoJS.Array.inArray(command, GeckoJS.Scaffold.Actions) == -1) {
        // error command not found
        this.log('WARN', 'GeckoJS.dispatch command not found for '+ command);
        return ;
    }

    /* ifdef DEBUG 
    this.log('DEBUG', '__invoke: ' + command);
    /* endif DEBUG */

    switch(command) {
        case 'index':
            this.__scaffoldIndex();
            break;
        case 'view':
            this.__scaffoldView();
            break;
        case 'list':
            this.__scaffoldIndex();
            break;
        case 'add':
            this.__scaffoldSave('add');
            break;
        case 'edit':
            this.__scaffoldSave('edit');
            break;
        case 'create':
            this.__scaffoldSave('add');
            break;
        case 'update':
            this.__scaffoldSave('edit');
            break;
        case 'delete':
            this.__scaffoldDelete();
            break;
    }

};


/**
 * Renders a view action of scaffolded model.
 *
 * @name GeckoJS.Scaffold#__scaffoldView
 * @private
 * @function
 */
GeckoJS.Scaffold.prototype.__scaffoldView = function() {

    /* ifdef DEBUG 
    this.log('DEBUG', '__scaffoldView');
    /* endif DEBUG */

    if (this.controller.dispatchEvent('beforeScaffold', 'view')) {

        var formObj, primaryKey, modelId = null;

        modelId = this.data || null;
        
        if (modelId == null) {

            formObj = this.controller.Form.serializeToObject(this.formId);
            primaryKey = this.controller[this.modelClass].primaryKey;
            modelId = formObj[primaryKey];
        }
            
        this.controller.dispatchEvent('beforeScaffoldView', modelId);
        
        if (modelId) {
            
            this.ScaffoldModel.id = modelId;
            var data = this.ScaffoldModel.findById(modelId);

            this.currentData = data;

            var defData = this.controller.Form.getDefaultValues(this.formId);

	    var dbData = GREUtils.extend(defData, data);
            
	    if (this.controller.dispatchEvent('afterScaffoldView', dbData)) {
	            this.controller.Form.unserializeFromObject(this.formId, dbData);
	    }
           
        }
    }

};
    
/**
 * Renders index action of scaffolded model.
 *
 * @name GeckoJS.Scaffold#__scaffoldIndex
 * @private
 * @function
 */
GeckoJS.Scaffold.prototype.__scaffoldIndex = function() {

    /* ifdef DEBUG 
    this.log('DEBUG', '__scaffoldIndex');
    /* endif DEBUG */

    if (this.controller.dispatchEvent('beforeScaffold', 'index')) {

	var params = {};
	if (typeof this.data == 'object') {
		params = this.data || {};
	}
	
        var datas = this.ScaffoldModel.find('all', params);

        var index =  (typeof this.data == 'object') ? (this.data.index || 0) : this.data ;

        if (index <0 || typeof index  == 'undefined' ) index = 0;
        index = (index >= datas.length) ? datas.length-1 : index;

        if(datas.length) {
            var defData = this.controller.Form.getDefaultValues(this.formId);
            this.currentData = datas[index];

	    var dbData = GREUtils.extend(defData, datas[index]);
            
	    if (this.controller.dispatchEvent('afterScaffoldView', dbData)) {
	            this.controller.Form.unserializeFromObject(this.formId, dbData);
	    }

        }
        
        this.controller.dispatchEvent('afterScaffoldIndex', datas);
    }

};

  
/**
 * Saves or updates the scaffolded model.
 *
 * @name GeckoJS.Scaffold#__scaffoldSave
 * @private
 * @function
 * @param {String} action add or edt
 */
GeckoJS.Scaffold.prototype.__scaffoldSave = function(action) {
    
    action = action || 'edit';

    /* ifdef DEBUG 
    this.log('DEBUG', '__scaffoldSave: ' + action);
    /* endif DEBUG */

    if (this.controller.dispatchEvent('beforeScaffold', action)) {

        var formObj = this.controller.Form.serializeToObject(this.formId);
        var primaryKey = this.controller[this.modelClass].primaryKey;
        var modelId = formObj[primaryKey];
        formObj[primaryKey] = modelId;
        
        if (action == 'edit') {
            
            if(this.controller.dispatchEvent('beforeScaffoldEdit', formObj)) {
                
                var count = this.ScaffoldModel.findById(formObj[primaryKey]);
                
                if (count <=0) {
                    // not exists
                    return ;
                }else {
                    this.ScaffoldModel.id = formObj[primaryKey];

                }

                if (this.controller.dispatchEvent('beforeScaffoldSave', formObj)) {
                    this.ScaffoldModel.save(formObj);
                    formObj[primaryKey] = this.ScaffoldModel.id;
                }
                this.controller.dispatchEvent('afterScaffoldSave', formObj);

            }
            this.controller.dispatchEvent('afterScaffoldEdit', formObj)
        }

        if (action == 'add') {
            
            if(this.controller.dispatchEvent('beforeScaffoldAdd', formObj)){
                this.ScaffoldModel.create();
                
                if (this.controller.dispatchEvent('beforeScaffoldSave', formObj)) {
                    delete formObj[this.ScaffoldModel.primaryKey]; 
                    this.ScaffoldModel.save(formObj);
                    formObj[primaryKey] = this.ScaffoldModel.id;
                }
                this.controller.dispatchEvent('afterScaffoldSave', formObj);

            }
            this.controller.dispatchEvent('afterScaffoldAdd', formObj)
        }

    }
};
    
/**
 * Performs a delete on given scaffolded Model.
 *
 * @name GeckoJS.Scaffold#__scaffoldDelete
 * @private
 * @function
 */
GeckoJS.Scaffold.prototype.__scaffoldDelete = function() {

    /* ifdef DEBUG 
    this.log('DEBUG', '__scaffoldDelete');
    /* endif DEBUG */

    if (this.controller.dispatchEvent('beforeScaffold', 'delete')) {

        var formObj = this.controller.Form.serializeToObject(this.formId);
        var primaryKey = this.controller[this.modelClass].primaryKey;
        var modelId = formObj[primaryKey];
        formObj[primaryKey] = modelId;
            
        if (this.controller.dispatchEvent('beforeScaffoldDelete', formObj)) {
            modelId = formObj[primaryKey];

            if (modelId) {
                
                this.ScaffoldModel.id = modelId;
                var data = this.ScaffoldModel.findById(modelId);
                this.ScaffoldModel.del(modelId);
                
                this.controller.dispatchEvent('afterScaffoldDelete', data);
            }
        }
    }

};

/**
 * Defines the GeckoJS.BaseModel namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.BaseModel', GeckoJS.global);

/**
 * Creates a new GeckoJS.BaseModel instance and initializes it with the given
 * record data and association level.
 * 
 * @param {Object} data                 This is the initial record data
 * @param {Number} recursive            This indicates the association level
 * 
 * @class GeckoJS.BaseModel is the base Model class for the VIVIPOS APP Engine
 * MVC Framework. A model in a Model-View-Controller design pattern represents
 * the information (the data) of the application and the business rules used to
 * process and manipulate the information.<br/>
 * <br/>
 * If a data source is not explicitly set, GeckoJS.BaseModel will use the data
 * source named by the useDbConfig proprety (obtained through the
 * GeckoJS.ConnectionManager.getDataSource() call.)<br/>
 *
 * @name GeckoJS.BaseModel
 * @extends GeckoJS.BaseObject
 *
 * @property {Object} events              A list of event listeners (read-only)
 * @property {Object} datasource          The data source providing storage for the model
 * @property {String} name                The model name (defaults to "Model")
 * @property {String} useDbConfig         The data source configuration (from "DATABASE_CONFIG.useDbConfig")
 * @property {String} table               The table name used to store this model
 * @property {String} primaryKey          Placeholder for the key that this model gets from persistent storage (the database).
 * @property {String} id                  Placeholder for the id that this model gets from persistent storage (the database).
 * @property {Object} data                Placeholder for the data that this model gets from persistent storage (the database).
 * @property {Object} indexes             List of searchable keys
 * @property {Object} belongsTo           List of Models to which this model belongs
 * @property {Object} hasOne              List of Models with which this model has an one-to-one relationship
 * @property {Object} hasMany             List of Models with which this model has an one-to-many relationship
 * @property {Object} hasAndBelongsToMany List of Models with which this model has an many-to-many relationship
 * @property {Object} behaviors           A list of Behaviors associated with this model
 * @property {Boolean} autoRestoreFromBackup             Auto Restore From Backup if backup datas exists
 * @property {Boolean} useTable           Custom database table name, or null/false if no table association is desired.
 *
 */
GeckoJS.BaseModel = GeckoJS.BaseObject.extend('BaseModel',
/** @lends GeckoJS.BaseModel.prototype */
{
    name: 'BaseModel',
    
    /**
     * GeckoJS.BaseModel contructor
     *
     * @name GeckoJS.BaseModel#init
     * @public
     * @function
     * @param {Object} data
     * @param {Number} recursive
     */
    init: function(data, recursive){

        // Name of the model.
        this.name = this.name || "BaseModel";

        recursive = recursive || 0;

        this._events = new GeckoJS.Event();

        // http://developer.mozilla.org/en/docs/wrappedJSObject
        this.wrappedJSObject = this;

        this.useDbConfig = this.useDbConfig || GeckoJS.Configure.read('DATABASE_CONFIG.useDbConfig') || "default";

        // Table name for this Model.
        this.table = this.table || GeckoJS.Inflector.tableize(this.name);

        if (this.useTable !== false) {
            this.useTable = this.table;
        }

        this._datasource = null;

        // The name of the ID field for this Model.
        this.primaryKey = this.primaryKey || "id";

        this.foreignKey = GeckoJS.Inflector.singularize(this.table) + "_" + this.primaryKey;

        // Container for the id that this model gets from persistent storage (the database).
        this.id = false; // uuid

        // Container for the data that this model gets from persistent storage (the database).
        this.data = data || null;

        // exists cache
        this.__exists = null;
        
        // Last inserted id
        this.__insertID = false;

        // this._schema = this.schema();
        this._schema = null;

        this._fieldsinfo = null;

        // indexes fields
        this.indexes = this.indexes || [];
                
        this.belongsTo = this.belongsTo || [];
        this.hasOne = this.hasOne || [];
        this.hasMany = this.hasMany || [];
        this.hasAndBelongsToMany = this.hasAndBelongsToMany || [];


        // add events
        this._addModelEvents();

        // _addBehaviors
        this.behaviors = this.behaviors || [];
        this._addBehaviors();

        //
        if (recursive >= 0 && this.useTable !== false) this._generateAssociation(recursive);

        // predefine recursive
        this.recursive = 1;

        this.autoRestoreFromBackup = this.autoRestoreFromBackup || false;

        this._restoreFromBackupInProcess = false;
        this._restoreFromBackupError = false;
    
    }
});

GeckoJS.BaseModel.prototype._associations = ['belongsTo', 'hasOne', 'hasMany', 'hasAndBelongsToMany'];

//events getter
GeckoJS.BaseModel.prototype.__defineGetter__('events', function(){
    return this._events;
});

GeckoJS.BaseModel.prototype.__defineGetter__('datasource', function(){
    this._datasource = this.getDataSource();
    return this._datasource;
});

GeckoJS.BaseModel.prototype.__defineGetter__('lastInsertId', function(){
    return this.getInsertID();
});

GeckoJS.BaseModel.prototype.__defineGetter__('lastError', function(){
    
    if(this._restoreFromBackupError) {
        return 99;
    }

    return this.datasource.lastError;
});

GeckoJS.BaseModel.prototype.__defineGetter__('lastErrorString', function(){

    if(this._restoreFromBackupError) {
        return 'database can not restore from backup';
    }

    return this.datasource.lastErrorString;
});


/**
 * Returns the list of event listeners attached to this GeckoJS.BaseModel
 * instance.
 *
 * @name GeckoJS.BaseModel#getEvents
 * @public
 * @function
 * @return {Object}                     The list of event listeners
 */
GeckoJS.BaseModel.prototype.getEvents = function(){
    return this._events;
};



/**
 * Adds a listener for the given event to this GeckoJS.BaseModel instance.
 *
 * @name GeckoJS.BaseModel#addEventListener
 * @public
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to add
 * @param {Object} thisObj          Locking its execution scope to an object specified by thisObj.
 */
GeckoJS.BaseModel.prototype.addEventListener = function(aEvent, aListener, thisObj){
    try {
        thisObj = thisObj || GeckoJS.global;
        return this.events.addListener(aEvent, aListener, thisObj);
    }
    catch (e) {
        this.log('ERROR' , this.getClassName() +'Model.addEventListener ' + aEvent , e);
    }

};


/**
 * Remove a listener for the given event to this GeckoJS.BaseModel instance.
 *
 * @name GeckoJS.BaseModel#removeEventListener
 * @public
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to remove
 */
GeckoJS.BaseModel.prototype.removeEventListener = function(aEvent, aListener){
    try {
        return this.events.removeListener(aEvent, aListener);
    }
    catch (e) {
        this.log('ERROR' , this.getClassName() +'Model.removeEventListener ' + aEvent , e);
    }

};


/**
 * Dispatches the given event to all listeners of that event.<br/>
 * <br/>
 * This method creates an EventItem instance from (sEvt, data, "this") to pass
 * to the event listeners. If any of the listeners invokes the preventDefault()
 * method on the EventItem instance, this method will return "false". Otherwise
 * it returns "true".
 *
 * @name GeckoJS.BaseModel#dispatchEvent
 * @public
 * @function
 * @param {String} sEvt             This is the event name
 * @param {Object} data             This is the event data
 * @return {Boolean}                 "false" if at least one of the event listeners which handled this event invoked preventDefault; "true" otherwise
 */
GeckoJS.BaseModel.prototype.dispatchEvent = function(sEvt, data){
    try {
        return this.events.dispatch(sEvt, data, this);
    }
    catch (e) {
        this.log('ERROR', this.getClassName() +'Model.dispatchEvent ' + sEvt , e);
    }
};



/**
 * _generateAssociation
 *
 * @name GeckoJS.BaseModel#_generateAssociation
 * @private
 * @function
 * @param {Number} recursive
 * 
 */
GeckoJS.BaseModel.prototype._generateAssociation =	function (recursive) {
    };


/**
 * _getAssociationModel
 *
 * @name GeckoJS.BaseModel#_getAssociationModel
 * @private
 * @function
 * @return {Class}
 */
GeckoJS.BaseModel.prototype._getAssociationModel = function(name, recursive) {

    };


/**
 * _addModelEvents
 *
 * @name GeckoJS.BaseModel#_addModelEvents
 * @private
 * @function
 *
 */
GeckoJS.BaseModel.prototype._addModelEvents = function() {

    };


/**
 * _addBehaviors
 *
 * @name GeckoJS.BaseModel#_addBehaviors
 * @private
 * @function
 */
GeckoJS.BaseModel.prototype._addBehaviors = function() {
    };


/**
 * Returns the model schema.<br/>
 * 
 * The schema is an object with the following properties:<br/>
 * <pre>
 *  - name                 : model name
 *  - table                : name of the table used to store the model
 *  - primaryKey           : primary key
 *  - foreignKey           : foreign key
 *  - hasOne               : schemas of models in one-to-one relationship
 *  - hasMany              : schemas of models in one-to-many relationship
 *  - belongsToOne         : schemas of models in many-to-one relationship
 *  - hasAndBelongsToMany  : schemas of models in many-to-many relationship
 * </pre>
 *
 * @name GeckoJS.BaseModel#schema
 * @public
 * @function
 * @param {Number} recursive        This is the recursion depth for the schema
 * @return {Object}                 The model schema
 */
GeckoJS.BaseModel.prototype.schema = function (recursive) {

    recursive = recursive || 0;

    /* ifdef DEBUG 
    this.log('DEBUG', 'schema ' + recursive);
    /* endif DEBUG */

    if (this._schema != null) return this._schema ;

    // ignore BaseModel or Model
    if (this.getClassName() == 'BaseModel' || this.getClassName() == 'Model' || this.useTable === false ) return {};
    
    var schema = {};
    
    schema.name = this.name;
    schema.table = this.table;
    schema.primaryKey = this.primaryKey;
    schema.foreignKey = this.foreignKey;

    /*if(this.indexes.length > 0) */
    schema.indexes = this.indexes;


    // getFieldsInfo to schema
    if (!schema.fields) {
        schema.fields = this.getFieldsInfo();
    }

    // table not exists
    if (!schema.fields) return schema;

    if (recursive >= 1) return schema;

    recursive++;

    var self = this;

    schema.associations = {};
	
    this._associations.forEach(function(type) {

        for(var i=0; i<self[type].length; i++) {

            if(i==0) schema.associations[type] = {};

            var assocData = self[type][i];
            var name = assocData.name;
            var model = self._getAssociationModel(name, recursive);
            
            if(self[name] != null && typeof self[name] != 'undefined' && typeof  self[name].schema == 'function') {
                schema.associations[type][name] = self[name].schema(recursive);
            }else if(model != null && typeof  model.schema == 'function') {
                schema.associations[type][name] = model.schema(recursive);
            }


            var assocSchema = schema.associations[type][name];

            // update and add default value
            if(typeof(assocData['name']) =='undefined') assocData['name'] = assocSchema['name'];
            if(typeof(assocData['table']) =='undefined') assocData['table'] = assocSchema['table'];
            if(typeof(assocData['fields']) =='undefined') assocData['fields'] = '';
            if(typeof(assocData['conditions']) =='undefined') assocData['conditions'] = '';

            switch(type) {
                default:
                case "belongsTo":
                    // push foreignkey to indexes
                    schema.indexes.push(assocSchema['foreignKey']);
                    if(typeof(assocData['primaryKey']) =='undefined') assocData['primaryKey'] = assocSchema['primaryKey'];
                    if(typeof(assocData['foreignKey']) =='undefined') assocData['foreignKey'] = assocSchema['foreignKey'];
                    break;

                case "hasOne":
                    if(typeof(assocData['primaryKey']) =='undefined') assocData['primaryKey'] = assocSchema['primaryKey'];
                    if(typeof(assocData['foreignKey']) =='undefined') assocData['foreignKey'] = schema['foreignKey'];

                    break;

                case "hasMany":
                    if(typeof(assocData['primaryKey']) =='undefined') assocData['primaryKey'] = assocSchema['primaryKey'];
                    if(typeof(assocData['foreignKey']) =='undefined') assocData['foreignKey'] = schema['foreignKey'];
                    break;

            }

            // push assocData to schema
            schema.associations[type][name]['association'] = assocData;
        }

    });
    
    this._schema = schema;
    return this._schema;
    
};


/**
 * Returns the model fields infomation.<br/>
 *
 * @name GeckoJS.BaseModel#getFieldsInfo
 * @public
 * @function
 * @param {String||NULL} field            This field name
 * @return {Object}                 The fields infomation
 */
GeckoJS.BaseModel.prototype.getFieldsInfo = function(field) {

    /* ifdef DEBUG 
    this.log('DEBUG', 'getFieldsInfo > ' + field  + ', useDbConfig = ' + this.useDbConfig);
    /* endif DEBUG */

    field = field || false;

    if (this._fieldsinfo == null || field === true) {
        var ds = this.datasource ;

        if (!ds) return false;

        this._fieldsinfo = ds.describe(this);

        if (this._fieldsinfo === false ) return false;
    }


    if (typeof field == 'string') {

        if (this._fieldsinfo[field]) {
            return this._fieldsinfo[field];
        } else {
            return false;
        }
    }
    return this._fieldsinfo;

};

/**
 * Returns true if the given field is defined in the Model.
 *
 * @name GeckoJS.BaseModel#hasField
 * @public
 * @function
 * @param {String} name           Name of field to look for
 * @return {Boolean}              "true" if the field is defined in the Model
 */
GeckoJS.BaseModel.prototype.hasField = function(name) {
    
    var self = this;
    var hasField = true;

    if (name == this.name) return false;

    this._associations.forEach( function(type) {
        if(GeckoJS.Array.inArray(name, self[type]) != -1) {
            hasField = false;
        }
    });

    if(!hasField) return hasField;

    // check database field
    var ds = this.datasource;

    if (!ds) return false;

    hasField = ds.hasField(this, name);

    return hasField;

};


/**
 * Initializes the model for writing a new record.<br/>
 * <br/>
 * Sets the model.id field to "null" to indicate that this is a new record.<br/>
 * <br/>
 * This method should be overridden as necessary by its descendant classes.
 *
 * @name GeckoJS.BaseModel#create
 * @public
 * @function
 * @param {Object} data             This is the data for the new record
 */
GeckoJS.BaseModel.prototype.create = function(data){

    this.id = false;
    this.data = null;
    
    var defaults = {};

    /* ifdef DEBUG 
    this.log('DEBUG', 'create >') ;
    /* endif DEBUG */

    if (!this.getFieldsInfo()) return false;


    
    if (data !== null && data !== false) {
        
        var fields = this.getFieldsInfo();

        for (var field in fields) {
            var properties = fields[field];

            if (this.primaryKey !== field && typeof properties['default'] != 'undefined') {
                defaults[field] = properties['default'];
            }
        }

        this.data = GREUtils.extend({}, defaults, data);
    }

};


/**
 * Retrieves all records satisfying the given query condition, sorted in the
 * specified order.<br/>
 * <br/>
 * If page size or page number is given, returns only records in the requested
 * page of the result set.<br/>
 * <br/>
 * Dispatches a "beforeFind" event before performing the query. Performs
 * the query and dispatches an "onFind" event only if the "beforeFind" event
 * passes.<br/>
 * <br/>
 * Dispatches an "afterFind" event after performing the query.<br/>
 * <br/>
 * The event listeners are passed in the EventItem.data field an
 * array whose first element is "all" and whose second element is an object
 * with properties from the arguments to this method:<br/>
 * <pre>
 *  - conditions
 *  - orders
 *  - limit
 *  - page
 * </pre>
 *
 * @name GeckoJS.BaseModel#findAll
 * @public
 * @function  
 * @param {String} conditions        This is the query condition
 * @param {String} group            This is the group by
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page numbers
 * @return {Object}                  The result set
 */
GeckoJS.BaseModel.prototype.findAll = function(conditions, group, order, limit, page){

    return this.find('all', {
        conditions: conditions,
        group: group,
        order: order,
        limit: limit,
        page: page
    });
    
};


/**
 * Returns the number of records satisfying the given query condition.<br/>
 * <br/>
 * If page size or page number is given, returns only records in the requested
 * page of the result set.<br/>
 * <br/>
 * The query will automatically retrieve matching records from related
 * models.<br/>
 * <br/>
 * Dispatches a "beforeFind" event before performing the query. Performs
 * the query and dispatches an "onFind" event only if the "beforeFind"
 * passes.<br/>
 * <br/>
 * Dispatches an "afterFind" event after performing the query.<br/>
 * <br/>
 * The event listeners are passed in the EventItem.data field an
 * array whose first element is "count" and whose second element is an object
 * with properties from the arguments to this method:<br/>
 * <pre>
 *  - conditions
 *  - order
 *  - limit
 *  - page
 * </pre>
 *
 * @name GeckoJS.BaseModel#findCount
 * @public
 * @function  
 * @param {String} conditions        This is the query condition
 * @param {String} group            This is the group by
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page numbers
 * @return {Number}                 The size of the result set
 */
GeckoJS.BaseModel.prototype.findCount = function(conditions, group, order, limit, page){

    return this.find('count', {
        conditions: conditions,
        group: group,
        order: order,
        limit: limit,
        page: page
    });
	
};


/**
 * Retrieves the first record from the result set satisfying the given query
 * condition, sorted in the specified order.<br/>
 * <br/>
 * If page size or page number is given, returns the first record in the
 * requested page of the result set.<br/>
 * <br/>
 * The query will automatically retrieve matching records from related
 * models.<br/>
 * <br/>
 * Dispatches a "beforeFind" event before performing the query. Performs
 * the query and dispatches an "onFind" event only if the "beforeFind"
 * passes.<br/>
 * <br/>
 * Dispatches an "afterFind" event after performing the query.<br/>
 * <br/>
 * The event listeners are passed in the EventItem.data field an
 * array whose first element is "first" and whose second element is an object
 * with properties from the arguments to this method:<br/>
 * <pre>
 *  - conditions
 *  - group
 *  - order
 *  - limit
 *  - page
 * </pre>
 *
 * @name GeckoJS.BaseModel#findFirst
 * @function
 * @public  
 * @param {String} conditions       This is the query condition
 * @param {String} group           This is the group by
 * @param {String} order           This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page numbers
 * @return {Object}                 The first record from the result set
 */ 
GeckoJS.BaseModel.prototype.findFirst = function(conditions, group, order, limit, page, recursive){

    recursive = (typeof recursive != 'undefined') ? recursive : 2;

    return this.find('first', {
        conditions: conditions,
        group: group,
        order: order,
        limit: limit,
        page: page,
        recursive: recursive
    });
	
};

/**
 * Performs the requested query operation.<br/>
 * <br/>
 * This is a generic query-by-condition method that invokes more specialized
 * query methods based on the requested query type.<br/>
 * <br/>
 * "type" is either "all", "first", "count". "first" is the default type.<br/>
 * <br/>
 * "params" is an object with any of the following available options as
 *  keys:<br/>
 * <pre>
 *  - conditions   : query conditions    // "name='rack lin' AND age = 30"
 *  - fields       : query fields        // "name, email"
 *  - group        : fields to group by  // "name , age "
 *  - order        : fields to order by  // "name ASC, age DESC"
 *  - limit        : an integer indicating the page size
 *  - page         : an integer indicating the page number
 *  - recursive    : relationship levels
 * </pre>
 * <br/>
 * The query will automatically retrieve matching records from related
 * models.<br/>
 * <br/>
 * Dispatches a "beforeFind" event before performing the query. Performs
 * the query and dispatches an "onFind" event only if the "beforeFind"
 * passes.<br/>
 * <br/>
 * Dispatches an "afterFind" event after performing the query.<br/>
 * <br/>
 * The event listeners are passed in the EventItem.data field an array whose
 * first element is the parameter "type" and whose second element is the
 * parameter "params".
 *
 * @name GeckoJS.BaseModel#find
 * @public
 * @function  
 * @param {String} type             This is the query type
 * @param {Object} params           This is a list of query parameters
 * @return{Object}                  The result of the requested query
 */
GeckoJS.BaseModel.prototype.find = function(type, params) {

    /* ifdef DEBUG 
    this.log('DEBUG', 'find > ') ;
    /* endif DEBUG */

    if(this.autoRestoreFromBackup && !this._restoreFromBackupInProcess) {
        if(!this.restoreFromBackup()) return false;
    }

    type = type || 'all';
    params = params || {};

    if (typeof params == 'string') {
        params = {
            conditions: params
        };
    }

    var fields = params.fields || null;
    var conditions = params.conditions || null;
    var group = params.group || null;
    var order = params.order || null;
    var limit = params.limit || null;
    var page = params.page || null;
    var recursive = typeof params.recursive != 'undefined' ? params.recursive : 1;
    var result;

    /*
    if (fields && fields.constructor.name == 'Array') {
        fields = fields.join(',');
    }*/

    if (group && group.constructor.name == 'Array') {
        group = group.join(',');
    }

    if (order && order.constructor.name == 'Array') {
        order = order.join(',');
    }

    try {
        var beforeResult = this.dispatchEvent('beforeFind', arguments);
        
        // if result invoke command
        if (beforeResult) {
            
            var ds = this.datasource;

            if (!ds) return null;

            // result = null;
			
            switch(type) {
                case 'all':
                    result = ds.querySelect(this, fields, conditions, group, order, limit, page, recursive);
                    if(result === false) {
                        // maybe sql error
                        this.log('WARN', 'find(All) return false. conditions: ' + conditions);
                        result = [];
                    }
                    break;
				
                case 'first':
                    result = ds.querySelect(this, fields, conditions, group, order, 1, 1, recursive);
                    if(result.length == 0) result = null;
                    else result = result[0];
                    break;
				
                case 'count':
                    result = ds.querySelectCount(this, conditions, group, order, limit, page);
                    break;
				
                case 'id':
                    result = ds.querySelectById(this, fields, conditions, recursive);
                    break;
            }

            this.dispatchEvent('afterFind', result);
        }

        this.dispatchEvent('onFind', result);
		        
        return result;
		
    }
    catch (e) {
        this.log('ERROR', this.getClassName() + 'Model.find ' , e);
        return result;
    }
    
};



/**
 * Retrieves a record by its ID.<br/>
 * <br/>
 * The query will automatically retrieve matching records from related
 * models.<br/>
 * <br/>
 * Dispatches a "beforeFind" event before performing the query. Performs
 * the query and dispatches an "onFind" event only if the "beforeFind" event
 * passes.<br/>
 * <br/>
 * Dispatches an "afterFind" event after performing the query.<br/>
 * <br/>
 * The event listeners are passed in the EventItem.data field an
 * array whose first element is "id" and second element is an object whose
 * "condition" property is set to the record ID.
 *
 * @name GeckoJS.BaseModel#findById
 * @function
 * @public  
 * @param {String} id               This is the ID of the record to find
 * @param {Number} recursive        This is the query recursive
 * @param {String} fields           This is the fields of the record to find
 * @return {Object}                 The requested record
 */
GeckoJS.BaseModel.prototype.findById = function(id, recursive, fields){

    recursive = (typeof recursive != 'undefined') ? recursive : 2;

    return this.find('id', {
        conditions: id,
        recursive: recursive,
        fields: fields
    });
};


/**
 * This is a generic query-by-index method that invokes more specialized
 * query methods based on the requested query type.<br/>
 * <br/>
 * "type" is either "all", "first", and "count". "first" is the default
 * type.<br/>
 * <br/>
 * "params" is an object with any of the following available options as
 * keys:<br/>
 * <pre>
 *  - "index"        : the index field (defaults to "id")
 *  - "value"        : the index value
 *  - "fields"       : fields               // "name,age"
 *  - "group"       : group
 *  - "order"       : fields to order by  // "name ASC, age DESC"
 *  - "limit"        : an integer indicating the page size
 *  - "page"         : an integer indicating the page number
 * </pre>
 * <br/>
 * The query will automatically retrieve matching records from related
 * models.<br/>
 * <br/>
 * Dispatches a "beforeFind" event before performing the query. Performs
 * the query and dispatches an "onFind" event only if the "beforeFind" event
 * passes.<br/>
 * <br/>
 * Dispatches an "afterFind" event after performing the query.<br/>
 * <br/>
 * The event listeners are passed in the EventItem.data an array whose first
 * element is the parameter "type" and second element is the parameter
 * "params".
 *
 * @name GeckoJS.BaseModel#findByIndex
 * @public
 * @function  
 * @param {String} type             This is the query type
 * @param {Object} params           This is a list of query parameters
 * @return {Object}                 The result of the requested query
 */
GeckoJS.BaseModel.prototype.findByIndex = function(type, params){

    /* ifdef DEBUG 
    this.log('DEBUG', 'findByIndex > ') ;
    /* endif DEBUG */

    if(this.autoRestoreFromBackup && !this._restoreFromBackupInProcess) {
        if(!this.restoreFromBackup()) return false;
    }

    type = type || 'all';
    params = params || {};

    var index = params.index || "id";
    var value = params.value || null;
    var fields = params.fields || null;
    var group = params.group || null;
    var order = params.order || null;
    var limit = params.limit || null;
    var page = params.page || null;
    var recursive = typeof params.recursive != 'undefined' ? params.recursive : 1;
    var result;

    /*
    if (fields && fields.constructor.name == 'Array') {
        fields = fields.join(',');
    }*/

    if (group && group.constructor.name == 'Array') {
        group = group.join(',');
    }

    if (order && order.constructor.name == 'Array') {
        order = order.join(',');
    }

    try {
        var beforeResult = this.dispatchEvent('beforeFind', arguments);
        
        // if result invoke command
        if (beforeResult) {
            
            var ds = this.datasource;

            if(!ds) return null;
            
            // result = null;
			
            switch(type) {
                case 'all':
                    result = ds.querySelectByIndex(this, fields, index, value, group, order, limit, page, recursive );
                    //if(result.length == 0) result = null;
                    if(result === false) {
                        // maybe sql error
                        this.log('WARN', 'findByIndex(All) return false. index: ' + index +", value: " + value);
                        result = [];
                    }
                    break;
				
                case 'first':
                    result = ds.querySelectByIndex(this, fields, index, value, group, order, 1, 1, recursive);
                    if(result.length == 0) result = null;
                    else return result[0];
                    break;
				
                case 'count':
                    result = ds.querySelectCountByIndex(this, index, value, group, order, limit, page);
                    break;
				
            }

            this.dispatchEvent('afterFind', result);

        }
        
        this.dispatchEvent('onFind', result);
		        
        return result;
		
    }
    catch (e) {
        this.log('ERROR', this.getClassName() + 'Model.FindByIndex ' , e);
        return result;
    }
	
};


/**
 * Retrieves a record by its ID.<br/>
 * <br/>
 * The query will automatically retrieve matching records from related
 * models.<br/>
 * <br/>
 * Dispatches a "beforeFind" event before performing the query. Performs
 * the query and dispatches an "onFind" event only if the "beforeFind" event
 * passes.<br/>
 * <br/>
 * Dispatches an "afterFind" event after performing the query.<br/>
 * <br/>
 * The event listeners are passed in the EventItem.data field an
 * array whose first element is "id" and second element is an object whose
 * "condition" property is set to the record ID.
 *
 * @name GeckoJS.BaseModel#read
 * @function
 * @public
 * @param {String} id               This is the ID of the record to find
 * @return                          The requested record
 */
GeckoJS.BaseModel.prototype.read = function(id){

    /* ifdef DEBUG 
    this.log('DEBUG', 'read ( ' + id + ') > ') ;
    /* endif DEBUG */


    this.data = this.findById(id);
    this.id = this.data[this.primaryKey];
    return this.data;
};


/**
 * Saves a data record to the model's backing store.<br/>
 * <br/>
 * Dispatches a "beforeSave" event before writing the data. Saves the
 * data and dispatches an "onSave" event only if the "beforeSave" event
 * passes.<br/>
 * <br/>
 * Dispatches an "afterSave" event regardless of the result of the
 * "beforeSave" event.<br/>
 * <br/>
 * All event listeners are passed the data being saved in the EventItem data
 * field.
 *
 * @name GeckoJS.BaseModel#save
 * @public
 * @function
 * @param {Array} data data to save
 * @param {Boolean} updateTimestamp auto update created/modified fields
 * @return {Boolean} success
 */
GeckoJS.BaseModel.prototype.save = function(data, updateTimestamp){

    updateTimestamp = (typeof updateTimestamp != 'undefined') ? updateTimestamp : true;

    /* ifdef DEBUG 
    this.log('DEBUG', 'save > ') ;
    /* endif DEBUG */

    if(this.autoRestoreFromBackup && !this._restoreFromBackupInProcess) {
        if(!this.restoreFromBackup()) return false;
    }

    if (typeof data != 'undefined' ) {
        if(this.data == null) this.data = {};
        this.data = GREUtils.extend(this.data, data);
    }

    if(this.data == null) {
        return false;
    }

    /* ifdef DEBUG 
    this.log('DEBUG', 'save > getFieldsInfo ') ;
    /* endif DEBUG */

    // table not exists
    if (!this.getFieldsInfo()) return false;

    var fields = [];
    var savedata = {};

    /* ifdef DEBUG 
    this.log('DEBUG', 'save > hasField ') ;
    /* endif DEBUG */

    for (var field in this.data) {
        if(this.hasField(field)) {
            savedata[field] = this.data[field];
            fields.push(field);
        }
    }
    
    // update data to this.data
    this.data = savedata;

    try {
        var result = this.dispatchEvent('beforeSave', this.data);
        
        // if result invoke command
        if (result) {

            // check for update or insert
            /* ifdef DEBUG 
            this.log('DEBUG', 'save > exists ') ;
            /* endif DEBUG */
            
            var isExists = this.exists(true);

            if (!isExists && fields.length > 0) {
                this.id = false;
            }
            
            var ds = this.datasource;

            if (!ds) return false;

            var created = false, success = false;

            /* ifdef DEBUG 
            this.log('DEBUG', 'save > getId ') ;
            /* endif DEBUG */

            if (!this.getId()) {

                // insert new record
                /// this.create(this.data);
                if (typeof this.data[this.primaryKey] == 'undefined' || this.data[this.primaryKey].length == 0 ) {
                    
                    var fieldType = this.getFieldsInfo(this.primaryKey).type.toUpperCase();
                    /* ifdef DEBUG 
                    this.log('TRACE', 'save > primaryKey type: ' + fieldType );
                    /* endif DEBUG */
                    
                    if (fieldType.indexOf('INT') == -1 ) this.data[this.primaryKey] = GeckoJS.String.uuid();
                }

                if(updateTimestamp || (typeof this.data['created'] == 'undefined') ) {
                    this.data['created'] = Math.round( (new Date()).getTime() / 1000) ;
                }
                if(updateTimestamp || (typeof this.data['modified'] == 'undefined') ) {
                    this.data['modified'] = this.data['updated'] = this.data['created'];
                }

                created = ds.executeInsert(this, this.data);

                if (created) success = true;
                
            }else {

                // update exists record
                if(updateTimestamp || (typeof this.data['modified'] == 'undefined') ) {
                    this.data['modified'] = this.data['updated'] = Math.round( (new Date()).getTime() / 1000);
                }

                success = ds.executeUpdate(this, this.data);
                
                created = false ;

            }
            if(success) {
                this.dispatchEvent('afterSave', created);
            }
        }

        this.dispatchEvent('onSave', this.data);
        
        if (success && this.data) {
            success = this.data;
        }

        delete savedata;
        delete data;
        this.data = null;
        this.__exists = null;

        return success;
        
    }
    catch (e) {
        this.log('ERROR', this.getClassName() + 'Model.save ' , e);
        delete savedata;
        delete data;
        this.data = null;
        this.__exists = null;
    }
    return false;

};


/**
 * Saves all records in a dataset to the model's backing store.<br/>
 * <br/>
 * Dispatches a "beforeSave" event before writing each record. Saves a
 * record and dispatches an "onSave" event only if the "beforeSave" event
 * passes.<br/>
 * <br/>
 * Dispatches an "afterSave" event regardless of the result of the
 * "beforeSave" event.<br/>
 * <br/>
 * All event listeners are passed the individual data records in the EventItem
 * data field.
 *
 * @name GeckoJS.BaseModel#saveAll
 * @public
 * @function  
 * @param {Object} data              This is dataset to save
 * @param {Boolean} updateTimestamp auto update created/modified fields
 * @return {Array} return saved datas
 */
GeckoJS.BaseModel.prototype.saveAll = function(data, updateTimestamp) {

    updateTimestamp = (typeof updateTimestamp != 'undefined') ? updateTimestamp : true;
    
    /* ifdef DEBUG 
    this.log('DEBUG', 'saveAll > ') ;
    /* endif DEBUG */

    if(this.autoRestoreFromBackup && !this._restoreFromBackupInProcess) {
        if(!this.restoreFromBackup()) return false;
    }

    var self = this;
    var result ;
    
    if(typeof data == 'object' && data.constructor.name == 'Array') {
        result = [];

        data.forEach(function(d) {
            self.create();
            result.push(self.save(d, updateTimestamp));
        });
    }
    return result;

};



/**
 * Saves a data record to the model's backup backing store (JSON Format).<br/>
 * <br/>
 * Dispatches a "beforeSave" event before writing the data. Saves the
 * data and dispatches an "onSave" event only if the "beforeSave" event
 * passes.<br/>
 * <br/>
 * Dispatches an "afterSave" event regardless of the result of the
 * "beforeSave" event.<br/>
 * <br/>
 * All event listeners are passed the data being saved in the EventItem data
 * field.
 *
 * @name GeckoJS.BaseModel#saveToBackup
 * @public
 * @function
 * @param {Object} data
 * @param {Boolean} updateTimestamp auto update created/modified fields
 */
GeckoJS.BaseModel.prototype.saveToBackup = function(data, updateTimestamp){

    try {
        /* ifdef DEBUG 
        this.log('DEBUG', 'saveToBackup > ') ;
        /* endif DEBUG */

        // force try to get original database schema
        this.getFieldsInfo();

        // backup properties
        var orgid = this.id;
        var orgData = this.data;
        var orgExists = this.__exists;
        var orgUseDbConfig = this.useDbConfig;

        var backupDbConfig = 'backup';

        this.useDbConfig = backupDbConfig;

        /* ifdef DEBUG 
        this.log('DEBUG', 'saveToBackup > call save method to datasource: ' + this.useDbConfig ) ;
        /* endif DEBUG */

        var result ;

        var self = this;
        if(typeof data == 'object' && data.constructor.name == 'Array') {

            /* ifdef DEBUG 
            this.log('DEBUG', 'saveToBackup > save datas, length: ' + data.length ) ;
            /* endif DEBUG */
            result = [];
            data.forEach(function(d) {
                self.create();
                result.push(self.save(d, updateTimestamp));
            });
            
        }else if(typeof data == 'object') {

            /* ifdef DEBUG 
            this.log('DEBUG', 'saveToBackup > save data, object' ) ;
            /* endif DEBUG */

            result = self.save(data, updateTimestamp);

        }else {

            /* ifdef DEBUG 
            this.log('DEBUG', 'saveToBackup > save data, others' ) ;
            /* endif DEBUG */

            // nothings to do!!
            // XXXX
            result = self.save(data, updateTimestamp);
        }

        /* ifdef DEBUG 
        this.log('DEBUG', 'saveToBackup > return from  save method ' + result ) ;
        /* endif DEBUG */

        // restore properties
        this.id = orgid;
        this.data = orgData;
        this.__exists = orgExists;
        this.useDbConfig = orgUseDbConfig;

        return result;

    }catch(e) {
        this.log('ERROR', 'saveToBackup > exception: ' + e) ;
        dump(e);
    }

};

/**
 * restore a backup data record to the model's backing store .<br/>
 *
 * @name GeckoJS.BaseModel#restoreFromBackup
 * @public
 * @function
 */
GeckoJS.BaseModel.prototype.restoreFromBackup = function(){

    /* ifdef DEBUG 
    this.log('DEBUG', 'restoreFromBackup > ' + this.name + ', useDbConfig ' + this.useDbConfig + ',, inprogress: ' + this._restoreFromBackupInProcess) ;
    /* endif DEBUG */

    if( this.useDbConfig == 'backup' || this.useDbConfig == 'memory' || this._restoreFromBackupInProcess ) return true;

    this._restoreFromBackupInProcess = true;
    this._restoreFromBackupError = false;

    // force try to get original database schema
    this.getFieldsInfo();

    var backupDbConfig = 'backup';
    var newDataSource = GeckoJS.ConnectionManager.getDataSource(backupDbConfig);

    // query all backup datas
    try {

        var backupDatas = newDataSource.querySelect(this, null, null, null, null, 0, 0, 0);

        /* ifdef DEBUG 
        this.log('DEBUG', 'restoreFromBackup > datas length = ' + backupDatas.length) ;
    /* endif DEBUG */

    }catch(e) {
        this.log('ERROR', 'restoreFromBackup > querySelect Error: ') ;
    }


    // no backup datas
    if (!backupDatas || backupDatas.length == 0) {

        /* ifdef DEBUG 
        this.log('DEBUG', 'restoreFromBackup > ' + this.name + ', useDbConfig ' + this.useDbConfig + ',, backupDatas = 0 ') ;
        /* endif DEBUG */

        this._restoreFromBackupInProcess = false;
        return true ;
    }

    /* ifdef DEBUG 
    this.log('DEBUG', 'restoreFromBackup > begin ' + this.name + ', useDbConfig ' + this.useDbConfig ) ;
    /* endif DEBUG */

    // backup properties
    var orgid = this.id;
    var orgData = this.data;
    var orgExists = this.__exists;

    // get transaction exclusive lock
    var r = this.begin(true);
    if(r) {

        /* ifdef DEBUG 
        this.log('DEBUG', 'saveall from backup data, length = ' + backupDatas.length);
        /* endif DEBUG */

        var removableIds = [] ;
        
        backupDatas.forEach(function(oldData) {
            
            this.create();
            var oldResult = this.save(oldData, false); // don't udpate timestamp

            if (oldResult) {
               removableIds.push(oldData[this.primaryKey]);
            }
            
        }, this);
        //this.saveAll(backupDatas, false); // don't update timestamp
        
        r = this.commit(true);

        /* ifdef DEBUG 
        this.log('DEBUG', 'commit to saveall backup datas. result = ' + r);
        /* endif DEBUG */

        // delete all backupDatas

        if (r) {

            /* ifdef DEBUG 
            this.log('DEBUG', 'commit to success , remove all backup datas.');
            /* endif DEBUG */
            
            // newDataSource.truncate(self);
            // only remove success data.
            removableIds.forEach(function(oldDataId) {
                this.id = oldDataId;
                newDataSource.executeDelete(this);
            }, this);

            this.id = false;
            this.data = null;
            this.__exists = false;

        }else {
            /* ifdef DEBUG 
            this.log('DEBUG', 'commit to failure , rollback.');
            /* endif DEBUG */

            this._restoreFromBackupError = true;
            
            r = this.rollback(true);
        }
    }else {

        /* ifdef DEBUG 
        this.log('DEBUG', 'restoreFromBackup > ' + this.name + ', useDbConfig ' + this.useDbConfig + ',, begin transaction false') ;
    /* endif DEBUG */

    }

    this._restoreFromBackupInProcess = false;

    /* ifdef DEBUG 
    this.log('DEBUG', 'restoreFromBackup return > ' + this.name + ', useDbConfig ' + this.useDbConfig ) ;
    /* endif DEBUG */

    // restore properties
    this.id = orgid;
    this.data = orgData;
    this.__exists = orgExists;

    return r;

};


/**
 * Deletes a record from the model by ID.<br/>
 * <br/>
 * Dispatches a "beforeDelete" event before deleting the record. Deletes
 * the record and dispatches an "onDelete" event only if the "beforeDelete"
 * event passes.<br/>
 * <br/>
 * Dispatches an "afterDelete" event regardless of the result of the
 * "beforeDelete" event.<br/>
 * <br/>
 * The event listeners are passed the record ID in the EventItem.data field.
 *
 * @name GeckoJS.BaseModel#del
 * @function
 * @public  
 * @param {String} id               This is the ID of the record to delete
 * @param {Boolean} cascade Set to true to delete records that depend on this record
 */
GeckoJS.BaseModel.prototype.del = function(id, cascade){

    /* ifdef DEBUG 
    this.log('DEBUG', 'del > ' + id);
    /* endif DEBUG */

    if(this.autoRestoreFromBackup && !this._restoreFromBackupInProcess) {
        if(!this.restoreFromBackup()) return false;
    }

    cascade = typeof cascade == 'undefined' ? true : cascade;
    id = id || this.id;

    // table not exists 
    if (!this.getFieldsInfo()) return false;

    var result = false;
    
    try {
        var beforeResult = this.dispatchEvent('beforeDelete', id);
        
        // if result invoke command
        if (beforeResult) {

            this._deleteDependent(id, cascade);

            this.id = id;
            
            var ds = this.datasource;

            if (!ds) return false;

            result = ds.executeDelete(this);

            if (result) {
                this.dispatchEvent('afterDelete', id);

                this.id = false;
                this.data = null;
                this.__exists = null;

                result = true;
            }
        }
        this.dispatchEvent('onDelete', result);

    } catch (e) {
        this.log('ERROR', this.getClassName() + 'Model.del ' , e);
    }
    return result;
    
};

GeckoJS.BaseModel.prototype._deleteDependent = function(id, cascade) {
    
    };

/**
 * Deletes a record from the model by ID.<br/>
 * <br/>
 * See del() for details.
 *
 * @name GeckoJS.BaseModel#delete
 * @function
 * @name delete
 * @public
 * @param {String} id               This is the ID of the record to delete
 * @param {Boolean} cascade Set to true to delete records that depend on this record
 */
GeckoJS.BaseModel.prototype['delete'] = function(id, cascade){
    // yuicompressor keyword
    return this.del(id, cascade);
};

/**
 * Deletes a record from the model by ID.<br/>
 * <br/>
 * See del() for details.
 *
 * @name GeckoJS.BaseModel#remove
 * @function
 * @public
 * @param {String} id               This is the ID of the record to delete
 * @param {Boolean} cascade Set to true to delete records that depend on this record
 */
GeckoJS.BaseModel.prototype.remove = function(id, cascade){
    return this.del(id, cascade);
};


/**
 * Deletes records from the model by ID.<br/>
 * <br/>
 * Dispatches a "beforeDelete" event before deleting the record. Deletes
 * the record and dispatches an "onDelete" event only if the "beforeDelete"
 * event passes.<br/>
 * <br/>
 * Dispatches an "afterDelete" event regardless of the result of the
 * "beforeDelete" event.<br/>
 * <br/>
 * The event listeners are passed the record ID in the EventItem.data field.
 *
 * @name GeckoJS.BaseModel#delAll
 * @function
 * @public
 * @param {Array|String} ids               This is the IDs of the record to delete or conditions
 * @param {Boolean} cascade Set to true to delete records that depend on this record
 */
GeckoJS.BaseModel.prototype.delAll = function(ids, cascade){

    if(this.autoRestoreFromBackup && !this._restoreFromBackupInProcess) {
        if(!this.restoreFromBackup()) return false;
    }

    var result = true;

    if (typeof ids == 'string') {
        // conditions
        var tmpIds = this.find('all', {
            fields: this.primaryKey,
            conditions: ids,
            recursive: 0
        });

        if(!tmpIds) return false;

        tmpIds.forEach(function(obj) {
            result &= this.del(obj[this.primaryKey], cascade);
        }, this);
        
        return result;
        
    }else if (GeckoJS.Array.isArray(ids)){

        ids.forEach(function(id) {
            result &= this.del(id, cascade);
        }, this);
        return result;
    }
    return false;
};


/**
 * Delete record sfrom the model by ID.<br/>
 * <br/>
 * See delAll() for details.
 *
 * @name GeckoJS.BaseModel#deleteAll
 * @function
 * @public
 * @param {Array|String} ids               This is the IDs of the record to delete or conditions
 * @param {Boolean} cascade Set to true to delete records that depend on this record
 */
GeckoJS.BaseModel.prototype.deleteAll = function(ids, cascade){

    return this.delAll(ids, cascade);
};

/**
 * Delete record sfrom the model by ID.<br/>
 * <br/>
 * See delAll() for details.
 *
 * @name GeckoJS.BaseModel#removeAll
 * @function
 * @public
 * @param {Array|String} ids               This is the IDs of the record to delete or conditions
 * @param {Boolean} cascade Set to true to delete records that depend on this record
 */
GeckoJS.BaseModel.prototype.removeAll = function(ids, cascade){

    return this.delAll(ids, cascade);
};


/**
 * Retrieves records using a VQL SQL-like statement.
 *
 * @name GeckoJS.BaseModel#query
 * @public
 * @function
 * @param {String} queryStatement   This is the VQL SQL-like query statement
 * @return {Object}                  The result set
 */
GeckoJS.BaseModel.prototype.query = function(queryStatement) {
    
    var statemenet = GeckoJS.VqlParser.parseVQL.apply(GeckoJS.VqlParser, arguments);

    // if only id condition , findbyid for best performance.
    if (statemenet.where.length == 1 && statemenet.where[0].column == 'id' )  {
        return [this.findById(statemenet.where[0].value)];
    }

    var conditions = GeckoJS.VqlParser.toWhereSQL(statemenet);
    var order = GeckoJS.VqlParser.toSortOrderSQL(statemenet);

    var limits = GeckoJS.VqlParser.toLimitSQL(statemenet);
    var limit = limits[0];
    var page = limits[1];


    return this.find('all', {
        conditions: conditions,
        order: order,
        limit: limit,
        page: page
    });    
};

/**
 * Retrieves records using a VQL SQL-like statement.<br/>
 * 
 * @example
 * GeckoJS.Model.query("SELECT * FROM User");
 *
 * @name GeckoJS.BaseModel.query
 * @public
 * @static
 * @function
 * @param {String} queryStatement   This is the VQL SQL-like query statement
 * @return {Object}                  The result set
 */
GeckoJS.BaseModel.query = function(queryStatement) {
    
    var statemenet = GeckoJS.VqlParser.parseVQL.apply(GeckoJS.VqlParser, arguments);
    
    var table = statemenet.table;
    var modelClass = GeckoJS.Model.getModelClass(table);
    if (!modelClass) return [];

    var model = new modelClass();

    // if only id condition , findbyid for best performance.
    if (statemenet.where.length == 1 && statemenet.where[0].column == 'id' )  {
        return [model.findById(statemenet.where[0].value)];
    }

    var conditions = GeckoJS.VqlParser.toWhereSQL(statemenet);
    var order = GeckoJS.VqlParser.toSortOrderSQL(statemenet);

    var limits = GeckoJS.VqlParser.toLimitSQL(statemenet);
    var limit = limits[0];
    var page = limits[1];


    return model.find('all', {
        conditions: conditions,
        order: order,
        limit: limit,
        page: page
    });    
};



/**
 * Retrieves records using a Native SQL statement.<br/>
 * <br/>
 * This method is a stub and should be overridden by its descendant classes.
 *
 * @name GeckoJS.BaseModel#execute
 * @public
 * @function
 * @param {String} statement   This is the SQL query statement
 * @return {Object}                  The result set
 */
GeckoJS.BaseModel.prototype.execute = function(statement){

    var ds = this.datasource ;

    if (!ds) return false;

    //if(!this.restoreFromBackup()) return false;

    return ds.execute(statement);
};


/**
 * Returns true if a record with set id exists.
 *
 * @name GeckoJS.BaseModel#exists
 * @public
 * @function
 * @param boolean $reset if true will force database query
 * @return boolean True if such a record exists
 * @access public
 */
GeckoJS.BaseModel.prototype.exists = function(reset) {
    reset = reset || false;

    if (this.getId() === false || this.useTable === false) {
        return false;
    }

    if (this.__exists !== null && reset !== true) {
        return this.__exists;
    }

    // table not exists
    if (!this.getFieldsInfo()) return false;

    /* ifdef DEBUG 
    this.log('DEBUG', 'exists > ');
    /* endif DEBUG */

    this.__exists = this.find('count', {
        conditions: this.primaryKey + "='" +this.id + "'",
        recursive: 0
    }) > 0;

    return this.__exists;
};

/**
 * Truncate table
 *
 * @name GeckoJS.BaseModel#truncate
 * @public
 * @function
 */
GeckoJS.BaseModel.prototype.truncate = function() {

    if(this.autoRestoreFromBackup && !this._restoreFromBackupInProcess) {
        if(!this.restoreFromBackup()) return false;
    }

    try {
        var beforeResult = this.dispatchEvent('beforeTruncate');
        var result = false;

        // if result invoke command
        if (beforeResult) {

            var ds = this.datasource;

            if (!ds) return false;

            result = ds.truncate(this.table);

            if (result) {
                this.dispatchEvent('afterTruncate', result);

                result = true;
            }
        }

        this.dispatchEvent('onTruncate', result);
    }
    catch (e) {
        this.log('ERROR', this.getClassName() + 'Model.truncate ' , e);
    }
    return result;

};



/**
 * Escapes the field name and prepends the model name.
 * Escaping will be done according to the current database driver's rules.
 *
 * @name GeckoJS.BaseModel#escapeField
 * @public
 * @function
 * @param {String} field Field to escape (e.g: id)
 * @param {String} table Table name for the model (e.g: posts)
 * @return {String} The name of the escaped field for this Model (i.e. id becomes `posts`.`id`).
 * @access public
 */
GeckoJS.BaseModel.prototype.escapeField = function(field, table) {

    table = table || this.table;
    field = field || this.primaryKey;


    var ds = this.datasource;

    if (!ds) return table + '.' + field;

    if (typeof ds.name == 'function') return ds.name(table + '.' + field);
    else return table + '.' + field;
    
};


/**
 * Returns the current record's ID
 *
 * @name GeckoJS.BaseModel#getId
 * @public
 * @function
 * @return {String} The ID of the current record, false if no ID
 */
GeckoJS.BaseModel.prototype.getId = function() {

    if (typeof this.id == 'string' && this.id.length >0) {
        return this.id;
    }

    if (typeof this.id == 'undefined' || this.id == null || this.id === false) {
        return false;
    }

    return false;
};


/**
 * Returns the ID of the last record this Model inserted
 *
 * @name GeckoJS.BaseModel#getLastInsertID
 * @public
 * @function
 * @return {String} Last inserted ID
 */
GeckoJS.BaseModel.prototype.getLastInsertID = function() {
    return this.getInsertID();
};

/**
 * Returns the ID of the last record this Model inserted
 *
 * @name GeckoJS.BaseModel#getInsertID
 * @public
 * @function
 * @return {String} Last inserted ID
 */
GeckoJS.BaseModel.prototype.getInsertID = function() {
    return this.__insertID;
};

/**
 * Sets the ID of the last record this Model inserted
 *
 * @name GeckoJS.BaseModel#setInsertID
 * @public
 * @function
 * @param {String} Last inserted ID
 */
GeckoJS.BaseModel.prototype.setInsertID = function(id) {
    this.__insertID = id;
};

/**
 * Gets the DataSource to which this model is bound.
 *
 * @name GeckoJS.BaseModel#getDataSource
 * @public
 * @function
 * @return {GeckoJS.Model.DataSource}
 */
GeckoJS.BaseModel.prototype.getDataSource = function() {

    var ds = GeckoJS.ConnectionManager.getDataSource(this.useDbConfig);
    return (ds || null) ;
};


/**
 * Begins a transaction.
 *
 * @name GeckoJS.BaseModel#begin
 * @public
 * @function
 * @param {Boolean}  waiting  if database is locked
 * @function
 */
GeckoJS.BaseModel.prototype.begin = function(waiting)	{

    waiting = (typeof waiting != 'undefined') ?  waiting : true;

    var ds = this.datasource ;

    if (!ds) return false;

    if(this.autoRestoreFromBackup && !this._restoreFromBackupInProcess) {
        if(!this.restoreFromBackup()) return false;
    }

    return ds.begin(waiting);

};

/**
 * Commits a transaction.
 *
 * @name GeckoJS.BaseModel#commit
 * @public
 * @function
 * @param {Boolean}  waiting  if database is locked
 * @function
 */
GeckoJS.BaseModel.prototype.commit = function(waiting) {

    waiting = (typeof waiting != 'undefined') ?  waiting : true;

    var ds = this.datasource ;

    if (!ds) return false;

    return ds.commit(waiting);

};

/**
 * Rolls back a transaction.
 *
 * @name GeckoJS.BaseModel#rollback
 * @public
 * @function
 * @param {Boolean}  waiting  if database is locked
 * @function
 */
GeckoJS.BaseModel.prototype.rollback = function(waiting) {

    waiting = (typeof waiting != 'undefined') ?  waiting : true;
    
    var ds = this.datasource ;

    if (!ds) return false;

    return ds.rollback(waiting);

};


/**
 * create Table Schema for the given Schema object
 *
 * @name GeckoJS.BaseModel#createSchema
 * @public
 * @function
 * @param {Object} schema       Schema object
 */
GeckoJS.BaseModel.prototype.createSchema = function(schema) {

    // @todo
    return true;

};


/**
 * drop Table Schema
 *
 * @name GeckoJS.BaseModel#dropSchema
 * @public
 * @function
 */
GeckoJS.BaseModel.prototype.dropSchema = function() {

    // @todo
    return true;

};


/**
 * Use fields declared type to convert and cast data properties .
 *
 * This function is useful for cast data type, that from JSON / or XMLHttpRequest response.
 *
 * @name GeckoJS.BaseModel#convertDataTypes
 * @public
 * @function
 * @param {Object|Array} data     data to cast
 * @return {Object} return converted data
 */
GeckoJS.BaseModel.prototype.convertDataTypes = function(data) {

    if (!data) return data;

    if (data.constructor.name == 'Array') {

        for (var i = 0; i < data.length; i++ ) {
            data[i] = this.convertDataTypes(data[i]);
        }
        return data;

    }else {

        var fieldsInfo = this.getFieldsInfo();

        for (var fieldName in data) {

            // fields is defined in table.
            if (fieldsInfo[fieldName]) {

                var declaredType = fieldsInfo[fieldName].type;
                var convertType = 'String';

                if (declaredType.match(/bool/i)) {
                    convertType = "Boolean";
                }
                if ((declaredType.match(/date/i) || declaredType.match(/time/i))) {
                    convertType = "Date";
                }
                if (declaredType.match(/int/i)) {
                    convertType = "Integer";
                }
                if (declaredType.match(/float/i)) {
                    convertType = "Float";
                }

                switch (convertType) {
                    default:
                    case 'String':
                        break;
                    case 'Boolean':
                        data[fieldName] = GeckoJS.String.parseBoolean(data[fieldName]);
                        break;
                    case 'Date':
                        if (parseFloat(data[fieldName]).toFixed(0).length == 10) {
                            data[fieldName] = new Date(data[fieldName] * 1000);
                        }else if (parseFloat(data[fieldName]).toFixed(0).length == 13) {
                            data[fieldName] = new Date(parseFloat(data[fieldName]));
                        }else {
                            data[fieldName] = new Date(0);
                        }

                        data[fieldName] = GeckoJS.String.parseBoolean(data[fieldName]);
                        break;
                    case 'Integer':
                        data[fieldName] = parseInt(data[fieldName]);
                        break;
                    case 'Float':
                        data[fieldName] = parseFloat(data[fieldName]);
                        break;
                }
            }
        }

        return data;

    }

};
/**
 * Defines GeckoJS.VqlParser namespace
 *
 * @private
 * @namespace
 */
GREUtils.define('GeckoJS.VqlParser', GeckoJS.global);
/**#nocode+*/
/**
 * @private
 * @class Defines the VQL-based query class, which is a query mechanism
 * for the model.
 * 
 * @extends GeckoJS.BaseObject
 * @param {Object} queryString           VQL query string
 *
 */
GeckoJS.VqlParser = GeckoJS.BaseObject.extend('VqlParser', {
    init: function(queryString){
        this.queryString = queryString || "";
        this.tokens = [];
        this.nextTokenIndex = 0;
        this.queryArguments = [];
        this.command = "";
        
        if (arguments.length >1)
            for(var i=1; i<arguments.length; i++) this.queryArguments.push(arguments[i]);
    }
});

GeckoJS.VqlParser.QUERY_REGEX = /(?:'[^'\n\r]*')+|<=|>=|!=|=|<|>|:\w+|,|\*|-?\d+(?:\.\d+)?|\w+|\(|\)|\S+/ig;
GeckoJS.VqlParser.IDENTIFIER_REGEX = /(\w+)$/ ;
GeckoJS.VqlParser.CONDITIONS_REGEX = /(<=|>=|!=|=|<|>|is|in)$/i ;
GeckoJS.VqlParser.NUMBER_REGEX = /(\d+)$/ ;
GeckoJS.VqlParser.REFERENCE_REGEX = /:(\d+)$/ ;

/**
 * Returns a new instance of VqlParser.<br/>
 * <br/>
 * VqlParser does not support Singleton pattern, so calling getInstance()
 * will always return a new instance.
 *  
 * @private
 * @static 
 * @function
 * @return {GeckoJS.ArrayQuery}  A new ArrayQuery instance
 */
GeckoJS.VqlParser.getInstance = function(){
    return new GeckoJS.VqlParser();
};


/**
 * @private
 */
GeckoJS.VqlParser.prototype._accept = function(cond) {
    
    if (this.nextTokenIndex < this.tokens.length) {

        if (typeof cond == 'string') {
            if (this.tokens[this.nextTokenIndex].toUpperCase() == cond) {
                this.nextTokenIndex++;
                return true;
            }
        }else if (typeof cond == 'object' && cond.constructor.name == 'RegExp') {
            var matched_strings = this.tokens[this.nextTokenIndex].match(cond);
            if (matched_strings) {
                this.nextTokenIndex++;
                return matched_strings[1];
            }
        }
    }
    return false;
};


/**
 * @private
 * @function
 */
GeckoJS.VqlParser.prototype._parseSelectStatement = function(queryString) {

    var queryString = this.queryString || "";
    var command = this.command = "SELECT";
    var columns = "*";
    var table = "";
    var whereClause = [];
    var sortOrders = [];
    var limitClause = {offset:0, count:0} ;

    if(this._accept('SELECT')) {

        this._accept('*');
        this._accept('FROM');

        table = this._accept(GeckoJS.VqlParser.IDENTIFIER_REGEX);        
    }

    if (this._accept('WHERE')) {

        var identifier, condition, reference , value, op = "AND", isGroup = false, whereClause2 = [];
        while (true) {
            
            if (this._accept('(')) isGroup = true;
            
            identifier = this._accept(GeckoJS.VqlParser.IDENTIFIER_REGEX);
            if (!identifier) break;
            
            condition = this._accept(GeckoJS.VqlParser.CONDITIONS_REGEX);
            if (!condition) break;

            // reference :1 :2 :3
            reference = this._accept(GeckoJS.VqlParser.REFERENCE_REGEX);
            if (reference) {
                value = this.queryArguments[reference-1];
            }else {
                value = this._accept(/(.*)/).replace(/^'|'$/g, "");
            }

            whereClause2.push({
                op: op,
                column: identifier,
                condition: condition,
                value: value
            });

            if (this._accept(')')) isGroup = false;
            
            if (!isGroup) {
                if (whereClause2.length <= 1) {
                    whereClause = whereClause.concat(whereClause2);
                }else {
                    whereClause.push(whereClause2);
                }
                whereClause2 = [];
            }

            // support AND OR operator
            op = this._accept('AND') ? "AND" : false;
            op = op ? op : (this._accept('OR') ? "OR" : false);

            if (!op) break;

        }
    }

    if (this._accept('ORDER')) {
        this._accept('BY');

        var identifier, direction;
        while(true) {
            
            identifier = this._accept(GeckoJS.VqlParser.IDENTIFIER_REGEX);
            if (!identifier) break;
            
            if(this._accept('DESC')){
                direction = 'DESC';
            }else if(this._accept('ASC')){
                direction = 'ASC';
            }else {
                direction = 'ASC';
            }
            sortOrders.push({
                column: identifier,
                direction: direction
            });

            if (!this._accept(',')) break;
        }
    }
    
    if (this._accept('LIMIT')) {
        var maybe_count = 0;
        var maybe_offset = 0;
        
        maybe_count = this._accept(GeckoJS.VqlParser.NUMBER_REGEX);
        if (maybe_count) {
            maybe_count = parseInt(maybe_count);
            
            if (this._accept(',')) {
                maybe_offset = this._accept(GeckoJS.VqlParser.NUMBER_REGEX);
                if (maybe_offset) {
                    maybe_offset = parseInt(maybe_offset);
                    if (maybe_offset < 0) maybe_offset = 0;
                    
                    var count = maybe_offset;
                    maybe_offset = maybe_count;
                    maybe_count = count;
                }
            }
        }
        limitClause = {offset: maybe_offset, count: maybe_count} ;
    }
    
    return {
        vql: queryString,
        type: command,
        table: table,
        columns: columns,
        where: whereClause,
        sort: sortOrders,
        limit: limitClause
    };

};


/**
 *  
 * @private
 * @function
 * @param {String} queryString      
 * @return {Object}
 */
GeckoJS.VqlParser.prototype.parseVQL = function (queryString) {

    this.queryString = queryString || this.queryString || "";

    if (arguments.length >1)
        for(var i=1; i<arguments.length; i++) this.queryArguments.push(arguments[i]);

    var tokens = [] ;
    var tt = null;
    while (tt = GeckoJS.VqlParser.QUERY_REGEX.exec(this.queryString)) {
        tokens.push(tt[0]);
    }
    // clone to this.tokens
    this.tokens = tokens.slice();
    this.nextTokenIndex = 0;
    
    var command = this.command = tokens[0].toUpperCase();

    var result = null;
    switch (command) {
        default:
        case "SELECT":
            result = this._parseSelectStatement();
            break;
    }
    return result;
    
};


/**
 * @private
 */
GeckoJS.VqlParser.parseVQL = function (queryString) {
    var parser = new GeckoJS.VqlParser();
    return parser.parseVQL.apply(parser, arguments);
};

/**
 * @private
 */
GeckoJS.VqlParser.toSQL = function(statement) {

    
};

/**
 * @private
 */
GeckoJS.VqlParser.toWhereSQL = function(statement) {

    var whereClause = statement.where || "";
    var result = "";
    
    if(whereClause == "") return result;

    var i = 0;
    whereClause.forEach(function(where){
        if (i > 0) result += " " + where.op + " ";
        
        result += where.column + where.condition + "'" + where.value + "'";
        i++;
    });
    
    return result;
};

/**
 * @private
 */
GeckoJS.VqlParser.toSortOrderSQL = function(statement) {

    var sortClause = statement.sort || "";
    var result = "";

    if(sortClause == "") return result;

    sortClause.forEach(function(sort){
        result += sort.column + " " + sort.direction + ",";
    });
    
    return result.replace(/,$/, "");
};


/**
 * @private
 */
GeckoJS.VqlParser.toLimitSQL = function(statement) {

    var limitClause = statement.limit | "";
    if (limitClause == "") return [0, 1];

    var limit = 0, page = 1;
    
    if (limitClause.limit <= 0) limit = 3000;
    else limit = limitClause.limit;
    
    if (limitClause.offset <= 0) page = 1;
    else page = Math.floor(limitClause.offset/limit) + 1;
    
    return [limit, page];
};

/**
 * Defines GeckoJS.ConnectionManager namespace
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.ConnectionManager', GeckoJS.global);

/**
 * Creates a new GeckoJS.ConnectionManager instance and initializes it by
 * setting the "config" field to the value of the 'DATABASE_CONFIG'
 * configuration parameter. This parameter should be a list of name-value pairs
 * where the name is the database configuration key and the value is an object
 * whose "classname" property is the data source class.<br/>
 * <br/>
 * If 'DATABASE_CONFIG' is not found, "config" is set to a "default" database
 * configuration with a data source of class "DatasourceJsonFile", using
 * storage from the "/var/tmp" file system.
 *
 * @class GeckoJS.ConnectionManager is a Singleton that maintains a cache of
 * data sources.<br/>
 *     
 * @name GeckoJS.ConnectionManager
 * @extends GeckoJS.BaseObject
 * @extends GeckoJS.Singleton 
 *
 * @property {Object} config Database configuration
 *
 */ 

GeckoJS.ConnectionManager = GeckoJS.BaseObject.extend('ConnectionManager', 
/** @lends GeckoJS.ConnectionManager.prototype */
{
    /**
     * GeckoJS.ConnectionManager contructor
     *
     * Load DATABASE_CONFIG from preferences and initialize datasources.
     *
     * @name GeckoJS.ConnectionManager#init
     * @public
     * @function
     */
    init: function() {
		
        // loadPreferences
        GeckoJS.Configure.loadPreferences('DATABASE_CONFIG');
        
        this.config = GeckoJS.Configure.read('DATABASE_CONFIG') || {
            'default': {
                classname: 'JsonFile', // JsonFile
                path: '/var/tmp'
            }
        };

        this._dataSources = new GeckoJS.Map();
        /*
        // FUEL's SessionStorage support
        if (Application.storage.has('GeckoJS_ConnectionManager_datasources')) {
            this._dataSources = Application.storage.get('GeckoJS_ConnectionManager_datasources',  (new GeckoJS.Map()) );
        }else {
            this._dataSources = new GeckoJS.Map();
            Application.storage.set('GeckoJS_ConnectionManager_datasources', this._dataSources);
        }*/
				
    }
});

// make ConnectionManager support singleton
GeckoJS.Singleton.support(GeckoJS.ConnectionManager);


/**
 * getConfig
 *
 * @name GeckoJS.ConnectionManager.getConfig
 * @public
 * @static
 * @function
 * @return {Object} database config
 */
GeckoJS.ConnectionManager.getConfig = function() {

    var self = GeckoJS.ConnectionManager.getInstance();

    return self.config;
};

/**
 * Gets the list of available DataSource connections
 *
 * @name GeckoJS.ConnectionManager.sourceList
 * @public
 * @static
 * @function
 * @return {Array} List of available connections
 */
GeckoJS.ConnectionManager.sourceList = function () {

		var self = GeckoJS.ConnectionManager.getInstance();

        return self._dataSources.getKeys();

};


/**
 * Returns the data source identified by the given name.<br/>
 * <br/>
 * If the data source has not yet been loaded, this name is used to look up the
 * corresponding data source class to load. Once loaded, the data source is
 * cached using the name as the key.<br/>
 * <br/>
 * Returns null if the data source is not found.  
 *
 * @name GeckoJS.ConnectionManager.getDataSource
 * @public
 * @static
 * @function
 * @param {String} name                   This is the data source name
 * @return {GeckoJS.DataSource}           The requested data source
 */   
GeckoJS.ConnectionManager.getDataSource = function(name) {

    name = name || 'default';
    
    var self = GeckoJS.ConnectionManager.getInstance();

    try {
		
        if (self._dataSources.containsKey(name)) {
            return self._dataSources.get(name);
        }
        
    }catch(e) {
        this.log("ERROR","ConnectionManager.getDataSource - Non-existent data source " + name, e);
    }
    if (GeckoJS.Array.inArray(name, GeckoJS.BaseObject.getKeys(self.config)) != -1) {
        var conf = self.config[name] || {
            classname: 'JsonFile',
            path: '/var/tmp'

        };
        var klass = conf['classname'] || 'JsonFile';
		
        var ds = self.loadDatasource(klass, conf);

        if(ds != null) {
            ds.configName = name;
        }

        self._dataSources.set(name, ds);
		
    }else {
        this.log("WARN","ConnectionManager.getDataSource - Non-existent data source " + name);
    }
    return self._dataSources.get(name);
};


/**
 * Returns the data source identified by the given name.<br/>
 * <br/>
 * If the data source has not yet been loaded, this name is used to look up the
 * corresponding data source class to load. Once loaded, the data source is
 * cached using the name as the key.<br/>
 * <br/>
 * Returns null if the data source is not found.
 *
 * @name GeckoJS.ConnectionManager.setDataSource
 * @public
 * @static
 * @function
 * @param {String} name                   This is the data source name
 * @param {GeckoJS.DataSource}           The requested data source
 * @return {GeckoJS.DataSource}           The requested data source
 */
GeckoJS.ConnectionManager.setDataSource = function(name, ds) {
    var self = GeckoJS.ConnectionManager.getInstance();
    self._dataSources.set(name, ds);
    return ds;
};


/**
 * Close Connection
 *
 * @name GeckoJS.ConnectionManager.close
 * @public
 * @static
 * @function
 * @param {String} name                   This is the data source name
 * @return {Boolean}
 */
GeckoJS.ConnectionManager.close = function(name) {
    var ds = GeckoJS.ConnectionManager.getDataSource(name);
    try {
        ds.close();
    }catch(e) {
        return false;
    }
    return true;
};



/**
 * Close All Connections
 *
 * @name GeckoJS.ConnectionManager.closeAll
 * @public
 * @static
 * @function
 * @param {String} name                   This is the data source name
 * @return {Boolean}
 */
GeckoJS.ConnectionManager.closeAll = function(name) {
    var self = GeckoJS.ConnectionManager.getInstance();
    var dss = self._dataSources.getValues();
    try {
        dss.forEach(function(ds) {
            ds.close();
        });
    }catch(e) {
        return false;
    }
    return true;
};


/**
 * Returns data source by class.<br/>
 * <br/>
 * This method loads and returns the data source by its class. The data source
 * is not cached.<br/>
 * <br/>
 * Returns null if the data source is not found.  
 *
 * @name GeckoJS.ConnectionManager.getDataSourceByClass
 * @public
 * @static
 * @function
 * @param {String} klass                  This is the data source name
 * @return {GeckoJS.DataSource}           The requested data source
 */
GeckoJS.ConnectionManager.getDataSourceByClass = function(klass, config) {
	
    var self = GeckoJS.ConnectionManager.getInstance();
    config = config || {};

    var ds = null;
	
    ds = self.loadDatasource(klass, config);
	
    return ds;
};

/**
 * Loads data source by class.<br/>
 * <br/>
 * This method loads and returns the data source by its class. The data source
 * is not cached.<br/>
 * <br/>
 * Returns null if the data source is not found.<br/>
 * <br/>
 * Note: in the SDK, a data source is stored as a property of the GeckoJS object
 * under the name "Datasource"+classname.<br/>
 *
 * @name GeckoJS.ConnectionManager#loadDatasource
 * @public
 * @function
 * @param {String} klass                  This is the data source class
 * @return {GeckoJS.DataSource}           The requested data source
 */
GeckoJS.ConnectionManager.prototype.loadDatasource = function(klass, config) {
    if(typeof GeckoJS['Datasource'+klass] == 'function' /* && GeckoJS['Datasource'+klass] instanceof Datasource */) {
        try {
            var clazz = GeckoJS['Datasource'+klass];
            var ds = new clazz(config);

            return ds;

        }catch (e) {
            this.log("ERROR", "GeckoJS.ConnectionManager.loadDatasource can't getInstance() GeckoJS.Datasource" + klass, e);
        }
    }else {
        this.log("ERROR", "GeckoJS.ConnectionManager.loadDatasource not found GeckoJS.Datasource" + klass);
    }
    return null;
	
};

/**
 * Defines GeckoJS.Datasource namespace
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Datasource', GeckoJS.global);

/**
 * Creates a new GeckoJS.Datasource instance.
 * 
 * @class GeckoJS.Datasource is a logical interface for performing standard
 * CRUD (Create, Read, Update, Delete) operations on data sources that is
 * independent of the underlying storage mechanism.<br/>
 * <br/>
 * GeckoJS.Datasource is an interface and should be extended by sub-classes
 * that implement the interactions with the actual storage devices.<br/>
 *
 * @name GeckoJS.Datasource
 * @class
 * @extends GeckoJS.BaseObject
 * @property {Object} config                datasource config object
 * @property {String} configName            datasource config name. (for useDbConfig)
 *
 */
GeckoJS.Datasource = GeckoJS.BaseObject.extend('Datasource',
/** @lends GeckoJS.Datasource.prototype */
{

    /**
     * GeckoJS.Datasource contructor
     *
     * @name GeckoJS.Datasource#init
     * @public
     * @function
     * @param {Object} config
     */
    init: function(config){
    
        // http://developer.mozilla.org/en/docs/wrappedJSObject
        this.wrappedJSObject = this;

        this._config = null;

        this._configName = "default";

        this._descriptionCache = {};

        if(config) this.setConfig(config);

        this.lastError = 0;
        this.lastErrorString = "";

	
    }
});

/**
 * setConfig
 *
 * @name GeckoJS.Datasource#setConfig
 * @public
 * @function
 * @param {Object} config
 */
GeckoJS.Datasource.prototype.setConfig = function(config) {
    this._config = config || this._config;
};

/**
 * getConfig
 *
 * @name GeckoJS.Datasource#getConfig
 * @public
 * @function
 * @return {Object} config
 */
GeckoJS.Datasource.prototype.getConfig = function() {
    return this._config;
};

/**
 * setConfigName
 *
 * default config name is 'default'
 *
 * @name GeckoJS.Datasource#setConfigName
 * @public
 * @function
 * @param {String} name
 */
GeckoJS.Datasource.prototype.setConfigName = function(name) {
    this._configKeyName = name || "default";
};

/**
 * getConfigName
 *
 * default config name is 'default'
 *
 * @name GeckoJS.Datasource#getConfigName
 * @public
 * @function
 * @return {String} name
 */
GeckoJS.Datasource.prototype.getConfigName = function() {
    return this._configKeyName || "default";
};

// getter / setter define
GeckoJS.Datasource.prototype.__defineGetter__('config', function() {
    return this.getConfig();
});

GeckoJS.Datasource.prototype.__defineSetter__('config', function(config) {
    return this.setConfig(config);
});

GeckoJS.Datasource.prototype.__defineGetter__('configName', function() {
    return this.getConfigName();
});

GeckoJS.Datasource.prototype.__defineSetter__('configName', function(name) {
    return this.setConfigName(name);
});


/**
 * Inserts data into a model using the given id as the primary key.
 *
 * @name GeckoJS.Datasource#executeInsert
 * @public
 * @function
 * @param {GeckoJS.Model} model             This is the model to insert data into
 * @param {String|Number} id                This is the primary key
 * @param {Object} data                     This is the data to insert
 */
GeckoJS.Datasource.prototype.executeInsert = function(model, id, data) {
    
    };

/**
 * Returns the size of the result set containing data items from model that
 * satisfy the given query condition.<br/>
 * <br/>
 * If page size or page number is given, returns only the number of data items
 * in the requested page of the result set.
 *
 * @name GeckoJS.Datasource#querySelectCount
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {Object} conditions        This is the query conditions
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number 
 * @return {Number}                 The number of rows in the result set
 */
GeckoJS.Datasource.prototype.querySelectCount = function(model, condition, order, limit, page) {
    
    };


/**
 * Retrieves from a model data items that satisfy the given query condition,
 * sorted in the specified order.<br/>
 * <br/>
 * If page size or page number is given, returns only data items in the requested
 * page of the result set.
 *
 * @name GeckoJS.Datasource#querySelect
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} fields        This is the query fields
 * @param {String} conditions        This is the query conditions
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @param {Number} recursive             This is the query recursive
 * @return {Object}                  The result set
 */
GeckoJS.Datasource.prototype.querySelect = function(model, fields, conditions, order, limit, page, recursive) {
    
    };


/**
 * Retrieves a data item from a model based on its id.
 *
 * @name GeckoJS.Datasource#querySelectById
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} fields        This is the query fields
 * @param {String} id               This is the id of the data item to retrieve
 * @param {Number} recursive             This is the query recursive
 * @return {Object}                  The data item
 */
GeckoJS.Datasource.prototype.querySelectById = function(model, fields, id, recursive) {
    
    };


/**
 * Returns the number of data items in a model where the property indicated
 * by the "index" parameter is equal to the "value" parameter.<br/>
 * <br/>
 * If page size or page number is given, returns only the number of data items
 * in the requested page of the result set.
 *
 * @name GeckoJS.Datasource#querySelectCountByIndex
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} index            This is the index property
 * @param {Object} value            This is the index value
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @return {Number}                 The number of rows in the result set
 */
GeckoJS.Datasource.prototype.querySelectCountByIndex = function(model, index, value, order, limit, page) {
    
    };


/**
 * Retrieves from a model data items where the property indicated by the
 * "index" parameter is equal to the "value" parameter, sorted in the
 * specified order.<br/>
 * <br/>
 * If page size or page number is given, returns only the data items in the
 * requested page of the result set.
 *
 * @name GeckoJS.Datasource#querySelectByIndex
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} fields        This is the query fields
 * @param {String} index            This is the index property
 * @param {Object} value            This is the index value
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @param {Number} recursive             This is the query recursive
 * @return {Object}                  The result set
 */
GeckoJS.Datasource.prototype.querySelectByIndex = function(model, fields, index, value, order, limit, page, recursive) {
    
    };


/**
 * Updates a data item in a model.
 *
 * @name GeckoJS.Datasource#executeUpdate
 * @public
 * @function
 * @param {GeckoJS.Model} model              This is the model to update
 * @param {String} id                        This is the primary key identifying the record to update
 * @param {Object} data                      This is the data to update the model with
 * @return {Number} rows                      Number of records updated
 */
GeckoJS.Datasource.prototype.executeUpdate = function(model, data) {

    };



/**
 * Removes the data item identified by id from a model.
 *
 * @name GeckoJS.Datasource#executeDelete
 * @public
 * @function
 * @param {GeckoJS.Model} model             This is the model to delete data from
 * @return {Number} rows                     Number of records deleted
 */
GeckoJS.Datasource.prototype.executeDelete = function(model) {
    
    };
    
/**
 *   Opens a connection to the database.
 *
 * @name GeckoJS.Datasource#connect
 * @public
 * @function
 */
GeckoJS.Datasource.prototype.connect = function() {
    return true;
};

/**
 * Closes the connection to the database.
 *
 * @name GeckoJS.Datasource#disconnect
 * @public
 * @function
 * 
 */
GeckoJS.Datasource.prototype.disconnect = function() {
    return true;
};


/**
 *   Opens a connection to the database.
 *
 * Alias to connect
 *
 * @name GeckoJS.Datasource#open
 * @public
 * @function
 */
GeckoJS.Datasource.prototype.open = function() {
    return this.connect();
};


/**
 * Closes the connection to the database.
 *
 * Alias to disconnect
 *
 * @name GeckoJS.Datasource#close
 * @public
 * @function
 *
 */
GeckoJS.Datasource.prototype.close = function() {
    return this.disconnect();
};


/**
 * Begins a transaction.
 *
 * @name GeckoJS.Datasource#begin
 * @public
 * @function
 * @param {Boolean} waiting waiting if database is locked
 * @return {Boolean} true if transaction begin
 */
GeckoJS.Datasource.prototype.begin = function(waiting)	{
    return true;
};

/**
 * Commits a transaction.
 *
 * @name GeckoJS.Datasource#commit
 * @public
 * @function
 * @param {Boolean} waiting waiting if database is locked
 * @return {Boolean} true if transaction begin
 */
GeckoJS.Datasource.prototype.commit = function(waiting) {
    return true;
};

/**
 * Rolls back a transaction.
 *
 * @name GeckoJS.Datasource#rollback
 * @public
 * @function
 * @param {Boolean} waiting waiting if database is locked
 * @return {Boolean} true if transaction begin
 */
GeckoJS.Datasource.prototype.rollback = function(waiting) {
    return true;
};


/**
 * is Field Name in table
 *
 * @name GeckoJS.Datasource#describe
 * @public
 * @function
 * @param {GeckoJS.Model} model
 * @return {Object} 
 */
GeckoJS.Datasource.prototype.describe = function(model) {
    return {};
};


/**
 * is Field Name in table
 *
 * @name GeckoJS.Datasource#hasField
 * @public
 * @function
 * @param {GeckoJS.Model} model
 * @param {String} field
 * @return {Boolean}
 */
GeckoJS.Datasource.prototype.hasField = function(model, field) {
    return true;
};


/**
 * Queries the database with given SQL statement, and obtains some metadata about the result
 * (rows affected, timing, any errors, number of rows in resultset). The query is also logged.
 * If DEBUG is set, the log is shown all the time, else it is only shown on errors.
 *
 * @name GeckoJS.Datasource#execute
 * @public
 * @function
 * @param {String} sql
 * @param {Array} params
 * @return {Array} Resource or object representing the result set, or false on failure
 */
GeckoJS.Datasource.prototype.execute = function (sql, params, waiting) {
    return false;
};


/**
 * Returns the ID of the last inserted row.
 *
 * @name GeckoJS.Datasource#getLastInsertId
 * @public
 * @function
 * @return {String}  The id of the last inserted row
 */
GeckoJS.Datasource.prototype.getLastInsertId = function() {
    return "";
};

/**
 * Defines GeckoJS.ArrayQuery namespace
 *
 * @namespace
 */
GREUtils.define('GeckoJS.ArrayQuery', GeckoJS.global);

/**
 * Creates a new GeckoJS.ArrayQuery instance and initializes it with
 * the given data.
 * 
 * @class GeckoJS.ArrayQuery provides a set of common array handling functions
 * useful for processing and manipulating model query results.<br/>
 * <br/>
 * Data items may be accessed via their array indices.<br/>
 * @name GeckoJS.ArrayQuery
 * @extends GeckoJS.BaseObject
 * @param {Object} data           This is an array of data items; defaults to an empty array
 * @property {Object} data        The array used to store data items 
 *
 */
GeckoJS.ArrayQuery = GeckoJS.BaseObject.extend('ArrayQuery', {
    init: function(){
        this._data = arguments[0] || [];
    }
});

/**
 * Returns a new instance of ArrayQuery.<br/>
 * <br/>
 * ArrayQuery does not support Singleton pattern, so calling getInstance()
 * will always return a new instance.
 *
 * @name GeckoJS.ArrayQuery.getInstance
 * @public
 * @static 
 * @function
 * @return {GeckoJS.ArrayQuery}  A new ArrayQuery instance
 */
GeckoJS.ArrayQuery.getInstance = function(){
    return new GeckoJS.ArrayQuery();
};


//data getter
GeckoJS.ArrayQuery.prototype.__defineGetter__('data', function(){
    return this._data;
});

//data setter
GeckoJS.ArrayQuery.prototype.__defineSetter__('data', function(d){
    this._data = d || [];
});

/**
 * Constructs a function that can be used to filter the elements of an array
 * based on the given condition.
 *
 * @name GeckoJS.ArrayQuery#buildFilterFunction
 * @public
 * @function
 * @param {String} condition      This is the condition used to filter an array
 * @return {Function}             A filter function
 */
GeckoJS.ArrayQuery.prototype.buildFilterFunction = function (condition) {
	
    var custO = [],localO = [];
    var rex = /(?:'[^'\n\r]*')+|<=|>=|!=|=|<|>|:\w+|,|\*|-?\d+(?:\.\d+)?|\w+|\(|\)|\S+/ig;
	
    var tokens = [] ;
    var tt = null;
    while (tt = rex.exec(condition)) {
        tokens.push(tt[0]);
    }
	
    for(var sa =0 ; sa < tokens.length; sa+=3) {
		
        var condCol = tokens[sa];
        if (condCol.match(/and/i)) {
            sa++;
            condCol = tokens[sa];
        }
        var condTest = tokens[sa+1];
        var condVal = tokens[sa+2].replace(/^'|'$/g, '');
		
        custO.push({
            'condCol': condCol,
            'condTest': condTest,
            'condVal': condVal
        });
    }
    
    // Return the filter function to the calling object.
    return function (element, index, array) {
        var returnvar = true, r1=element,r2=index,x,y;
        
        // loop over the custO and test each sort
        // instruction set against records x and y to see which
        // should appear first in the final array sort
        for(var sa = 0; sa < custO.length; sa++) {
            if (returnvar === true) {

                x = r1[custO[sa]["condCol"]];
                
                if (!x && custO[sa]["condCol"].indexOf('.') != -1) {

                    // try to get inner object.
                    var tt = custO[sa]["condCol"].split('.');
                    
                    try {
                        var rr = null;
                        tt.forEach(function(tcol){
                            if(rr == null) rr = r1;
                            if(rr[tcol]) {
                                rr = rr[tcol];
                            }
                        });
                        x = rr;
                    }catch(e){
                        
                    }

                }
                y = custO[sa]["condVal"];
                
                if (custO[sa].condTest == '=')
                {
                    if (GREUtils.isNull(x) || !GREUtils.isDefined(x) || x != y) {
                        returnvar = false;
                    }
                } else if (custO[sa].condTest == '<=') {
                    if (GREUtils.isNull(x) || !GREUtils.isDefined(x) || x > y) {
                        returnvar = false;
                    }
                }else if (custO[sa].condTest == '>=') {
                    if (GREUtils.isNull(x) || !GREUtils.isDefined(x) || x < y) {
                        returnvar = false;
                    }
                }else if (custO[sa].condTest == '!=') {
                    if (GREUtils.isNull(x) || !GREUtils.isDefined(x) || x == y) {
                        returnvar = false;
                    }
                }else if (custO[sa].condTest == '<') {
                    if (GREUtils.isNull(x) || !GREUtils.isDefined(x) || x >= y) {
                        returnvar = false;
                    }
                }else if (custO[sa].condTest == '>') {
                    if (GREUtils.isNull(x) || !GREUtils.isDefined(x) || x <= y) {
                        returnvar = false;
                    }
                }
            }
        }
        return returnvar;
    };
};



/**
 * Constructs a function that can be used to sort the elements of an array
 * based on the given sort order.<br/>
 * <br/>
 * The order is given as a string containing comma-separated element property
 * names. The order between two elements is determined by comparing the property
 * values in turn. Sort direction is ascending ("asc") by default. To use
 * descending direction on a property, append the string "desc" to the property
 * separated by a space.          
 *
 * @name GeckoJS.ArrayQuery#buildSortFunction
 * @public
 * @function
 * @param {String} order          This is the order used to sort an array
 * @return {Function}             A sort function
 */
GeckoJS.ArrayQuery.prototype.buildSortFunction = function (order) {
    var custO = [],localO = [];

    localO = order.split(",");
    for(var sa = 0; sa < localO.length; sa++) {
        var sortCol = GeckoJS.String.trim(localO[sa]);
        var sortDir = "asc";
		
        var localO2 = sortCol.split(/[\s]+/);
        if (localO2.length == 2) {
            sortCol = localO2[0];
            sortDir = localO2[1].toLowerCase();
        }
        custO.push({
            'sortCol': sortCol,
            'sortDir': sortDir
        });
    }
    
    // Return the sort function to the calling object.
    return function (a,b) {
        var returnvar = 0,r1=a,r2=b,x,y;
        
        // loop over the custO and test each sort
        // instruction set against records x and y to see which
        // should appear first in the final array sort
        for(var sa = 0; sa < custO.length; sa++) {
            if (returnvar === 0) {
			
                x = r1[custO[sa]["sortCol"]];
                y = r2[custO[sa]["sortCol"]];
                
                x = (GREUtils.isString(x)) ? x.toLowerCase() : x;
                y = (GREUtils.isString(y)) ? y.toLowerCase() : y;
    
                if (custO[sa].sortDir == 'desc')
                {
                    if (GREUtils.isNull(y) || !GREUtils.isDefined(y) || y < x) {
                        returnvar = -1;
                    } else if (GREUtils.isNull(x) || !GREUtils.isDefined(x) || y > x){
                        returnvar = 1;
                    }
                } else {
                    if (GREUtils.isNull(x) || !GREUtils.isDefined(x) || x < y) {
                        returnvar = -1;
                    } else if (GREUtils.isNull(y) || !GREUtils.isDefined(y) || x > y){
                        returnvar = 1;
                    }
                }
            }
        }
        return returnvar;
    };
};

/**
 * Returns data items from this data source that satisfy the given condition.
 *
 * @name GeckoJS.ArrayQuery#filter
 * @public
 * @function
 * @name GeckoJS.ArrayQuery.prototype.filter
 * @param {String} condition      This is the condition used to filter the data source
 * @return {Object}                An array of data items
 */
GeckoJS.ArrayQuery.prototype.filter = function(condition) {
    var filterFunc = this.buildFilterFunction(condition);
    var data = this.data.concat([]);
    return data.filter(filterFunc);
};



/**
 * Sorts in place the data items in the data source according to the given sort
 * order and returns the sorted data items. 
 *
 * @name GeckoJS.ArrayQuery#orderBy
 * @public
 * @function
 * @name GeckoJS.ArrayQuery.prototype.orderBy
 * @param {String} condition      This is the order used to sort the data source
 * @return {Object}                An array of data items 
 */
GeckoJS.ArrayQuery.prototype.orderBy = function(order) {
    var sortFunc = this.buildSortFunction(order);
    this.data.sort(sortFunc);
    return this.data;
};


/**
 * Returns a page of data items.  
 *
 * @name GeckoJS.ArrayQuery#limit
 * @public
 * @function
 * @name GeckoJS.ArrayQuery.prototype.limit
 * @param {Number} limit          This is the page size
 * @param {Number} page           This is the page number (starts at 1)
 * @return {Object}                An array of data items
 */
GeckoJS.ArrayQuery.prototype.limit = function(limit, page) {
	
    limit = limit || this.data.length;
    limit = (limit > this.data.length || limit < 0) ? this.data.length : limit;

    var totalPage = Math.floor(this.data.length / limit) ;

    page = page || 1;
    page = (page > totalPage || page <= 0) ? totalPage : page;
	
    var offsetStart = limit * (page-1);
    offsetStart = (offsetStart  < 0 || offsetStart > this.data.length) ? 0 : offsetStart;
    
    var offsetEnd = offsetStart + limit;
    offsetEnd = (offsetEnd > this.data.length) ? this.data.length : offsetEnd;

    var resultCount = offsetEnd - offsetStart;
    // if resultCount == data.length return right now
    if (resultCount == this.data.length) return this.data;
	
    return this.data.slice(offsetStart, offsetEnd);
	 
};

/**
 * Defines GeckoJS.DatasourceJsonFile namespace
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.DatasourceJsonFile', GeckoJS.global);

/**
 * Creates a new GeckoJS.DatasouceJsonFile instance.
 * 
 * @class GeckoJS.DatasourceJsonFile implements a data source that stores data
 * in JSON-encoded format in a file. It also maintains a write-through data
 * cache.<br/>
 * <br/>
 * It is a Singleton class.<br/>
 * <br/>
 * Data is stored in files under the "data" sub-directory of the
 * system tmp directory (configuration key "TmpD").<br/> 
 *
 * @name GeckoJS.DatasourceJsonFile
 * @extends GeckoJS.Datasource 
 */
GeckoJS.DatasourceJsonFile = GeckoJS.Datasource.extend('DatasourceJsonFile',
/** @lends GeckoJS.DatasourceJsonFile.prototype */
{

    /**
     * GeckoJS.DatasourceJsonFile contructor
     *
     * @name GeckoJS.DatasourceJsonFile#init
     * @public
     * @function
     * @param {Object} config
     */
    init: function(config){
    
        // http://developer.mozilla.org/en/docs/wrappedJSObject
        this.wrappedJSObject = this;

        this._path = null ;
        //this._data = new GeckoJS.Map();

        this.config = config;

        this.lastInsertId = "";

        this.lastError = 0;
        this.lastErrorString = "";

    }
});



//dispatchData getter
/*
GeckoJS.DatasourceJsonFile.prototype.__defineGetter__('data', function(){
    return this._data;
});
*/

// path
GeckoJS.DatasourceJsonFile.prototype.__defineGetter__('path', function() {
    if (this._path == null) {
        this._path = this.config.path || "/var/tmp";
    }
    return this._path;
});


/**
 * Reads the entire content of a table from the corresponding Json file.<br/>
 * <br/>
 * If the table is cached, returns the cached data instead.
 *
 * @name GeckoJS.DatasourceJsonFile#readTableFile
 * @public
 * @function
 * @param {String} table              This is the name of the table to read
 */
GeckoJS.DatasourceJsonFile.prototype.readTableFile = function(table){

    var db = null;
    var d = null;

    var tableFile = new GeckoJS.Dir(this.path, true);

    // directory not exists and can't created
    if (!tableFile.exists()) {
        this.lastError = 1;
        this.lastErrorString = "error or missing database";
        
        return db;
    }

    tableFile.append(table + '.db');

    if (tableFile.exists() && tableFile.file.fileSize > 0) {

        /* ifdef DEBUG 
        this.log('DEBUG', 'readTableFile > ' + tableFile.path + ' , fileSize = ' + tableFile.file.fileSize);
        /* endif DEBUG */
       
        try {
            d = GREUtils.JSON.decodeFromFile(tableFile.path);
        }catch(e) {
            d = null;
        }
        
    }

    /* ifdef DEBUG 
    this.log('DEBUG', 'readTableFile > AddtoMap ');
    /* endif DEBUG */

    db = new GeckoJS.Map();

    if (d != null) {
        db.addAll(d);
    }

    this.lastError = 0;
    this.lastErrorString = "successful result";

    return db;
    
};

/**
 * Saves the entire content of a table to file.
 *
 * @name GeckoJS.DatasourceJsonFile#saveTableFile
 * @public
 * @function
 * @param {String} table               This is the table name to save to
 * @param {Object} db                  This is the table data to save
 */
GeckoJS.DatasourceJsonFile.prototype.saveTableFile = function(table, db){

    var tableFile = new GeckoJS.Dir(this.path, true);

    // directory not exists and can't created
    if (!tableFile.exists()) {
        this.lastError = 1;
        this.lastErrorString = "error or missing database";

        return false;
    }

    tableFile.append(table + '.db');

    /* ifdef DEBUG 
    this.log('DEBUG', 'saveTableFile > ' + tableFile.path);
    /* endif DEBUG */

    if (!db) {
        // null or false , write 0 byte file.
        GREUtils.File.writeAllBytes(tableFile.path, '');
    }else if (db._obj) {
        // Map object
        GREUtils.JSON.encodeToFile(tableFile.path, db._obj);
    }

    // this.data.set(table, db);
    this.lastError = 0;
    this.lastErrorString = "successful result";

    return true;
};


/**
 * Returns the size of the result set containing data items from model that
 * satisfy the given query condition.<br/>
 * <br/>
 * If page size or page number is given, returns only the number of data items
 * in the requested page of the result set.
 *
 * @name GeckoJS.DatasourceJsonFile#querySelectCount
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {Object} condition        This is the query condition
 * @param {String} group            This is the group by fields
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @return {Number}                 The number of rows in the result set
 */
GeckoJS.DatasourceJsonFile.prototype.querySelectCount = function(model, condition, group, order, limit, page){
    return this.querySelect(model, "", condition, group, order, limit, page, 0).length;
};

/**
 * Retrieves from a model data items that satisfy the given query condition,
 * sorted in the specified order.<br/>
 * <br/>
 * If page size or page number is given, returns only data items in the requested
 * page of the result set.
 *
 * @name GeckoJS.DatasourceJsonFile#querySelect
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} fields        This is the query fields
 * @param {String} conditions        This is the query conditions
 * @param {String} group            This is the group by fields
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @param {Number} recursive             This is the query recursive
 * @return {Object}                  The result set
 */
GeckoJS.DatasourceJsonFile.prototype.querySelect = function(model, fields, conditions, group, order, limit, page, recursive){
    
    recursive = typeof recursive != 'undefined' ? recursive : 1;

    var table = model.table;
    var name = model.name ;

    /* ifdef DEBUG 
    this.log('DEBUG', 'querySelect > ' + table + ' , name: ' + name + ', recursive: ' + recursive);
    /* endif DEBUG */

    try {
        var db = this.readTableFile(table);

        if (!db) {

            /* ifdef DEBUG 
            this.log('DEBUG', 'querySelect > ' + table + ',, error or missing database');
            /* endif DEBUG */

            return [];
        }
        
        var resultSet = db.getValues();

        /* ifdef DEBUG 
        this.log('DEBUG', 'querySelect > resultSet datas length = ' + resultSet.length );
        /* endif DEBUG */

        // if no datas , return 
        if (resultSet.length == 0) return [];

        var arrayDs = new GeckoJS.ArrayQuery(resultSet);
        
        if (conditions)
            arrayDs.data = arrayDs.filter(conditions);
        
        if (order)
            arrayDs.orderBy(order);
        
        if (limit || page)
            arrayDs.data = arrayDs.limit(limit, page);
        
        var result = arrayDs.data.concat([]);

        /* ifdef DEBUG 
        this.log('DEBUG', 'querySelect > arrayDs data result length = ' + result.length );
        /* endif DEBUG */

        // make row[ModelName] format
        result.forEach(function(row) {
            row[name] = GREUtils.extend({}, row);
        });

        /* ifdef DEBUG 
        this.log('DEBUG', 'querySelect > set result with model.name structure, length = ' + result.length );
        /* endif DEBUG */

        delete arrayDs;
        delete resultSet;
        delete db;

        if (recursive == 1) {

            /* ifdef DEBUG 
            this.log('DEBUG', 'querySelect > _queryAssociations, length = ' + result.length );
            /* endif DEBUG */

            return this._queryAssociations(model, result, recursive);
        }else {

            /* ifdef DEBUG 
            this.log('DEBUG', 'querySelect > return result , length = ' + result.length );
            /* endif DEBUG */

            return result;
        }
        
        
    }
    catch (e) {
        this.log("ERROR","GeckoJS.DatasourceJsonFile: An error occurred executing the selectAll (" + conditions + ")command\n" , e);
        return [];
    }
    
};


/**
 * _generateAssociation
 *
 * @name GeckoJS.DatasourceJsonFile#_queryAssociations
 * @private
 * @function
 * @param {GeckoJS.Model} model
 * @param {Object} datas
 * @param {Number} recursive
 */
GeckoJS.DatasourceJsonFile.prototype._queryAssociations = function(model, datas, recursive) {

    recursive = typeof recursive != 'undefined' ? recursive : 1;

    try {
        var self = this;
        var results = new Array();
        var schema = model.schema();

        /* ifdef DEBUG 
        this.log('DEBUG', '_queryAssociations > ' + model.table);
        /* endif DEBUG */

        datas.forEach( function (d){

            // shadow clone object
            var data = GeckoJS.BaseObject.clone(d);
        
            // process belongsTo
            if(typeof schema.associations['belongsTo'] == 'object') {
                for (var assocName in schema.associations['belongsTo']) {
                    var assocSchema = schema.associations['belongsTo'][assocName];
                    var foreignKey = assocSchema.foreignKey;
                
                    var foreignValue = data[foreignKey];

                    if(typeof foreignValue != 'undefined') {
                        var assocModel = model._getAssociationModel(assocName);
                        data[assocName] = assocModel.find('id', {
                            conditions: foreignValue,
                            recursive: 0
                        });
                    }
                }
            }

            // process hasOne
            if(typeof schema.associations['hasOne'] == 'object') {
                for (var assocName2 in schema.associations['hasOne']) {
                    var foreignKey2 = schema.foreignKey;
                    var foreignValue2 = data.id;

                    if(typeof foreignValue2 != 'undefined') {
                        var assocModel2 = model._getAssociationModel(assocName2);
                        data[assocName2] = assocModel2.find('first', {
                            conditions: foreignKey2 + " = '"+foreignValue2 + "'",
                            recursive: 0
                        });
                    }
                }
            }


            // process hasMany
            if(typeof schema.associations['hasMany'] == 'object') {
                for (var assocName3 in schema.associations['hasMany']) {
                    var foreignKey3 = schema.foreignKey;
                    var foreignValue3 = data.id;

                    if(typeof foreignValue3 != 'undefined') {
                        var assocModel3 = model._getAssociationModel(assocName3);
                        data[assocName3] = assocModel3.find('all', {
                            conditions: foreignKey3 + " = '"+foreignValue3 +"'",
                            recursive: 0
                        });
                    }
                }
            }

            results.push(data);
        });
        delete datas;
    }catch($e){
        this.log("ERROR","GeckoJS.DatasourceJsonFile: An error occurred executing the _queryAssociations \n" , e);
    }
    
    return results;
};



/**
 * Retrieves a data item from a model based on its id.
 *
 * @name GeckoJS.DatasourceJsonFile#querySelectById
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} fields        This is the query fields
 * @param {String} id               This is the id of the data item to retrieve
 * @param {Number} recursive             This is the query recursive
 * @return {Object}                  The data item
 */
GeckoJS.DatasourceJsonFile.prototype.querySelectById = function(model, fields, id, recursive){
    
    recursive = typeof recursive != 'undefined' ? recursive : 1;

    var table = model.table;

    try {
    
        var db = this.readTableFile(table);

        if (!db) {

            /* ifdef DEBUG 
            this.log('DEBUG', 'querySelectById > ' + table + ',, error or missing database');
            /* endif DEBUG */

            return null;
        }


        var resultSet = db.get(id);
        var result = null;
        
        if(resultSet != null) {
            result = GeckoJS.BaseObject.clone(resultSet);
        }
        delete resultSet;


        result[model.name] = GREUtils.extend({}, result);

        if (recursive == 1) {
            return this._queryAssociations(model, [result], recursive)[0];
        }else {
            return result;
        }
        
        
    //        return resultSet;
        
    }
    catch (e) {
        this.log("ERROR","GeckoJS.DatasourceJsonFile: An error occurred executing the byId command\n" , e);
        return null;
    }
    
};


/**
 * Returns the number of data items in a model where the property indicated
 * by the "index" parameter is equal to the "value" parameter.<br/>
 * <br/>
 * If page size or page number is given, returns only the number of data items
 * in the requested page of the result set.
 *
 * @name GeckoJS.DatasourceJsonFile#querySelectCountByIndex
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} index            This is the index property
 * @param {Object} value            This is the index value
 * @param {String} group            This is the group by fields
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @return {Number}                 The number of rows in the result set
 */
GeckoJS.DatasourceJsonFile.prototype.querySelectCountByIndex = function(model, index, value, group, order, limit, page){
    return this.querySelectByIndex(model, "", index, value, group, order, limit, page, 0).length;
};


/**
 * Retrieves from a model data items where the property indicated by the
 * "index" parameter is equal to the "value" parameter, sorted in the
 * specified order.<br/>
 * <br/>
 * If page size or page number is given, returns only the data items in the
 * requested page of the result set.
 *
 * @name GeckoJS.DatasourceJsonFile#querySelectByIndex
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} fields        This is the query fields
 * @param {String} index            This is the index property
 * @param {Object} value            This is the index value
 * @param {String} group            This is the group by fields
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @param {Number} recursive             This is the query recursive
 * @return {Object}                  The result set
 */
GeckoJS.DatasourceJsonFile.prototype.querySelectByIndex = function(model, fields, index, value, group, order, limit, page, recursive){

    recursive = typeof recursive != 'undefined' ? recursive : 1;
    
    // sdk for json not support quick index.
    var conditions = index + " = '" + value + "'";
    return this.querySelect(model, fields, conditions, group, order, limit, page, recursive);
    
};


/**
 * Inserts data into a model.<br/>
 * <br/>
 * The ID used to uniquely identify the data is taken from model.id.
 *
 * @name GeckoJS.DatasourceJsonFile#executeInsert
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {Object} data             This is the data
 * @return {Number}                 The ID used to insert the data
 */
GeckoJS.DatasourceJsonFile.prototype.executeInsert = function(model, data){

    var table = model.table;

    try {

        var db = this.readTableFile(table);

        if (!db) {

            /* ifdef DEBUG 
            this.log('DEBUG', 'executeInsert > error or missing database');
            /* endif DEBUG */

            return false;
        }


        var key = data[model.primaryKey];

        if (key.toString().length == 0) {
            // auto generate schema and save to data
            // data['__schema'] = model.schema();
            data[model.primaryKey] = key = GeckoJS.String.uuid();
        }


        db.set(key, data);

        var r = this.saveTableFile(table, db);

        model.setInsertID(key);
        model.id = key;
        return r;
        
    }
    catch (e) {
        this.log("ERROR","GeckoJS.DatasourceJsonFile: An error occurred executing the insert command\n", e);
    }
    return false;

};


/**
 * Replaces a data item in a model.<br/>
 * <br/>
 * This method replaces a data item stored in the model with the new data item.
 * The data item to replace is identified by an internal model ID
 * (model.id).<br/>
 * <br/>   
 * The operation fails and returns 0 if id does not exist in the model. 
 *
 * @name GeckoJS.DatasourceJsonFile#executeUpdate
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {Object} data             This is the new data
 * @return {Number}                 The number of rows updated
 */
GeckoJS.DatasourceJsonFile.prototype.executeUpdate = function(model, data){

    var table = model.table;
    
    try {
    
        var db = this.readTableFile(table);

        if (!db) {

            /* ifdef DEBUG 
            this.log('DEBUG', 'executeUpdate > error or missing database');
            /* endif DEBUG */

            return false;
        }


        var key = model.id;
        
        if (db.containsKey(key)) {
            
            var dataOrg = db.get(key);
            dataOrg = GREUtils.extend(dataOrg, data);
            db.set(key, dataOrg);
            
            var r = this.saveTableFile(table, db);

            return r;
        }

    }
    catch (e) {
        this.log("ERROR", "GeckoJS.DatasourceJsonFile: An error occurred executing the update command\n" , e);
    }
    return false;
    
};


/**
 * Removes the data item associated with an id from a model.<br/>
 * <br/>
 * If id is not given, then internal model ID (model.id) is used.<br/>
 * <br/>
 * The operation fails and returns 0 if id does not exist in the model. 
 *
 * @name GeckoJS.DatasourceJsonFile#executeDelete
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} id               This is the id
 * @return {Number}                 The number of rows deleted
 */
GeckoJS.DatasourceJsonFile.prototype.executeDelete = function(model){

    var table = model.table;
    
    try {
    
        var db = this.readTableFile(table);

        if (!db) {

            /* ifdef DEBUG 
            this.log('DEBUG', 'executeDelete > error or missing database');
            /* endif DEBUG */

            return false;
        }

        //keys = db.getKeys();
        //key = keys[id-1];
        var key = model.id;
        
        if (db.containsKey(key)) {

            /* ifdef DEBUG 
            this.log('DEBUG', 'executeDelete > remove key: ' + key);
            /* endif DEBUG */

            db.remove(key);
            var r = this.saveTableFile(table, db);
            return r;
        }
        return false;
    }
    catch (e) {
        this.log("ERROR", "GeckoJS.DatasourceJsonFile: An error occurred executing the delete command\n", e);
    }
    return false;
    
};



/**
 * Deletes all the records in a table and resets the count of the auto-incrementing
 * primary key, where applicable.
 *
 * @name GeckoJS.DatasourceJsonFile#truncate
 * @public
 * @function
 * @param {String} table A string or model class representing the table to be truncated
 * @return {Boolean}	SQL TRUNCATE TABLE statement, false if not applicable.
 */
GeckoJS.DatasourceJsonFile.prototype.truncate = function (model) {

    try {
        var table = model.table;
        var r = this.saveTableFile(table, null);
        return r;
    }
    catch (e) {
        this.log("ERROR", "GeckoJS.DatasourceJsonFile: An error occurred executing the truncate command\n", e);
        return false;
    }


};

/**
 * Returns an array of the fields in given table name.
 *
 * @name GeckoJS.DatasourceJsonFile#describe
 * @public
 * @function
 * @param {GeckoJS.Model} model
 * @return {Object} Fields in table
 */
GeckoJS.DatasourceJsonFile.prototype.describe = function(model) {

    // return sqlite style 
    return {
        id: {
            name: 'id',
            type: 'VARCHAR',
            notnull: 1,
            pk: 1
        }
        };

};


/**
 * is Field Name in table
 *
 * @name GeckoJS.DatasourceJsonFile#hasField
 * @public
 * @function
 * @param {GeckoJS.Model} model
 * @param {String} field
 * @return {Boolean}
 */
GeckoJS.DatasourceJsonFile.prototype.hasField = function(model, field) {

    return true;

};

/**
 * Queries the database with given SQL statement, and obtains some metadata about the result
 * (rows affected, timing, any errors, number of rows in resultset). The query is also logged.
 * If DEBUG is set, the log is shown all the time, else it is only shown on errors.
 *
 * @name GeckoJS.DatasourceJsonFile#execute
 * @public
 * @function
 * @param string $sql
 * @param array $options
 * @return mixed Resource or object representing the result set, or false on failure
 */
GeckoJS.Datasource.prototype.execute = function (sql, params, waiting) {
    return true;
};

/**
 * Defines GeckoJS.DatasourceJsonFile namespace
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.DatasourceSQL', GeckoJS.global);

/**
 * 
 * @class GeckoJS.DatasourceSQL
 *
 * @name GeckoJS.DatasourceSQL
 * @extends GeckoJS.Datasource 
 * @property {GeckoJS.Map} data                Data cache (read-only)
 *
 * @property {String} startQuote
 * @property {String} endQuote
 * @property {Boolean} isConnected      Is the connection currently open? Recall that even if the answer is no the connection would automatically be opened when needed.
 * @property {Boolean} closeAfterExecute
 *
 */
GeckoJS.DatasourceSQL = GeckoJS.Datasource.extend('DatasourceSQL',
/** @lends GeckoJS.DatasourceSQL.prototype */
{
    
    /**
     * GeckoJS.DatasourceSQL contructor
     *
     * @name GeckoJS.DatasourceSQL#init
     * @public
     * @function
     * @param {Object} config
     */
    init: function(config){

        this._super(config);

        this._tables = null;

        this.conn = null;

        this.connected = false;

        this._queryCache = {};

        this._result = null;
        this._statement = null;

        this.lastError = 0;
        this.lastErrorString = "";

    }
});

// startQuote
GeckoJS.DatasourceSQL.prototype.startQuote = "`" ;

// endQuote
GeckoJS.DatasourceSQL.prototype.endQuote = "`" ;

// isConnected
GeckoJS.DatasourceSQL.prototype.__defineGetter__('isConnected', function() {
    return (this.conn != null && this.connected);
});

GeckoJS.DatasourceSQL.prototype.__defineGetter__('closeAfterExecute', function() {
    return (this.config.closeAfterExecute || false);
});



/**
 * connect
 *
 * @name GeckoJS.DatasourceSQL#connect
 * @public
 * @function
 */
GeckoJS.DatasourceSQL.prototype.connect = function(){

    if (this.isConnected) return this.connected;

    try {
        /* ifdef DEBUG 
        this.log('DEBUG', 'connect > _connect ');
        /* endif DEBUG */
        this._connect();
        

    }catch(e) {
        this.log('ERROR', 'ERROR connect ' + e.message);
    }
    return this.connected;
   
};


/**
 * reconnect
 *
 * @name GeckoJS.DatasourceSQL#reconnect
 * @public
 * @function
 */
GeckoJS.DatasourceSQL.prototype.reconnect = function(){

    if (this.isConnected) this.disconnect();

    return this.connect();

};

/**
 * disconnect
 *
 * @name GeckoJS.DatasourceSQL#disconnect
 * @public
 * @function
 */
GeckoJS.DatasourceSQL.prototype.disconnect = function(){

    if (!this.isConnected) return this.connected;
    
    try {
        /* ifdef DEBUG 
        this.log('DEBUG', 'disconnect > _disconnect ');
        /* endif DEBUG */
        this._disconnect();
    }catch(e) {
        this.log('ERROR', 'ERROR disconnect ' + e.message);
    }
    
    return this.connected;

};


/**
 * Retrieves from a model data items that satisfy the given query condition,
 * sorted in the specified order.<br/>
 * <br/>
 * If page size or page number is given, returns only data items in the requested
 * page of the result set.
 *
 * @name GeckoJS.DatasourceSQL#querySelect
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} fields        This is the query fields
 * @param {String} conditions        This is the query conditions
 * @param {String} group            This is the group by fields
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @param {Number} recursive         This is the query recursive
 * @return {Object}                  The result set
 */
GeckoJS.DatasourceSQL.prototype.querySelect = function(model, fields, conditions, group, order, limit, page, recursive){

    fields = fields || "";
    conditions = conditions || "";
    order = order || "";
    group = group || "";

    limit = (typeof limit != 'undefined' && limit !== null) ? parseInt(limit) : 3000;
    page = (typeof page != 'undefined' && page !== null) ? parseInt(page) : 1;

    recursive = (typeof recursive != 'undefined' && recursive !== null) ? recursive : model.recursive;

    var offset = ( ((page-1)<=0 ? 0: page-1) * limit);

    var table = model.table;
    
    try {

        if(fields.length > 0) {
            this.__bypass = true;
            fields = this.fields(model, fields);
        }else {
            this.__bypass = false;
            fields = this.fields(model);
        }

        var schema = model.schema();

        var queryData = {
            fields: fields,
            conditions: conditions,
            order: order,
            limit: limit,
            offset: offset,
            group: group,
            joins: []
        };

        if (recursive >=1) {
            for (var type in schema.associations ) {
                for (var assocName in schema.associations[type]) {
                    var assocData = schema.associations[type][assocName];
                    var assocModel = model[assocName];

                    if(typeof assocModel == 'undefined') continue;

                    // use the same datasource
                    if (model.useDbConfig == assocModel.useDbConfig) {
                        if (true === this._generateAssociationQuery(model, assocModel, type, assocName, assocData, queryData)) {
                            // hasOne belongsTo
                        }
                    }
                }
            }
        }

        var query = this._generateAssociationQuery(model, null, null, null, null, queryData);

        /* ifdef DEBUG 
        this.log('DEBUG', "querySelect > fetchAll: " + query);
        /* endif DEBUG */

        var result = this.fetchAll(query, [], false, model);

        // has ERROR
        if (result === false) {
            //model.onError();
            return false;
        }
        
        if (recursive > 1) {
            // fetch hasMany

            for (var type in schema.associations) {
                for (var assocName in schema.associations[type]) {
                    var assocData = schema.associations[type][assocName];
                    var assocModel = model[assocName];

                    if(typeof assocModel == 'undefined') continue;

                    // use the same datasource
                    if (model.useDbConfig == assocModel.useDbConfig) {

                        // queryAssociation
                        // and store to result
                        this._queryAssociations(model, assocModel, type, assocName, assocData, queryData, result, recursive);
                        
                    }
                }
            }
            
        }

        return result;

    }
    catch (e) {
        this.log("ERROR","GeckoJS.DatasourceSql: An error occurred executing the querySelect (" + conditions + ")command\n" , e);
        return false;
    }
    
};


/**
 * Generates an array representing a query or part of a query from a single model or two associated models
 *
 * @name GeckoJS.DatasourceSQL#_generateAssociationQuery
 * @private
 * @function
 * @param {GeckoJS.Model} model         This is the model
 * @param {GeckoJS.Model} assocModel    This is the association model
 * @param {String} type                 This is the association type
 * @param {String} assocName            This is the association model name
 * @param {Object} assocSchema          This is the association model 's schema
 * @param {Object} queryData            This is the Query Data to be prepare
 * @return {Boolean|null}               The query statement
 */
GeckoJS.DatasourceSQL.prototype._generateAssociationQuery = function(model, assocModel, type, assocName, assocSchema, queryData) {

    if (!queryData['fields'] || queryData['fields'].length <= 0) {
        queryData['fields'] = this.fields(model);
    } else if (model.hasMany.length > 0 && model.recursive > -1) {
        // must include primarykey in fields
        var assocFields = this.fields(model, model.table+'.'+model.primaryKey);
        var passedFields = this.fields(model, queryData['fields']);

        if (passedFields.length === 1) {
            if (passedFields[0] != assocFields[0] && passedFields[0].indexOf('COUNT(') == -1) {
                passedFields.splice(1,0,assocFields[0]);
            }
            queryData['fields'] = passedFields.concat([]);

        } else {
            passedFields.splice(passedFields.length,0,assocFields[0]);
            queryData['fields'] = passedFields.concat([]);
        }
        delete assocFields;
        delete passedFields;
    }

    

    // no assocModel just return statement
    if (assocModel == null) {

        return this.buildStatement( {
            'fields': GeckoJS.Array.unique(queryData['fields']),
            'table': model.table,
            'limit': queryData['limit'],
            'offset': queryData['offset'],
            'joins': queryData['joins'],
            'conditions': queryData['conditions'],
            'order': queryData['order'],
            'group': queryData['group']
        }, model );
    }

    // process assoc model
    var isSelf = model.name == assocModel.name;
    var schema = model.schema();
    var association = assocSchema.association || false;
    var assocFields = [];
    var assocConditions = "";
    var join = {};
    var query = {};

    if ( (type == 'hasOne' || type == 'belongsTo') && this.__bypass === false) {
        if (association) {
            assocFields = this.fields(assocModel, association.fields);
        }else {
            assocFields = this.fields(assocModel);
        }
    }

    switch(type) {

        case 'hasOne':
            
            if (association){
                
                assocConditions = this.name(schema.table+'.'+association.primaryKey) + ' = ' +
                this.name(association.table+'.'+association.foreignKey);

                if (association.conditions) assocConditions += ' AND ' + association.conditions

            }else {
                assocConditions = this.name(schema.table+'.'+schema.primaryKey) + ' = ' +
                this.name(assocSchema.table+'.'+schema.foreignKey);
            }

            join = {
                'table': assocSchema.table,
                'type': 'LEFT',
                'conditions': this.conditions(assocModel, assocConditions, true)
            };

            queryData['fields'] = queryData['fields'].concat(assocFields);

            if (GeckoJS.Array.inArray(join, queryData['joins']) == -1) {
                queryData['joins'].push(join);
            }

            delete join;
            delete assocFields;
            delete assocConditions;

            return true;
            break;

        case 'belongsTo':

            if (association){

                assocConditions = this.name(schema.table+'.'+association.foreignKey) + ' = ' +
                this.name(association.table+'.'+association.primaryKey);

                if (association.conditions) assocConditions += ' AND ' + association.conditions

            }else {
                assocConditions = this.name(schema.table+'.'+assocSchema.foreignKey) + ' = ' +
                this.name(assocSchema.table+'.'+schema.primaryKey);
            }


            join = {
                'table': assocSchema.table,
                'type': 'LEFT',
                'conditions': this.conditions(assocModel, assocConditions, true)
            };

            queryData['fields'] = queryData['fields'].concat(assocFields);

            if (GeckoJS.Array.inArray(join, queryData['joins']) == -1) {
                queryData['joins'].push(join);
            }

            delete join;
            delete assocFields;
            delete assocConditions;

            return true;
            break;

        case 'hasMany':
                
            if (association) {
                assocFields = this.fields(assocModel, association.fields);
            }else {
                assocFields = this.fields(assocModel);
            }

            assocConditions = this.name(assocSchema.table+'.'+association.foreignKey) + ' IN ( {__$FOREIGN_IDS$__} ) ';

            query = {
                'table': assocSchema.table,
                'conditions': this.conditions(assocModel, assocConditions),
                'fields': assocFields,
                'limit': (association['limit'] || 3000)
            };

            break;

    }

    if (query['table']) {
        var sql = this.buildStatement(query, model);
        return sql;
    }
    return null;

};

/**
 * Query Associations Data
 *
 * @name GeckoJS.DatasourceSQL#_queryAssociations
 * @private
 * @function
 * @param {GeckoJS.Model} model         This is the model
 * @param {GeckoJS.Model} assocModel    This is the association model
 * @param {String} type                 This is the association type
 * @param {String} assocName            This is the association model name
 * @param {Object} assocData            This is the association model 's schema
 * @param {Object} queryData            This is the Query Data to be prepare
 * @param {Array} result                This is the query result
 * @param {Number} recursive            This is the query recursive
 * @return {Array|null}                 The query result
 */
GeckoJS.DatasourceSQL.prototype._queryAssociations = function(model, assocModel, type, assocName, assocData, queryData, result, recursive) {

    recursive = typeof recursive != 'undefined' ? recursive : 1;

    var count = result ? result.length : 0;

    var association = assocData.association;
    
    if (count >0) {

        if (type == 'hasMany' && association['primaryKey']) {
            
            var queryData2 = {fields: [association['primaryKey']]};
            var query = this._generateAssociationQuery(model, assocModel, type, assocName, assocData, queryData2);

            var ids = [], idmaps={}, assocResults = [];

            for (var i = 0; i < count; i++) {
                // ids= $in;
                var id = result[i][association['primaryKey']].toString();

                if (id.length == 0) continue;
                
                // only query uniqid
                if(typeof idmaps[id] == 'undefined'){
                    idmaps[id] = [i];
                    ids.push(id);
                }else {
                    idmaps[id].push(i);
                }
            }

            query = query.replace('{__$FOREIGN_IDS$__}', "'" + ids.join("', '") +"'") ;

            /* ifdef DEBUG 
            this.log('TRACE', '_queryAssociations query hasMany  = ' + query);
            /* endif DEBUG */

            assocResults =  this.fetchAll(query );

            if(assocResults) {
                //merge to result
                this._mergeHasMany(result, assocResults, model, assocModel, assocName, assocData, idmaps);
            }

            delete ids;
            delete idmaps;
            delete assocResults;
            
        }
    }
    return null;
};


/**
 * _mergeHasMany
 *
 * @name GeckoJS.DatasourceSQL#_mergeHasMany
 * @private
 * @function
 * @param {Array} result                This is the query result
 * @param {Array} assocResults          This is the query association result
 * @param {GeckoJS.Model} model         This is the model
 * @param {GeckoJS.Model} assocModel    This is the association model
 * @param {String} assocName            This is the association model name
 * @param {Object} assocData            This is the association model 's schema
 * @param {Object} idmaps               This is the Query id mapping Data
 * @return {Array|null}                 The query result
 */
GeckoJS.DatasourceSQL.prototype._mergeHasMany = function(result, assocResults, model, assocModel, assocName, assocData, idmaps)  {

    /* ifdef DEBUG 
    this.log('TRACE', '_mergeHasMany ' + assocName);
    /* endif DEBUG */

    var association = assocData.association;

    assocResults.forEach(function(assoc) {

        var d = assoc[assocName];

        if (!d) return;

        var foreignId = d[association.foreignKey];

        // multiple idmaps
        var resultIndexs = idmaps[foreignId];

        if(typeof resultIndexs == 'undefined' ||  resultIndexs.length == 0) return;
            
        resultIndexs.forEach(function(resultIndex) {

            if(!result[resultIndex]) return;

            // init hasMany array
            if(!result[resultIndex][assocName]) result[resultIndex][assocName] = [];

            result[resultIndex][assocName].push(d);

        });

    });

};

/**
 * Returns the size of the result set containing data items from model that
 * satisfy the given query condition.<br/>
 * <br/>
 * If page size or page number is given, returns only the number of data items
 * in the requested page of the result set.
 *
 * @name GeckoJS.DatasourceSQL#querySelectCount
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {Object} conditions       This is the query conditions
 * @param {String} group            This is the group by fields
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @return {Number}                 The number of rows in the result set
 */
GeckoJS.DatasourceSQL.prototype.querySelectCount = function(model, conditions, group, order, limit, page){

    var fields = model.primaryKey ? "COUNT("+model.primaryKey+") AS count" : "COUNT(*) AS count";
    var result = this.querySelect(model, fields, conditions, group, order, limit, page, 0);
    if(result && result.length > 0) {
        return result[0]['count'];
    }
    return 0;
    
};


/**
 * Retrieves a data item from a model based on its id.
 *
 * @name GeckoJS.DatasourceSQL#querySelectById
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} fields        This is the query fields
 * @param {String} id               This is the id of the data item to retrieve
 * @return {Object}                  The data item
 */
GeckoJS.DatasourceSQL.prototype.querySelectById = function(model, fields, id, recursive){

    if (!model || typeof id =='undefined') return null;
    
    var table = model.table;

    var conditions =  table+'.'+model.primaryKey +"='"+ id+"'";
    var result = this.querySelect(model, fields, conditions, null, null, 1, 1, recursive);
    if(result && result.length > 0) {
        return result[0];
    }
    return null;
    
};


/**
 * Returns the number of data items in a model where the property indicated
 * by the "index" parameter is equal to the "value" parameter.<br/>
 * <br/>
 * If page size or page number is given, returns only the number of data items
 * in the requested page of the result set.
 *
 * @name GeckoJS.DatasourceSQL#querySelectCountByIndex
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} index            This is the index property
 * @param {Object} value            This is the index value
 * @param {String} group            This is the group by fields
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @return {Number}                 The number of rows in the result set
 */
GeckoJS.DatasourceSQL.prototype.querySelectCountByIndex = function(model, index, value, group, order, limit, page){

    var result = this.querySelectByIndex(model, "COUNT(*) AS count", index, value, group, order, limit, page, 0);
    if(result && result.length > 0) {
        return result[0]['count'];
    }
    return 0;

};


/**
 * Retrieves from a model data items where the property indicated by the
 * "index" parameter is equal to the "value" parameter, sorted in the
 * specified order.<br/>
 * <br/>
 * If page size or page number is given, returns only the data items in the
 * requested page of the result set.
 *
 * @name GeckoJS.DatasourceSQL#querySelectByIndex
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} fields           This is the query fields
 * @param {String} index            This is the index property
 * @param {Object} value            This is the index value
 * @param {String} group            This is the group by fields
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @return {Object}                  The result set
 */
GeckoJS.DatasourceSQL.prototype.querySelectByIndex = function(model, fields, index, value, group, order, limit, page, recursive){


    if (!model) return null;

    var table = model.table;

    var conditions =  table+'.'+index +"='"+ value+"'";

    var result = this.querySelect(model, fields, conditions, group, order, limit, page, recursive);
    
    return result;

};


/**
 * Inserts data into a model.<br/>
 * <br/>
 * The ID used to uniquely identify the data is taken from model.id.
 *
 * @name GeckoJS.DatasourceSQL#executeInsert
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {Object} data             This is the data
 * @return {Number}                 The ID used to insert the data
 */
GeckoJS.DatasourceSQL.prototype.executeInsert = function(model, data){

    var table = model.table;

    try {

        var fields = [], values = [], values_fields = [];

        var index = 0;
        for (var field in data ) {
            var val = data[field];

            if(this.hasField(model, field)) {
                index++;
                fields.push(this.name(field));
                values_fields.push('?'+index);

                // get declare type
                var fieldInfo = model.getFieldsInfo(field);

                if ( fieldInfo ) {
                    var declaredType = fieldInfo.type;

                    if(declaredType.match(/bool/i)) {
                        val = GeckoJS.String.parseBoolean(val) ? 1 : 0;
                    }
                }
                
                values.push(val);
            }
        }

        /* ifdef DEBUG 
        this.log('DEBUG', 'executeInsert > execute > renderStatement ' );
        /* endif DEBUG */
        
        var result = this.execute(this.renderStatement('insert', {
            table: table,
            values: values_fields.join(', '),
            fields: fields.join(', ')
            }), values);

        if (result) {
            var key = data[model.primaryKey];
            if(!key) {
                // auto increment ?
                key = this.getLastInsertId();
            }
            data[model.primaryKey] = key ;
            model.id = key;
            model.setInsertID(key);
            return true
        }
    }
    catch (e) {
        this.log("ERROR","GeckoJS.DatasourceSql: An error occurred executeInsert " + this.dump(data)+ "command\n", e);
    }
    return false;

};


/**
 * Replaces a data item in a model.<br/>
 * <br/>
 * This method replaces a data item stored in the model with the new data item.
 * The data item to replace is identified by an internal model ID
 * (model.id).<br/>
 * <br/>   
 * The operation fails and returns 0 if id does not exist in the model. 
 *
 * @name GeckoJS.DatasourceSQL#executeUpdate
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {Object} data             This is the new data
 * @return {Number}                 The number of rows updated
 */
GeckoJS.DatasourceSQL.prototype.executeUpdate = function(model, data){

    try {
           
        var key = model.id || null;
        var table = model.table;

        if(key === null) return 0;

        var conditions = null;

        conditions = this.defaultConditions(model, conditions);

        if (conditions === false) return 0;

        var fields = [], values = [];

        var index = 0;
        for (var field in data ) {
            var val = data[field];

            if(this.hasField(model, field)) {
                index++;
                var fieldStr = this.name(field) + ' = ?'+index;
                fields.push(fieldStr);
                values.push(val);
            }
        }

        /* ifdef DEBUG 
        this.log('DEBUG', 'executeUpdate > execute > renderStatement' );
        /* endif DEBUG */

        var result = this.execute(this.renderStatement('update', {
            table: table,
            conditions: conditions,
            fields: fields.join(', ')
            }), values);

        return result;
        
    }
    catch (e) {
        this.log("ERROR", "GeckoJS.DatasourceSql: An error occurred executeUpdate " + this.dump(data)+ " command\n" , e);
    }
    return false;
    
};


/**
 * Removes the data item associated with an id from a model.<br/>
 * <br/>
 * If id is not given, then internal model ID (model.id) is used.<br/>
 * <br/>
 * The operation fails and returns 0 if id does not exist in the model. 
 *
 * @name GeckoJS.DatasourceSQL#executeDelete
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} id               This is the id
 * @return {Number}                 The number of rows deleted
 */
GeckoJS.DatasourceSQL.prototype.executeDelete = function(model){

    try {
    
        var key =  model.id;
        var table = model.table;

        if (key === null) return 0;

        var conditions = null;

        conditions = this.defaultConditions(model, conditions);

        if (conditions === false) return 0;

        /* ifdef DEBUG 
        this.log('DEBUG', 'executeDelete > execute > renderStatement' );
        /* endif DEBUG */

        var result = this.execute(this.renderStatement('delete', {
            table: this.name(table),
            conditions: conditions
        }), []);

        return result;
    }
    catch (e) {
        this.log("ERROR", "GeckoJS.DatasourceSql: An error occurred executeDelete " + key + " command\n", e);
    }
    return false;
    
};


/**
 * Begins a transaction.
 *
 * @name GeckoJS.DatasourceSQL#begin
 * @public
 * @function
 * @param {Boolean} waiting waiting if database is locked
 * @return {Boolean} true if transaction begin
 */
GeckoJS.DatasourceSQL.prototype.begin = function(waiting)	{

    return this.execute("BEGIN", waiting);

};


/**
 * Commits a transaction.
 *
 * @name GeckoJS.DatasourceSQL#commit
 * @public
 * @function
 * @param {Boolean} waiting waiting if database is locked
 * @return {Boolean} true if transaction commit
 */
GeckoJS.DatasourceSQL.prototype.commit = function(waiting) {

    return this.execute("COMMIT", waiting);

};

/**
 * Rolls back a transaction.
 *
 * @name GeckoJS.DatasourceSQL#rollback
 * @public
 * @function
 * @param {Boolean} waiting waiting if database is locked
 * @return {Boolean} true if transaction rollback
 */
GeckoJS.DatasourceSQL.prototype.rollback = function(waiting) {

    return this.execute("ROLLBACK", waiting);
    
};


/**
 * Returns an array of all result rows for a given SQL query.
 * Returns false if no rows matched.
 *
 * @name GeckoJS.DatasourceSQL#fetchAll
 * @public
 * @function
 * @param {String} sql SQL statement
 * @param {Array} params parameters for prepare SQL statement
 * @param {Boolean} cache Enables returning/storing cached query results
 * @param {GeckoJS.Model} model [optional] Model for prepare result array
 * @return {Array} Array of resultset rows, or false if no rows matched
 */
GeckoJS.DatasourceSQL.prototype.fetchAll = function (sql, params, cache, model) {

    cache = cache || false;
        
    if (cache && this._queryCache[sql]) {
        if (sql.match(/^\s*select/i)) {
            return this._queryCache[sql];
        }
    }

    params = params || [];

    /* ifdef DEBUG 
    this.log('DEBUG', "fetchAll > execute " + sql + ((model) ? '\n'+model.name : '') );
    /* endif DEBUG */

    if (this.execute(sql, params)) {

        var out = [];

        var first = this.fetchResult(model);

        if (first != null){
            out.push(first);
        }

        var item = this.fetchResult(model);

        while (item) {
            out.push(item);
            item = this.fetchResult(model);
        }

        if (cache) {
            if (sql.match(/^\s*select/i)) {
                this._queryCache[sql] = out;
            }
        }
        return out;

    } else {
        var errorCode = this.lastError ;
        var errorString = this.lastErrorString ;

        if (this.lastError == 0) {
            return [];
        }
        /* ifdef DEBUG 
        this.log('DEBUG', 'fetchAll > failure: ' + errorCode + '\n' + errorString +'\n'+ sql);
        /* endif DEBUG */
        return false;
    }
};

/**
 * Queries the database with given SQL statement
 *
 * @name GeckoJS.DatasourceSQL#execute
 * @public
 * @function
 * @param {String} sql
 * @param {Array} params
 * @param {Boolean} 	waiting waiting if database is locked
 * @return {Boolean}    true or false on failure
 */
GeckoJS.DatasourceSQL.prototype.execute = function (sql, params, waiting) {

    params = params || [];

	if(typeof waiting =='undefined') waiting = true;

    this.connect(); // In case it hasn't been opened

    try {

        this._result = this._execute(sql, params);

    }catch(e) {

        this.log('WARN', 'ERROR execute sql ' + e.message);
        
    }finally {

        
        try	{
            if (this._result && this.closeAfterExecute)	{
                /* ifdef DEBUG 
                this.log('DEBUG', "Closing the connection");
                /* endif DEBUG */
                this.close();
            }

            return this._result;
        }
        catch (e) {
            this.log("WARN","Error trying to close the statement: " + e);
        }
    }

    return false;

};


/**
 * Checks if the result is valid
 *
 * @name GeckoJS.DatasourceSQL#hasResult
 * @public
 * @function
 * @return {Boolean} True if the result is valid else false
 */
GeckoJS.DatasourceSQL.prototype.hasResult = function() {
    
    if (this._result !== null) {

        if (typeof this._result == 'boolean') return this._result

        return true;
    }
    return false;
    
};


/**
 * Builds and generates a JOIN statement from an array.	 Handles final clean-up before conversion.
 *
 * @name GeckoJS.DatasourceSQL#buildJoinStatement
 * @public
 * @function
 * @param {Array} join An array defining a JOIN statement in a query
 * @return {String} An SQL JOIN statement to be used in a query
 */
GeckoJS.DatasourceSQL.prototype.buildJoinStatement = function(join) {

    var data = GREUtils.extend({
        type: '',
        table: '',
        conditions: ''
    }, join);

    return this.renderJoinStatement(data);
};


/**
 * Builds and generates an SQL statement from an array.	 Handles final clean-up before conversion.
 *
 * @name GeckoJS.DatasourceSQL#buildStatement
 * @public
 * @function
 * @param {Object} query            An query defining an SQL query
 * @param {GeckoJS.Model} model     The model object which initiated the query
 * @return {String} An executable SQL statement
 */
GeckoJS.DatasourceSQL.prototype.buildStatement = function(query, model) {
    
    query = GREUtils.extend({
        'limit': 3000,
        'offset': 0,
        'joins': []
    }, query);

    if (query['joins'].length >0) {

        var count = query['joins'].length ;

        for (var i = 0; i < count; i++) {
            if (typeof query['joins'][i] == 'object') {
                query['joins'][i] = this.buildJoinStatement(query['joins'][i]);
            }
        }
    }
        
    return this.renderStatement('select', {
        'conditions': this.conditions(model, query['conditions']),
        'fields': query['fields'].join(', '),
        'table': query['table'],
        'order': this.order(query['order']),
        'limit': this.limit(query['limit'], query['offset']),
        'joins': query['joins'].join(' '),
        'group': this.group(query['group'])
    });
};

/**
 * Renders a final SQL JOIN statement
 *
 * @name GeckoJS.DatasourceSQL#renderJoinStatement
 * @public
 * @function
 * @param {Object} data
 * @return {String}
 */
GeckoJS.DatasourceSQL.prototype.renderJoinStatement = function(data) {
    
    if (data.conditions.length == 0 || data.table.length == 0 || data.type.length == 0) return  "" ;

    return data.type +" JOIN " + data.table +" ON (" + data.conditions +")";
};


/**
 * Renders a final SQL statement by putting together the component parts in the correct order
 *
 * @name GeckoJS.DatasourceSQL#renderStatement
 * @public
 * @function
 * @param {String} type     Type of SQL statement to render
 * @param {Object} data     The data
 * @return {String} An executable SQL statement
 */
GeckoJS.DatasourceSQL.prototype.renderStatement = function(type, data) {

    switch (type.toLowerCase()) {

        case 'select':
            return "SELECT " + data.fields + " FROM " + data.table + " " + data.joins + " " + data.conditions + " " + data.group + " " + data.order + " " + data.limit;
            break;

        case 'insert':
            // because vivipos use uuid as id, so try to replace if id exists
            return "INSERT OR REPLACE INTO " + data.table + " (" + data.fields + ") VALUES (" + data.values + ")";
            break;

        case 'update':
            return "UPDATE " + data.table + " SET " + data.fields + " WHERE " + data.conditions;
            break;

        case 'delete':
            return "DELETE FROM " + data.table + " WHERE " + data.conditions ;
            break;
          
        case 'alter':
            break;
    }
};



/**
 * Creates a default set of conditions from the model.
 *
 * @name GeckoJS.DatasourceSQL#defaultConditions
 * @public
 * @function
 * @param {GeckoJS.Model} model
 * @param {String} conditions
 * @return {String}
 */
GeckoJS.DatasourceSQL.prototype.defaultConditions = function (model, conditions) {

    conditions = conditions || false;

    if (conditions) return conditions;

    if (!model.id) return false;

    var table = model.table;

    return this.name(table+'.'+model.primaryKey) +"='"+ model.id+"'";

};


/**
 * Creates a default set of conditions from the model if $conditions is null/empty.
 *
 * @name GeckoJS.DatasourceSQL#conditions
 * @public
 * @function
 * @param {GeckoJS.Model} model
 * @param {String} conditions
 * @param {Boolean} where         true is where clause preset.
 * @return {String}
 */
GeckoJS.DatasourceSQL.prototype.conditions = function (model, conditions, where) {

    where = typeof where != 'undefined'? where : false;
    conditions = conditions || "";

    var clause = ' WHERE ',  out = '';

    if (conditions.length == 0) {
        return clause + ' 1 = 1';
    }else if (conditions.match(/\x20WHERE\x20/i) || where) {
        clause = '';
    }

    return clause +  conditions;

};


/**
 * Returns a limit statement in the correct format for the particular database.
 *
 * @name GeckoJS.DatasourceSQL#limit
 * @public
 * @function
 * @param {Number} limit            Limit of results returned
 * @param {Number} offset           Offset from which to start results
 * @return {String} SQL limit/offset statement
 */
GeckoJS.DatasourceSQL.prototype.limit = function(limit, offset) {

    limit = (typeof limit != 'undefined' && limit != null) ? "" + limit : false;
    offset = (typeof offset != 'undefined' && offset != null) ? "" + offset : false;
    
    if (limit !== false) {
        var rt = '';
        if ( limit.toLowerCase().indexOf('limit') == -1 ) {
            rt = ' LIMIT';
        }else {
            limit = limit.replace(/limit/i, "");
        }

        if (offset !== false) {
            rt += ' ' + offset + ',';
        }

        rt += ' ' + limit;
        return rt;
    }
    return "";
};

/**
 * Returns an ORDER BY clause as a string.
 *
 * @name GeckoJS.DatasourceSQL#order
 * @public
 * @function
 * @param {String} order        Field reference
 * @return {String} ORDER BY clause
 */
GeckoJS.DatasourceSQL.prototype.order = function(order, direction) {


    order = order || "";
    direction = direction || 'ASC';

    if (order.length == 0) return "";

    var result = ' ORDER BY ' + order;
    result = result + (order.match(/\x20ASC|\x20DESC/i) ? '' : ' ' + direction);

    return result ;

};


/**
 * Create a GROUP BY SQL clause
 *
 * @name GeckoJS.DatasourceSQL#group
 * @public
 * @function
 * @param {String} group Group By Condition
 * @return {String} string condition or null
 */
GeckoJS.DatasourceSQL.prototype.group = function(group) {

    group = group || '';
    if (group.length == 0) return "";

    if (group.constructor.name == 'Array') {
        group = group.join(', ');
    }

    return ' GROUP BY ' + group;
};


/**
 * Returns an array of tables in the database.
 * If there are no tables, an error is raised and the application exits.
 *
 * @name GeckoJS.DatasourceSQL#listTables
 * @public
 * @function
 * @return {Array} Array of tablenames in the database
 */
GeckoJS.DatasourceSQL.prototype.listTables = function() {

};


/**
 * Returns an array of the fields in given table name.
 *
 * @name GeckoJS.DatasourceSQL#describe
 * @public
 * @function
 * @param {GeckoJS.Model} model
 * @return {Object} Fields in table
 */
GeckoJS.DatasourceSQL.prototype.describe = function(model) {

    var table = model.table;
    var cached = this._descriptionCache[table];

    if (cached) return cached;

    return null;

};

/**
 * is Field Name in table
 *
 * @name GeckoJS.DatasourceSQL#hasField
 * @public
 * @function
 * @param {GeckoJS.Model} model
 * @param {String} field
 * @return {Boolean} 
 */
GeckoJS.DatasourceSQL.prototype.hasField = function(model, field) {

    var table = model.table;
    var fields = this._descriptionCache[table];

    if(!fields) {
        fields = this.describe(model);
    }

    if (fields) {
        return (field in fields);
    }
    return false;
    
};


/**
 * Generates the fields list of an SQL query.
 *
 * @name GeckoJS.DatasourceSQL#fields
 * @public
 * @function
 * @param {GeckoJS.Model} model
 * @param {String|Array} fields
 * @param {Boolean} quote If false, returns fields array unquoted
 * @return {Array}
 */
GeckoJS.DatasourceSQL.prototype.fields = function(model, fields, quote) {

    quote = typeof quote != 'undefined' ? quote : true;
    fields = fields || false;

    var table = model.table;
    var name = model.name;

    var fields2 = [];
    if (fields) {
        if (fields.constructor.name == 'Array') {
            fields2 = fields;
        } else {
            fields2 = fields.split(',');
        }
    }else {
        var schema = model.schema();
        fields2 = GeckoJS.BaseObject.getKeys(schema.fields);
    }

    if (!quote) {
        return fields2;
    }

    var fcount = fields2.length;

    if (fcount >= 1 && (fields2[0].indexOf('*') == -1 && fields2[0].indexOf('COUNT(') == -1) ) {

        for (var i = 0; i < fcount; i++) {

            // has sql function in statement
            if (fields2[i].match(/^.+\(.*\)/)) {

                // sum(field) or sql_function(fieldb)
                var fieldMatch = fields2[i].match(/\(([\.\w]+)\)/);
                if(fieldMatch && fieldMatch.length >1) {
                    
                }

                if ( fields2[i].match(/\x20AS\x20/i) ) continue;

            }else {
                // surpose quoted
                if (fields2[i].match(/\s+AS\s+"[\w]+\.[\w]+"/i)) continue ;
                
                if (fields2[i].indexOf('.') != -1) {
                    // has dot and fieldname
                    var m = fields2[i].match(/^(\w+)\.(.*)/);

                    fields2[i] = this.name(fields2[i]) + ' AS ' + this.name(this.modelName(model, m[1]) + '.' + m[2], true);
                
                }else {

                    fields2[i] = this.name(table + '.' + fields2[i]) + ' AS ' + this.name(name + '.' + fields2[i], true);

                }
            }
        }
    }

    return fields2;
};

/**
 * Returns a model's from given table's name
 *
 * @name GeckoJS.DatasourceSQL#modelName
 * @public
 * @function
 * @param {GeckoJS.Model} model
 * @param {String} table
 * @return {String} tablename
 */
GeckoJS.DatasourceSQL.prototype.modelName = function(model, table) {
    var schema = model.schema();
    var tables = {};

    if (schema.table == table) return schema.name;
    
    tables[schema.table] = schema.name;

    for (var type in schema.associations) {
        for (var assocName in schema.associations[type]) {
            var assocSchema = schema.associations[type][assocName];

            tables[assocSchema.table] = assocSchema.name;
        }
    }

    if (tables[table]) return tables[table];

    return table;

    
};


/**
 * Returns a quoted name of data for use in an SQL statement.
 * Strips fields out of SQL functions before quoting.
 *
 * @name GeckoJS.DatasourceSQL#name
 * @public
 * @function
 * @param {String} data
 * @return {String} SQL field
 */
GeckoJS.DatasourceSQL.prototype.name = function(data, quote) {

    quote = quote || false ;

    if (data == '*') return '*';

    if (typeof data == 'object' && typeof data.type != 'undefined') {
        return data.value;
    }

    var isArray = (data.constructor.name == 'Array');
    var count = data.length;

    if (isArray) {
        for(var i = 0; i < data.length; i++) {

            if (data[i] == '*') {
                continue;
            }

            if(!quote) data[i] = data[i].replace('.', this.endQuote + '.' + this.startQuote);
            data[i] = this.startQuote + data[i] + this.endQuote;
        }

    }else {
        if(!quote) data = data.replace('.', this.endQuote + '.' + this.startQuote);
        return this.startQuote + data + this.endQuote;
    }

};


/**
 * Deletes all the records in a table and resets the count of the auto-incrementing
 * primary key, where applicable.
 *
 * @name GeckoJS.DatasourceSQL#truncate
 * @public
 * @function
 * @param {String} table    The table to be truncated
 * @return {Boolean} SQL TRUNCATE TABLE statement, false if not applicable.
 */
GeckoJS.DatasourceSQL.prototype.truncate = function (table) {
    return this.execute('TRUNCATE TABLE ' + table);
};

/**
 * Defines GeckoJS.DatasourceJsonFile namespace
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.DatasourceSQLite', GeckoJS.global);

/**
 * Creates a new GeckoJS.DatasourceSQLite instance.
 * 
 * @class GeckoJS.DatasourceSQLite implements a data source that stores data
 * in mozIStorage (SQLite).
 * <br/>
 * Data is stored in files under the "data" sub-directory of the
 * system tmp directory (configuration key "TmpD").<br/> 
 *
 * @name GeckoJS.DatasourceSQLite
 * @extends GeckoJS.DatasourceSQL
 * @property {GeckoJS.Map} data                Data cache (read-only)
 * @property {String} path
 * @property {String} database
 * @property {String} startQuote
 * @property {String} endQuote
 */
GeckoJS.DatasourceSQLite = GeckoJS.DatasourceSQL.extend('DatasourceSQLite', {

    maxTries: 120,
    delayTries: 250

});


GeckoJS.DatasourceSQLite.CLASS_ID	= "@mozilla.org/storage/service;1";
GeckoJS.DatasourceSQLite.INTERFACE	= Components.interfaces.mozIStorageService;

// path getter
GeckoJS.DatasourceSQLite.prototype.__defineGetter__('path', function() {
    return this.config.path || "/var/tmp";
});

// database getter
GeckoJS.DatasourceSQLite.prototype.__defineGetter__('database', function() {
    return this.config.database || "vivipos.sqlite";
});


 // startQuote
GeckoJS.DatasourceSQLite.prototype.startQuote = '"' ;

// endQuote
GeckoJS.DatasourceSQLite.prototype.endQuote = '"' ;


/**
 * sleep for miliseconds
 *
 * @name GeckoJS.DatasourceSQLite#sleep
 * @param {Number} ms
 */
GeckoJS.DatasourceSQLite.prototype.sleep = function(ms) {


    try {

        var ioService = GREUtils.XPCOM.getService("@firich.com.tw/io_port_control_unix;1", "nsIIOPortControlUnix");
        //GREUtils.log('sleep use usleep');
        ioService.usleep(ms*1000);

    }catch(e) {

        // use loop
        //GREUtils.log('sleep use loop');
        var d = new Date();
        var start = d.getTime();
        var expire = start + ms;

        while( (new Date()).getTime() < expire) {
    // do nothing, just wait?
    }
    }

    return;

};

/**
 * connect
 *
 * @name GeckoJS.DatasourceSQLite#_connect
 * @private
 * @function
 */
GeckoJS.DatasourceSQLite.prototype._connect = function(){

    // already connected return
    if(this.connected) return ;

    // set timeout
    var timeout = parseInt(this.config['timeout'] || "30") ;
    this.maxTries = (timeout*1000/this.delayTries);

    var synchronous = this.config['synchronous'] || "NORMAL" ;
    var journalMode = this.config['journal_mode'] || "DELETE" ;

    // support in-memory sqlite database
    this._inMemory = false;
    if (this.database.match(/^:in-memory$/i)) {
        this._inMemory = true;
    }else {
        var file = new GeckoJS.Dir(this.path, true);
        file.append(this.database);
    }

    var err = null;
    var errorString ='';
    var errorCode = 0;
    var numTries = 0;

    while (numTries < this.maxTries) {

        try {

            err = null;

            var storageService = Components.classes[GeckoJS.DatasourceSQLite.CLASS_ID]
            .getService(GeckoJS.DatasourceSQLite.INTERFACE);

            if (this._inMemory) {
                this.conn = storageService.openSpecialDatabase("memory");
            }else {
                this.conn = storageService.openDatabase(file.nsIFile);
            }           

            if(this.conn) {
                this.connected = true;
                // this._execute('PRAGMA full_column_names = 1');
                try {
                    if (!this._inMemory) {

                        var initSQL = "";

                        initSQL += "PRAGMA synchronous = " + synchronous + ";\n";
                        initSQL += "PRAGMA journal_mode = " + journalMode + ";\n";
                        initSQL += "PRAGMA locking_mode = NORMAL;\n";

                        this.conn.executeSimpleSQL(initSQL);
                    }
                }catch(e){}
                
                break;
            }

        } catch (e) {

            if (this.conn && this.conn.conectionReady) {
                errorString = this.conn.lastErrorString;
                errorCode = this.conn.lastError;
                this.connected = true;
                break;
            }
            else  {
                if (!file.exists()) {
                    errorString = "Database file not found at " + file.path;
                    errorCode = -1;
                }
                else {
                    errorString = "Error initializing connection to database file " + file.path + ": " + e.message;
                    errorCode = e.result;
                }
                this.connected = false;
            }
            err = "Error opening database: " + errorString + "; \nmozStorage exception: " + e;
            //this.log('ERROR', err);
            if ((errorCode != 5) && (errorCode != 6) && (errorCode != Components.results.NS_ERROR_FILE_IS_LOCKED)) // not due to a locking issue -- so don't bother retrying
            {
                break;
            }

            // @FIXME stupid delay
            this.sleep(this.delayTries);
        }
        numTries++;
    }
    
    if (err) {
        this.connected = false;
        this.log('ERROR' , err ) ;
    } else {
        /* ifdef DEBUG 
        this.log('DEBUG', "Opened");
        /* endif DEBUG */
    }

    this.lastError = this.conn.lastError;
    this.lastErrorString = this.conn.lastErrorString;

};

/**
 * disconnect
 *
 * @name GeckoJS.DatasourceSQLite#_disconnect
 * @private
 * @function
 */
GeckoJS.DatasourceSQLite.prototype._disconnect = function(){

    var err, errorString, errorCode;
    
    try {
        if(this.conn) {
            
            if(this._statement){
                try {
                    this._statement.reset();
                    this._statement.finalize();

                }catch(e) {}
            }
            
            this.conn.close();

            this.connected = false;
            this._result = null;
            this._statement = null;
            this.conn = null;

        }

    } catch (e) {
        if(this.conn) {
            errorString = this.conn.lastErrorString;
            errorCode = this.conn.lastError;
        }
        err = "Error closing database: " + errorString + "; \nmozStorage exception: " + e;
    ///this.log('ERROR', err);
    }

};

/**
 * Queries the database with given SQL statement
 *
 * @name GeckoJS.DatasourceSQLite#_execute
 * @private
 * @function
 * @param {String} sql
 * @param {Array} params    is params, use bindParameter to binding params by type.
 * @param {Boolean} waiting waiting if database is locked
 * @return {Boolean}
 */
GeckoJS.DatasourceSQLite.prototype._execute = function(sql, params, waiting) {

    params = params || [];
    if(typeof waiting =='undefined') waiting = true;

    if (!this.isConnected) return null;

    // free prev statment
    if (this._statement) {
        
        try {
            this._statement.reset();
            this._statement.finalize();
            this._statement = null;
        }catch(e){
            
        }

        this._statement = null;
        this._result = false;
    }

    try {
        /* ifdef DEBUG 
        this.log('DEBUG', '_execute > createStatement : ' + sql);
        /* endif DEBUG */
        this._statement = null;
        this._statement = this.conn.createStatement(sql);

    }catch(e) {

        this.lastError = this.conn.lastError;
        this.lastErrorString = this.conn.lastErrorString;

        this.log('ERROR', 'ERROR _execute > createStatement>' + this.lastErrorString +'\n' + sql);

        this._result = false;
        return false;
    }

    /* ifdef DEBUG 
    this.log('DEBUG', '_execute > bindParameter' );
    /* endif DEBUG */

    if (params.length > 0) {
        this.bindParameter(this._statement, params);
    }

    // We'll try multiple times if we get an error because of the database or a table being locked
    // @see http://www.sqlite.org/capi3.html
    var errorCode = 0;
    var errorString = '';
    var maxTries = waiting ? this.maxTries : 1;
    var numTries = 0;
    var selectMode = sql.match(/^\s*select|^\s*pragma/i);

    while (numTries < maxTries) {

        try {

            if (selectMode) {

                /* ifdef DEBUG 
                this.log('DEBUG', '_execute > executeStep ' );
                /* endif DEBUG */

                this._result = this._statement.executeStep();
               

            } else {

                /* ifdef DEBUG 
                this.log('DEBUG', '_execute > execute ' );
                /* endif DEBUG */
                this._result = this._statement.execute();

                this.lastError = (this.conn.lastError == 0 || this.conn.lastError == 100 || this.conn.lastError == 101) ? 0 : this.conn.lastError; // not an error
                if (this.lastError == 0)  this._result = true;

            }
            break;

        }catch(e) {
            
            this._result = false;
            errorString = this.conn.lastErrorString;
            errorCode = this.conn.lastError;

            this.log('ERROR', '_execute > execute > exception: ' + this.conn.lastError +',,'+this.conn.lastErrorString +  '\n retries ' + numTries + '\n' + sql);
            
            if ((errorCode != 5) && (errorCode != 6) && (errorCode != 17) ) // not due to a locking issue -- so don't bother retrying
            {
                break;
            }else {
                
                // database is locked
                // @FIXME stupid delay
                if(waiting) {
                    this.sleep(this.delayTries);
                }
            }

            
        }
        numTries++;
    }

    if (numTries == maxTries) {
        
        // this._statement.finalize();
        this._statement = null;
        this._result = false;

        this.log('ERROR', '_execute > too many retries exception: ' + errorString + "\n" + sql + '\n result: ' + this._result );

    }
    // change 100 , 101 to 0
    // @see http://www.sqlite.org/capi3.html
    this.lastError = (this.conn.lastError == 0 || this.conn.lastError == 100 || this.conn.lastError == 101) ? 0 : this.conn.lastError; // not an error
    this.lastErrorString = this.conn.lastErrorString;

    return this._result;

};

/**
 * Executes an SQL expression
 *
 * @name GeckoJS.DatasourceSQLite#executeSimpleSQL
 * @public
 * @function
 * @param {String} sql
 * @param {Boolean} waiting waiting if database is locked
 * @return {Boolean}
 */
GeckoJS.DatasourceSQLite.prototype.executeSimpleSQL = function(sql, waiting) {

    if(typeof waiting =='undefined') waiting = true;

    if (!this.isConnected) return null;

    // We'll try multiple times if we get an error because of the database or a table being locked
    // @see http://www.sqlite.org/capi3.html
    var errorCode = 0;
    var errorString = '';
    var maxTries = waiting ? this.maxTries : 1;
    var numTries = 0;
    var result = false;

    while (numTries < maxTries) {

        try {

            /* ifdef DEBUG 
            this.log('DEBUG', 'executeSimpleSQL > mozIStorageConnection.executeSimpleSQL ' );
            /* endif DEBUG */

            this.conn.executeSimpleSQL(sql);

            this.lastError = (this.conn.lastError == 0 || this.conn.lastError == 100 || this.conn.lastError == 101) ? 0 : this.conn.lastError; // not an error
            if (this.lastError == 0)  result = true;

            break;

        }catch(e) {

            result = false;
            errorString = this.conn.lastErrorString;
            errorCode = this.conn.lastError;

            this.log('ERROR', 'executeSimpleSQL > mozIStorageConnection.executeSimpleSQL > exception: ' + this.conn.lastError +',,'+this.conn.lastErrorString +  '\n retries ' + numTries );

            if ((errorCode != 5) && (errorCode != 6) && (errorCode != 17) ) // not due to a locking issue -- so don't bother retrying
            {
                break;
            }else {

                // database is locked
                // @FIXME stupid delay
                if(waiting) {
                    this.sleep(this.delayTries);
                }
            }


        }
        numTries++;
    }

    if (numTries == maxTries) {
        
        this.log('ERROR', 'executeSimpleSQL > mozIStorageConnection.executeSimpleSQL too many retries exception: ' + errorString + '\n result: ' + result );

    }
    // change 100 , 101 to 0
    // @see http://www.sqlite.org/capi3.html
    this.lastError = (this.conn.lastError == 0 || this.conn.lastError == 100 || this.conn.lastError == 101) ? 0 : this.conn.lastError; // not an error
    this.lastErrorString = this.conn.lastErrorString;

    return result;

};


/**
 * Returns an array of all result rows for a given SQL query.
 * Returns false if no rows matched.
 *
 * @name GeckoJS.DatasourceSQLite#fetchAll
 * @public
 * @function
 * @param {String} sql SQL statement
 * @param {Array} params parameters for prepare SQL statement
 * @param {Boolean} cache Enables returning/storing cached query results
 * @param {GeckoJS.Model} model [optional] Model for prepare result array
 * @return {Array} Array of resultset rows, or false if no rows matched
 */
GeckoJS.DatasourceSQLite.prototype.fetchAll = function (sql, params, cache, model) {

    cache = cache || false;

    if (cache && this._queryCache[sql]) {
        if (sql.match(/^\s*select/i)) {
            return this._queryCache[sql];
        }
    }

    params = params || [];

    /* ifdef DEBUG 
    this.log('DEBUG', "fetchAll > execute " + sql + ((model) ? '\n'+model.name : '') );
    var start = (new Date).getTime(), diff = 0;
    /* endif DEBUG */
   
    if (this.execute(sql, params)) {

        /* ifdef DEBUG 
        diff = (new Date).getTime() - start;
        this.log('DEBUG', 'fetchAll > execute : ' + diff + ' ms for query');
        /* endif DEBUG */

        var out = [];
        var columns = this.getStatementColumnsType(this._statement) || [];

        /* ifdef DEBUG 
        diff = (new Date).getTime() - start;
        this.log('DEBUG', 'fetchAll > getStatementColumnsType : ' + diff + ' ms for getStatementColumnsType');
        /* endif DEBUG */


        var first = this.fetchResult(model, columns);

        if (first != null){
            out.push(first);
        }

        var item = this.fetchResult(model, columns);

        while (item) {
            out.push(item);
            item = this.fetchResult(model, columns);
        }

        if (cache) {
            if (sql.match(/^\s*select/i)) {
                this._queryCache[sql] = out;
            }
        }

        /* ifdef DEBUG 
        diff = (new Date).getTime() - start;
        this.log('DEBUG', 'fetchAll > expend: ' + diff + ' ms and return ' + out.length +' datas');
        /* endif DEBUG */

        return out;

    } else {
        var errorCode = this.lastError ;
        var errorString = this.lastErrorString ;

        if (this.lastError == 0) {
            return [];
        }
        this.log('WARN', 'fetchAll > failure: ' + errorCode + '\n' + errorString +'\n'+ sql);

        return false;
    }
};


/**
 * Fetches the next row from the current result set
 *
 * @name GeckoJS.DatasourceSQLite#fetchResult
 * @public
 * @function
 * @param {GeckoJS.Model} model [optional] Model for prepare result array
 * @return {Array|Boolean} result array or false
 */
GeckoJS.DatasourceSQLite.prototype.fetchResult = function(model, columns) {

    if (this._result == false) return false;

    model = model || false;

    if (!columns) {
        columns = this.getStatementColumnsType(this._statement);
    }
    
    var numCols = columns.length;

    var values_assoc = {};
    //var values = [];
    
    for (var iCol = 0; iCol < numCols; iCol++) {

        var colName = columns[iCol].name;
        var modelName = columns[iCol].modelName;

        var value = this.getAsType(this._statement, iCol, columns[iCol].type);
        //values[iCol] = value;
        
        if(modelName.length > 0) {

            if(!values_assoc[modelName]) values_assoc[modelName] = {};
            
            values_assoc[modelName][colName] = value;

            // extract
            if(model && model.name == modelName) {
                values_assoc[colName] = value;
            }

        }else {
            values_assoc[colName] = value;
        }
    }

    this._result = this._statement.executeStep();
    return values_assoc;
};


/**
 * Returns an array of tables in the database.
 * If there are no tables, an error is raised and the application exits.
 *
 * @name GeckoJS.DatasourceSQLite#listTables
 * @public
 * @function
 * @return {Array} Array of tablenames in the database
 */
GeckoJS.DatasourceSQLite.prototype.listTables = function() {

    var result = this.fetchAll("SELECT name AS name FROM sqlite_master WHERE type='table' ORDER BY name;");

    if (result) {
        
        var tables = [];
        result.forEach(function(table){
            tables.push(table.name);
        });

        this._tables = tables;

        return tables;
    }
    return [];
};


/**
 * Returns an array of the fields in given table name.
 *
 * @name GeckoJS.DatasourceSQLite#describe
 * @public
 * @function
 * @param {GeckoJS.Model} model
 * @return {Object} Fields in table
 */
GeckoJS.DatasourceSQLite.prototype.describe = function(model) {

    /* ifdef DEBUG 
    this.log('DEBUG', 'describe > ' + model.table );
    /* endif DEBUG */

    var table = model.table;

    // call super method
    var cached =  this.superclass.prototype.describe.apply(this, arguments);

    if (cached) return cached; // @todo

    var fields = {};

    var result = this.fetchAll('PRAGMA table_info(' + table + ')');

    if(result === false || result.length == 0) return false;
        
    result.forEach( function(row) {

        fields[row.name] = {
            name: row.name,
            type: row.type,
            notnull: row.notnull,
            default_value: row.dflt_value,
            pk: row.pk
        };
    });

    this._descriptionCache[table] = fields;

    return fields;
};


/**
 * Returns the ID of the last inserted row.
 *
 * @name GeckoJS.DatasourceSQLite#getLastInsertId
 * @public
 * @function
 * @return {String}  The id of the last inserted row
 */
GeckoJS.DatasourceSQLite.prototype.getLastInsertId = function() {

    if (this.isConnected) {
        return this.conn.lastInsertRowID;
    }else {
        return 0;
    }

};

/**
 * Bind Statement 's Parameter by param type
 *
 * @name GeckoJS.DatasourceSQLite#bindParameter
 * @public
 * @function
 * @param {Object} stmt     The Statement Object
 * @param {Array} params    The paramters to be binding
 */
GeckoJS.DatasourceSQLite.prototype.bindParameter = function (stmt, params) {

    // First bind the parameters
    if (params && params.length) {

        params.forEach(function(param, index) {
            try {
                switch (typeof param) {
                    case "number":
                        if (isFinite(param))
                        {
                            stmt.bindDoubleParameter(index, param);
                        }
                        else
                        {
                            stmt.bindStringParameter(index, param.toString());
                        }
                        break;
                    case "boolean":
                        stmt.bindInt32Parameter(index, (param ? 1 : 0));
                        break;
                    case "string":
                        stmt.bindStringParameter(index, param);
                        break;
                    case "object":
                        if (param == null) {
                            stmt.bindNullParameter(index);
                        } else if (typeof param['getTime'] == 'function') {
                            stmt.bindInt64Parameter(index, Math.round(param.getTime()/1000)); // milliseconds since midnight 1/1/1970.
                        } else {
                            stmt.bindNullParameter(index);
                        }
                        break;
                    case "undefined":
                        stmt.bindNullParameter(index);
                        break;
                    default:
                        stmt.bindNullParameter(index);
                        break;
                }
            }catch(e) {
                this.log('ERROR', 'Error bindParameter ' + e);
            }
        });
    }

};


/**
 * Retrieves the specified value from the prepared statement (at its current
 * cursor location), casting to the given type.
 *
 * @name GeckoJS.DatasourceSQLite#getAsType
 * @public
 * @function
 * @param {Object} stmt     The statement object
 * @param {Object} iCol		The index of the column whose value is to be fetched
 * @param {Object} iType	The type object containing information on how to return this value
 * @return {String} 		The value as the requested type
 */
GeckoJS.DatasourceSQLite.prototype.getAsType = function(stmt, iCol, iType) {

    var declaredType = iType.declared;
    var sqliteType = iType.sqlite;
    var convertType = iType.convert;

    var value;
    switch (sqliteType)
    {
        case stmt.VALUE_TYPE_INTEGER:
            if (stmt.getIsNull(iCol)) {
                value = 0;
            }else {
                value = stmt.getInt64(iCol);
            }
            break;
        case stmt.VALUE_TYPE_FLOAT:
            if (stmt.getIsNull(iCol)) {
                value = 0;
            }else {
                value = stmt.getDouble(iCol);
            }
            break;
        case stmt.VALUE_TYPE_TEXT:
            if (stmt.getIsNull(iCol)) {
                value = '' ;
            }else {
                value = stmt.getString(iCol);
            }
            break;
        case stmt.VALUE_TYPE_BLOB:
            if (stmt.getIsNull(iCol)) {
                value = '' ;
            }else {
                value = stmt.getString(iCol); // TODO: revisit blobs
            }
            break;
        case stmt.VALUE_TYPE_NULL:
            value = null;
            break;
        default:
            throw new Exception("SQLite statement returned an unknown data type: " + sqliteType);
    }
    
    if (convertType == 'Boolean') {
        value = GeckoJS.String.parseBoolean(value);
    }
    if (convertType == 'Date') {

        if (parseFloat(value).toFixed(0).length == 10) {
            value = new Date(value * 1000);
        }else if (parseFloat(value).toFixed(0).length == 13) {
            value = new Date(value);
        }else {
            value = new Date(0);
        }
        
    }
    return value;
};


/**
 * Deletes all the records in a table and resets the count of the auto-incrementing
 * primary key, where applicable.
 *
 * @name GeckoJS.DatasourceSQLite#truncate
 * @public
 * @function
 * @param {String} table    The table to be truncated
 * @return {Boolean} SQL TRUNCATE TABLE statement, false if not applicable.
 */
GeckoJS.DatasourceSQLite.prototype.truncate = function (table) {

    var sql = 'DELETE FROM ' + table;

    /* ifdef DEBUG 
    this.log('DEBUG', 'truncate > ' + sql);
    /* endif DEBUG */
    
    return this._execute(sql);
};


/**
 * Begins a transaction.
 *
 * @name GeckoJS.DatasourceSQLite#begin
 * @public
 * @function
 * @param {Boolean} waiting if database is locked
 */
GeckoJS.DatasourceSQLite.prototype.begin = function(waiting)	{

    // In case it hasn't been opened
    if(!this.connect()) {
        return false;
    }

    var maxTries = waiting ? this.maxTries : 1;
    var numTries = 0;

    if(this.transactionInProgress) {
        
        /* ifdef DEBUG 
        this.log('DEBUG', 'beginTransaction transactionInProgress, return true'  );
        /* endif DEBUG */

        return this.transactionInProgress;
    }

    while (numTries < maxTries) {

        try {

            this.conn.executeSimpleSQL("begin exclusive");
            
            /* ifdef DEBUG 
            this.log('DEBUG', 'beginTransaction '  );
            /* endif DEBUG */

            this.transactionInProgress = true;
            
            break;

        }catch(e) {

            this.log('ERROR', 'beginTransaction > exception: ' + this.conn.lastError +',,'+this.conn.lastErrorString +  '\n retries ' + numTries + '\n');

            if ((this.conn.lastError != 5) && (this.conn.lastError != 6)) // not due to a locking issue -- so don't bother retrying
            {
                break;
            }else {
                // @FIXME stupid delay
                if(waiting) {
                    this.sleep(this.delayTries);
                }
            }


        }
        numTries++;

    }

    // update lastError / lastErrorString
    this.lastError = (this.conn.lastError == 0 || this.conn.lastError == 100 || this.conn.lastError == 101) ? 0 : this.conn.lastError; // not an error
    this.lastErrorString = this.conn.lastErrorString;

    return this.transactionInProgress;

};


/**
 * Commits a transaction.
 *
 * @name GeckoJS.DatasourceSQLite#commit
 * @public
 * @function
 */
GeckoJS.DatasourceSQLite.prototype.commit = function(waiting) {

    // In case it hasn't been opened
    if(!this.connect()) {
        return false;
    }

    var maxTries = waiting ? this.maxTries : 1;
    var numTries = 0;
    var delay = 250; // this.delayTries

    if(!this.transactionInProgress) {

        /* ifdef DEBUG 
        this.log('DEBUG', 'commitTransaction !transactionInProgress, return true'  );
        /* endif DEBUG */

        return true;
    }

    if (this._statement) {
        this._statement.reset();
        this._statement.finalize();
        this._statement = null;
    }

    while (numTries < maxTries) {

        try {

            this.conn.executeSimpleSQL("COMMIT");

            /* ifdef DEBUG 
            this.log('DEBUG', 'commitTransaction ' );
            /* endif DEBUG */

            this.transactionInProgress = false;
            
            break;

        }catch(e) {

            this.log('ERROR', 'commitTransaction > exception: ' + this.conn.lastError +',,'+this.conn.lastErrorString +  '\n retries ' + numTries + '\n');
            
            if ( (this.conn.lastError != 5) && (this.conn.lastError != 6)) // not due to a locking issue -- so don't bother retrying
            {
                break;
            }else {
                // @FIXME stupid delay
                if(waiting) {
                    this.sleep(this.delayTries);
                }
            }


        }

        numTries++;

    }

    // update lastError / lastErrorString
    this.lastError = (this.conn.lastError == 0 || this.conn.lastError == 100 || this.conn.lastError == 101) ? 0 : this.conn.lastError; // not an error
    this.lastErrorString = this.conn.lastErrorString;
    
    return !this.transactionInProgress;

};


/**
 * Rolls back a transaction.
 *
 * @name GeckoJS.DatasourceSQLite#rollback
 * @public
 * @function
 */
GeckoJS.DatasourceSQLite.prototype.rollback = function(waiting) {

    // In case it hasn't been opened
    if(!this.connect()) {
        return false;
    }

    var maxTries = waiting ? this.maxTries : 1;
    var numTries = 0;

    if(!this.transactionInProgress) {

        /* ifdef DEBUG 
        this.log('DEBUG', 'rollbackTransaction !transactionInProgress, return true'  );
        /* endif DEBUG */

        return true;
    }

    while (numTries < maxTries) {

        try {

            this.conn.executeSimpleSQL("ROLLBACK");

            /* ifdef DEBUG 
            this.log('DEBUG', 'rollbackTransaction ' );
            /* endif DEBUG */

            this.transactionInProgress = false;
            
            break;

        }catch(e) {

            this.log('ERROR', 'rollbackTransaction > exception: ' + this.conn.lastError +',,'+this.conn.lastErrorString +  '\n retries ' + numTries + '\n');

            if ((this.conn.lastError != 5) && (this.conn.lastError != 6)) // not due to a locking issue -- so don't bother retrying
            {
                break;
            }else {

                // @FIXME stupid delay
                if(waiting) {
                    this.sleep(this.delayTries);
                }
            }


        }
        numTries++;

    }

    // update lastError / lastErrorString
    this.lastError = (this.conn.lastError == 0 || this.conn.lastError == 100 || this.conn.lastError == 101) ? 0 : this.conn.lastError; // not an error
    this.lastErrorString = this.conn.lastErrorString;

    return !this.transactionInProgress;

};


/**
 * Renders a final SQL statement by putting together the component parts in the correct order
 *
 * @name GeckoJS.DatasourceSQLite#renderStatement
 * @public
 * @function
 * @param {String} type     Type of SQL statement to render
 * @param {Object} data     The data
 * @return {String} An executable SQL statement
 */
GeckoJS.DatasourceSQLite.prototype.renderStatement = function(type, data) {

    var sql = "";
    switch (type.toLowerCase()) {

        case 'select':
            sql = "SELECT " + data.fields + " FROM " + data.table + " " + data.joins + " " + data.conditions + " " + data.group + " " + data.order + " " + data.limit;
            break;

        case 'insert':
            sql = "INSERT OR REPLACE INTO " + data.table + " (" + data.fields + ") VALUES (" + data.values + ")";
            break;

        case 'update':
            sql = "UPDATE " + data.table + " SET " + data.fields + " WHERE " + data.conditions;
            break;

        case 'delete':
            sql = "DELETE FROM " + data.table + " WHERE " + data.conditions ;
            break;
          
        case 'alter':
            break;
    }

    /* ifdef DEBUG 
    this.log('DEBUG', 'renderStatement > ' + type + '\n' + sql);
    /* endif DEBUG */

    return sql;
};


/**
 * get Statement columns type
 *
 * @name GeckoJS.DatasourceSQLite#getStatementColumnsType
 * @public
 * @function
 * @param {Object} statement
 * @return {Object}
 */
GeckoJS.DatasourceSQLite.prototype.getStatementColumnsType = function (statement) {

        /* ifdef DEBUG 
        this.log('DEBUG', 'getStatementColumnsType > ');
        /* endif DEBUG */

        // do not use stmt.columnCount in the for loop
        var numCols = statement.columnCount;

        var columns = [];
        for (var iCol = 0; iCol < numCols; iCol++) {

            var colName = statement.getColumnName(iCol);
            var declaredType = statement.getColumnDecltype(iCol);
            var sqliteType = statement.getTypeOfIndex(iCol);
            var convertType = false;

            if (declaredType.match(/bool/i)) {
                convertType = "Boolean";
            }
            if ((declaredType.match(/date/i) || declaredType.match(/time/i)) && (sqliteType == statement.VALUE_TYPE_INTEGER)) {
                convertType = "Date";
            }

            // if can't determine or not internal type , force change it to logical type.
            if (sqliteType == statement.VALUE_TYPE_NULL) {

                if (declaredType.match(/char/i)) {
                    sqliteType = statement.VALUE_TYPE_TEXT;
                }
                if (declaredType.match(/text/i)) {
                    sqliteType = statement.VALUE_TYPE_TEXT;
                }
                if (declaredType.match(/memo/i)) {
                    sqliteType = statement.VALUE_TYPE_TEXT;
                }
                if (declaredType.match(/int/i)) {
                    sqliteType = statement.VALUE_TYPE_INTEGER;
                }
                if (declaredType.match(/float/i)) {
                    sqliteType = statement.VALUE_TYPE_FLOAT;
                }
                if (declaredType.match(/bool/i)) {
                    sqliteType = statement.VALUE_TYPE_INTEGER;
                    convertType = "Boolean";
                }
                if (declaredType.match(/date/i)) {
                    sqliteType = statement.VALUE_TYPE_INTEGER;
                    convertType = "Date";
                }
                if (declaredType.match(/time/i)) {
                    sqliteType = statement.VALUE_TYPE_INTEGER;
                    convertType = "Date";
                }

            }


            var modelName = "";

            var m = colName.match(/^(\w+)\.(.*)/);

            if(m) {
                colName =  m[2];
                modelName =  m[1];
            }

            columns[iCol] =  {name: colName,
                              modelName: modelName,
                              type: {
                                    declared: declaredType,
                                    sqlite: sqliteType,
                                    convert: convertType

                                }};

        }

        /* ifdef DEBUG 
        //this.log('DEBUG', '     getStatementColumnsType > ' + this.dump(columns));
        /* endif DEBUG */

        return columns;
};

/**
 * Defines the GeckoJS.NSITreeViewArray namespace.
 *
 * @public
 * @namespace GeckoJS.NSITreeViewArray
 */
GREUtils.define('GeckoJS.NSITreeViewArray', GeckoJS.global);

/**
 * @class The nsITreeView interface is used by the tree widget to get information about what and how to display
 * a tree widget. Implementing a nsITreeView in lieu of DOM methods for tree creation can improve performance
 * dramatically, and removes the need to make changes to the tree manually when changes to the database occur.
 *
 * @see https://developer.mozilla.org/en/nsITreeView
 *
 * @name GeckoJS.NSITreeViewArray
 * @extends GeckoJS.BaseObject
 *
 * @property {Number} rowCount
 * @property {nsITreeSelection} selection
 */
GeckoJS.NSITreeViewArray = GeckoJS.BaseObject.extend('NSITreeViewArray',
/** @lends GeckoJS.NSITreeViewArray.prototype */
{

    /**
     * NSITreeViewArray contructor
     *
     * @name GeckoJS.NSITreeViewArray#init
     * @public
     * @function
     * @param {Array} data      data array for tree view
     */
    init: function(data){
        this.tree = null;

        this.selection = null;
        this._data = data || [];
    //this.keys = GeckoJS.BaseObject.getKeys(this._data[0]) || [];

    }
});

GeckoJS.NSITreeViewArray.prototype.tree = null;
GeckoJS.NSITreeViewArray.prototype.selection = null;
GeckoJS.NSITreeViewArray.prototype._data = [];


//data getter
GeckoJS.NSITreeViewArray.prototype.__defineGetter__('data', function(){
    return this._data;
});
//data setter
GeckoJS.NSITreeViewArray.prototype.__defineSetter__('data', function(d){
    this._data = d || [];
//this.keys = GeckoJS.BaseObject.getKeys(this._data[0]) || [];
});


/**
 * rowCount
 */
GeckoJS.NSITreeViewArray.prototype.__defineGetter__('rowCount', function() {
    return this._data.length;
});


/**
 * getCellValue    implemented nsITreeView interface
 *
 * The value for a given cell. This method is only called for columns of type other than text.
 *
 * @name GeckoJS.NSITreeViewArray#getCellValue
 * @public
 * @function
 * @param {Number} row      the index of the row.
 * @param {nsITreeColumn} col   The index of the column.
 * @return {String}
 */
GeckoJS.NSITreeViewArray.prototype.getCellValue = function(row, col) {
    var sResult;
    var key = (typeof col == 'object') ? col.id : col;

    try {
        sResult= this.data[row][key];
    }
    catch (e) {
        return "<" + row + "," + key + ">";
    }
    return sResult;
};


/**
 * getCellText    implemented nsITreeView interface
 *
 * The text for a given cell. If a column consists only of an image, then the empty string is returned.
 *
 * @name GeckoJS.NSITreeViewArray#getCellText
 * @public
 * @function
 * @param {Number} row      the index of the row.
 * @param {nsITreeColumn} col   The index of the column.
 * @return {String}
 */
GeckoJS.NSITreeViewArray.prototype.getCellText = function(row, col) {

    return this.getCellValue(row, col);

};


/**
 * setCellValue    implemented nsITreeView interface
 *
 * setCellValue is called when the value of the cell has been set by the user.
 * This method is only called for columns of type other than text. 
 *
 * @name GeckoJS.NSITreeViewArray#setCellValue
 * @public
 * @function
 * @param {Number} row          The index of the row.
 * @param {nsITreeColumn} col   The index of the column.
 * @param {String} value        The text to change the cell to.
 */
GeckoJS.NSITreeViewArray.prototype.setCellValue = function(row, col, value) {
    };


/**
 * setCellText    implemented nsITreeView interface
 *
 * setCellText is called when the contents of the cell have been edited by the user.
 *
 * @name GeckoJS.NSITreeViewArray#setCellText
 * @public
 * @function
 * @param {Number} row          The index of the row.
 * @param {nsITreeColumn} col   The index of the column.
 * @param {String} value        The text to change the cell to.
 */
GeckoJS.NSITreeViewArray.prototype.setCellText = function(row, col, value) {
    };


/**
 * setTree    implemented nsITreeView interface
 *
 * Called during initialization to link the view to the front end box object.
 *
 * @see http://www.xulplanet.com/references/xpcomref/ifaces/nsITreeBoxObject.html
 * 
 * @name GeckoJS.NSITreeViewArray#setTree
 * @public
 * @function
 * @param {nsITreeBoxObject} tree       The nsITreeBoxObject to attach this view to
 */
GeckoJS.NSITreeViewArray.prototype.setTree = function(tree) {
    this.tree = tree;
};


/**
 * isContainer    implemented nsITreeView interface
 *
 * @name GeckoJS.NSITreeViewArray#isContainer
 * @public
 * @function
 * @param {Number} row      the index of the row.
 * @return {Boolean} 
 */
GeckoJS.NSITreeViewArray.prototype.isContainer = function(row) {
    return false;
};


/**
 * isContainerOpen    implemented nsITreeView interface
 *
 * @name GeckoJS.NSITreeViewArray#isContainerOpen
 * @public
 * @function
 * @param {Number} row      the index of the row.
 * @return {Boolean}
 */
GeckoJS.NSITreeViewArray.prototype.isContainerOpen = function(row) {
    return false;
};


/**
 * isContainerEmpty    implemented nsITreeView interface
 *
 * @name GeckoJS.NSITreeViewArray#isContainerEmpty
 * @public
 * @function
 * @param {Number} row      the index of the row.
 * @return {Boolean} 
 */
GeckoJS.NSITreeViewArray.prototype.isContainerEmpty = function(row) {
    return false;
};


/**
 * isSeparator    implemented nsITreeView interface
 *
 * isSeparator is used to determine if the row at index is a separator.
 * A value of true will result in the tree drawing a horizontal separator.
 * The tree uses the ::moz-tree-separator pseudoclass to draw the separator.
 *
 * @name GeckoJS.NSITreeViewArray#isSeparator
 * @public
 * @function
 * @param {Number} row      the index of the row.
 * @return {Boolean} 
 */
GeckoJS.NSITreeViewArray.prototype.isSeparator = function(row) {
    return false;
};

/**
 * isSorted    implemented nsITreeView interface
 * 
 * @name GeckoJS.NSITreeViewArray#isSorted
 * @public
 * @function
 * @return {Boolean}
 */
GeckoJS.NSITreeViewArray.prototype.isSorted = function() {
    return false;
};


/**
 * canDrop    implemented nsITreeView interface
 *
 * @name GeckoJS.NSITreeViewArray#canDrop
 * @public
 * @function
 * @param {Number} index
 * @param {String} orientation
 * @return {Boolean}
 */
GeckoJS.NSITreeViewArray.prototype.canDrop = function (index, orientation) {
    return false;
};


/**
 * drop    implemented nsITreeView interface
 *
 * @name GeckoJS.NSITreeViewArray#drop
 * @public
 * @function
 * @param {Number} index
 * @param {String} orientation
 * @return {Boolean}
 */
GeckoJS.NSITreeViewArray.prototype.drop = function (index, orientation) {
    return false;
};


/**
 * isEditable    implemented nsITreeView interface
 *
 * isEditable is called to ask the view if the cell contents are editable.
 * A value of true will result in the tree popping up a text field when the user tries to inline edit the cell.
 *
 * @name GeckoJS.NSITreeViewArray#isEditable
 * @public
 * @function
 * @param {Number} row      the index of the row.
 * @param {nsITreeColumn} col   The index of the column.
 * @return {Boolean} 
 */
GeckoJS.NSITreeViewArray.prototype.isEditable = function(row, col) {
    return false;
};

/**
 * isSelectable    implemented nsITreeView interface
 *
 * isSelectable is called to ask the view if the cell is selectable.
 * This method is only called if the selection type is cell or text.
 *
 * @name GeckoJS.NSITreeViewArray#isSelectable
 * @public
 * @function
 * @param {Number} row      the index of the row.
 * @param {nsITreeColumn} col   The index of the column.
 * @return {Boolean} 
 */
GeckoJS.NSITreeViewArray.prototype.isSelectable = function(row, col) {
    return false;
};



/**
 * cycleHeader    implemented nsITreeView interface
 *
 * Called on the view when a header is clicked.
 *
 * @name GeckoJS.NSITreeViewArray#cycleHeader
 * @public
 * @function
 * @param {nsITreeColumn} col           The column to cycle.
 */
GeckoJS.NSITreeViewArray.prototype.cycleHeader = function(col) {
    };

/**
 * cycleCell    implemented nsITreeView interface
 *
 * Called on the view when a cell in a non-selectable cycling column (e.g., unread/flag/etc.) is clicked.
 *
 * @name GeckoJS.NSITreeViewArray#cycleCell
 * @public
 * @function
 * @param {nsITreeColumn} col           The column to cycle.
 */
GeckoJS.NSITreeViewArray.prototype.cycleCell = function(col) {
    };


/**
 * getParentIndex    implemented nsITreeView interface
 *
 * Methods used by the tree to draw thread lines in the tree.
 * getParentIndex is used to obtain the index of a parent row.
 * If there is no parent row, getParentIndex returns -1.
 *
 * @name GeckoJS.NSITreeViewArray#getParentIndex
 * @public
 * @function
 * @param {Number} row      the index of the row.
 * @return {Number}
 */
GeckoJS.NSITreeViewArray.prototype.getParentIndex = function(row) {
    if (this.isContainer(row)) return -1;
    for (var t = row - 1; t >= 0 ; t--) {
        if (this.isContainer(t)) return t;
    }
};


/**
 * getLevel    implemented nsITreeView interface
 *
 * @name GeckoJS.NSITreeViewArray#getLevel
 * @public
 * @function
 * @param {Number} row      the index of the row.
 * @return {Number}
 */
GeckoJS.NSITreeViewArray.prototype.getLevel = function(row) {
    if (this.isContainer(row)) return 0;
    return 1;
};

/**
 * hasNextSibling    implemented nsITreeView interface
 *
 * hasNextSibling is used to determine if the row at rowIndex has a nextSibling that occurs after
 * the index specified by afterIndex. Code that is forced to march down the view looking at levels
 * can optimize the march by starting at afterIndex+1.
 *
 * @name GeckoJS.NSITreeViewArray#hasNextSibling
 * @public
 * @function
 * @param {Number} row    The index of the item.
 * @param {Number} after  The index of the item to find siblings after.
 * @return {Boolean} 
 */
GeckoJS.NSITreeViewArray.prototype.hasNextSibling = function(row, after) {
    
    var thisLevel = this.getLevel(row);
    var nextLevel = this.getLevel(after);

    if (nextLevel == thisLevel) return true;
    else return false;
    
};


/**
 * toggleOpenState    implemented nsITreeView interface
 *
 * Called on the view when an item is opened or closed.
 *
 * @name GeckoJS.NSITreeViewArray#toggleOpenState
 * @public
 * @function
 * @param {Number} row         The index of the row to toggle.
 */
GeckoJS.NSITreeViewArray.prototype.toggleOpenState = function(row) {
    };

/**
 * getImageSrc    implemented nsITreeView interface
 *
 * The image path for a given cell. For defining an icon for a cell.
 * If the empty string is returned, the :moz-tree-image pseudoelement will be used.
 *
 * @name GeckoJS.NSITreeViewArray#getImageSrc
 * @public
 * @function
 * @param {Number} row      the index of the row.
 * @param {nsITreeColumn} col   The index of the column.
 * @return {String}
 */
GeckoJS.NSITreeViewArray.prototype.getImageSrc = function(row, col) {

    return this.getCellValue(row, col);

};

/**
 * getProgressMode    implemented nsITreeView interface
 *
 * The progress mode for a given cell. This method is only called for columns of type progressmeter.
 *
 * PROGRESS_NORMAL 	1
 * PROGRESS_UNDETERMINED 	2
 * PROGRESS_NONE 	3
 *
 * @name GeckoJS.NSITreeViewArray#getProgressMode
 * @public
 * @function
 * @param {Number} row      the index of the row.
 * @param {nsITreeColumn} col   The index of the column.
 * @return {Number}
 */
GeckoJS.NSITreeViewArray.prototype.getProgressMode = function(row, col) {
    return 1;
};


/**
 * getRowProperties    implemented nsITreeView interface
 *
 * @name GeckoJS.NSITreeViewArray#getRowProperties
 * @public
 * @function
 * @param {Number} row      the index of the row.
 * @param {Object} props    The properties of the row.
 * @return {Object}
 */
GeckoJS.NSITreeViewArray.prototype.getRowProperties = function(row, props) {
    
    };

/**
 * getCellProperties    implemented nsITreeView interface
 *
 * @name GeckoJS.NSITreeViewArray#getCellProperties
 * @public
 * @function
 * @param {Number} row          The index of the row.
 * @param {nsITreeColumn} col   The index of the column.
 * @param {Object} props        The properties of the cell.
 * @return {Object}
 */
GeckoJS.NSITreeViewArray.prototype.getCellProperties = function(row, col, props) {

    };

/**
 * getColumnProperties    implemented nsITreeView interface
 *
 * @name GeckoJS.NSITreeViewArray#getColumnProperties
 * @public
 * @function
 * @param {Number} row          The index of the row.
 * @param {Object} props        The properties of the cell.
 * @return {Object}
 */
GeckoJS.NSITreeViewArray.prototype.getColumnProperties = function(col, props) {

    };

/**
 * selectionChanged    implemented nsITreeView interface
 *
 * Should be called from a XUL onselect handler whenever the selection changes.
 *
 * @name GeckoJS.NSITreeViewArray#selectionChanged
 * @public
 * @function
 */
GeckoJS.NSITreeViewArray.prototype.selectionChanged = function() {
    
    };

/**
 * performAction    implemented nsITreeView interface
 * 
 * A command API that can be used to invoke commands on the selection.
 * The tree will automatically invoke this method when certain keys are pressed.
 * For example, when the DEL key is pressed, performAction will be called with the delete string.
 *
 * @name GeckoJS.NSITreeViewArray#performAction
 * @public
 * @function
 * @param {String} action            The action to perform. 
 */
GeckoJS.NSITreeViewArray.prototype.performAction = function(action) {

    };

/**
 * performActionOnRow    implemented nsITreeView interface
 *
 * A command API that can be used to invoke commands on a specific row.
 *
 * @name GeckoJS.NSITreeViewArray#performActionOnRow
 * @public
 * @function
 * @param {String} action            The action to perform.
 * @param {Number} row               The row of the cell.
 */
GeckoJS.NSITreeViewArray.prototype.performActionOnRow = function(action, row) {

    };

/**
 * performActionOnCell    implemented nsITreeView interface
 *
 * A command API that can be used to invoke commands on a specific cell.
 *
 * @name GeckoJS.NSITreeViewArray#performActionOnCell
 * @public
 * @function
 * @param {String} action            The action to perform.
 * @param {Number} row               The row of the cell.
 * @param {nsITreeColumn} col        The column of the cell.
 */
GeckoJS.NSITreeViewArray.prototype.performActionOnCell = function(action, row, col) {

    };

/**
 * Defines the GeckoJS.StringBundle namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.StringBundle', GeckoJS.global);

// getString
// getFormattedString

/**
 * Creates a new GeckoJS.StringBundle instance and initializes it with an
 * empty list of listeners and an empty set of string bundles.
 * 
 * @class GeckoJS.StringBundle is a Singleton used to load localized resources
 * from property files. A property file is a list of property key-value pairs
 * each on a separate line. The key and value are separated with an equals
 * sign.<br/>
 * GeckoJS.StringBundle is implemented using XPCOM nsIStringBundleService.<br/>
 * 
 * @name GeckoJS.StringBundle
 * @extends GeckoJS.BaseObject
 * @extends GeckoJS.Singleton
 *
 * @property {GeckoJS.Event} events                 A list of event listeners for updates on the string bundle (read-only)
 * @property {GeckoJS.Map} map                      A collection of the key-value pairs in the string bundle (read-only)
 * @property {nsIStringBundleService} bundleService A reference to the XPCOM nsIStringBundleService service {read-only}
 */
GeckoJS.StringBundle = GeckoJS.BaseObject.extend('StringBundle',
/** @lends GeckoJS.StringBundle.prototype */
{

    /**
     * StringBundle contructor
     *
     * @name GeckoJS.StringBundle#init
     * @public
     * @function
     */
    init: function(){

        this._map = new GeckoJS.Map();
        /*
        if (Application.storage.has('GeckoJS_StringBundle_map')) {
            this._map = Application.storage.get('GeckoJS_StringBundle_map',  (new GeckoJS.Map()) );
        }else {
            this._map = new GeckoJS.Map();
            Application.storage.set('GeckoJS_StringBundle_map', this._map);
        }*/

    }
});

// make StringBundle support singleton
GeckoJS.Singleton.support(GeckoJS.StringBundle);


//map getter
GeckoJS.StringBundle.prototype.__defineGetter__('map', function(){
	return this._map;
});


GeckoJS.StringBundle.prototype.__defineGetter__('bundleService', function(){
	if (this._bundleService == null) {
		this._bundleService = GREUtils.XPCOM.getService("@mozilla.org/intl/stringbundle;1" , "nsIStringBundleService");
	}
	return this._bundleService;
});


/**
 * Loads a string bundle from a URL.<br/>
 * <br/>
 * This methods loads a string bundle from the location given by URLSpec, which
 * is normally a Chrome URL. The string bundle is then cached in memory and does
 * not get reloaded unless the cache is flushed.
 *
 * @name GeckoJS.StringBundle.createBundle
 * @public
 * @static
 * @function
 * @param {String} URLspec            This is the location of the string bundle to load, given as an URL
 * @return {nsIStringBundle}          The string bundle resource
 */
GeckoJS.StringBundle.createBundle = function(URLSpec) {
	return GeckoJS.StringBundle.getInstance().createBundle(URLSpec);
};


/**
 * Loads a string bundle from a URL.<br/>
 * <br/>
 * This methods loads a string bundle from the location given by URLSpec, which
 * is normally a Chrome URL. The string bundle is then cached in memory and does
 * not get reloaded unless the cache is flushed.
 *
 * @name GeckoJS.StringBundle#createBundle
 * @public
 * @function
 * @param {String} URLspec            This is the location of the string bundle to load, given as an URL
 * @return {nsIStringBundle}          The string bundle resource
 */
GeckoJS.StringBundle.prototype.createBundle = function(URLSpec) {
	var md5 = GREUtils.CryptoHash.md5(URLSpec);

	// if exists return nsIStringBundle
	if (!this.map.containsKey(md5)) {
		try {
			this.map.add(md5, this.bundleService.createBundle(URLSpec));

            var self = this;
            // resource release guarder
            /*
            window.addEventListener('unload', function(evt) {
                self.map.remove(md5);
            }, true);
            */

		}
		catch (e) {
		}
	}
	return this.map.get(md5);
};

/**
 * Flushes the bundle cache.<br/>
 * <br/>
 * Flushes the string bundle cache; this is useful when the locale changes or
 * when we need to get some extra memory back. At some point, we might want
 * to make this flush all the bundles, because any bundles that are floating
 * around when the locale changes will suddenly contain bad data.
 *
 * @name GeckoJS.StringBundle.flushBundles
 * @public
 * @static
 * @function
 */
GeckoJS.StringBundle.flushBundles = function() {
	GeckoJS.StringBundle.getInstance().flushBundles();
};

/**
 * Flushes the bundle cache.<br/>
 * <br/>
 * Flushes the string bundle cache; this is useful when the locale changes or
 * when we need to get some extra memory back. At some point, we might want
 * to make this flush all the bundles, because any bundles that are floating
 * around when the locale changes will suddenly contain bad data.
 *
 * @name GeckoJS.StringBundle#flushBundles
 * @public
 * @function
 */
GeckoJS.StringBundle.prototype.flushBundles = function() {
	this.bundleService.flushBundles();
	this.map.clear();
};


/**
 * Retrieves a string from a bundle by its name.<br/>
 * <br/>
 * If "URLSpec" is given, this method will first load the string bundle at this
 * location if it is not already cached before searching for the string through
 * the cached string bundles.<br/>
 * <br/>
 * The first match by name is returned; null is returned if no match is found.
 *
 * @name GeckoJS.StringBundle.getStringFromName
 * @public
 * @static
 * @function
 * @param {String} name               This is the name of the string to retrieve
 * @param {String} URLSpec            This is the location of a string bundle to add to the bundle cache; defaults to null
 * @return {String}                   The requested string
 */
GeckoJS.StringBundle.getStringFromName = function(name, URLSpec){
	return GeckoJS.StringBundle.getInstance().getStringFromName(name, URLSpec);
};


/**
 * Retrieves a string from a bundle by its name.<br/>
 * <br/>
 * If "URLSpec" is given, this method will first load the string bundle at this
 * location if it is not already cached before searching for the string through
 * the cached string bundles.<br/>
 * <br/>
 * The first match by name is returned; null is returned if no match is found.
 *
 * @name GeckoJS.StringBundle#getStringFromName
 * @public
 * @function
 * @param {String} name               This is the name of the string to retrieve
 * @param {String} URLSpec            This is the location of a string bundle to add to the bundle cache; defaults to null
 * @return {String}                   The requested string
 */
GeckoJS.StringBundle.prototype.getStringFromName = function(name, URLSpec) {

	var str = null;

	var bundles = this.map.getValues() || [];
        
        if(URLSpec) {
                if(this.createBundle(URLSpec)) {
                    bundles.splice(0,0,this.createBundle(URLSpec));
                }
        }
        
        name = name.replace('\n', '\\n');

	bundles.forEach(function(bundle){
		try {
			str = bundle.GetStringFromName(name);
		}catch(e){

		}
		// first match then return ?
		if(str) return str;
	});
	if (str == null) {
		str = name.replace('\\n', '\n');
	}
	return str;
};


/**
 * Returns a formatted string with the given key name from a string bundle,
 * where each occurrence of %S (uppercase) is replaced by each successive element
 * in the supplied array. You may also use other formatting codes, but can only
 * pass Unicode strings in. The name should refer to a string in the bundle that
 * uses %S.<br/>
 * <br/>
 * If "URLSpec" is given, this method will first load the string bundle at this
 * location if it is not already cached before searching for the string through
 * the cached string bundles.<br/>
 * <br/>
 * The first match by name is returned; if no match is found, the given key name
 * is itself used as the formatting string.
 *
 * @name GeckoJS.StringBundle.formatStringFromName
 * @public
 * @static
 * @function
 * @param {String} name               This is the name of the string to retrieve
 * @param {Object} params             This is the array of strings to use as arguments to the formatting codes
 * @param {String} URLSpec            This is the location of a string bundle to add to the bundle cache; defaults to null
 * @return {String}                   The formatted string
 */
GeckoJS.StringBundle.formatStringFromName = function(name, params, URLSpec) {
	return GeckoJS.StringBundle.getInstance().formatStringFromName(name, params, URLSpec);
};



/**
 * Returns a formatted string with the given key name from a string bundle,
 * where each occurrence of %S (uppercase) is replaced by each successive element
 * in the supplied array. You may also use other formatting codes, but can only
 * pass Unicode strings in. The name should refer to a string in the bundle that
 * uses %S.<br/>
 * <br/>
 * If "URLSpec" is given, this method will first load the string bundle at this
 * location if it is not already cached before searching for the string through
 * the cached string bundles.<br/>
 * <br/>
 * The first match by name is returned; if no match is found, the given key name
 * is itself used as the formatting string.
 *
 * @name GeckoJS.StringBundle#formatStringFromName
 * @public
 * @function
 * @param {String} name               This is the name of the string to retrieve
 * @param {Object} params             This is the array of strings to use as arguments to the formatting codes
 * @param {String} URLSpec            This is the location of a string bundle to add to the bundle cache; defaults to null
 * @return {String}                   The formatted string
 */
GeckoJS.StringBundle.prototype.formatStringFromName = function(name, params, URLSpec) {

	var str = null;

	var bundles = this.map.getValues() || [];

        if(URLSpec) {
                if(this.createBundle(URLSpec)) {
                    bundles.splice(0,0,this.createBundle(URLSpec));
                }
        }

        name = name.replace('\n', '\\n');

	bundles.forEach(function(bundle){
		try {
			str = bundle.formatStringFromName(name, params, params.length);
		}catch(e){

		}
		// first match then return ?
		if(str) return str;
	});

	if(str == null) {
		str = name.replace('\\n', '\n');
		params.forEach(function(s){
			str = str.replace(/%S/, s);
		});
	}
	return str;

};


/**
 * Retrieves a string from a preferences service by its name.<br/>
 * <br/>
 * The first match by name is returned; null is returned if no match is found.
 *
 * @name GeckoJS.StringBundle.getPrefLocalizedString
 * @public
 * @static
 * @function
 * @param {String} name               This is the name of the PrefName to retrieve
 * @return {String}                   The requested string
 */
GeckoJS.StringBundle.getPrefLocalizedString = function(name){
	return GeckoJS.StringBundle.getInstance().getPrefLocalizedString(name);
};


/**
 * Retrieves a string from a preferences service by its name.<br/>
 * <br/>
 * The first match by name is returned; null is returned if no match is found.
 *
 * @name GeckoJS.StringBundle#getPrefLocalizedString
 * @public
 * @function
 * @param {String} name               This is the name of the PrefName to retrieve
 * @return {String}                   The requested string
 */
GeckoJS.StringBundle.prototype.getPrefLocalizedString = function(name) {

	var str = null;

        try {
            var prefs = GREUtils.Pref.getPrefService();
            str = prefs.getComplexValue(name, Components.interfaces.nsIPrefLocalizedString).data;
        }catch(e) {
            str = null;
        }
	return str;
};

/**
 * Defines the GeckoJS.I18n namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.I18n', GeckoJS.global);

/**
 * Creates a new GeckoJS.I18n instance.
 * 
 * @class GeckoJS.I18n provides internationalization support for applications running on
 * the VIVIPOS APP Engine.<br/>
 *
 * @name GeckoJS.I18n
 * @extends GeckoJS.BaseObject
 * @extends GeckoJS.Singleton
 */
GeckoJS.I18n = GeckoJS.BaseObject.extend('I18n',
/** @lends GeckoJS.I18n.prototype */
{
    
    /**
     * I18n contructor
     *
     * @name GeckoJS.I18n#init
     * @public
     * @function
     */
    init: function(){

        this._stringbundle = GeckoJS.StringBundle.getInstance();
        
    }
});

// make I18n support singleton
GeckoJS.Singleton.support(GeckoJS.I18n);



/**
 * Returns the application locale for messages.
 *
 * @name GeckoJS.I18n.getApplicationLocale
 * @public
 * @static
 * @function
 * @return {String}                   The application locale for messages
 */
GeckoJS.I18n.getApplicationLocale = function() {
	try {
		var service = GREUtils.XPCOM.getService("@mozilla.org/intl/nslocaleservice;1", "nsILocaleService");
		return service.getApplicationLocale().getCategory("NSILOCALE_MESSAGES");
	}catch (e) {
		return "";
	}
};

/**
 * Returns the system locale for messages.
 *
 * @name GeckoJS.I18n.getSystemLocale
 * @public
 * @static
 * @function
 * @return {String}                   The system locale for messages
 */
GeckoJS.I18n.getSystemLocale = function() {
	try {
		var service = GREUtils.XPCOM.getService("@mozilla.org/intl/nslocaleservice;1", "nsILocaleService");
		return service.getSystemLocale().getCategory("NSILOCALE_MESSAGES");
	}catch (e) {
		return "";
	}
};

/**
 * Returns the User Agent locale component.
 *
 * @name GeckoJS.I18n.getLocaleComponentForUserAgent
 * @public
 * @static
 * @function
 * @return {String}                   The user agent locale component
 */
GeckoJS.I18n.getLocaleComponentForUserAgent = function() {
	try {
		var service = GREUtils.XPCOM.getService("@mozilla.org/intl/nslocaleservice;1", "nsILocaleService");
		return service.getLocaleComponentForUserAgent();
	}catch (e) {
		return "";
	}
};


/**
 * Returns the locale for message as determined from the given accept language.
 *
 * @name GeckoJS.I18n.getLocaleFromAcceptLanguage
 * @public
 * @static
 * @function
 * @param {String} accept_language    This is the Accept Language used to determine the locale
 * @return {String}                   The locale for messages as determined from the Accept Language
 */
GeckoJS.I18n.getLocaleFromAcceptLanguage = function(accept_language) {
	try {
		var service = GREUtils.XPCOM.getService("@mozilla.org/intl/nslocaleservice;1", "nsILocaleService");
		return service.getLocaleFromAcceptLanguage(accept_language).getCategory("NSILOCALE_MESSAGES");
	}catch (e) {
		return "";
	}
};

/**
 * Returns the locale for package
 *
 * @name GeckoJS.I18n.getSelectedLocaleForPackage
 * @public
 * @static
 * @function
 * @param {String} packageName         This is the package name
 * @return {String}                   The locale for messages
 */
GeckoJS.I18n.getSelectedLocaleForPackage = function(packageName) {
	var selectedLocale = "";
	try {
		var chromeRegInstance = Components.classes["@mozilla.org/chrome/chrome-registry;1"].createInstance();
		var xulChromeReg = chromeRegInstance.QueryInterface(Components.interfaces.nsIXULChromeRegistry);
		selectedLocale = xulChromeReg.getSelectedLocale("localeswitchdemo");
	}catch(err) {
		GeckoJS.I18n.log('ERROR', "Couldn't getSelectedLocaleForPackage " + packageName +", "+ err);
		selectedLocale = "";
	}
	return selectedLocale;
};

/**
 * Returns the locales Array from the given package.
 *
 * @name GeckoJS.I18n.getLocalesForPackage
 * @public
 * @static
 * @function
 * @param {String} packageName        This is the package name of chrome registry
 * @return {Array}                    The locales for the package name
 */
GeckoJS.I18n.getLocalesForPackage = function(packageName) {
	var locales = [];
	try {

		var chromeRegInstance = Components.classes["@mozilla.org/chrome/chrome-registry;1"].createInstance();
		var toolkitChromeReg = chromeRegInstance.QueryInterface(Components.interfaces.nsIToolkitChromeRegistry);
		
		var availableLocales = toolkitChromeReg.getLocalesForPackage(packageName);
		
		while(availableLocales.hasMore()) {
			var locale = availableLocales.getNext();
			locales.push(locale);
		}

	}catch (err) {
		GeckoJS.I18n.log('ERROR', "Couldn't getLocalesForPackage " + packageName +", "+ err);
		locales = [];
	}
	return locales;
};


/**
 * Returns the locale for message for a new Locale.
 *
 * @name GeckoJS.I18n.newLocale
 * @public
 * @static
 * @function
 * @return {String}                   The locale for messages for a new Locale
 */
GeckoJS.I18n.newLocale = function() {
	try {
		var service = GREUtils.XPCOM.getService("@mozilla.org/intl/nslocaleservice;1", "nsILocaleService");
		return service.newLocale().getCategory("NSILOCALE_MESSAGES");
	}catch (e) {
		return "";
	}
};

/**
 * Change to the new Locale.
 *
 * @name GeckoJS.I18n.changeLocale
 * @public
 * @static
 * @function
 * @param {String} newLocale                   The locale for a new Locale
 * @param {Boolean} restart                    Restart application
 */
GeckoJS.I18n.changeLocale = function(newLocale, restart) {

	restart = restart || false;

	try {
	
		// Write preferred locale to local user config
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		    getService(Components.interfaces.nsIPrefBranch);
		prefs.setCharPref("general.useragent.locale", newLocale);
	
		if (restart) {
			// Restart application
			var appStartup = Components.classes["@mozilla.org/toolkit/app-startup;1"]
			     .getService(Components.interfaces.nsIAppStartup);

			appStartup.quit(Components.interfaces.nsIAppStartup.eRestart |
		 		        Components.interfaces.nsIAppStartup.eAttemptQuit);
		}
	
	} catch(err) {

		GeckoJS.I18n.log('ERROR', "Couldn't change locale: " + err);
	}

};

/**
 * Translates a string.<br/>
 * <br/>
 * If a single argument is passed in, this method treats it as a key and returns
 * the first matching string from the cached string bundles. If a second argument
 * is present, then the method returns the formatted string produced by calling
 * GeckoJS.StringBundle.formatStringFromName() on the two arguments.    
 *
 * @name GeckoJS.I18n#translate
 * @public
 * @function  
 * @param {String} [str]                This is the string to translate
 * @param {Array} [arguments]           This is an array of strings to use as arguments to the formatting codes in "str"
 * @return {String}                   The translated string
 */
GeckoJS.I18n.prototype.translate = function() {

	if (arguments.length == 1) {
		return this._stringbundle.getStringFromName(arguments[0]);
	}else {
		return this._stringbundle.formatStringFromName(arguments[0], arguments[1]);
	}

};

/**
 * Translates a string.<br/>
 * <br/>
 * If a single argument is passed in, this method treats it as a key and returns
 * the first matching string from the cached string bundles. If a second argument
 * is present, then the method returns the formatted string produced by calling
 * GeckoJS.StringBundle.formatStringFromName() on the two arguments.    
 *
 * @name GeckoJS.I18n.translate
 * @public
 * @static 
 * @function  
 * @param {String} [str]                This is the string to translate
 * @param {Array} [arguments]           This is an array of strings to use as arguments to the formatting codes in "str"
 * @return {String}                   The translated string
 */
GeckoJS.I18n.translate = function() {
	return GeckoJS.I18n.getInstance().translate.apply(GeckoJS.I18n.getInstance(), arguments);
};


// for jsmodules export
var _ = function(){
	return GeckoJS.I18n.translate.apply(null, arguments);
};
/**
 * Defines the GeckoJS.HttpRequest namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.HttpRequest', GeckoJS.global);

/**
 * Creates a new GeckoJS.HttpRequest instance.
 * 
 * @class GeckoJS.HttpRequest provides client-side support for communication
 * with HTTP servers. Through GeckoJS.HttpRequest, a client application can
 * exchange XML documents with remote HTTP services without having to deal with
 * the underlying networking details.<br/>
 * <br/>
 * This class is implemented using the XPCOM nsIXMLHttpRequest and
 * nsIJSXMLHttpRequest interfaces.<br/>
 *
 * @name GeckoJS.HttpRequest
 * @extend GeckoJS.BaseObject
 *
 * @property {GeckoJS.Event} events           A list of event listeners for changes on the request status (read-only)
 * @property {XMLHttpRequest} XMLHttpRequest  The underlying nsIXMLHttpRequest component handling the networking details (read-only)
 * @property {Object} requestSettings         A collection of request settings {read-only}
 * @property {Number} readyState              The state of the request as a numeric code {read-only}
 * @property {String} readyStateText          The state of the request as a descriptive string {read-only}
 * @property {Object} responseData            Data returned in response to the request; is parsed either as text/xml or text depending on content-type in the response header {read-only}
 * @property {Object} lastModified            A cache of If-Modified-Since request headers for individual URLs (read-only)
 * @property {Boolean} async                  A flag, when "true", indicates that the request should be asynchronous
 * @property {Number} timeout                 Request Timeout miliseconds, defaults to 60000
 */
GeckoJS.HttpRequest = GeckoJS.BaseObject.extend('HttpRequest', 
/** @lends GeckoJS.HttpRequest.prototype */
{

    /**
     * HttpRequest contructor
     *
     * @name GeckoJS.HttpRequest#init
     * @public
     * @function
     */
    init: function(){

        this._events = new GeckoJS.Event();
        this._xhr = null;

        // default request settings
        this._requestSettings = {
            method: "GET",
            timeout: 60000,
            contentType: "application/x-www-form-urlencoded",
            processData: true,
            async: false,
            data: null,
            username: null,
            password: null
        };

        // Last-Modified header cache for next request
        this._lastModified = {};

    }
});

/**
 * HttpRequest Accepts request type
 *
 * <blockquote><pre>
 * xml: "application/xml, text/xml"
 * html: "text/html"
 * script: "text/javascript, application/javascript"
 * json: "application/json, text/javascript"
 * text: "text/plain"
 * default: "* / *"
 * </pre></blockquote>
 *
 *
 * @name GeckoJS.HttpRequest.requestAccepts
 * @public
 * @function
 * @return {GeckoJS.Map}              The collection of the key-value pairs stored in the repository
 */
GeckoJS.HttpRequest.requestAccepts = {
    xml: "application/xml, text/xml",
    html: "text/html",
    script: "text/javascript, application/javascript",
    json: "application/json, text/javascript",
    text: "text/plain",
    _default: "*/*"
};

// extends getter / setter

//events getter
GeckoJS.HttpRequest.prototype.__defineGetter__('events', function(){
    return this._events;
});

//XMLHttpRequest getter
GeckoJS.HttpRequest.prototype.__defineGetter__('XMLHttpRequest', function(){

    // lazy initialize
    if (this._xhr == null) {
        this._xhr = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);

        // bind to event dispatch
        var self = this;
        this._xhr.onprogress = function(evt){
            self.events.dispatch('progress', evt);
        };
        this._xhr.onload = function(evt){
            self.events.dispatch('load', evt);
        };
        this._xhr.onerror = function(evt){
            self.events.dispatch('error', evt);
        };
    }
    return this._xhr;
});

// _requestSettings
GeckoJS.HttpRequest.prototype.__defineGetter__('requestSettings', function(){
    return this._requestSettings;
});

// _lastModified
GeckoJS.HttpRequest.prototype.__defineGetter__('lastModified', function(){
    return this._lastModified;
});

// readyState
GeckoJS.HttpRequest.prototype.__defineGetter__('readyState', function(){
    return this.XMLHttpRequest.readyState;
});

// readyStateText
GeckoJS.HttpRequest.prototype.__defineGetter__('readyStateText', function(){
    var _text = "";
    switch (this.readyState) {
        case 0:
            _text = "UNINITIALIZED";
            break;
        case 1:
            _text = "LOADING";
            break;
        case 2:
            _text = "LOADED";
            break;
        case 3:
            _text = "INTERACTIVE";
            break;
        case 4:
            _text = "COMPLETED";
            break;
    }
    return _text;
});


// responseData
GeckoJS.HttpRequest.prototype.__defineGetter__('responseData', function(){
    var data = null;
    var req = this.XMLHttpRequest;

    if (this.readyState == 4) {

        var ct = req.getResponseHeader("content-type");
        var xml = ct && ct.indexOf("xml") >= 0;
        data = xml ? req.responseXML : req.responseText;

        if (xml && data.documentElement.tagName == "parsererror")
            throw "parsererror";

    }
    return data;
});


// async
GeckoJS.HttpRequest.prototype.__defineGetter__('async', function(){
    return this.requestSettings.async;
});
GeckoJS.HttpRequest.prototype.__defineSetter__('async', function(s){
    return this.requestSettings.async = s;
});

// timeout
GeckoJS.HttpRequest.prototype.__defineGetter__('timeout', function(){
    return this._requestSettings.timeout;
});
// timeout
GeckoJS.HttpRequest.prototype.__defineSetter__('timeout', function(t ){
    this._requestSettings.timeout = t;
});



/**
 * Returns the complete list of response headers for the current request.
 *
 * This method returns a string containing all the response headers as
 * name/value pairs delimited by a carriage return/line feed (CRLF) sequence.
 * If the response has not yet been received an empty string is returned.
 *
 * @name GeckoJS.HttpRequest#getAllResponseHeaders
 * @public
 * @function
 * @return {String}                           All the response headers
 */
GeckoJS.HttpRequest.prototype.getAllResponseHeaders = function(){
    try {
        return this.XMLHttpRequest.getAllResponseHeaders();
    }
    catch (e) {
        return "";
    }
};


/**
 * Returns the value of a response header from the current request.<br/>
 * <br/>
 * If the response has not yet been received or if the header does not exist in
 * the response, an empty string is returned.
 *
 * @name GeckoJS.HttpRequest#getResponseHeader
 * @public
 * @function
 * @param {String} header                     This is the name of the header to retrieve
 * @return {String}                           All the response headers
 */
GeckoJS.HttpRequest.prototype.getResponseHeader = function(header){
    try {
        return this.XMLHttpRequest.getResponseHeader(header);
    }
    catch (e) {
        return "";
    }
};

/**
 * Sets a HTTP request header for HTTP requests.<br/>
 * <br/>
 * The open() method must be called before setting the request headers.
 *
 * @name GeckoJS.HttpRequest#setRequestHeader
 * @public
 * @function
 * @param {String} header                     This is the name of the header to set in the request.
 * @param {String} value                      This is the value to which to set the header
 */
GeckoJS.HttpRequest.prototype.setRequestHeader = function(header, value){
    try {
        this.XMLHttpRequest.setRequestHeader(header, value);
    }
    catch (e) {
    }
};

/**
 * Overrides the mime type returned by the server (if any).<br/>
 * <br/>
 * This may be used, for example, to force a stream to be treated and parsed as
 * text/xml, even if the server does not report it as such.<br/>
 * <br/>
 * This must be done before the send() method is invoked.
 *
 * @name GeckoJS.HttpRequest#overrideMimeType
 * @public
 * @function
 * @param {String} mimetype                   This is the mimetype to use to override that returned by the server (if any)
 */
GeckoJS.HttpRequest.prototype.overrideMimeType = function(mimetype){
    try {
        this.XMLHttpRequest.overrideMimeType(mimetype);
    }
    catch (e) {
    }
};

/**
 * Sends the request.<br/>
 * <br/>
 * The "body" parameter specifies the request body. It is either an instance of
 * nsIDOMDocument, nsIInputStream or a string (nsISupportsString in the native
 * calling case). This is used to populate the body of the HTTP request if the
 * HTTP request method is "POST".<br/>
 * <br/>
 * If the parameter is an nsIDOMDocument, it is serialized. If the parameter is
 * an nsIInputStream, then it must be compatible with
 * nsIUploadChannel.setUploadStream, and a Content-Length header will be added
 * to the HTTP request with a value given by nsIInputStream.available. Any
 * headers included at the top of the stream will be treated as part of the
 * message body. The MIME type of the stream should be specified by setting the
 * Content-Type header via the setRequestHeader method before calling send.<br/>
 * <br/>
 * If the request is asynchronous (i.e. the "async" property is "true"), this
 * method returns immediately after sending the request.<br/>
 * <br/>
 * If the request is synchronous, this method returns only after the response
 * has been received.<br/>
 * <br/>
 * All event listeners must be set before calling send().
 * After the initial response, all event listeners will be cleared
 *
 * @name GeckoJS.HttpRequest#send
 * @public
 * @function
 * @param {Object} body                       This is the body of the request
 */
GeckoJS.HttpRequest.prototype.send = function(body){
    try {
        this.XMLHttpRequest.send(body);
    }
    catch (e) {
    }
};


/**
 * Sends the request with binary data as the content of a POST request.<br/>
 * <br>
 * This method takes a single parameter of type DOMString containing the request
 * data to send. The DOMString will be converted to a single-byte string by
 * truncation (i.e., the high-order byte of each character will be discarded)
 * before it is sent.<br/>
 * <br/>
 * This is a variant of the send() method and behaves in an identical manner.
 *
 * @name GeckoJS.HttpRequest#sendAsBinary
 * @public
 * @function
 * @param {DOMString} body                    This is the binary data to send
 */
GeckoJS.HttpRequest.prototype.sendAsBinary = function(body){
    try {
        this.XMLHttpRequest.sendAsBinary(body);
    }
    catch (e) {
    }
};


/**
 * Aborts the request if it has been sent.
 *
 * @name GeckoJS.HttpRequest#abort
 * @public
 * @function
 */
GeckoJS.HttpRequest.prototype.abort = function(){
    try {
        this.XMLHttpRequest.abort();
    }
    catch (e) {
    }

};


/**
 * Initializes the request.<br/>
 * <br/>
 * This method initializes the HTTP request with the given method and URL, and
 * optionally sets the async flag as well as the user name and password
 * credentials for authentication.<br/>
 * <br/>
 * This method must be called before request headers can be set.<br/>
 * <br/>
 * If there is an "active" request (that is, if open() has been called already),
 * this is equivalent to calling abort().
 *
 * @name GeckoJS.HttpRequest#open
 * @public
 * @function
 * @param {String} method                     This is the HTTP request method
 * @param {String} url                        This is the URL to which to send the request
 * @param {Boolean} async                     This flag indicates whether the request is asynchronous
 * @param {String} user                       This is the username to use for authentication
 * @param {String} password                   This is the password to use for authentication
 */
GeckoJS.HttpRequest.prototype.open = function(method, url, async, user, password){
    try {
        this.XMLHttpRequest.open(method, url, async, user, password);
    }
    catch (e) {
    }
};



/**
 * Sends a GET request.<br/>
 * <br/>
 * This is a specialized form of the request() method. It provides the
 * appropriate request settings and options for sending an HTTP GET request.
 *
 * @name GeckoJS.HttpRequest#get
 * @public
 * @function
 * @param {String} url                        This is the URL to which to send the request
 * @param {Object} data                       This is the request data
 * @param {Object} callback                   This is the "success" event callback
 * @param {String} type                       This is the requested response data type
 * @return {Object}                           The response data
 */
GeckoJS.HttpRequest.prototype.get = function(url, data, callback, type){

    // shift arguments if data argument was ommited
    if (GREUtils.isFunction(data)) {
        callback = data;
        data = null;
    }

    return this.request({
        method: "GET",
        url: url,
        data: data,
        success: callback,
        dataType: type
    });
};


/**
 * Sends a POST request.<br/>
 * <br/>
 * This is a specialized form of the request() method. It provides the
 * appropriate request settings and options for sending an HTTP POST request.
 *
 * @name GeckoJS.HttpRequest#post
 * @public
 * @function
 * @param {String} url                        This is the URL to which to send the request
 * @param {Object} data                       This is the request data
 * @param {Object} callback                   This is the "success" event callback
 * @param {String} type                       This is the requested response data type
 * @return {Object}                           The response data
 */
GeckoJS.HttpRequest.prototype.post = function(url, data, callback, type){
    if (GREUtils.isFunction(data)) {
        callback = data;
        data = {};
    }

    return this.request({
        method: "POST",
        url: url,
        data: data,
        success: callback,
        dataType: type
    });
};


/**
 * Sends a PUT request.<br/>
 * <br/>
 * This is a specialized form of the request() method. It provides the
 * appropriate request settings and options for sending an HTTP PUT request.
 *
 * @name GeckoJS.HttpRequest#put
 * @public
 * @function
 * @param {String} url                        This is the URL to which to send the request
 * @param {Object} data                       This is the request data
 * @param {Object} callback                   This is the "success" event callback
 * @param {String} type                       This is the requested response data type
 * @return {Object}                           The response data
 */
GeckoJS.HttpRequest.prototype.put = function(url, data, callback, type){
    if (GREUtils.isFunction(data)) {
        callback = data;
        data = {};
    }

    return this.request({
        method: "PUT",
        url: url,
        data: data,
        success: callback,
        dataType: type
    });
};


/**
 * Sends a DELETE request.<br/>
 * <br/>
 * This is a specialized form of the request() method. It provides the
 * appropriate request settings and options for sending an HTTP DELETE request.
 *
 * @name GeckoJS.HttpRequest#delete
 * @public
 * @function
 * @param {String} url                        This is the URL to which to send the request
 * @param {Object} data                       This is the request data
 * @param {Object} callback                   This is the "success" event callback
 * @param {String} type                       This is the requested response data type
 * @return {Object}                           The response data
 */
GeckoJS.HttpRequest.prototype.delete_ = function(url, data, callback, type){
    if (GREUtils.isFunction(data)) {
        callback = data;
        data = {};
    }

    return this.request({
        method: "DELETE",
        url: url,
        data: data,
        success: callback,
        dataType: type
    });
};
// Issue the specified request.

GeckoJS.HttpRequest.prototype['delete'] = GeckoJS.HttpRequest.prototype.delete_;

/**
 * Sends the request.<br/>
 * <br/>
 * This is a generic method for sending a request. For normal use, the
 * specialized request methods should be used.<br/>
 * <br/>
 * This method constructs the request options and settings by merging and
 * overriding the default request settings (the "requestSettings" property) with
 * additional options and settings given in the input parameter "s", stored as
 * properties of the object.<br/>
 * <br/>
 * This method dispatches a "start" event with the request settings as the event
 * data before opening the request. A "send" event is dispatched immediately
 * before the request is sent to the HTTP server, with event data set as an
 * array containing the string "xml" as the first element, and the collection of
 * request settings as the second element.<br/>
 * <br/>
 * If the request is successful, a "success" event is dispatched with event data
 * set as an array containing the string "xml" as the first element, and the
 * collection of request settings as the second element.<br/>
 * <br/>
 * When the request completes, a "complete" event is dispatched with event data
 * set as an array containing the string "xml" as the first element, and the
 * collection of request settings as the second element.<br/>
 * <br/>
 * This method supports callbacks on "success" and "complete" events. These
 * callbacks are set via the "success" and "complete" request settings. The
 * callback function will be passed the response data as the first argument and
 * the request status as the second argument.<br/>
 * <br/>
 * If the request is asynchronous, the method returns immediately after sending
 * the request. A "timeout" option may be set that causes the request to abort
 * if it has not completed after a given amount of time (in milliseconds) has
 * elapsed. A request that times out is considered to have completed
 * successfully.<br/>
 * <br/>
 * If the request is synchronous, this method returns only after the response
 * has been received.<br/>
 * <br/>
 * If the request completes successfully, this method returns the response data.
 * The content-type header from the response headers should be examined to
 * determine the type of the response data.
 *
 * @name GeckoJS.HttpRequest#request
 * @public
 * @function
 * @param {Object} s                          This is a collection of additional request options and settings
 * @return {Object}                           The reponse data
 */
GeckoJS.HttpRequest.prototype.request = function(s){

    var status, data, timeoutObj;

    // Extend the settings
    s = GREUtils.extend({}, this.requestSettings, s);

    // convert data if not already a string
    if (s.data && s.processData && typeof s.data != "string")
        s.data = GeckoJS.String.httpBuildQuery(s.data);

    if (s.dataType == "script" && s.cache == null)
        s.cache = false;

    if (s.cache === false && s.method.toLowerCase() == "get") {
        var ts = (new Date()).getTime();
        // try replacing _= if it is there
        var ret = s.url.replace(/(\?|&)_=.*?(&|$)/, "$1_=" + ts + "$2");
        // if nothing was replaced, add timestamp to the end
        s.url = ret + ((ret == s.url) ? (s.url.match(/\?/) ? "&" : "?") + "_=" + ts : "");
    }

    // If data is available, append data to url for get requests
    if (s.data && s.method.toLowerCase() == "get") {
        s.url += (s.url.match(/\?/) ? "&" : "?") + s.data;
        s.data = null;
    }

    // Watch for a new set of requests
    // dispatch start event
    this.events.dispatch('start', s);

    var requestDone = false;

    var xml = this;
    var req = xml.XMLHttpRequest;

    s.accepts = GeckoJS.HttpRequest.requestAccepts;

    // Open the socket
    xml.open(s.method, s.url, s.async, s.username, s.password);

    // Need an extra try/catch for cross domain requests in Firefox 3
    try {
        // Set the correct header, if data is being sent
        if (s.data)
            xml.setRequestHeader("Content-Type", s.contentType);

        // Set the If-Modified-Since header, if ifModified mode.
        if (s.ifModified)
            xml.setRequestHeader("If-Modified-Since", this._lastModified[s.url] || "Thu, 01 Jan 1970 00:00:00 GMT");

        // Set header so the called script knows that it's an XMLHttpRequest
        xml.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        // Set the Accepts header for the server, depending on the dataType
        xml.setRequestHeader("Accept", s.dataType && s.accepts[s.dataType] ? s.accepts[s.dataType] + ", */*" : s.accepts._default);

        // Set Extra Headers
        if(s.headers) {
            for (var header in s.headers) {
                xml.setRequestHeader(header, s.headers[header]);
            }
        }

    }
    catch (e) {
        this.events.dispatch('error', e);
    }

    // dispatch send event
    this.events.dispatch('send', [xml, s]);

    var onreadystatechange = function(aEvt){
        if (!requestDone && req && (xml.readyState == 4 || aEvt == "timeout")) {

            alert('onreadystatechange ' + aEvt);
            // clear Timeout Timer
            clearTimeout(timeoutObj);
            
            requestDone = true;
            status = "success";
            data = xml.responseData;
            data = GeckoJS.HttpRequest.httpData(data, s.dataType);
            alert(data);
            alert('before calling success ');
            success();
            complete();
        }
        else {
            dump("Error loading page\n");
        }
    };

    if (s.async) {
        // In asynchronous usage, you get a callback when the data has been received
        req.onreadystatechange = onreadystatechange;
    }

    // Timeout checker
    if (s.timeout > 0)
        timeoutObj = setTimeout(function(){
            // Check to see if the request is still happening
            alert('timeout');
            if (xml) {
                // Cancel the request
                xml.abort();

                if (!requestDone)
                    onreadystatechange("timeout");

                clearTimeout(timeoutObj);
            }
        }, s.timeout);

    // Send the data
    try {
        xml.send(s.data);
    }
    catch (e) {
        alert(e);
        this.events.dispatch('error', e);
    }

    // gecko doesn't fire statechange for sync requests
    if (!s.async)
        onreadystatechange();


    function success(){
        alert('in success ' + status + ',' + data);
        // If a local callback was specified, fire it and pass it the data
        if (s.success)
            s.success(data, status);

        // Fire the global callback
        xml.events.dispatch('success', [xml, s]);
    }

    function complete(){
        alert('in complete ');
        // Process result
        if (s.complete)
            s.complete(data, status);

        // The request was completed
        xml.events.dispatch('complete', [xml, s]);
    }

    alert('before return');
    // return Data.
    return data;
};

/**
 * Restores a JavaScript object from its JSON representation.<br/>
 * <br/>
 * If type given is "json", decodes the JSON data  into the corresponding
 * object. Otherwise simply returns the data.
 *
 * @name GeckoJS.HttpRequest.httpData
 * @public
 * @static
 * @function
 * @param {Object} data                       This is the data
 * @param {String} type                       This is the data type
 * @return {Object}                           The JavaScript object represented by the JSON
 */
GeckoJS.HttpRequest.httpData = function(data, type){

    /*
     // If the type is "script", eval it in global context
     if ( type == "script" )
     jQuery.globalEval( data );
     */
    // Get the JavaScript object, if JSON is used.
    if (type == "json")
        data = GREUtils.JSON.decode(data);

    return data;

};

/**
 * Model Extented utilities
 *
 */
if (GeckoJS.BaseModel) {


/**
 * export CSV
 *
 * "params" is an object with any of the following available options as
 *  keys:<br/>
 * <pre>
 *  - conditions   : query conditions    // "name='rack lin' AND age = 30"
 *  - fields       : query fields        // "name, email"
 *  - order        : fields to order by  // "name ASC, age DESC"
 *  - limit        : an integer indicating the page size
 *  - page         : an integer indicating the page number
 * </pre>
 *
 * @name GeckoJS.BaseModel#exportCSV
 * @public
 * @function
 * @param {String} file
 * @param {Object} params
 * @return {Number} 
 */
    GeckoJS.BaseModel.prototype.exportCSV = function(file, params, aCallback) {

        params = params || {};
        params.recursive = 0; // force recursive to 0

        var result = this.find('all', params);
        var count = result.length;
        var modelName = this.name;

        try {

            var saveFile = new GeckoJS.File(file, true);
            saveFile.open("w");

            var isFirstRow = true;
            var columns = [];

            var idx = 0;
            var nextIdx = 1;

            result.forEach(function(row) {

                var buf = "";
                if (isFirstRow) {
                    columns = GeckoJS.BaseObject.getKeys(row[modelName]);

                    buf = columns.join('","');
                    buf = '"'+buf+'"';

                    saveFile.write(buf+"\n");

                    isFirstRow = false;
                }

                var data =[];
                columns.forEach(function(col){
                    var val = new String(row[modelName][col]);
                    val = val.replace('"', '""');
                    data.push(val);
                });

                buf = data.join('","');
                buf = '"'+buf+'"';
                saveFile.write(buf+"\n");

                if(aCallback) {
                    try {
                        aCallback.apply(this, idx, count);
                    }catch(e){}
                }

                idx++;

            });

            saveFile.close();

        }catch(e){
            GeckoJS.BaseModel.log('ERROR', 'exportCSV ' + e);
        }
        
        return count;

    };


    /**
 * exportXML
 *
 * "params" is an object with any of the following available options as
 *  keys:<br/>
 * <pre>
 *  - conditions   : query conditions    // "name='rack lin' AND age = 30"
 *  - fields       : query fields        // "name, email"
 *  - order        : fields to order by  // "name ASC, age DESC"
 *  - limit        : an integer indicating the page size
 *  - page         : an integer indicating the page number
 * </pre>
 *
 * @name GeckoJS.BaseModel#exportXML
 * @public
 * @function
 * @param {String} file
 * @param {Object} params
 * @return {Number}
 */
    GeckoJS.BaseModel.prototype.exportXML = function(file, params, aCallback) {

        params = params || {};
        params.recursive = 0; // force recursive to 0

        var result = this.find('all', params);
        var count = result.length;
        var modelName = this.name;
        var table = this.table;

        try {

            var saveFile = new GeckoJS.File(file, true);
            saveFile.open("w");

            saveFile.write('<?xml version="1.0" encoding="UTF-8"?>\n');
            saveFile.write('<table name="'+ table+'" model="'+modelName+'">\n');

            var isFirstRow = true;
            var columns = [];

            var idx = 0;

            result.forEach(function(row) {

                var buf = "";
                if (isFirstRow) {
                    columns = GeckoJS.BaseObject.getKeys(row[modelName]);

                    saveFile.write('  <cols>\n');

                    columns.forEach(function(col){
                        saveFile.write('    <col name="'+col+'">'+col+'</col>\n');
                    });

                    saveFile.write('  </cols>\n');

                    isFirstRow = false;

                    saveFile.write('  <rows>\n');

                }

                saveFile.write('    <row>\n');

                var data =[];
                columns.forEach(function(col){
                    var val = new String(row[modelName][col]);

                    saveFile.write('      <col name="'+col+'"><![CDATA['+val+']]></col>\n');

                });

                saveFile.write('    </row>\n');

                if(aCallback) {
                    try {
                        aCallback.apply(this, idx, count);
                    }catch(e){}
                }

                idx++;

            }, this);

            if (isFirstRow === false) saveFile.write('  </rows>\n');

            saveFile.write('</table>\n');

            saveFile.close();

        }catch(e){
            GeckoJS.BaseModel.log('ERROR', 'exportXML ' + e);
        }
        
        return count;

    };

}
