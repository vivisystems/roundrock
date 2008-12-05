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
var GeckoJS = GeckoJS || {version: "0.9.21"}; // Check to see if already defined in current scope

/**
 * This is a reference to the global context, which is normally the "window" object.
 *  
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
 * @field
 * @type {String} Name for hash code property
 * @private
 */
GeckoJS.HASH_CODE_PROPERTY = '__GeckoJS_hashCode__';


/**
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
 * @namespace
 */
GREUtils.define('GeckoJS.Singleton', GeckoJS.global);

GeckoJS.Singleton = {

/**
 * Gets an instance of the Singleton class.<br/>
 * <br/>
 * This is a dummy method and is overridden in individual Singleton classes.<br/>
 *
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
};/**
 * @namespace Defines the GeckoJS.Class namespace
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
 * @public
 * @function
 * @param {GeckoJS.Log.Level} level This is the level of the message
 * @param {String} message   		This is the message to log
 * @param {Object} [exception]      This is an optional exception to use
 * @return {GeckoJS.Log.ClassLogger} An instance of the class specific logger
 */
GeckoJS.BaseObject.prototype.log = function(level, message, exception) {

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
 *
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
 * @public
 * @function
 * @param {String} command              This is the command to dispatch
 * @param {Object} data                 This is the data to pass to the controller
 * @param {Object} context              This is the controller to dispatch the command to
 * @return {GeckoJS.BaseObject}
 */
GeckoJS.BaseObject.prototype.requestCommand = function(command, data, context) {
    var window = window || GeckoJS.global;
    context = context || this;
    GeckoJS.Dispatcher.dispatch(window, command, data, context);
    return this;
};


/**
 * Dispatches a command to a controller
 *
 * @public
 * @static
 * @function
 * @param {String} command              This is the command to dispatch
 * @param {Object} data                 This is the data to pass to the controller
 * @param {Object} context              This is the controller to dispatch the command to
 * @return {GeckoJS.BaseObject}
 */
GeckoJS.BaseObject.requestCommand = function(command, data, context) {
    var window = window || GeckoJS.global;
    context = context || window;
    GeckoJS.Dispatcher.dispatch(window, command, data, context);
    return this;
};

/**
 * Serializes an object using JSON encoding.
 *
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object to serialize
 * @return {String}         The JSON representation of the object
 */
GeckoJS.BaseObject.serialize = function(obj){

    var res = GREUtils.JSON.encode(obj);
    return res;

};


/**
 * Serializes this GeckoJS.BaseObject instance using JSON encoding.
 *
 * @public
 * @function
 * @return {String}         The JSON representation of this BaseObject
 */
GeckoJS.BaseObject.prototype.serialize = function(){
    return GeckoJS.BaseObject.serialize(this);
};

/**
 * Serializes an object using JSON encoding.
 *
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
 * @public
 * @function
 * @return {String}                 The JSON representation of this BaseObject
 */
GeckoJS.BaseObject.prototype.stringify = GeckoJS.BaseObject.prototype.serialize;


/**
 * Recreates an object from its JSON encoding.
 *
 * @public
 * @static
 * @function
 * @param {String} str      The JSON representation of the object
 * @return {Object}         The object represented by the JSON string
 */
GeckoJS.BaseObject.unserialize = function(str){

    var res = GREUtils.JSON.decode(str);
    return res;

};


/**
 * Restores this GeckoJS.BaseOBject instance to the state represented by the JSON encoding.
 *
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
 * @public 
 * @static
 * @function  
 * @param {Object} array     This is the object to dump 
 * @return {String}          The formatted dump output
 *
 */
GeckoJS.BaseObject.dump = function ( array ) {

    var output = "";
    var pad_char = " ";
    var pad_val = 4;

    var formatArray = function (obj, cur_depth, pad_val, pad_char) {
        if (cur_depth > 0) {
            cur_depth++;
        }

        var base_pad = repeat_char(pad_val*cur_depth, pad_char);
        var thick_pad = repeat_char(pad_val*(cur_depth+1), pad_char);
        var str = "";

        if(obj == null) return str;
        
        // TODO recursive depth use setting ?
        if(cur_depth > 6) return "** too many recursive **" + "\n";

        if ( (typeof obj == "object") || (typeof obj == "array"))  {
            str += obj.constructor.name + "\n" + base_pad + "{" + "\n";
            for (var key in obj) {
                if ( (typeof obj[key] == "object") || (typeof obj[key] == "array") || (typeof obj[key] == "function") ) {

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
 * @public 
 * @function  
 * @param {Object} array     This is the object to dump 
 * @return {String}          The formatted dump output
 *
 */
GeckoJS.BaseObject.prototype.dump = function (array) {

    var obj = array || this;
    return GeckoJS.BaseObject.dump(obj);

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
 * @class
 * @extends GeckoJS.BaseObject
 */
GeckoJS.Map = GeckoJS.BaseObject.extend('Map', {
    init: function(){

        this._obj = {};
		this._keys = [];
		this._count = 0;

    }
});


/**
 * Returns the number of elements in a Map.
 *
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
 * @public
 * @static
 * @function
 * @param {Object} obj      This is the object in which to look for key
 * @param {String} key      The key for which to check
 * @return {Boolean}        "true" if "key" is contained in "obj"
 */
GeckoJS.Map.containsKey = function(obj, key){
    return key in obj && obj[key] !== Object.prototype[key] ;
};


/**
 * Checks whether this Map contains the given key.
 *
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
 * @public
 * @function
 */
GeckoJS.Map.prototype.clear = function(){

      // delete old reference
      delete this._obj ;

      // reset
	  this._obj = {};
	  this._keys.length = 0;
	  this._count = 0;

};


/**
 * Removes a key-value pair from an object/hash/map based on the key.
 *
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
 * @private
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
 * @extends GeckoJS.BaseObject
 */
GeckoJS.Set = GeckoJS.BaseObject.extend('Set', {
    init: function(){

        this._map = new GeckoJS.Map();

    }
});


/**
 * This is used to get the key or the hash. We are not using getHashCode
 * because it only works with objects
 * 
 * @param {*} val Object or primitive value to get a key for.
 * @return {string} A unique key for this value/object.
 * @private
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
 * @public
 * @function
 */
GeckoJS.Set.prototype.clear = function(){
    this._map.clear();
};


/**
 * Removes an object from the Set.
 *
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
// FUEL's SessionStorage support
if (Application.storage.has("GeckoJS_Log_classes")) {
    GeckoJS.Log.classes = Application.storage.get("GeckoJS_Log_classes", (new GeckoJS.Map()) );
}else {
    GeckoJS.Log.classes = new GeckoJS.Map();
    Application.storage.set("GeckoJS_Log_classes", GeckoJS.Log.classes);
}

if (Application.storage.has("GeckoJS_Log_appenders")) {
    GeckoJS.Log.appenders = Application.storage.get("GeckoJS_Log_appenders", (new GeckoJS.Map()) );
}else {
    GeckoJS.Log.appenders = (new GeckoJS.Map());
    Application.storage.set("GeckoJS_Log_appenders", GeckoJS.Log.appenders);
}


//if (Application.storage.has("GeckoJS_Log_defaultClassLevel")) {
//    GeckoJS.Log.defaultClassLevel = Application.storage.get("GeckoJS_Log_classes", null );
//}else {
    GeckoJS.Log.defaultClassLevel = null;
//    Application.storage.set("GeckoJS_Log_defaultClassLevel", GeckoJS.Log.defaultClassLevel);
//}

//if (Application.storage.has("GeckoJS_Log_defaultLogger")) {
//    GeckoJS.Log.defaultLogger = Application.storage.get("GeckoJS_Log_defaultLogger", {} );
//}else {
    GeckoJS.Log.defaultLogger = {};
//    Application.storage.set("GeckoJS_Log_defaultLogger", GeckoJS.Log.defaultLogger);
//}

GeckoJS.Log.levels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"];

/**
 * Returns in an array the built-in log levels.
 *
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
        window.addEventListener('unload', function(evt) {
            GeckoJS.Log.classes.remove(className);
        }, true);

    }
    return GeckoJS.Log.classes.get(className);
};


/**
 * Checks if a class-specific logger already exists for a given class.
 *
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
        window.addEventListener('unload', function(evt) {
            GeckoJS.Log.appenders.remove(name);
        }, true);
    }
};

/**
 * Removes the specified appender.
 *
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
        }catch(e) {
            // maybe append at openwindow, and window closed
            GeckoJS.Log.appenders.remove(appenderName);
            GREUtils.log(appenderName + ", " + e );
        }
    });

    return GeckoJS.Log;
    
};


/**
 * Initializes GeckoJS.Log and instantiates a default Logger of class "GeckoJS".
 *
 * @private
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
 * @return {GeckoJS.Log.Level}		The current log level
 */
GeckoJS.Log.ClassLogger.prototype.getLevel = function getLevel()
{
    return this.level;
};

/**
 * Sets the log level.
 *
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
GeckoJS.Log.Appender = GeckoJS.Class.extend('Appender', {
    init: function (level) {
        this.level = level;
    }
});

/**
 * Formats a log message for output.
 *
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
    var formattedDate = today.getUTCFullYear() + "-" + GeckoJS.String.padLeft(today.getUTCMonth(), 2) + "-" + GeckoJS.String.padLeft(today.getUTCDate(), 2) + " " +
    GeckoJS.String.padLeft(today.getUTCHours(), 2) + ":" + GeckoJS.String.padLeft(today.getUTCMinutes(), 2) + ":" + GeckoJS.String.padLeft(today.getUTCSeconds(), 2);

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
GeckoJS.Log.ConsoleAppender = GeckoJS.Log.Appender.extend('ConsoleAppender', {
    init: function(level) {
        this.level = level;
    }
});


/**
 * Logs a message by appending it to the end of the console device.
 *
 * @public
 * @function
 * @param {String} className 		This is the name of the class to use
 * @param {GeckoJS.Log.Level} level	This is the log level to use for this message
 * @param {String} message   		This is the message to log
 * @param {Object} [exception] 		This is an optional exception object to use
 * @return {GeckoJS.Log.ConsoleAppender} This GeckoJS.Log.ConsoleAppender instance
 */
GeckoJS.Log.ConsoleAppender.prototype.append = function (className, level, message, exception) {

    GREUtils.XPCOM.getUsefulService("consoleservice").logStringMessage(this.getFormattedMessage(className, level, message, exception));
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
GeckoJS.Log.FileAppender = GeckoJS.Log.Appender.extend('FileAppender', {
    
    init: function(level, logFile) {
        this.level = level;
        this.logFile = logFile || null;
    }
});


/**
 * Logs a message by appending it to the end of the log file.
 *
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
 * @class
 *
 * @property {Object} listeners   An array of event listeners (read-only)
 *
 */

GeckoJS.Event = GeckoJS.BaseObject.extend('Event', {
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
 * @public
 * @static
 * @field {Object} callbacks
 */
// GeckoJS.Event.callbacks = [];
if (Application.storage.has("GeckoJS_Event_callbacks")) {
    GeckoJS.Event.callbacks = Application.storage.get("GeckoJS_Event_callbacks", (new Array()) );
}else {
    GeckoJS.Event.callbacks = (new Array());
    Application.storage.set("GeckoJS_Event_callbacks", GeckoJS.Event.callbacks);
}


/**
 * Adds a global event callback.<br/>
 * <br/>
 * This method checks if the same event-callback combination already exists
 * before adding a new callback.
 *
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
    if(typeof window != 'undefined') {
        var self = this;
        window.addEventListener('unload', function(evt) {
            GeckoJS.Event.removeCallback(aType, aCallback);
        }, true);
    }

};

/**
 * Removes a global event callback.<br/>
 *
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
            }catch(e) {
                GeckoJS.Event.log('Event', 'ERROR', 'GeckoJS.Event.processCallback', e);
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
    if(typeof window != 'undefined') {
        var self = this;
        window.addEventListener('unload', function(evt) {
            self.removeListener(aEvent, aListener);
        }, true);
    }
/*
    function hasFilter(element){
        return element.event == aEvent && element.listener == aListener;
    }*/
};

/**
 * Removes a listener for an event.<br/>
 *
 * @public
 * @function
 *
 * @param {String} aEvent         This is the event for which a listener is to be removed
 * @param {Function} aListener    This is the listener function to be removed
 */
GeckoJS.Event.prototype.removeListener = function(aEvent, aListener){

    for (var i = this.listeners.length -1; i >0; i--) {
        var element = this.listeners[i];
        if ( element.event == aEvent && (element.listener == aListener || element.listener.__hashCode == aListener.__hashCode) ) {
            this.listeners.splice(i,1);
        }

    }
    /*
    this.listeners = this.listeners.filter(function(element){
        return !(element.event == aEvent && (element.listener == aListener) );
    });
    */

};

/**
 * Dispatches an event to all listeners of that event.<br/>
 * <br/>
 * This method creates an EventItem instance from the input parameters to pass
 * to the event listeners. If any of the listeners invokes the preventDefault()
 * method on the EventItem instance, this method will return "false". Otherwise
 * it returns "true".
 *
 * @public
 * @function
 * @param {String} aEvent         This is the name of the event to dispatch
 * @param {Object} aEventData     This is the event data to dispatch
 * @param {Object} aTarget        This is the event target
 * @return {Boolean}              Whether preventDefault() has been invoked on the event
 */
GeckoJS.Event.prototype.dispatch = function(aEvent, aEventData, aTarget){
    var eventItem = new GeckoJS.EventItem(aEvent, aEventData, aTarget);

    this.listeners.forEach(function(key){
        GeckoJS.Event.processCallback("before", eventItem);
        
        if (key.event == aEvent && !eventItem.cancel) {

            try {
                key.listener.handleEvent ? key.listener.handleEvent.call(key.thisObj, eventItem) : key.listener.call(key.thisObj, eventItem);
            }catch(e) {
                GeckoJS.Event.log('Event', 'ERROR', 'GeckoJS.Event.dispatch (' + key.event +') ', e);
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
 * @public
 * @function
 *
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
 * @namespace
 * @name GeckoJS.String
 */
GREUtils.define('GeckoJS.String', GeckoJS.global);


/**
 * Generates a globally unique ID.
 *
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
 * @public
 * @static
 * @function
 * @param {String} word           This is the string of words
 * @return {String}               The string with first character of each word converted to upper case
 */
GeckoJS.String.ucwords = function(word){
    return GREUtils.ucwords(word);
};


/**
 * Converts the first character of a string to upper case.
 *
 * @public
 * @static
 * @function
 * @param {String} word           This is the string
 * @return {String}               The string with the first character converted to upper case
 */
GeckoJS.String.ucfirst = function(word){
    return GREUtils.ucfirst(word);
};


/**
 * Trims white spaces to the left and right of a string.
 *
 * @public
 * @static
 * @function
 * @param {String} str            This is the string to trim
 * @return {String}               The trimmed string
 */
GeckoJS.String.trim = function(str){
    // include it in the regexp to enforce consistent cross-browser behavior.
    return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
};


/**
 * Trims white spaces at the left end of a string.
 *
 * @public
 * @static
 * @function
 * @param {String} str            This is the string to trim
 * @return {String}               The trimmed string
 */
GeckoJS.String.trimLeft = function(str){
    // include it in the regexp to enforce consistent cross-browser behavior.
    return str.replace(/^[\s\xa0]+/, '');
};


/**
 * Trims white spaces at the right end of a string.
 *
 * @public
 * @static
 * @function
 * @param {String} str            This is the string to trim
 * @return {String}               The trimmed string
 */
GeckoJS.String.trimRight = function(str){
    // include it in the regexp to enforce consistent cross-browser behavior.
    return str.replace(/[\s\xa0]+$/, '');
};


/**
 * Pads a string 'on the left' to the specified length by prepending the string
 * with the given padding character. 
 *
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
 * @public
 * @static
 * @function
 * @return {String}               A random string
 */
GeckoJS.String.getRandomString = function(){
    return Math.floor(Math.random() * 2147483648).toString(36) +
    (Math.floor(Math.random() * 2147483648) ^
    (new Date).getTime()).toString(36);
};


/**
 * Converts a string from one character set encoding to another.<br/>
 * <br/>
 * This method takes a string encoded in character set "in_charset"
 * and returns the corresponding string encoded in character set "out_charset".
 *
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
 * @public
 * @static
 * @function
 * @param {Boolean|String|Object} bool            This is the value to parse
 * @return {Boolean}
 *
 */
GeckoJS.String.parseBoolean = function(bool) {

    if (typeof bool == 'string' ) {
        return (bool.length == 0 || bool.toUpperCase() == '0' || bool.toUpperCase() == 'FALSE' || bool.toUpperCase() == 'NULL') ? false : true;
    }else {
        return new Boolean(bool).valueOf();
    }
};


/**
 * Escapes an input string for use with SQL
 *
 * @alias GeckoJS.String.escapeForSQL
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
 * @alias GeckoJS.String.singleQuote
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
 * GeckoJS.Array provides a set of functions for manipulating arrays.<br/>
 * 
 * @public
 * @namespace 
 * @name GeckoJS.Array
 */
GREUtils.define('GeckoJS.Array', GeckoJS.global);


/**
 * Creates a copy of an array.<br/>
 * <br/>
 * If the object passed in is not an array, a new array with the object as its
 * only element is returned.<br/>
 *
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
 * @public
 * @static
 * @function
 * @param {Object} elem       This is the element to look for in the array
 * @param {Object} array      This is the array
 * @return {Number}          The index of the element
 */
GeckoJS.Array.inArray =  function( elem, array ) {
	for ( var i = 0, length = array.length; i < length; i++ )
	// Use === because on IE, window == document
		if ( array[ i ] === elem )
			return i;

	return -1;
};


/**
 * Merges two arrays.<br/>
 * <br/>
 * This method appends the second array to the end of the first array.<br/>
 *
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
            var serialize = GREUtils.JSON.encode( array[ i ] );
            serialize = serialize || String(array[i]);
			var id = GREUtils.CryptoHash.md5(serialize);
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
 * @param {Object||Array} data Array Or Data from where to extract
 * @param {String} pathKey  dot-separated string.
 * @param {String} pathValue  dot-separated string.
 * @return {Object} Extracted data
 * @access public

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
 * @class
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
		this._InputStream = GREUtils.File.getInputStream(this.file, aMode, aPerms);
	}else {
		// write mode ?
		this.create(); // if not exists
		this._OutStream = GREUtils.File.getOutputStream(this.file, aMode, aPerms);
	}
};


/**
 * Closes the file.<br/>
 * <br/>
 * This method closes an open file. It has no effect on a file that is not
 * already open. 
 * 
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
 * Reads a given number of bytes from the file and closes the file.<br/>
 * <br/>
 * The file must already be open for reading before its content may be read. If
 * the file has been opened in binary mode, the content is returned as an array
 * of bytes. Otherwise the content is returned as a String.<br/>
 * <br/>
 * If errors occur while reading from the file, null is returned.
 * 
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
      else
        rv = this._InputStream.read(aSize);
      
      this._InputStream.close();
    } catch (e) {
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.read ' + aSize); 
		rv = null;
	}

    return rv;	
	
};


/**
 * Writes the content of the given buffer to the file.<br/>
 * <br/>
 * The file must already be open for writing. Textual data is written to the
 * file using UTF-8 encoding. If the file has been opened in binary mode, the
 * buffer can be either an array of bytes or a string of bytes.
 * 
 * @public
 * @function
 * @param {Object|String} aBuffer    This is the buffer containing data to write to file
 * @return {Number}                 0 if successful, 1 otherwise
 */
GeckoJS.File.prototype.write = function (aBuffer) {

    var rv  = 0;
    try {
      if (this._IsBinary) {
	  	
	  	if(aBuffer.constructor == Array) this._OutStream.writeByteArray(aBuffer, aBuffer.length);
		else this._OutStream.write(aBuffer, aBuffer.length);
		
	  }else {
	  	
		// auto convert text output charset
		var oBuffer = GREUtils.Charset.convertFromUnicode(aBuffer, this._OutputCharset);
		this._OutStream.write(oBuffer, oBuffer.length);
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
 * @public
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
 * @param {String} path 		This is the full or partial (to be resolved) path of the file to delete
 */
GeckoJS.File.remove = function (path)
{
	var file = new GeckoJS.File(path);

	if (!file.isFile()) {
		throw path+" is not a file" ;
	}

	if (file.exists())	{
		file.remove();
	}
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
 * @public
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
 * @public
 * @function
 * @param {String} aFileName      This is the file name to append to the directory
 * @return {Boolean}              Whether the file name has been successfully appended
 */
GeckoJS.File.prototype.append = function(aFileName){

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
		GeckoJS.BaseObject.log('[Error] GeckoJS.File.append: '+e.message);
        return "";
    }
    
    return rv;
};


/**
 * Checks if this GeckoJS.File instance corresponds to a directory.
 * 
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is a directory; "false" otherwise
 */
GeckoJS.File.prototype.isDir = function(){

	if(this.file == null) return false;
	    
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
 * Checks if this GeckoJS.File instance corresponds to a file.
 * 
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is a file; "false" otherwise
 */
GeckoJS.File.prototype.isFile = function(){

	if(this.file == null) return false;
	    
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
 * Checks if this GeckoJS.File instance corresponds to an executable file.
 * 
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is an executable file; "false" otherwise
 */
GeckoJS.File.prototype.isExecutable = function(){

	if(this.file == null) return false;
	    
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
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is a symbolic link; "false" otherwise
 */
GeckoJS.File.prototype.isSymlink = function(){

	if(this.file == null) return false;
	    
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
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is writable; "false" otherwise
 */
GeckoJS.File.prototype.isWritable = function(){

	if(this.file == null) return false;
	    
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
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is hidden; "false" otherwise
 */
GeckoJS.File.prototype.isHidden = function(){

	if(this.file == null) return false;
	    
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
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is readable; "false" otherwise
 */
GeckoJS.File.prototype.isReadable = function(){

	if(this.file == null) return false;
	    
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
 * @public
 * @function
 * @return {Boolean}                "true" if this File instance is special; "false" otherwise
 */
GeckoJS.File.prototype.isSpecial = function(){

	if(this.file == null) return false;
	    
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
 * @public
 * @function
 * @return {Number}                -1 when exceptions occur; "null" otherwise
 */
GeckoJS.File.prototype.normalize = function(){

	if(this.file == null) return -1;
	    
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
 * @public
 * @function
 * @param {String} aArgs          This is the array of arguments to pass to the executable
 * @param {Boolean} blocking      If "true", the method blocks until the process terminates; defaults to false
 * @return {Number}               The process ID
 */
GeckoJS.File.prototype.run = function(aArgs, blocking){
	if (this.file == null) return -1;
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
    } 
    catch (e) {
		GREUtils.log('[Error] GeckoJS.File.run: ' + e.message);
        rv = -3
    }
    return rv;
};


/**
 * Adds a line to the end of an existing file.
 *
 * @param {String} path     The full or partial (to be resolved) path of the file to append
 * @param {String} text		The text to append, as a new line
*/
GeckoJS.File.appendLine = function(path, text){

	var file = new GeckoJS.File(path, true);

	try
	{
		file.open('a');
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
 * @class
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
 *
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
 * @public
 * @static
 * @function
 * @param {String} path                  This is the full path of the directory
 * @return {Object}                      Returns the directory entries as an array of strings containing file paths
 */
GeckoJS.Dir.readDir = function(path){
	return GREUtils.Dir.readDir(path);
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
 * @public
 * @function
 * @return {Object}                      Returns the directory entries as an array of strings containing file paths
 */
GeckoJS.Dir.prototype.readDir = function(){
	return GREUtils.Dir.readDir(this.path);
};

/**
 * Defines the GeckoJS.ClassRegistry namespace.
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.ClassRegistry', GeckoJS.global);

/**
 * Creates a new GeckoJS.ClassRegistry instance and initializes it with an
 * empty registry repository and listener list.<br/>
 * 
 * @class GeckoJS.ClassRegistry provides a central Singleton registry for
 * GeckoJS classes. Each class should be registered with its class name as
 * the key. The registration entries are stored in the "map" field.<br/>
 * <br/>
 * The class registry contains a read-only "events" field of type GeckoJS.Event.
 * This "events" field may be associated with event listeners that are invoked
 * whenever the repository is updated. Please see the individual method
 * description for information on the details of the various update events.<br/>
 * 
 * @name GeckoJS.ClassRegistry
 * @extends GeckoJS.BaseObject
 * @extends GeckoJS.Singleton
 *
 * @property {GeckoJS.Event} events   A set of event listeners for updates on the registry (read-only)
 * @property {GeckoJS.Map} map        A collection of the key-object pairs stored in the registry (read-only)
 */
GeckoJS.ClassRegistry = GeckoJS.BaseObject.extend('ClassRegistry', {
    init: function(){

        this._events = new GeckoJS.Event();
        this._map = new GeckoJS.Map();
    }
});

// make ClassRegistry support singleton
GeckoJS.Singleton.support(GeckoJS.ClassRegistry);

//events getter
GeckoJS.ClassRegistry.prototype.__defineGetter__('events', function(){
    return this._events;
});


//map getter
GeckoJS.ClassRegistry.prototype.__defineGetter__('map', function(){
    return this._map;
});

/**
 * Returns the set of event listeners associated with the registry.
 *
 * @public
 * @function
 * @return {GeckoJS.Event}            The set of event listeners associated with the registry
 */
GeckoJS.ClassRegistry.prototype.getEvents = function(){
    return this._events;
};


/**
 * Returns the collection of key-object pairs stored in the registry.
 *
 * @public
 * @function
 * @return {GeckoJS.Map}              The collection of the key-object pairs stored in the registry
 */
GeckoJS.ClassRegistry.prototype.getMap = function(){
    return this._map;
};

// We need shadow some method for event support.


/**
 * Flushes all objects from the registry.<br/>
 * <br/>
 * This method flushes (clears) all key-object pairs stored in the registry,
 * generating a "flush" event that is dispatched to all listeners of that event
 * after all the key-object pairs have been flushed. This GeckoJS.ClassRegistry
 * instance is passed to the event listeners as the event data
 * (in the field "eventItem.data").
 *
 * @public
 * @function
 */
GeckoJS.ClassRegistry.prototype.flush = function(){
    this.map.clear();
    this.events.dispatch("flush", this);
};


/**
 * Flushes all objects from the registry.<br/>
 * <br/>
 * This method flushes (clears) all key-object pairs stored in the registry,
 * generating a "flush" event that is dispatched to all listeners of that event
 * after all the key-object pairs have been flushed. This GeckoJS.ClassRegistry
 * instance is passed to the event listeners as the event data
 * (in the field "eventItem.data").
 *
 * @public
 * @static
 * @function
 */
GeckoJS.ClassRegistry.flush = function(){
	GeckoJS.ClassRegistry.getInstance().flush();
};

/**
 * Removes an object from the registry.<br/>
 * <br/>
 * This method removes an object identified by the given key from the registry,
 * generating a "remove" event that is dispatched to all listeners of that event
 * after the object has been removed. The key is passed to the event listeners
 * as the event data (in the field "eventItem.data").
 *
 * @public
 * @static
 * @function
 * @param {String} key                This is the key that identifies the object to remove
 */
GeckoJS.ClassRegistry.prototype.removeObject = function(key){
    this.map.remove(key);
    this.events.dispatch("remove", key);
};


/**
 * Removes an object from the registry.<br/>
 * <br/>
 * This method removes an object identified by the given key from the registry,
 * generating a "remove" event that is dispatched to all listeners of that event
 * after the object has been removed. The key is passed to the event listeners
 * as the event data (in the field "eventItem.data").
 *
 * @public
 * @function
 * @param {String} key                This is the key that identifies the object to remove
 */
GeckoJS.ClassRegistry.removeObject = function(key){
	GeckoJS.ClassRegistry.getInstance().removeObject(key);
};


/**
 * Adds an object to the registry.<br/>
 * <br/>
 * This method adds the given object to the registry, registering it with the
 * give key. A "change" event is dispatched to all listeners of that event
 * after the object has been added, where the key-object pair is passed to the
 * event listeners as named properties of the event data object (i.e. as
 * "eventItem.data.key" and "eventItem.data.value").<br/>
 * <br/>
 * Any existing object in the registry associated with the key is replaced by the
 * new object.
 *
 * @public
 * @function
 * @param {String} key                This is the key used to register the object
 * @param {Object} obj                This is the object to store in the registry
 */
GeckoJS.ClassRegistry.prototype.addObject = function(key, obj){
    this.setObject(key, obj);
};


/**
 * Adds an object to the registry.<br/>
 * <br/>
 * This method adds the given object to the registry, registering it with the
 * give key. A "change" event is dispatched to all listeners of that event
 * after the object has been added, where the key-object pair is passed to the
 * event listeners as named properties of the event data object (i.e. as
 * "eventItem.data.key" and "eventItem.data.value").
 * <br/>
 * Any existing object in the registry associated with the key is replaced by the
 * new object.
 *
 * @public
 * @static
 * @function
 * @param {String} key                This is the key used to register the object
 * @param {Object} obj                This is the object to store in the registry
 */
GeckoJS.ClassRegistry.addObject = function(key, obj){
	GeckoJS.ClassRegistry.getInstance().addObject(key, obj);
};


/**
 * Adds an object to the registry.<br/>
 * <br/>
 * This method adds the given object to the registry, registering it with the
 * give key. A "change" event is dispatched to all listeners of that event
 * after the object has been added, where the key-object pair is passed to the
 * event listeners as named properties of the event data object (i.e. as
 * "eventItem.data.key" and "eventItem.data.value").
 * <br/>
 * Any existing object in the registry associated with the key is replaced by the
 * new object.
 *
 * @public
 * @function
 * @param {String} key                This is the key used to register the object
 * @param {Object} obj                This is the object to store in the registry
 */
GeckoJS.ClassRegistry.prototype.setObject = function(key, obj){
    this.map.set(key, obj);
    this.events.dispatch("change", {
        key: key,
        value: obj
    });
};


/**
 * Adds an object to the registry.<br/>
 * <br/>
 * This method adds the given object to the registry, registering it with the
 * give key. A "change" event is dispatched to all listeners of that event
 * after the object has been added, where the key-object pair is passed to the
 * event listeners as named properties of the event data object (i.e. as
 * "eventItem.data.key" and "eventItem.data.value").
 * <br/>
 * Any existing object in the registry associated with the key is replaced by the
 * new object.
 *
 * @public
 * @static
 * @function
 * @param {String} key                This is the key used to register the object
 * @param {Object} obj                This is the object to store in the registry
 */
GeckoJS.ClassRegistry.setObject = function(key, obj){
	GeckoJS.ClassRegistry.getInstance().setObject(key, obj);
};


/**
 * Retrieves the object registered with the given key from the registry.<br/>
 * <br/>
 * This method returns null if the key has not been registered.
 *
 * @public
 * @function
 * @param {String} key                This is the key that identifies the object to retrieve
 * @return {Object}                   The object registered with the given key
 */
GeckoJS.ClassRegistry.prototype.getObject = function(key){
    return this.map.get(key);
};


/**
 * Retrieves the object registered with the given key from the registry.<br/>
 * <br/>
 * This method returns null if the key has not been registered.
 *
 * @public
 * @static
 * @function
 * @param {String} key                This is the key that identifies the object to retrieve
 * @return {Object}                   The object registered with the given key
 */
GeckoJS.ClassRegistry.getObject = function(key){
    return GeckoJS.ClassRegistry.getInstance().getObject(key);
};


/**
 * Checks if the given key has been registered.
 *
 * @public
 * @function
 * @param {String} key                This is the key to check
 * @return {Boolean}                  "true" if the key has been registered, "false" otherwise
 */
GeckoJS.ClassRegistry.prototype.isKeySet = function(key){
    return this.map.containsKey(key);
};


/**
 * Checks if the given key has been registered.
 *
 * @public
 * @static
 * @function
 * @param {String} key                This is the key to check
 * @return {Boolean}                  "true" if the key has been registered, "false" otherwise
 */
GeckoJS.ClassRegistry.isKeySet = function(key){
    return GeckoJS.ClassRegistry.getInstance().isKeySet(key);
};


/**
 * Returns all the keys that have been registered.
 *
 * @public
 * @function
 * @return {Object}                    An array containing all the keys in the registry
 */
GeckoJS.ClassRegistry.prototype.keys = function(){
    return this.map.getKeys();
};


/**
 * Returns all the keys that have been registered.
 *    
 * @public
 * @static 
 * @function
 * @return {Object}                    An array containing all the keys in the registry
 */
GeckoJS.ClassRegistry.keys = function(){
    return GeckoJS.ClassRegistry.getInstance().keys();
};


/**
 * Cloning of GeckoJS.ClassRegistry instances is not supported.<br/>
 * <br/>
 * The clone() method from GeckoJS.BaseObject is overridden in
 * GeckoJS.ClassRegistry with a dummy method.
 *
 * @public
 * @function
 */
GeckoJS.ClassRegistry.prototype.clone = function(){
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
GeckoJS.Configure = GeckoJS.BaseObject.extend('Configure', {
    init: function(){

        // FUEL's SessionStorage support
        this._events = new GeckoJS.Event();
        if (Application.storage.has('GeckoJS_Configure_events')) {
            var sessObj = Application.storage.get('GeckoJS_Configure_events', {listeners: []} );
            this._events.listeners = sessObj.listeners;
        }else {
            var sessObj = {listeners: []};
            this._events.listeners = sessObj.listeners;
            Application.storage.set('GeckoJS_Configure_events', sessObj);
        }


        if (Application.storage.has('GeckoJS_Configure_map')) {
            this._map = Application.storage.get('GeckoJS_Configure_map', (new GeckoJS.Map()) );
        }else {
            this._map = new GeckoJS.Map();
            Application.storage.set('GeckoJS_Configure_map', this._map);
        }

        if (Application.storage.has('GeckoJS_Configure_hasLoadPreferences')) {
            this._hasLoadPreferences = Application.storage.get('GeckoJS_Configure_hasLoadPreferences', {} );
        }else {
            this._hasLoadPreferences = {};
            Application.storage.set('GeckoJS_Configure_hasLoadPreferences', this._hasLoadPreferences);
        }

	// try add preference listener
	if (!Application.storage.has('GeckoJS_Configure_PrefObserver')) {
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
				if (GeckoJS.Configure.check(aData)) {
					// update new value
					aSubject.QueryInterface(Components.interfaces.nsIPrefBranch2);
					switch(aSubject.getPrefType(aData)) {
						case aSubject.PREF_STRING:
							GeckoJS.Configure.write(aData, aSubject.getCharPref(aData));
							break;
						case aSubject.PREF_INT:
							GeckoJS.Configure.write(aData, aSubject.getIntPref(aData));
							break;
						case aSubject.PREF_BOOL:
							GeckoJS.Configure.write(aData, aSubject.getBoolPref(aData));
							break;
					}
				}
				}catch(e) { GREUtils.log('[ERROR] GeckoJS_Configure_PrefObserver ' + e); }
			  }
			};
			Application.storage.set('GeckoJS_Configure_PrefObserver', prefObserver);
			prefs.addObserver("", Application.storage.get('GeckoJS_Configure_PrefObserver', prefObserver), false);

		}catch(e) {
			GREUtils.log(e);
		}
	}

        var self = this;
        // set System PATH
        var directory_service = Components.classes["@mozilla.org/file/directory_service;1"]
        .getService(Components.interfaces.nsIProperties);

        ['ProfD', 'DefProfRt','UChrm','DefRt','PrfDef','ProfDefNoLoc','APlugns','AChrom','ComsD','CurProcD','Home','TmpD','ProfLD','resource:app','Desk'/*,'Progs'*/].forEach(function(key) {
            try {
                self.write(key, (directory_service.get(key, Components.interfaces.nsIFile)).path);
                self.write("CORE."+key, (directory_service.get(key, Components.interfaces.nsIFile)).path);
            }
            catch (e) {
                self.log('[Error] GeckoJS.Configure directory_service;1 get [' + key +'] fail.');
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
 * @public
 * @function
 * @return {GeckoJS.Map}              The collection of the key-value pairs stored in the repository
 */
GeckoJS.Configure.prototype.getMap = function() {
    return this._map;
};

// We need shadow some method for event support.


/**
 * Clears all entries from the configuration repository.<br/>
 * <br/>
 * This method clears all key-value entries stored in the configuration repository,
 * generating a "clear" event that is dispatched to all listeners of that event
 * after all the entries have been cleared. This Configure instance is passed to the
 * event listeners as the event data (in the field eventItem.data).
 *
 * @public
 * @static
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
 * @public
 * @static
 * @function
 * @param {String} key                This is the key that identifies the configuration entry to remove
 */
GeckoJS.Configure.prototype.remove = function(key){
    
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
 * @public
 * @static
 * @function
 * @param {String} key                This is the key that identifies the configuration entry to remove
 */
GeckoJS.Configure.remove = function(key){
    GeckoJS.Configure.getInstance().remove(key);
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
 * @public
 * @static
 * @function
 * @param {String} key                This is the configuration key
 * @param {Object} value              This is the configuration value
 */
GeckoJS.Configure.prototype.write = function(key, value) {

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

        this.events.dispatch("write", {
            key: key,
            value: value
        });
    }else {
        this.map.set(name[0], value);

        this.events.dispatch("write", {
            key: key,
            value: value
        });
    }
    
    
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
 * @public
 * @static
 * @function
 * @param {String} key                This is the configuration key
 * @param {Object} value              This is the configuration value
 */
GeckoJS.Configure.write = function(key, value) {
    GeckoJS.Configure.getInstance().write(key, value);
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
 * @public
 * @static
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
 * @public
 * @static
 * @function
 * @param {String} key                This is the key to check
 * @return {Boolean}                  "true" if the key exists, "false" otherwise
 */
GeckoJS.Configure.prototype.check = function(key) {
    
    var name = this.__configVarNames(key);

    if(name.length >1) {
        var obj = this.map.get(name[0]);
        if (obj == null || typeof obj[name[1]] == 'undefined') return false;
        else return true;
    }else {
        return this.map.containsKey(name[0]);
    }
    
};


/**
 * Checks if the given key exists in the configuration repository.
 *
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
 * @public
 * @function
 */
GeckoJS.Configure.prototype.clone = function(){
    };


/**
 * Serializes the configuration repository using JSON encoding.
 *
 * @public
 * @static
 * @function
 * @return {String}         The JSON representation of the configuration repository
 */
GeckoJS.Configure.prototype.serialize = function(){
    return this.map.serialize();
};


/**
 * Serializes the configuration repository using JSON encoding.
 *
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
 * @public
 * @static 
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
 * @public
 * @function
 * @param {String} startingAt                The point on the branch at which to start enumerating the child preferences. Pass in "" to enumerate all preferences referenced by this branch.
 */
GeckoJS.Configure.prototype.loadPreferences = function(startingAt){
	
    if(typeof this._hasLoadPreferences[startingAt] =='undefined' || !this._hasLoadPreferences[startingAt]) {
        var prefs = GREUtils.Pref.getPrefService();
        var prefCount = {}, prefValues = {};

        prefValues = prefs.getChildList(startingAt, prefCount );
	
        for(var i=0; i<prefCount.value; i++) {
            this.write(prefValues[i], GREUtils.Pref.getPref(prefValues[i]));
        }
        this._hasLoadPreferences[startingAt] = true;

    }
};


/**
 * Loads XULRunner's and extensions' preferences into the configuration
 * repository.
 *
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
 * @public
 * @function
 * @param {String} startingAt                The point on the branch at which to start enumerating the child preferences. Pass in "" to enumerate all preferences referenced by this branch.
 */
GeckoJS.Configure.prototype.savePreferences = function(startingAt){

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
        var type2 = typeof(prefValues[prefKey]);
        
        switch(type2) {
            case 'string':
                prefServices.setCharPref(prefKey, prefValues[prefKey]);
                break;
            case 'number':
                prefServices.setIntPref(prefKey, prefValues[prefKey]);
                break;
            case 'boolean':
                prefServices.setBoolPref(prefKey, prefValues[prefKey]);
                break;
        }
    }
    return ;

};


/**
 * Save to XULRunner's and extensions' preferences from the configuration
 * repository.
 *
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
GeckoJS.Session = GeckoJS.BaseObject.extend('Session', {
    init: function(){

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
 * @public
 * @function
 * @return {GeckoJS.Event}            The set of event listeners associated with the Session context
 */
GeckoJS.Session.getEvents = function() {
    return this.getInstance().getEvents();
};


/**
 * Returns data stored in the Session context as key-value pairs.
 *
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
 * Clears all entries from the Session context.<br/>
 * <br/>
 * This method clears all data entries stored in the Session context, generating
 * a "clear" event that is dispatched to all listeners of that event after all
 * the entries have been cleared. This Session instance is passed to the event
 * listeners as the event data (in the field eventItem.data).
 *
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
 * @public
 * @static
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
 * @public
 * @static
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
 *
 * @public
 * @static
 * @function
 * @param {String} key                This is the key under which to store the Session data
 * @param {Object} value              This is the data value
 */
GeckoJS.Session.prototype.set = function(key, value) {
	this.map.set(key, value);
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
 *
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
 *
 * @public
 * @static
 * @function
 * @param {String} key                This is the key that identifies the data to retrieve
 * @return {Object}                   The Session data stored under the given key
 */
GeckoJS.Session.prototype.get = function(key){
    return this.map.get(key);
};


/**
 * Retrieves the data value identified by the given key.<br/>
 * <br/>
 * This method returns null if the key does not exist in the Session context.
 *
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
 * @public
 * @static
 * @function
 * @param {String} key                This is the key to check
 * @return {Boolean}                  "true" if the key exists, "false" otherwise
 */
GeckoJS.Session.prototype.has = function(key) {
    return this.map.containsKey(key);
};


/**
 * Checks if the given key exists in the Session context.
 *
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
 * @public
 * @function
 */
GeckoJS.Session.prototype.clone = function(){
};


/**
 * Serializes the Session context using JSON encoding. Event listeners are not
 * serialized. 
 *
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
 * @public
 * @function
 * @param {String} str      The JSON representation of the Session context
 */
GeckoJS.Session.prototype.unserialize = function(str) {
	return this.map.unserialize(str);
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
GeckoJS.NSIRunnable = GeckoJS.BaseObject.extend('NSIRunnable', {
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
 * @class
 * @extends GeckoJS.NSIRunnable
 *
 * @property {GeckoJS.NSIRunnable} runnable   The GeckoJS.NSIRunnable object to execute (read-only)
 * @property {nsIThread} worker               An nsIThread worker thread to execute the runnable (read-only)
 * @property {nsIThread} main                 The main thread (read-only)
 * @property {Number} id                      The thread id (read-only)
 */
GeckoJS.Thread = GeckoJS.NSIRunnable.extend('Thread', {
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
GeckoJS.NSIObserver = GeckoJS.BaseObject.extend('NSIObserver', {
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
GeckoJS.Observer = GeckoJS.NSIObserver.extend('Observer', {
    
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
 * @class
 * @extends GeckoJS.BaseObject
 * @extends GeckoJS.Singleton
 * @property {GeckoJS.Event} events       A list of event listeners
 */
GeckoJS.Dispatcher = GeckoJS.BaseObject.extend('Dispatcher', {
    init: function(){

        // FUEL's SessionStorage support
        this._events = new GeckoJS.Event();
        if (Application.storage.has('GeckoJS_Dispatcher_events')) {
            var sessObj = Application.storage.get('GeckoJS_Dispatcher_events', {listeners: []} );
            this._events.listeners = sessObj.listeners;
        }else {
            var sessObj = {listeners: []};
            this._events.listeners = sessObj.listeners;
            Application.storage.set('GeckoJS_Dispatcher_events', sessObj);
        }


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
 * @public
 * @static
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to add
 */
GeckoJS.Dispatcher.addEventListener = function(aEvent, aListener) {
    this.getInstance().addEventListener(aEvent, aListener);
};


/**
 * Adds a listener for a given event to this Dispatcher instance.
 *
 * @public
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to add
 */
GeckoJS.Dispatcher.prototype.addEventListener = function(aEvent, aListener) {
    try {
        this.events.addListener(aEvent, aListener);
    }catch(e) {
        this.log("ERROR", 'GeckoJS.Dispatcher.addEventListener ' + aEvent , e);
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
 * @public
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
 * @public
 * @function
 * @param {String} sEvt             This is the event name
 * @param {Object} data             This is the event data
 * @return {Boolean}                Whether preventDefault() has been invoked on the event
 */
GeckoJS.Dispatcher.prototype.dispatchEvent = function(sEvt, data ) {
    try {
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
 * @public
 * @static
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
                context = GeckoJS.BaseController.getControllerClass(context);
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
            //var top = window.top || top || GeckoJS.global.top;
            //var document = window.document || document || GeckoJS.global.document;
            var cmdDispatcher = document.commandDispatcher || top.document.commandDispatcher || window.controllers;

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

                // dispatch dispatcher's event
                this.dispatchEvent('onDispatch', controller);

                // invoke controller 's command
                controller.doCommand(command);

            }catch(e) {
                this.log('ERROR','GeckoJS.dispatch ', e);
            }

        }else if (typeof controller['scaffold'] != 'undefined') {
            // scaffold ?
            if (typeof controller.wrappedJSObject['Scaffold'] == 'undefined') {
                // always instance new for cross window controller
                controller.wrappedJSObject['Scaffold'] = new GeckoJS.Scaffold(controller);
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
 * Defines GeckoJS.NSIController namespace
 * 
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
GeckoJS.NSIController = GeckoJS.BaseObject.extend('NSIController', {
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
 * @public
 * @static 
 * @function
 */
GeckoJS.NSIController.appendController = function() {
    var window = window || GeckoJS.global;
    window.controllers.appendController(this.getInstance());
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
 * @property {jQuery} query               The query function used to look for a document element; normally jQuery, but document.getElementById if jQuery is not available (read-only)
 * @property {Window} activeWindow        activeWindow's window object || ChromeWindow (read-only)
 * @property {Window} window              activeWindow's window object || ChromeWindow (read-only)
 * @property {Document} document          activeWindow's document object || XULDocument (read-only)
 * @property {Object} data                Data from gDispatch
 * @property {String} command             Command from gDispatch
 * @property {String} lastDispatchEvent   Name of the last dispatched event
 * @property {String} name                Name of this Controller class
 */
GeckoJS.BaseController = GeckoJS.NSIController.extend('BaseController', {
    name: 'BaseController',
    
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

        // lastDispatchEvent
        this.lastDispatchEvent = "";
		
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


/**
 * Registers the Controller sub-class in the Class Registry.
 *
 * @public
 * @static
 * @function   
 * @param {String} name                 This is the name to register the sub-class with
 * @param {GeckoJS.Controller} klass    This is the Controller sub-class to register
 */
GeckoJS.BaseController.setControllerClass = function(name, klass) {
    
    if (name == 'Controller' || GeckoJS.ClassRegistry.isKeySet("ControllerClass_" + name)) return ;

    /*
    // FUEL's SessionStorage support
    var eventKey = "GeckoJS_Controller_"+ name + "_events";
    Application.storage.set(eventKey, (new GeckoJS.Event()) );
    */

    GeckoJS.ClassRegistry.addObject("ControllerClass_" + name, klass);
};


/**
 * Retrieves the Controller sub-class object by name from the Class Registry.
 *
 * @public
 * @static
 * @function   
 * @param {String} name                 This is the name of the Model sub-class to retrieve
 * @return {GeckoJS.Controller}         The Controller sub-class identified by name
 */
GeckoJS.BaseController.getControllerClass = function(name) {
    
    return GeckoJS.ClassRegistry.getObject("ControllerClass_" + name);

};


//events getter
GeckoJS.BaseController.prototype.__defineGetter__('events', function(){
    return this._events;
});

//session getter
GeckoJS.BaseController.prototype.__defineGetter__('Session', function(){
    return this._session;
});

//domquery getter
GeckoJS.BaseController.prototype.__defineGetter__('query', function(){

    var win = this.window; // this.activeWindow;
    var doc = win.document;

    var fn = win.jQuery || function(id) {
        doc.getElementById(id.replace('#',''));
    };

    return fn;
});

//document object getter
GeckoJS.BaseController.prototype.__defineGetter__('document', function(){

    return this.activeWindow.document;
    
});

//window object getter
GeckoJS.BaseController.prototype.__defineGetter__('window', function(){

    var ww =  (typeof window != 'undefined') ? window : this.activeWindow ;

    return ww;

});

//window object getter
GeckoJS.BaseController.prototype.__defineGetter__('activeWindow', function(){

    var ww = GREUtils.XPCOM.getUsefulService("window-watcher");

    return ww.activeWindow;

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
 * @private
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
 * @private
 */
GeckoJS.BaseController.prototype._addComponents = function() {
    
    var self = this;
    var components = this.components;

    // ignore basecontroller or controller
    if (this.getClassName() == 'BaseController' || this.getClassName() == 'Controller' ) return;

    
    if (GeckoJS.Array.inArray('Acl', components) == -1) {
        components.push('Acl');
    }
    
    components.forEach( function(componentName) {
        var componentClass =GeckoJS.Component.getComponentClass(componentName);
        if (componentClass != null) {
            self[componentName] = new componentClass(self);
        }
    });

};


/**
 * _addHelpers
 *
 * @private
 */
GeckoJS.BaseController.prototype._addHelpers = function() {
    
    var self = this;
    var helpers = this.helpers;
    
    // ignore basecontroller or controller
    if (this.getClassName() == 'BaseController' || this.getClassName() == 'Controller' ) return;

    if (GeckoJS.Array.inArray('Form', helpers) == -1) {
        helpers.push('Form');
    }
    
    helpers.forEach( function(helperName) {
        var helperClass = GeckoJS.Helper.getHelperClass(helperName);
        if (helperClass != null) {
            if(typeof helperClass['getInstance'] == 'function') {
                self[helperName] = helperClass.getInstance();
            } else {
                self[helperName] = new helperClass();
            }
        }
    });

};


/**
 * _loadModels
 *
 * @private
 */
GeckoJS.BaseController.prototype._loadModels = function() {

    var modelClasses = [GeckoJS.Inflector.classify(this.name)].concat(this.uses);

    modelClasses.forEach(function(modelClass){

        if (typeof this[modelClass] != 'undefined' ) return;

        var model = GeckoJS.BaseModel.getModelClass(modelClass);

        if (model) {
            this[modelClass] = new model;
            
            // set default ModelClass and ModelKey
            if(this.modelClass.length == 0 && this.modelKey.length == 0) {

                this.modelClass = modelClass;
                this.modelKey = GeckoJS.Inflector.underscore(modelClass);

            }
        }

    }, this);

};


/**
 * Returns the list of event listeners associated with this BaseController
 * instance.
 *
 * @public
 * @function
 * @return {GeckoJS.Event}          The list of event listeners
 */
GeckoJS.BaseController.prototype.getEvents = function(){
    return this._events;
};


/**
 * Retrieves a controller's Singleton instance by the controller's name.
 *
 * @public
 * @static
 * @function
 * @param {String} name           This is the controller's name
 * @return {GeckoJS.BaseController}    The controller's Singleton instance, or null
 */
GeckoJS.BaseController.getInstanceByName = function(name) {

        var controllerClass = null;
        var controllerName = name || null;

        if (controllerName) {
            controllerClass = GeckoJS.BaseController.getControllerClass(controllerName);
        }
        
        if (controllerClass) {
            return controllerClass.getInstance();
        }else {
            return null;
        }
       
};


/**
 * Adds a listener for a given event to this BaseController instance.
 *
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
 * @public
 * @function
 * @param {String} aEvent           This is the event name
 * @param {Function} aListener      This is the listener to add
 * @param {Object} thisObj          This is the execution scope to lock the listener to
 */
GeckoJS.BaseController.prototype.addEventListener = function(aEvent, aListener, thisObj) {
    try {
        thisObj = thisObj || GeckoJS.global;
        this.events.addListener(aEvent, aListener, thisObj);
    }catch(e) {
        this.log("ERROR", this.getClassName() + 'Controller.addEventListener ' + aEvent , e);
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
 * @public
 * @function
 * @param {String} sEvt             This is the event name
 * @param {Object} data             This is the event data
 * @return {Boolean}                The return value is false, if at least one of the event handlers which handled this event, called preventDefault. Otherwise it returns true. 
 */
GeckoJS.BaseController.prototype.dispatchEvent = function(sEvt, data ) {
    try {
        this.lastDispatchEvent = sEvt;
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
 * @public
 * @function
 * @param {String} sCmd             This is the command to execute
 */
GeckoJS.BaseController.prototype.doCommand = function(sCmd){

    try {
        var beforeResult = this.dispatchEvent('beforeFilter', sCmd);

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

                    // invoke command
                    this[sCmd].apply(this, args);
                    
                }catch(e) {
                    this.log('ERROR', this.getClassName() + 'Controller.doCommand ' + sCmd , e);
                }
            }
			
            // check if user had dispatchEvent by itself
            var lastDispatchEvent = this.lastDispatchEvent;
            var autoEvent = 'on' + GeckoJS.Inflector.camelize(sCmd);
			
            if (lastDispatchEvent != autoEvent) {
                this.dispatchEvent(autoEvent, arguments);
            }
        }

        this.dispatchEvent('afterFilter', sCmd);

    }
    catch (e) {
        this.log('ERROR' , this.getClassName() + '.doCommand error occurred executing the ' + sCmd, e);
    }

};
/**
 * Defines GeckoJS.Controller namespace
 *
 * @namespace
 */
GREUtils.define('GeckoJS.Controller', GeckoJS.global);

/**
 * Creates a new GeckoJS.Controller instance.
 * 
 * @class GeckoJS.Controller inherits from GeckoJS.BaseController and is
 * intended to be extended by applications that require specialized controller
 * behaviors.<br/>
 *
 * @name GeckoJS.Controller
 * @extends GeckoJS.BaseController
 *
 */
GeckoJS.Controller = GeckoJS.BaseController.extend('Controller', {
    name: 'Controller'
});

// make Controller support singleton
GeckoJS.Singleton.support(GeckoJS.Controller);

// unnamed Controller counter
GeckoJS.Controller.unnamedCounter = 1;


/**
 * addObject to ClassRegistry, when BaseController has been extended.
 * 
 * @private
 */
GeckoJS.Controller.extended = function(klass) {

    if (klass.prototype.name == 'Controller' || klass.prototype.name == 'BaseController') {
        klass.prototype.name = 'Unnamed' + GeckoJS.Controller.unnamedCounter++;
    }

    var name = klass.prototype.name;
    klass.className = name;

    GeckoJS.BaseController.setControllerClass(name, klass);
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
 * @class GeckoJS.ConnectionManager
 * @extends GeckoJS.BaseObject
 * @extends GeckoJS.Singleton 
 *
 * @property {Object} config Database configuration
 *
 */ 

GeckoJS.ConnectionManager = GeckoJS.BaseObject.extend('ConnectionManager', {
    init: function() {
		
        // loadPreferences
        GeckoJS.Configure.loadPreferences('DATABASE_CONFIG');
        
        this.config = GeckoJS.Configure.read('DATABASE_CONFIG') || {
            'default': {
                classname: 'JsonFile',
                path: '/var/tmp'
            }
        };

        // FUEL's SessionStorage support
        if (Application.storage.has('GeckoJS_ConnectionManager_datasources')) {
            this._dataSources = Application.storage.get('GeckoJS_ConnectionManager_datasources',  (new GeckoJS.Map()) );
        }else {
            this._dataSources = new GeckoJS.Map();
            Application.storage.set('GeckoJS_ConnectionManager_datasources', this._dataSources);
        }
				
    }
});

// make ConnectionManager support singleton
GeckoJS.Singleton.support(GeckoJS.ConnectionManager);


/**
 * Returns the data source identified by the given name.<br/>
 * <br/>
 * If the data source has not yet been loaded, this name is used to look up the
 * corresponding data source class to load. Once loaded, the data source is
 * cached using the name as the key.<br/>
 * <br/>
 * Returns null if the data source is not found.  
 *  
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
            ds.configKeyName = name;
        }

        self._dataSources.set(name, ds);
		
    }else {
        this.log("WARN","ConnectionManager.getDataSource - Non-existent data source " + name);
    }
    return self._dataSources.get(name);
};


/**
 * Returns data source by class.<br/>
 * <br/>
 * This method loads and returns the data source by its class. The data source
 * is not cached.<br/>
 * <br/>
 * Returns null if the data source is not found.  
 *  
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
 *
 */
GeckoJS.Datasource = GeckoJS.BaseObject.extend('Datasource', {
    init: function(config){
    
        // http://developer.mozilla.org/en/docs/wrappedJSObject
        this.wrappedJSObject = this;
        
        this.config = config;
        this.configKeyName = "default";
	
    }
});


/**
 * Inserts data into a model using the given id as the primary key.
 *
 * @public
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
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {Object} condition        This is the query condition
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
 * @public
 * @param {GeckoJS.Model} model     This is the model
 * @param {Object} condition        This is the query condition
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @return {Object}                  The result set
 */
GeckoJS.Datasource.prototype.querySelect = function(model, condition, order, limit, page) {
    
    };


/**
 * Retrieves a data item from a model based on its id.
 *   
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} id               This is the id of the data item to retrieve
 * @return {Object}                  The data item
 */
GeckoJS.Datasource.prototype.querySelectById = function(model, id) {
    
    };


/**
 * Returns the number of data items in a model where the property indicated
 * by the "index" parameter is equal to the "value" parameter.<br/>
 * <br/>
 * If page size or page number is given, returns only the number of data items
 * in the requested page of the result set.
 *   
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
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} index            This is the index property
 * @param {Object} value            This is the index value
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @return {Object}                  The result set
 */
GeckoJS.Datasource.prototype.querySelectByIndex = function(model, index, value, order, limit, page) {
    
    };


/**
 * Updates a data item in a model.
 *
 * @public
 * @function
 * @param {GeckoJS.Model} model              This is the model to update
 * @param {String} id                        This is the primary key identifying the record to update
 * @param {Object} data                      This is the data to update the model with
 * @return {Number} rows                      Number of records updated
 */
GeckoJS.Datasource.prototype.executeUpdate = function(model, id, data) {

    };



/**
 * Removes the data item identified by id from a model.
 *
 * @public
 * @function
 * @param {GeckoJS.Model} model             This is the model to delete data from
 * @param {String} id                       This is the primary key identifying data to delete
 * @return {Number} rows                     Number of records deleted
 */
GeckoJS.Datasource.prototype.executeDelete = function(model, id) {
    
    };
    
/**
 * Returns the ID of the last inserted row.
 *
 * @public
 * @function
 * @return {String}  The id of the last inserted row
 */
GeckoJS.Datasource.prototype.getLastInsertId = function() {

};

/**
 *   Opens a connection to the database.
 *
 * @public
 * @function
 * @param {Object} connParam  This is an object containing the connection options
 */
GeckoJS.Datasource.prototype.connect = function(connParam) {
};

/**
 * Closes the connection to the database.
 * 
 * @public
 * @function
 * 
 */
GeckoJS.Datasource.prototype.disconnect = function() {
};


/**
 * Begins a transaction.
 * 
 * @public
 * @function
 */
GeckoJS.Datasource.prototype.begin = function()	{

};

/**
 * Commits a transaction.
 * 
 * @public
 * @function
 */
GeckoJS.Datasource.prototype.commit = function() {

};

/**
 * Rolls back a transaction.
 * 
 * @public
 * @function
 */
GeckoJS.Datasource.prototype.rollback = function() {
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
 */
GeckoJS.BaseModel = GeckoJS.BaseObject.extend('BaseModel', {
    name: 'BaseModel',
    
    init: function(data, recursive){

        // Name of the model.
        this.name = this.name || "BaseModel";

        recursive = recursive || 0;

        /*
        // FUEL's SessionStorage support
        var eventKey = "GeckoJS_Model_"+this.name+"_events";
        if (Application.storage.has(eventKey)) {
            this._events = Application.storage.get(eventKey, (new GeckoJS.Event()) );
        }else {
            this._events = new GeckoJS.Event();
            Application.storage.set(eventKey, this._events);
        }*/

        this._events = new GeckoJS.Event();

        // http://developer.mozilla.org/en/docs/wrappedJSObject
        this.wrappedJSObject = this;


        this.useDbConfig = this.useDbConfig || GeckoJS.Configure.read('DATABASE_CONFIG.useDbConfig') || "default";

        // Table name for this Model.
        this.table = this.table || GeckoJS.Inflector.tableize(this.name);

        this._datasource = null;

        // The name of the ID field for this Model.
        this.primaryKey = this.primaryKey || "id";

        // Container for the id that this model gets from persistent storage (the database).
        this.id = ""; // uuid
        
        // Last inserted id
        this.__insertID = "";

        // Container for the data that this model gets from persistent storage (the database).
        this.data = data || null;

        // indexes fields
        this.indexes = this.indexes || [];
                
        this.belongsTo = this.belongsTo || [];
        this.hasOne = this.hasOne || [];
        this.hasMany = this.hasMany || [];
        this.hasAndBelongsToMany = this.hasAndBelongsToMany || [];

        // this._schema = this.schema();
        this._schema = null;

        // add events
        this._addModelEvents();

        // _addBehaviors
        this.behaviors = this.behaviors || [];
        this._addBehaviors();
        
        //
        this._generateAssociation(recursive);

    }
});

/**
 * Registers the Model sub-class in the Class Registry.
 *
 * @public
 * @static
 * @function   
 * @param {String} name               This is the name to register the sub-class with
 * @param {GeckoJS.Model} klass       This is the Model sub-class to register
 */
GeckoJS.BaseModel.setModelClass = function(name, klass) {
    
    // GeckoJS.ClassRegistry.addObject(instance.name, instance);
//    if (name == 'Model' || GeckoJS.ClassRegistry.isKeySet("ModelClass_" + name)) return ;
    if (GeckoJS.ClassRegistry.isKeySet("ModelClass_" + name)) return ;

    /*
    // FUEL's SessionStorage support
    var eventKey = "GeckoJS_Model_"+ name + "_events";
    Application.storage.set(eventKey, (new GeckoJS.Event()) );
    */
    GeckoJS.ClassRegistry.addObject("ModelClass_" + name, klass);

};

/**
 * Retrieves the Model sub-class object by name from the Class Registry.
 *
 * @public
 * @static
 * @function   
 * @param {String} name                 This is the name of the Model sub-class to retrieve
 * @return {GeckoJS.Model}              The Model sub-class identified by name
 */
GeckoJS.BaseModel.getModelClass = function(name) {
    
    return  GeckoJS.ClassRegistry.getObject("ModelClass_" + name);

};

GeckoJS.BaseModel.prototype._associations = ['belongsTo', 'hasOne', 'hasMany', 'hasAndBelongsToMany'];

//events getter
GeckoJS.BaseModel.prototype.__defineGetter__('events', function(){
    return this._events;
});

GeckoJS.BaseModel.prototype.__defineGetter__('datasource', function(){
    if (this._datasource == null)
        this._datasource = GeckoJS.ConnectionManager.getDataSource(this.useDbConfig);
    return this._datasource;
});

GeckoJS.BaseModel.prototype.__defineSetter__('datasource', function(ds){
    if (ds != null && ds instanceof Datasource)
        this._datasource = ds;
});


/**
 * Returns the list of event listeners attached to this GeckoJS.BaseModel
 * instance.
 *
 * @public
 * @function
 * @return {Object}                     The list of event listeners
 */
GeckoJS.BaseModel.prototype.getEvents = function(){
    return this._events;
};


/**
 * Instantiates a model by name.
 *
 * @public
 * @static
 * @function
 * @param {String} name           This is the name of the model to instantiate
 * @return {GeckoJS.Model}    The new model instance, or null if the model class does not exist
 */
GeckoJS.BaseModel.getInstanceByName = function(name) {

        var modelClass = null;
        var modelName = name || null;

        if (modelName) {
            modelClass = GeckoJS.BaseModel.getModelClass(modelName);
        }

        if (modelClass) {
            return new modelClass;
        }else {
            return null;
        }

};


/**
 * Adds a listener for the given event to this GeckoJS.BaseModel instance.
 *
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
 * Dispatches the given event to all listeners of that event.<br/>
 * <br/>
 * This method creates an EventItem instance from (sEvt, data, "this") to pass
 * to the event listeners. If any of the listeners invokes the preventDefault()
 * method on the EventItem instance, this method will return "false". Otherwise
 * it returns "true".
 *
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
 * @private
 * 
 */
GeckoJS.BaseModel.prototype._generateAssociation =	function (recursive) {
    
    recursive = recursive || 0;
    
    if (recursive >= 1) return ;
    
    // ignore BaseModel or Model
    if (this.getClassName() == 'BaseModel' || this.getClassName() == 'Model' ) return;
    
    
    var self = this;

    this._associations.forEach(function(type) {
        if (self[type].length > 0) {
            for (var i=0; i < self[type].length; i++) {
                var name = self[type][i];
                self[name] = self._getAssociationModel(name, ++recursive);
            }
        }
    });
    
};


/**
 * _getAssociationModel
 *
 * @private
 * @return {Class}
 */
GeckoJS.BaseModel.prototype._getAssociationModel = function(name, recursive) {
    
    recursive = recursive || 1;
    
    var model = GeckoJS.ClassRegistry.getObject("ModelAssoc_" + name);
    var modelClass = GeckoJS.ClassRegistry.getObject("ModelClass_"+name);

    if (model == null && modelClass != null){

        model = new modelClass(null, recursive);
        
        // add Model to ClassRegistry for later use
        GeckoJS.ClassRegistry.addObject("ModelAssoc_" + name, model);
        
    }
    return model;
};


/**
 * _addModelEvents
 *
 * @private
 */
GeckoJS.BaseModel.prototype._addModelEvents = function() {
    
    var events = this._events;
    var self = this;
    
    // ignore BaseModel or Model
    if (this.getClassName() == 'BaseModel' || this.getClassName() == 'Model' ) return;
        
    ['beforeSave', 'afterSave', 'beforeFind', 'afterFind', 'beforeDelete', 'afterDelete'].forEach(function(evt){
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
 * _addBehaviors
 *
 * @private
 */
GeckoJS.BaseModel.prototype._addBehaviors = function() {
    
    var events = this._events;
    var self = this;
    var config = this.useDbConfig;
    var behaviors = this.behaviors;

    // ignore BaseModel or Model
    if (this.getClassName() == 'BaseModel' || this.getClassName() == 'Model' ) return;

    behaviors.forEach( function(behaviorName) {
        var behaviorClass = GeckoJS.Behavior.getBehaviorClass(behaviorName);
        if (behaviorClass != null) {
            var behavior = new behaviorClass(self, config);
            ['beforeSave', 'afterSave', 'beforeFind', 'afterFind', 'beforeDelete', 'afterDelete'].forEach( function(evt){
                events.addListener(evt, behavior[evt], behavior);
            }, self);
        }
    });

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
 * @public
 * @function
 * @param {Number} recursive        This is the recursion depth for the schema
 * @return {Object}                 The model schema
 */
GeckoJS.BaseModel.prototype.schema = function (recursive) {
    
    recursive = recursive || 0;
    
    if (this._schema != null) return this._schema ;

    // ignore BaseModel or Model
    if (this.getClassName() == 'BaseModel' || this.getClassName() == 'Model' ) return {};
    
    var schema = {};
    
    schema.name = this.name;
    schema.table = this.table;
    schema.primaryKey = this.primaryKey;
    schema.foreignKey = GeckoJS.Inflector.singularize(this.table) + "_" + this.primaryKey;
    
    /*if(this.indexes.length > 0) */ schema.indexes = this.indexes;

    
    if (recursive >= 1) return schema;

    recursive++;

    var self = this;
	
    this._associations.forEach(function(type) {

        for(var i=0; i<self[type].length; i++) {

            if(i==0) schema[type] = {};

            var name = self[type][i];
            var model = self._getAssociationModel(name, recursive);
            
            if(typeof self[name] != 'undefined' && typeof  self[name].schema == 'function') {
                schema[type][name] = self[name].schema(recursive);
            }else if(model != null && typeof  model.schema == 'function') {
                schema[type][name] = model.schema(recursive);
            }

            // push foreignkey to indexes
            if (type == 'belongsTo') {
                schema.indexes.push(schema[type][name]['foreignKey']);
            }
        }

    });
    
    this._schema = schema;
    return this._schema;
    
};


/**
 * Returns true if the given field is defined in the Model.
 *
 * @param {String} name           Name of field to look for
 * @return {Boolean}              "true" if the field is defined in the Model
 */
GeckoJS.BaseModel.prototype.hasField = function(name) {
    
    var self = this;
    var hasField = true;

    this._associations.forEach( function(type) {
        if(GeckoJS.Array.inArray(name, self[type]) != -1) {
            hasField = false;
        }
    });
    
    return hasField;

};


/**
 * Initializes the model for writing a new record.<br/>
 * <br/>
 * Sets the model.id field to "null" to indicate that this is a new record.<br/>
 * <br/>
 * This method should be overridden as necessary by its descendant classes.
 *
 * @public
 * @function
 * @param {Object} data             This is the data for the new record
 */
GeckoJS.BaseModel.prototype.create = function(data){
    this.id = "";
    this.data = data || null;
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
 *  - order
 *  - limit
 *  - page
 * </pre>
 *
 * @public
 * @function  
 * @param {String} condition        This is the query condition
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page numbers
 * @return {Object}                  The result set
 */
GeckoJS.BaseModel.prototype.findAll = function(condition, order, limit, page){

    return this.find('all', {
        conditions: condition,
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
 * @public
 * @function  
 * @param {String} condition        This is the query condition
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page numbers
 * @return {Number}                 The size of the result set
 */
GeckoJS.BaseModel.prototype.findCount = function(condition, order, limit, page){

    return this.find('count', {
        conditions: condition,
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
 *  - order
 *  - limit
 *  - page
 * </pre>
 *
 * @function
 * @public  
 * @param {String} condition        This is the query condition
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page numbers
 * @return {Object}                 The first record from the result set
 */ 
GeckoJS.BaseModel.prototype.findFirst = function(condition, order, limit, page){

    return this.find('first', {
        conditions: condition,
        order: order,
        limit: limit,
        page: page
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
 * @public
 * @function  
 * @param {String} type             This is the query type
 * @param {Object} params           This is a list of query parameters
 * @return{Object}                  The result of the requested query
 */
GeckoJS.BaseModel.prototype.find = function(type, params) {
    type = type || 'all';
    params = params || {};

    if (typeof params == 'string') {
        params = {
            conditions: params
        };
    }
	
    var conditions = params.conditions || null;
    var order = params.order || null;
    var limit = params.limit || null;
    var page = params.page || null;
    var recursive = typeof params.recursive != 'undefined' ? params.recursive : 1;
    var result = null;
	
    try {
        var beforeResult = this.dispatchEvent('beforeFind', arguments);
        
        // if result invoke command
        if (beforeResult) {
            
            var ds = GeckoJS.ConnectionManager.getDataSource(this.useDbConfig);

            result = null;
			
            switch(type) {
                case 'all':
                    result = ds.querySelect(this, conditions, order, limit, page, recursive);
                    if(result.length == 0) result = null;
                    break;
				
                case 'first':
                    result = ds.querySelect(this, conditions, order, 1, 1, recursive);
                    if(result.length == 0) result = null;
                    else result = result[0];
                    break;
				
                case 'count':
                    result = ds.querySelectCount(this, conditions, order, limit, page);
                    break;
				
                case 'id':
                    result = ds.querySelectById(this, conditions, recursive);
                    break;
            }

            this.dispatchEvent('onFind', result);
        }
        
        this.dispatchEvent('afterFind', result);
		        
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
 * @function
 * @public  
 * @param {String} id               This is the ID of the record to find
 * @return {Object}                 The requested record
 */
GeckoJS.BaseModel.prototype.findById = function(id){
    return this.find('id', {
        conditions: id,
        recursive: 1
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
 *  - "order"        : fields to order by  // "name ASC, age DESC"
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
 * @public
 * @function  
 * @param {String} type             This is the query type
 * @param {Object} params           This is a list of query parameters
 * @return {Object}                 The result of the requested query
 */
GeckoJS.BaseModel.prototype.findByIndex = function(type, params){

    type = type || 'all';
    params = params || {};

    var index = params.index || "id";
    var value = params.value || null;
    var order = params.order || null;
    var limit = params.limit || null;
    var page = params.page || null;
    var recursive = typeof params.recursive != 'undefined' ? params.recursive : 1;
    var result = null;
    
    try {
        var beforeResult = this.dispatchEvent('beforeFind', arguments);
        
        // if result invoke command
        if (beforeResult) {
            
            var ds = GeckoJS.ConnectionManager.getDataSource(this.useDbConfig);

            result = null;
			
            switch(type) {
                case 'all':
                    result = ds.querySelectByIndex(this, index, value, order, limit, page, recursive );
                    if(result.length == 0) result = null;
                    break;
				
                case 'first':
                    result = ds.querySelectByIndex(this, index, value, order, 1, 1, recursive);
                    if(result.length == 0) result = null;
                    else return result[0];
                    break;
				
                case 'count':
                    result = ds.querySelectCountByIndex(this, index, value, order, limit, page);
                    break;
				
            }

            this.dispatchEvent('onFind', result);
        }
        
        this.dispatchEvent('afterFind', result);
		        
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
 * @function
 * @public
 * @param {String} id               This is the ID of the record to find
 * @return                          The requested record
 */
GeckoJS.BaseModel.prototype.read = function(id){
    this.data = this.findById(id);
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
 * @public
 * @function  
 * @param {Object} data             This is the data to save
 */
GeckoJS.BaseModel.prototype.save = function(data){

    this.data = data || this.data;

    if(this.data == null) {
        return ;
    }

    var fields = [];
    var savedata = {};

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
            
            var ds = GeckoJS.ConnectionManager.getDataSource(this.useDbConfig);

            var created = false;
            if (this.id.toString().length == 0) {

                // insert new record
                
                this.create(this.data);

                this.data['created'] = (new Date()).getTime();

                var newId = ds.executeInsert(this, this.data);
                this.id = newId;
                created = true;
                
            }else {

                // update exists record
                
                this.data['modified'] = (new Date()).getTime();
                this.data['updated'] = this.data['modified'];
                ds.executeUpdate(this, this.data);
                created = false ;
            }
			
            this.dispatchEvent('onSave', this.data);
        }
        
        this.dispatchEvent('afterSave', created);
        delete savedata;
        delete data;
        this.data = null;
        
    }
    catch (e) {
        this.log('ERROR', this.getClassName() + 'Model.save ' , e);
        delete savedata;
        delete data;
        this.data = null;
    }

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
 * @public
 * @function  
 * @param {Object} data              This is dataset to save
 */
GeckoJS.BaseModel.prototype.saveAll = function(data) {

    var self = this;
    if(typeof data == 'object' && data.constructor.name == 'Array') {
        data.forEach(function(d) {
            self.create(d);
            self.save();
        });
    }

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
 * @function
 * @public  
 * @param {String} id               This is the ID of the record to delete
 */
GeckoJS.BaseModel.prototype.del = function(id){

    if (typeof id == 'undefined') return;

    try {
        var beforeResult = this.dispatchEvent('beforeDelete', id);
        
        // if result invoke command
        if (beforeResult) {
            

            var ds = GeckoJS.ConnectionManager.getDataSource(this.useDbConfig);

            ds.executeDelete(this, id);
			
            this.dispatchEvent('onDelete', id);
        }
        
        this.dispatchEvent('afterDelete', id);
        
    }
    catch (e) {
        this.log('ERROR', this.getClassName() + 'Model.del ' , e);
    }
    
};

/**
 * Deletes a record from the model by ID.<br/>
 * <br/>
 * See del() for details.
 *
 * @function
 * @name delete
 * @public
 * @param {String} id               This is the ID of the record to delete
 */
GeckoJS.BaseModel.prototype['delete'] = function(id){
    // yuicompressor keyword
    return this.del(id);
};

/**
 * Deletes a record from the model by ID.<br/>
 * <br/>
 * See del() for details.
 *
 * @function
 * @public
 * @param {String} id               This is the ID of the record to delete
 */
GeckoJS.BaseModel.prototype.remove = function(id){
    return this.del(id);
};

/**
 * Retrieves records using a VQL SQL-like statement.
 *
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
 * @public
 * @function
 * @param {String} queryStatement   This is the VQL SQL-like query statement
 * @return {Object}                  The result set
 */
GeckoJS.BaseModel.query = function(queryStatement) {
    
    var statemenet = GeckoJS.VqlParser.parseVQL.apply(GeckoJS.VqlParser, arguments);
    
    var table = statemenet.table;
    var modelClass = GeckoJS.BaseModel.getModelClass(table);
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
 * @public
 * @function
 * @param {String} statement   This is the SQL query statement
 * @return {Object}                  The result set
 */
GeckoJS.BaseModel.prototype.execute = function(statement){
    return null;
};



/**
 * Escapes the field name and prepends the model name.
 * Escaping will be done according to the current database driver's rules.
 *
 * @param {String} field Field to escape (e.g: id)
 * @param {String} alias Alias for the model (e.g: Post)
 * @return {String} The name of the escaped field for this Model (i.e. id becomes `Post`.`id`).
 * @access public
 */
	GeckoJS.BaseModel.prototype.escapeField = function(field, alias) {
        
        alias = alias || this.name;
        field = field || this.primaryKey;

		return alias + '.' + field;
	};


/**
 * Returns the current record's ID
 *
 * @return {String} The ID of the current record, false if no ID
 */
	GeckoJS.BaseModel.prototype.getID = function() {

		if (typeof this.id == 'string') {
			return this.id;
		}

		if (typeof this.id == 'undefined' || this.id == null) {
			return false;
		}

		return false;
	};


/**
 * Returns the ID of the last record this Model inserted
 *
 * @return {String} Last inserted ID
 */
	GeckoJS.BaseModel.prototype.getLastInsertID = function() {
		return this.getInsertID();
	};

/**
 * Returns the ID of the last record this Model inserted
 *
 * @return {String} Last inserted ID

 */
	GeckoJS.BaseModel.prototype.getInsertID = function() {
		return this.__insertID;
	};

/**
 * Sets the ID of the last record this Model inserted
 *
 * @param {String} Last inserted ID
 */
	GeckoJS.BaseModel.prototype.setInsertID = function(id) {
		this.__insertID = id;
	};

/**
 * Gets the DataSource to which this model is bound.
 *
 * @return {GeckoJS.Model.DataSource}
 */
GeckoJS.BaseModel.prototype.getDataSource = function() {
    var ds = GeckoJS.ConnectionManager.getDataSource(this.useDbConfig);
    return ds || null;
};


/**
 * Defines GeckoJS.Model namespace
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Model', GeckoJS.global);

/**
 * Creates a new GeckoJS.Model instance and initializes it with the given
 * record data and association level.
 * 
 * @param {Object} data                 This is the initial record data
 * @param {Number} recursive            This indicates the association level
 * 
 * @class GeckoJS.Model inherits from GeckoJS.BaseModel and is intended to be
 * extended by applications that require specialized model behaviors.<br/>
 *
 * @class GeckoJS.Model 
 * @extends GeckoJS.BaseModel 
 *
 * @property {Number} cursor       a last cursor of cachedDatas
 *
 */
GeckoJS.Model = GeckoJS.BaseModel.extend('Model', {
    name: 'Model',

    init: function(data, recursive) {
        this._super(data, recursive);
    }
});


// unnamed Model counter
GeckoJS.Model.unnamedCounter = 1;

/**
 * addObject to ClassRegistry, when Model has been extended.
 * @private
 */
GeckoJS.Model.extended = function(klass) {
    
    if (klass.prototype.name == 'Model' || klass.prototype.name == 'BaseModel') {
        klass.prototype.name = 'Unnamed' + GeckoJS.Model.unnamedCounter++;
    }

    var name = klass.prototype.name;
    klass.className = name;

    GeckoJS.BaseModel.setModelClass(name, klass);
    
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
 * @extends GeckoJS.Datasource 
 * @property {GeckoJS.Map} data                Data cache (read-only)
 */
GeckoJS.DatasourceJsonFile = GeckoJS.Datasource.extend('DatasourceJsonFile', {
    init: function(config){
    
        // http://developer.mozilla.org/en/docs/wrappedJSObject
        this.wrappedJSObject = this;

        this._path = null ;
        this._data = new GeckoJS.Map();

        this.config = config;

        this.lastInsertId = "";
        
    }
});



//dispatchData getter
GeckoJS.DatasourceJsonFile.prototype.__defineGetter__('data', function(){
    return this._data;
});

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
 * @public
 * @function
 * @param {String} table              This is the name of the table to read
 */
GeckoJS.DatasourceJsonFile.prototype.readTableFile = function(table){

    var db = null;
    if (this.data.containsKey(table)) {
    
        // this.log('readTableFile From Map ' + table);
        db = this.data.get(table);
        
    }
    else {
    
        var tableFile = new GeckoJS.File(this.path);
        tableFile.append(table + '.db');
        
        // this.log('readTableFile = ' + tableFile.path);
        var d = GREUtils.JSON.decodeFromFile(tableFile.path);
        if (d == null)
            d = {};
        
        db = new GeckoJS.Map();
        db.addAll(d);
        
        this.data.set(table, db);
    }
    
    return db;
    
};

/**
 * Saves the entire content of a table to file.
 *
 * @public
 * @function
 * @param {String} table               This is the table name to save to
 * @param {Object} db                  This is the table data to save
 */
GeckoJS.DatasourceJsonFile.prototype.saveTableFile = function(table, db){

    var tableFile = new GeckoJS.File(this.path);
    tableFile.append(table + '.db');
    
    // this.log('saveTableFile = ' + tableFile.path);
    
    GREUtils.JSON.encodeToFile(tableFile.path, db._obj);
    
    this.data.set(table, db);
    
};

/**
 * Inserts data into a model.<br/>
 * <br/>
 * The ID used to uniquely identify the data is taken from model.id.
 *   
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
        
        var key = GeckoJS.String.uuid();
        
        if (key.toString().length == 0) {
            key = GeckoJS.String.uuid();
        }

        // auto generate schema and save to data
        // data['__schema'] = model.schema();
        data[model.primaryKey] = key;

        db.set(key, data);
        
        this.saveTableFile(table, db);

        this.lastInsertId = key;
        return key;
    }
    catch (e) {
        this.log("ERROR","GeckoJS.DatasourceJsonFile: An error occurred executing the insert command\n", e);
    }
    
};

/**
 * Returns the size of the result set containing data items from model that
 * satisfy the given query condition.<br/>
 * <br/>
 * If page size or page number is given, returns only the number of data items
 * in the requested page of the result set.
 *   
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {Object} condition        This is the query condition
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number 
 * @return {Number}                 The number of rows in the result set
 */
GeckoJS.DatasourceJsonFile.prototype.querySelectCount = function(model, condition, order, limit, page){
    return this.querySelect(model, condition, order, limit, page, 0).length;
};

/**
 * Retrieves from a model data items that satisfy the given query condition,
 * sorted in the specified order.<br/>
 * <br/>
 * If page size or page number is given, returns only data items in the requested
 * page of the result set.
 *   
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {Object} condition        This is the query condition
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @return {Object}                  The result set
 */
GeckoJS.DatasourceJsonFile.prototype.querySelect = function(model, condition, order, limit, page, recursive){
    
    recursive = typeof recursive != 'undefined' ? recursive : 1;

    var table = model.table;
    
    try {
        var db = this.readTableFile(table);
        
        var resultSet = db.getValues();
        var arrayDs = new GeckoJS.ArrayQuery(resultSet);
        
        if (condition)
            arrayDs.data = arrayDs.filter(condition);
        
        if (order)
            arrayDs.orderBy(order);
        
        if (limit || page)
            arrayDs.data = arrayDs.limit(limit, page);
        
        var result = arrayDs.data.slice();
        
        delete arrayDs;
        delete resultSet;
        delete db;
        
        if (recursive == 1) {
            return this.__queryAssociations(model, result, recursive);
        }else {
            return result;
        }
        
        
    }
    catch (e) {
        this.log("ERROR","GeckoJS.DatasourceJsonFile: An error occurred executing the selectAll (" + condition + ")command\n" , e);
        return [];
    }
    
};


GeckoJS.DatasourceJsonFile.prototype.__queryAssociations = function(model, datas, recursive) {

    recursive = typeof recursive != 'undefined' ? recursive : 1;

    var self = this;
    var results = new Array();
    var schema = model.schema();

    datas.forEach( function (d){

        // shadow clone object
        var data = GeckoJS.BaseObject.clone(d);
        
        // process belongsTo
        if(typeof schema['belongsTo'] == 'object') {
            for (var assocName in schema['belongsTo']) {
                var assocSchema = schema['belongsTo'][assocName];
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
        if(typeof schema['hasOne'] == 'object') {
            for (var assocName2 in schema['hasOne']) {
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
        if(typeof schema['hasMany'] == 'object') {
            for (var assocName3 in schema['hasMany']) {
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
    
    return results;
};



/**
 * Retrieves a data item from a model based on its id.
 *   
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} id               This is the id of the data item to retrieve
 * @return {Object}                  The data item
 */
GeckoJS.DatasourceJsonFile.prototype.querySelectById = function(model, id, recursive){
    
    recursive = typeof recursive != 'undefined' ? recursive : 1;

    var table = model.table;

    try {
    
        var db = this.readTableFile(table);

        var resultSet = db.get(id);
        var result = null;
        
        if(resultSet != null) {
            result = GeckoJS.BaseObject.clone(resultSet);
        }
        delete resultSet;

        if (recursive == 1) {
            return this.__queryAssociations(model, [result], recursive)[0];
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
GeckoJS.DatasourceJsonFile.prototype.querySelectCountByIndex = function(model, index, value, order, limit, page){
    return this.querySelectByIndex(model, index, value, order, limit, page, 0).length;
};


/**
 * Retrieves from a model data items where the property indicated by the
 * "index" parameter is equal to the "value" parameter, sorted in the
 * specified order.<br/>
 * <br/>
 * If page size or page number is given, returns only the data items in the
 * requested page of the result set.
 *   
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} index            This is the index property
 * @param {Object} value            This is the index value
 * @param {String} order            This is the sort order
 * @param {Number} limit            This is the page size
 * @param {Number} page             This is the page number
 * @return {Object}                  The result set
 */
GeckoJS.DatasourceJsonFile.prototype.querySelectByIndex = function(model, index, value, order, limit, page, recursive){

    recursive = typeof recursive != 'undefined' ? recursive : 1;
    
    // sdk for json not support quick index.
    var condition = index + " = '" + value + "'";
    return this.querySelect(model, condition, order, limit, page, recursive);
    
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
        
        var key = model.id;
        
        if (db.containsKey(key)) {
            
            var dataOrg = db.get(key);
            dataOrg = GREUtils.extend(dataOrg, data);
            db.set(key, dataOrg);
            this.saveTableFile(table, db);
            return 1;
        }
        return 0;
        
    }
    catch (e) {
        this.log("ERROR", "GeckoJS.DatasourceJsonFile: An error occurred executing the update command\n" , e);
        return 0;
    }
    
};


/**
 * Removes the data item associated with an id from a model.<br/>
 * <br/>
 * If id is not given, then internal model ID (model.id) is used.<br/>
 * <br/>
 * The operation fails and returns 0 if id does not exist in the model. 
 *   
 * @public
 * @function
 * @param {GeckoJS.Model} model     This is the model
 * @param {String} id               This is the id
 * @return {Number}                 The number of rows deleted
 */
GeckoJS.DatasourceJsonFile.prototype.executeDelete = function(model, id){

    var table = model.table;
    
    try {
    
        var db = this.readTableFile(table);
        
        //keys = db.getKeys();
        //key = keys[id-1];
        var key = id || model.id;
        
        if (db.containsKey(key)) {
            db.remove(key);
            this.saveTableFile(table, db);
            return 1;
        }
        return 0;
    }
    catch (e) {
        this.log("ERROR", "GeckoJS.DatasourceJsonFile: An error occurred executing the delete command\n", e);
        return 0;
    }
    
};


/**
 * Defines GeckoJS.Helper namespace
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Helper', GeckoJS.global);

/**
 * Creates a new GeckoJS.Helper instance.
 * 
 * @class GeckoJS.Helper provides a means of encapsulating a set of methods that
 * collectively work together to expand and/or supplement the functionality
 * of a Controller.<br/>
 * <br/>
 * A Helper by convention focuses on UI-related processing, while a Component
 * typically provides model-related processing.<br/>
 * <br/>
 * This is the base Helper class and should be extended by sub-classes that
 * implement the actual functionalities.<br/>
 *
 * @name GeckoJS.Helper
 * @extends GeckoJS.BaseObject
 * @extends GeckoJS.Singleton 
 *  
 * @property {jQuery} query             The query function used to look for a document element; normally jQuery, but document.getElementById if jQuery is not available (read-only)
 */

GeckoJS.Helper = GeckoJS.BaseObject.extend('Helper', {
    name: 'Helper'
});

// make Helper support singleton
GeckoJS.Singleton.support(GeckoJS.Helper);

// unnamed Helper counter
GeckoJS.Helper.unnamedCounter = 1;


/**
 * addObject to ClassRegistry, when Helper has been extended.
 * @private
 */
GeckoJS.Helper.extended = function(klass) {

    if (klass.prototype.name == 'Helper') {
        klass.prototype.name = 'Unnamed' + GeckoJS.Helper.unnamedCounter++;
    }

    var name = klass.prototype.name;
    klass.className = name;

    GeckoJS.Helper.setHelperClass(name, klass);
    
};

/**
 * Registers the Helper sub-class in the Class Registry.
 *
 * @public
 * @static
 * @function   
 * @param {String} name               This is the name to register the sub-class with
 * @param {GeckoJS.Helper} klass      This is the Helper sub-class to register
 */
GeckoJS.Helper.setHelperClass = function(name, klass) {
    
    if (GeckoJS.ClassRegistry.isKeySet("HelperClass_" + name)) return ;

    GeckoJS.ClassRegistry.addObject("HelperClass_" + name, klass);

};

/**
 * Retrieves the Helper sub-class object by name from the Class Registry.
 *
 * @public
 * @static
 * @function   
 * @param {String} name                 This is the name of the Helper sub-class to retrieve
 * @return {GeckoJS.Helper}             The Helper sub-class identified by name
 */
GeckoJS.Helper.getHelperClass = function(name) {
    
    return GeckoJS.ClassRegistry.getObject("HelperClass_" + name);

};


//domquery getter
GeckoJS.Helper.prototype.__defineGetter__('query', function(){

    var window = window || GeckoJS.global;
    var document = document || window.document || GeckoJS.global;

    var fn = window.jQuery || document.getElementById;
    return fn;
});


/**
 * Creates a DOM element of the given document type and element tag.
 *
 * @public
 * @function  
 * @param {String} type         This is the document type, which may be "xul", "html", or "xhtml"
 * @param {String} tag          This is the element tag
 * @return {Element}            A DOM element of the given document type and element tag
 */
GeckoJS.Helper.prototype.createElement = function(type, tag) {

    return GeckoJS.Helper.createElement(type, tag);

};

/**
 * Creates a DOM element of the given document type and element tag.
 *
 * @public
 * @static 
 * @function  
 * @param {String} type         This is the document type, which may be "xul", "html", or "xhtml"
 * @param {String} tag          This is the element tag
 * @return {Element}            A DOM element of the given document type and element tag
 */
GeckoJS.Helper.createElement = function(type, tag) {

    type = type.toUpperCase();

    var window = window || GeckoJS.global;
    var document = document || window.document || GeckoJS.global.document ||  GeckoJS.global;

    switch(type) {
        case "HTML":
        case "XHTML":
            return document.createElementNS("http://www.w3.org/1999/xhtml", tag)
            break;

        case "XUL":
            return document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", tag)
            break;
    }

};

/**
 * Removes all children of a DOM element. 
 *
 * @public
 * @function  
 * @param {Element} el          This is the DOM element whose children are to be removed
 */
GeckoJS.Helper.prototype.removeAllChildren = function (el) {

    GeckoJS.Helper.removeAllChildren(el);
    
};


/**
 * Removes all children of a DOM element. 
 *
 * @public
 * @function  
 * @param {Element} el          This is the DOM element whose children are to be removed
 */
GeckoJS.Helper.removeAllChildren = function (el) {

    if(el == null || typeof el == 'undefined') return;

    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }

};
/**
 * Defines GeckoJS.FormHelper namespace
 *
 */
GREUtils.define('GeckoJS.FormHelper', GeckoJS.global);

/**
 * Creates a new GeckoJS.FormHelper instance.
 * 
 * @class GeckoJS.FormHelper provides a set of methods that help a Controller in
 * parsing and retrieving data from an XUL form. <br/>
 *
 * @name GeckoJS.FormHelper
 * @extends GeckoJS.Helper
 * @extends GeckoJS.Singleton 
 */
GeckoJS.FormHelper = GeckoJS.Helper.extend({
    name: 'Form'
});

// make Form support singleton
GeckoJS.Singleton.support(GeckoJS.FormHelper);


/**
 * Resets all inputable fields in a form to default if the field has a
 * 'default' attribute.
 *
 * @public
 * @static
 * @function   
 * @param {String} form           This is the name of the DOM element with 'form' attribute. 
 */
GeckoJS.FormHelper.reset = function(form) {
    return GeckoJS.FormHelper.getInstance().reset(form);
};


/**
 * Resets all inputable fields in a form to default if the field has a
 * 'default' attribute.
 *
 * @public
 * @function   
 * @param {String} form           This is the name of the DOM element with 'form' attribute. 
 */
GeckoJS.FormHelper.prototype.reset = function(form) {

    // jQuery way
    this.query('[form='+form+']').each(function() {
        var n = this.name || this.getAttribute('name');
        if (!n) return;
        var v = this.getAttribute('default');
        
        if (typeof v != 'undefined') {
            GeckoJS.FormHelper.setFieldValue(this, v);
        }
    });        
};


/**
 * Serializes all inputable fields in a form and stores them in an Object.<br/>
 * <br/>
 * Each inputable field is stored in the return object as a property of the
 * object.
 * 
 * @public
 * @static
 * @function   
 * @param {String} form           This is the name of the DOM element with 'form' attribute. 
 * @param {Boolean} successful    This is a flag indicating if only enabled and selected fields are to be included; defaults to "true"
 * @return {Object}               An object containing the values of all inputable fields in the form
 */
GeckoJS.FormHelper.serializeToObject = function(form, successful) {
    return GeckoJS.FormHelper.getInstance().serializeToObject(form, successful);
};


/**
 * Serializes all inputable fields in a form and stores them in an Object.<br/>
 * <br/>
 * Each inputable field is stored in the return object as a property of the
 * object.
 * 
 * @public
 * @function   
 * @param {String} form           This is the name of the DOM element with 'form' attribute. 
 * @param {Boolean} successful    This is a flag indicating if only enabled and selected fields are to be included; defaults to "true"
 * @return {Object}               An object containing the values of all inputable fields in the form
 */
GeckoJS.FormHelper.prototype.serializeToObject = function(form, successful) {

    var a = {};

    // jQuery way
    this.query('[form='+form+']').each(function() {
        var n = this.name || this.getAttribute('name');
        if (!n) return;
        var v = GeckoJS.FormHelper.getFieldValue(this, successful);
        if (v && v.constructor.name == 'Array') {
            //for (var i=0,max=v.length; i < max; i++) a[n] = v[i];
            a[n] = v;
        }
        else if (v !== null && typeof v != 'undefined') {
            a[n] = v;
        }
    });
    
    return a;
        
};



/**
 * Serializes all inputable fields in a form into an HTTP query string.
 *  
 * @public
 * @static 
 * @function   
 * @param {String} form           This is the name of the DOM element with 'form' attribute. 
 * @param {Boolean} successful    This is a flag indicating if only enabled and selected fields are to be included; defaults to "true"
 * @return {String}               An HTTP query string containing the values of all inputable fields in the form
 */
GeckoJS.FormHelper.serialize = function(form, successful) {
    return GeckoJS.FormHelper.getInstance().serialize(form, successful);
};


/**
 * Serializes all inputable fields in a form into an HTTP query string.
 *  
 * @public
 * @function   
 * @param {String} form           This is the name of the DOM element with 'form' attribute. 
 * @param {Boolean} successful    This is a flag indicating if only enabled and selected fields are to be included; defaults to "true"
 * @return {String}               An HTTP query string containing the values of all inputable fields in the form
 */
GeckoJS.FormHelper.prototype.serialize = function(form, successful) {
    return GeckoJS.String.httpBuildQuery(this.serializeToObject(form, successful));
};


/**
 * Unserializes inputable fields from an HTTP query string.<br/>
 * <br/>
 * For each inputable field, if a parameter with the same name exists in the
 * HTTP query string, the field value is set to the corresponding parameter
 * value.
 * 
 * @public
 * @static
 * @function   
 * @param {String} form           This is the name of the DOM element with 'form' attribute. 
 * @param {String} data           This is the HTTP query string used as the source of the inputable field values
 */
GeckoJS.FormHelper.unserialize = function(form, data) {
    return GeckoJS.FormHelper.getInstance().unserialize(form, data);
};


/**
 * Unserializes inputable fields from an HTTP query string.<br/>
 * <br/>
 * For each inputable field, if a parameter with the same name exists in the
 * HTTP query string, the field value is set to the corresponding parameter
 * value.
 * 
 * @public
 * @function   
 * @param {String} form           This is the name of the DOM element with 'form' attribute. 
 * @param {String} data           This is the HTTP query string used as the source of the inputable field values
 */
GeckoJS.FormHelper.prototype.unserialize = function(form, data) {
  
    return this.unserializeFromObject(form, GeckoJS.String.parseStr(data));
  
};



/**
 * Unserializes inputable fields from a JavaScript object.<br/>
 * <br/>
 * For each inputable field, if a property with the same name is defined in the
 * object, the field value is set to the corresponding property value.
 * 
 * @public
 * @static
 * @function   
 * @param {String} form           This is the name of the DOM element with 'form' attribute. 
 * @param {Object} data           This is an object used as the source of the inputable field values
 */
GeckoJS.FormHelper.unserializeFromObject = function(form, data) {
    GeckoJS.FormHelper.getInstance().unserializeFromObject(form, data);
};


/**
 * Unserializes inputable fields from a JavaScript object.<br/>
 * <br/>
 * For each inputable field, if a property with the same name is defined in the
 * object, the field value is set to the corresponding property value.
 *   
 * @public
 * @function  
 * @param {String} form           This is the name of the DOM element with 'form' attribute. 
 * @param {Object} data           This is an object used as the source of the inputable field values
 */
GeckoJS.FormHelper.prototype.unserializeFromObject = function FormHelper_unserializeFromObject(form, data) {

    if(typeof data == 'undefined' || typeof form == 'undefined') return;
    
    // jQuery way
    this.query('[form='+form+']').each(function() {
        var n = this.name || this.getAttribute('name');
        if (!n) return;
        var v = data[n];
        if (typeof v != 'undefined') {
            GeckoJS.FormHelper.setFieldValue(this, v);
        }
    });
  
};


/**
 * isFormModified.<br/>
 * <br/>
 *
 * @public
 * @static
 * @function
 * @param {String} form           This is the name of the DOM element with 'form' attribute.
 * @return {Boolean}              Return true is form 's value != org_value
 */
GeckoJS.FormHelper.isFormModified = function(form) {
    return GeckoJS.FormHelper.getInstance().isFormModified(form);
};


/**
 * isFormModified.<br/>
 * <br/>
 *
 * @public
 * @static
 * @function
 * @param {String} form           This is the name of the DOM element with 'form' attribute.
 * @return {Boolean}              Return true is form 's value != org_value
 */
GeckoJS.FormHelper.prototype.isFormModified = function FormHelper_isFormModified(form) {

    if(typeof form == 'undefined') return false;

    // jQuery way
    var result = false;
    
    this.query('[form='+form+']').each(function() {
        
        var n = this.name || this.getAttribute('name');
        if (!n) return;

        var v = GeckoJS.FormHelper.getFieldValue(this);
        var org_value = this.getAttribute('org_value');

        if(typeof org_value != 'undefined' && typeof v != 'undefined' && typeof v !== null && typeof org_value !== null)  {

            if (v.constructor.name == 'Array') {
                v = v.join(',');
            }
            if(v != org_value) result = true;
        }
    });

    return result;

};


/**
 * Returns the value of an XUL inputable field.
 *
 * @public
 * @static 
 * @function  
 * @param {Element} el            This is a DOM element representing an XUL inputable field
 * @param {Boolean} successful    This is a flag indicating if only enabled and selected fields are to be retrieved; defaults to "true"
 * @return {String}               The value of the inputable field
 */
GeckoJS.FormHelper.getFieldValue = function(el, successful) {
    return GeckoJS.FormHelper.getInstance().getFieldValue(el, successful);
};


/**
 * Returns the value of an XUL inputable field.
 * 
 * @public
 * @function  
 * @param {Element} el            This is a DOM element representing an XUL inputable field
 * @param {Boolean} successful    This is a flag indicating if only enabled and selected fields are to be retrieved; defaults to "true"
 * @return {String}               The value of the inputable field
 */
GeckoJS.FormHelper.prototype.getFieldValue = function(el, successful) {

    if(el == null) return null;
    
    var n = el.name || el.getAttribute('name'), tag = el.tagName.toLowerCase(), t = el.type || el.getAttribute('type') || tag;

    if (typeof successful == 'undefined') successful = true;

    if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
        (t == 'checkbox' || t == 'radio') && !el.checked ||
        (tag == 'colorpicker') && !el.color ||
        (t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
        (tag == 'select' || tag =='listbox' || tag =='menulist') && el.selectedIndex == -1)) {
        return null;
    }


    if (tag == 'select') {

        var index = el.selectedIndex;

        if (index < 0) return null;

        var a = [], ops = el.options;

        var one = (t == 'select-one');

        var max = (one ? index+1 : ops.length);

        for(var i=(one ? index : 0); i < max; i++) {

            var op = ops[i];

            if (op.selected) {

                // extra pain for IE...

                var v = op.value;

                if (one) return v;

                a.push(v);

            }

        }

        return a;

    } else if(tag == 'listbox' || tag =='menulist') {

        if (el.selectedIndex < 0) return null;

        var a2 = [], ops2 = [], one2 = true;
        
        if (tag == 'listbox') {
            ops2 = el.selectedItems;
            one2 = (el.selType != 'multiple');
        }else {
            ops2 = [el.selectedItem];
        }

        for (var j=0; j<ops2.length; j++) {
            var v2 = ops2[j].value || ops2[j].label;
            if(one2) return v2;
            a2.push(v2);
        }

        return a2;

    }else if (tag == 'checkbox') {
        return el.checked;
    }else if( tag == 'colorpicker') {
        return el.color || "";
    }
    return el.value;
    
};


/**
 * Sets the value of an XUL inputable field.
 * 
 * @public
 * @static 
 * @function  
 * @param {Element} el            This is a DOM element representing an XUL inputable field
 * @param {String} data           This is the value to set the inputable field to
 */
GeckoJS.FormHelper.setFieldValue = function(el, data) {
    return GeckoJS.FormHelper.getInstance().setFieldValue(el, data);
};


/**
 * Sets the value of an XUL inputable field.
 * 
 * @public
 * @function  
 * @param {Element} el            This is a DOM element representing an XUL inputable field
 * @param {String} data           This is the value to set the inputable field to
 */
GeckoJS.FormHelper.prototype.setFieldValue = function(el, data) {

    if(el == null) return;
    
    var n = el.name || el.getAttribute('name'), tag = el.tagName.toLowerCase(), t = el.type || el.getAttribute('type') || tag;

    /*
    if ( (!n || el.disabled ||
        (t != 'checkbox' && t != 'radio' && tag != 'radiogroup') &&
        (tag != 'colorpicker' && tag != 'datepicker' && tag != 'timepicker' ) &&
        (tag != 'textbox' && t != 'input' ) &&
        (tag != 'label' && t != 'description' ) &&
        (tag != 'select' && tag !='listbox' && tag != 'menulist') ) ) {
        return;
    }
    */
    if ( (!n) || el.disabled )  return ;

    if (tag == 'select' || tag == 'listbox' || tag == 'menulist') {

        var ops = [];
        if (tag == 'select') {
            el.selectedIndex = -1;
            ops = el.options;
        }else if (tag == 'listbox') {
            el.clearSelection();
            for (var i=0; i<el.itemCount; i++) {
                Array.prototype.push.apply(ops, [el.getItemAtIndex( i )]);
            }
        }else if (tag == 'menulist') {
            el.selectedIndex = -1;
            for (var i=0; i<el.itemCount; i++) {
                Array.prototype.push.apply(ops, [el.getItemAtIndex( i )]);
            }
        }

        for (var j=0; j<ops.length; j++) {
            var selected = false;
            var value = ops[j].value || ops[j].label;

            if (data.constructor.name == 'Array') {
                if (GeckoJS.Array.inArray(value, data) != -1) selected = true;
            }else {
                if (value == data) selected = true;
            }
            
            if (selected) {
                // listbox // listitem bug? selected = true can't modify selectedItem anymore later
                if (tag == 'listbox' ) {
                    el.addItemToSelection( ops[j] );
                }else if (tag == 'menulist') {
                    el.selectedIndex = j;
                }else {
                    ops[j].selected = true;
                }
            }
                
        }

    }else if (tag == 'checkbox') {
        var checked = data;
        if (typeof data == 'string') {
            checked = (data.toLowerCase() == "true" || data.toLowerCase() == "1") ? true : false;
        }
        el.checked = checked;
    }else if( tag == 'colorpicker') {
        el.color = data;
    }else {
        // just set value attribute
        el.value = data;
    }

    // keep orignal value
    if (data){
        if(data.constructor.name == 'Array') el.setAttribute('org_value', data.join(','));
        else el.setAttribute('org_value', data);
    }
   

};

/**
 * Appends items to a selection tag (select/listbox/menulist).<br/>
 * <br/>
 * The items are passed in as an array. Each item consists of a label and a
 * value. If an item is given as a string, the string is used as both label
 * and value. Otherwise, the given mapping is applied to the item to produce
 * a label and a value. Mapping may be a function or an object. If mapping is
 * a function, it is invoked with the item as the single parameter, and should
 * return an object with "value" and "label" properties. If mapping is an
 * object, it should contain "value" and "label" properties, which in turn
 * contain the actual value and label property names of the item.        
 * 
 * @public
 * @static 
 * @function  
 * @param {Element} el         This is a DOM element representing a selection tag
 * @param {Object} data        This is the list of items to append
 * @param {Object} mapping     This is a mapping function/object
 */
GeckoJS.FormHelper.appendItems = function(el, data, mapping) {
    return GeckoJS.FormHelper.getInstance().appendItems(el, data, mapping);
};


/**
 * Appends items to a selection tag (select/listbox/menulist).<br/>
 * <br/>
 * The items are passed in as an array. Each item consists of a label and a
 * value. If an item is given as a string, the string is used as both label
 * and value. Otherwise, the given mapping is applied to the item to produce
 * a label and a value. Mapping may be a function or an object. If mapping is
 * a function, it is invoked with the item as the single parameter, and should
 * return an object with "value" and "label" properties. If mapping is an
 * object, it should contain "value" and "label" properties, which in turn
 * contain the actual value and label property names of the item.        
 * 
 * @public
 * @function  
 * @param {Element} el         This is a DOM element representing a selection tag
 * @param {Object} data        This is the list of items to append
 * @param {Object} mapping     This is a mapping function/object
 */
GeckoJS.FormHelper.prototype.appendItems = function(el, data, mapping) {
  
    if(el == null || typeof el == 'undefined') return;
    if(data == null || typeof data == 'undefined') return;
    mapping = mapping || {};
    
    var n = el.name || el.getAttribute('name'), tag = el.tagName.toLowerCase(), t = el.type || el.getAttribute('type') || tag;

    if ( (tag != 'select' && tag !='listbox' && tag != 'menulist') ) {
        return;
    }

    var ops = [];
    
    if (data.constructor.name == 'Array') ops = data;
    else ops.push(data);

    for (var j=0; j<ops.length; j++) {
        var label, value, item;
        
        if (typeof ops[j] == 'string') {
            label = value = ops[j];
        }else {

            if (typeof mapping == 'function') {
                // callback it

                var result = {};
                try {
                    result = mapping.call(ops[j]) || {};
                }catch(e) {}

                value = result.value || "";
                label = result.label || value;
            }else {
                var labelProperty = mapping['label'] || "label";
                var valueProperty = mapping['value'] || "value";

                value = ops[j][valueProperty] || "";
                label = ops[j][labelProperty] || value;
            }
        }
        
        if (tag == 'select') {
            item = GeckoJS.Helper.createElement("html", "option");
            item.label = label;
            item.value = value;
            el.appendChild(item);
            continue;
        }else if (tag == 'listbox') {
            /*
            item = GeckoJS.Helper.Form.createElement("xul", "listitem");
            item.label = label;
            item.value = value;
            */
        }else if (tag == 'menulist') {
            /*
            item = GeckoJS.Helper.Form.createElement("xul", "menuitem");
            item.label = label;
            item.value = value;
            */
        }
        item = el.appendItem(label, value);
        if (ops[j].type) item.type = ops[j].type;
    }
};


/**
 * Clears all selection entries.<br/>
 * <br/>
 * This method removes all children of a selection tag, which may be a "select",
 * "listbox", or "menulist" element.    
 *
 * @public
 * @static 
 * @function  
 * @param {Element} el         This is a DOM element representing a selection tag
 */
GeckoJS.FormHelper.clearItems = function(el) {
    return GeckoJS.FormHelper.getInstance().clearItems(el);
};


/**
 * Clears all selection entries.<br/>
 * <br/>
 * This method removes all children of a selection tag, which may be a "select",
 * "listbox", or "menulist" element.    
 *
 * @public
 * @function  
 * @param {Element} el         This is a DOM element representing a selection tag
 */
GeckoJS.FormHelper.prototype.clearItems = function(el) {

    if(el == null || typeof el == 'undefined') return;
   
    var n = el.name || el.getAttribute('name'), tag = el.tagName.toLowerCase(), t = el.type || el.getAttribute('type') || tag;

    if ( (tag != 'select' && tag !='listbox' && tag != 'menulist') ) {
        return;
    }
    
    
    if (tag == 'select') {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }else if (tag == 'listbox' || tag == 'menulist') {
        while (el.itemCount >0) {
            el.removeItemAt(el.itemCount-1);
        }
    }

};
/**
 * Defines GeckoJS.NumberHelper namespace
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.NumberHelper', GeckoJS.global);

/**
 * Creates a new GeckoJS.NumberHelper instance.
 * 
 * @class GeckoJS.NumberHelper provides a set of formatting functions to make
 * numbers more readable.<br/>
 *
 * @name GeckoJS.NumberHelper
 * @extends GeckoJS.Helper
 * @extends GeckoJS.Singleton 
 */
GeckoJS.NumberHelper = GeckoJS.Helper.extend({
    name: 'Number'
});


// make Form support singleton
GeckoJS.Singleton.support(GeckoJS.NumberHelper);


/* 
 * Rounds a number to a given precision using the indicated rounding policy.<br/>
 * <br/>
 * Rounding policy may be one of the following:<br/>
 * <pre>
 * - to-nearest-precision
 * - to-nearest-half
 * - to-nearest-quarter
 * - to-nearest-nickel
 * - to-nearest-dime
 * - always-round-up
 * - always-round-down
 * - use-table
 * </pre>
 * If 'use-table' policy is selected, the table parameter should consist
 * of an array of {breakpoint, value} pairs. The value is first shifted by
 * precision, and the fractional part is then compared with each breakpoint
 * in turn. If the fractional part is less than the breakpoint, the corresponding
 * value is used as the result. For example, if we need to carry out the following
 * rounding policy:<br/>
 * <pre>
 * 0     < val <= 0.015 rounds to 0.007
 * 0.015 < val <= 0.030 rounds to 0.021
 * 0.030 < val <= 0.065 rounds to 0.051
 * 0.065 < val <= 0.080 rounds to 0.073
 * 0.080 < val <= 0.100 rounds to 0.092
 * </pre>
 * then we would create the following table:<br/>
 * <pre>
 * [{breakpoint: 0.015, value: 0.007},
 *  {breakpoint: 0.030, value: 0.021},
 *  {breakpoint: 0.065, value: 0.051},
 *  {breakpoint: 0.080, value: 0.073},
 *  {breakpoint: 0.100, value: 0.092}]
 * </pre>
 * <br/>
 * and we would invoke the function as:<br/>
 * <br/>
 * <pre>
 * round(val, 1, 'use-table', table)
 * </pre>
 * or if we want to perform the following rounding:<br/>
 * <pre>
 * 0     < val <= 3000 rounds to 300
 * 3000  < val <= 6000 rounds to 4200
 * 6000  < val <= 8000 rounds to 7500
 * 8000 < val <= 10000 rounds to 9000
 * </pre>
 * then we would create the following table:<br/>
 * <pre>
 * [{breakpoint: 3000, value: 1300},
 *  {breakpoint: 6000, value: 4200},
 *  {breakpoint: 8000, value: 7500},
 *  {breakpoint: 10000, value: 9000}]
 * </pre>
 * and invoke the function as:<br/>
 * <pre>
 * round(val, -4, 'use-table', table);
 * </pre>
 * 
 * @public
 * @static
 * @parameter {Float} value         this is the value to round
 * @parameter {Number} precision    this is the precision to round the result to
 * @parameter {Number} policy       this is the rounding policy
 * @return {Number}                 the result after rounding
 */

GeckoJS.NumberHelper.round = function (value, precision, policy, table) {
    if (isNaN(value) || isNaN(precision)) return value;
    
    var p = Math.round(precision);
    var result = value * Math.pow(10, p);
    
    switch(policy) {
        
        case 'to-nearest-precision':
            result = Math.round(result);
            break;
            
        case 'to-nearest-half':
            result = Math.round(result * 2) / 2;
            break;
            
        case 'to-nearest-quarter':
            result = Math.round(result * 4) / 4;
            break;
            
        case 'to-nearest-nickel':
            result = Math.round(result * 10) / 10;
            break;
            
        case 'to-nearest-dime':
            result = Math.round(result * 20) / 20;
            break;
            
        case 'always-round-up':
            result = Math.round(result + 0.5);
            break;
            
        case 'always-round-down':
            result = Math.floor(result);
            break;
            
        case 'use-table':
            var whole = Math.floor(result);
            var fraction = (result - whole) * Math.pow(10, -p);
            for (i = 0; i < table.length; i++) {
                if (fraction <= table[i].breakpoint) {
                    result = whole + table[i].value * Math.pow(10, p);
                    break;
                }
            }
            break;
    }
    var result2 = (result * Math.pow(10, -p));
    return (precision>=0) ? parseFloat(result2.toFixed(precision)) : result2;
    // return (result * Math.pow(10, -p)).toFixed(digits);
}

/* 
 * Rounds a number to a given precision using the indicated rounding policy.<br/>
 * <br/>
 * Please see <pre>GeckoJS.NumberHelper.round</pre> for usage. 
 * 
 * @public
 * @static
 * @parameter {Float} value         this is the value to round
 * @parameter {Number} precision    this is the precision to round the result to
 * @parameter {Number} policy       this is the rounding policy
 * @return {Number}                 the result after rounding
 */

GeckoJS.NumberHelper.prototype.round = function (value, precision, policy, table) {
    return GeckoJS.NumberHelper.round(value, precision, policy, table);
}

/**
 * Formats a number to a given level of precision.
 *
 * @public
 * @static
 * @function
 * @param  {Number}	number	A floating point number.
 * @param  {Number} precision  The precision of the returned number.
 * @return {Number}
 */
GeckoJS.NumberHelper.precision = function (number, precision) {
    number = number || 0.0;
    precision = precision || 2;
    return parseFloat( parseFloat(number).toFixed(precision));
};

/**
 * Formats a number to a given level of precision.
 *
 * @public
 * @function
 * @param  {Number} number	This is a floating point number.
 * @param  {Number} precision   This is the precision of the returned number.
 * @return {Number}
 */
GeckoJS.NumberHelper.prototype.precision = function (number, precision) {
    return GeckoJS.NumberHelper.precision(number, precision);
};



/**
 * Returns a formatted-for-humans file size.<br/>
 * <br/>
 * This method formats a file size given in bytes into a more readable unit
 * (i.e. KB, MB, GB, etc.)
 *
 * @public
 * @static
 * @function
 * @param {Number} size          This is the file size in bytes to format
 * @return {String}               The file size formatted for better readability
 */
GeckoJS.NumberHelper.toReadableSize	= function (size) {
        size = size || 0;
        size = parseInt(size);
		
        if (size == 0) {
            return '0 Bytes';
        }else if (size == 1) {
            return '1 Byte';
        }else if (size < 1024) {
            return size + ' Bytes';
        }else if (size < 1024 * 1024) {
            return GeckoJS.NumberHelper.precision(size / 1024, 0) + ' KB';
        }else if (size < 1024 * 1024 * 1024) {
            return GeckoJS.NumberHelper.precision(size / 1024 / 1024, 2) + ' MB';
        }else if (size < 1024 * 1024 * 1024 * 1024) {
            return GeckoJS.NumberHelper.precision(size / 1024 / 1024 / 1024, 2) + ' GB';
        }else  if (size < 1024 * 1024 * 1024 * 1024 * 1024) {
            return GeckoJS.NumberHelper.precision(size / 1024 / 1024 / 1024 / 1024, 2) + ' TB';
        }else {
            return size + ' Bytes';
        }

};


/**
 * Returns a formatted-for-humans file size.<br/>
 * <br/>
 * This method formats a file size given in bytes into a more readable unit
 * (i.e. KB, MB, GB, etc.)
 *
 * @public
 * @static
 * @function
 * @param {Number} size          This is the file size in bytes to format
 * @return {String}               The file size formatted for better readability
 */
GeckoJS.NumberHelper.prototype.toReadableSize = function (size) {
    return GeckoJS.NumberHelper.toReadableSize(size);
};


/**
 * Formats a number into a percentage string with a given level of precision.
 * <br/><br/>
 * 
 * @param {Number} number        This is a floating point number
 * @param {Number} precision     This is the precision of the returned number
 * @return string                 The formatted string
 * 
 * @example
 *    Gecko.NumberHelper.toPercentage(2.3234, 1) => "2.3%"
 */
GeckoJS.NumberHelper.toPercentage = function (number, precision) {
    precision = precision || 2; 
	return GeckoJS.NumberHelper.precision(number, precision) + '%';
};


/**
 * Formats a number into a percentage string with a given level of precision.
 * <br/><br/>
 * 
 * @param {Number} number        This is a floating point number
 * @param {Number} precision     This is the precision of the returned number
 * @return string                 The formatted string
 * 
 * @example
 *    Gecko.NumberHelper.toPercentage(2.3234, 1) => "2.3%"
 */
GeckoJS.NumberHelper.prototype.toPercentage = function (number, precision) {
    return GeckoJS.NumberHelper.toPercentage(number, precision);
};


/**
 * Formats a number for better readability.<br/>
 * <br/>
 * By default, this method formats the number with 2 decimal places, no
 * prefix, ',' as thousands separator, '.' as the decimal symbol, and
 * no postfix. These default settings may be overridden with
 * "options":<br/>
 * <br/>
 * When "options" is a number, it indicates the decimal places to return<br/>
 * <br/>
 * When "options" is a string other than ',', '.', '-', and ':', it is the
 * the prefix symbol<br/>
 * <br/>
 * When "options" is an object, the formatting options are taken from its
 * properties:<br/>
 * <pre>
 *  - before:     prefix symbol
 *  - after:      postfix symbol
 *  - zero:       string for value 0
 *  - places:     number of decimal places
 *  - thousands:  thousands separator
 *  - decimals:   decimal point
 *  - negative:   negative indicator
 * </pre>
 * 
 * @public
 * @static
 * @function
 * @param {Number} number        This is a floating point number
 * @param {Object} options       This is the formatting options
 * @return {String}               The formatted number
 */
GeckoJS.NumberHelper.format = function (number, options) {
        options = options || {};
        
		var places = 2;
		if (typeof options == 'number') {
			places = options;
		}

		var separators = [',', '.', '-', ':'];

		var before, after = null;
        
		if (typeof options == 'string' && GeckoJS.Array.inArray(options, separators) == -1) {
			before = options;
		}

        var thousands = ',';
		var decimals = '.';
        
		if (typeof options == 'object') {
            before = options['before'] || '';
            places = options['places'] || 0;
            thousands = options['thousands'] || ',';
            decimals = options['decimals'] || '.';
            after = options['after'] || '';
		}

        var out = before + GeckoJS.String.numberFormat(number, places, decimals, thousands) + after ;

		return out;
};


/**
 * Formats a number for better readability.<br/>
 * <br/>
 * By default, this method formats the number with 2 decimal places, no
 * prefix, ',' as thousands separator, '.' as the decimal symbol, and
 * no postfix. These default settings may be overridden with
 * "options":<br/>
 * <br/>
 * When "options" is a number, it indicates the decimal places to return<br/>
 * <br/>
 * When "options" is a string other than ',', '.', '-', and ':', it is the
 * the prefix symbol<br/>
 * <br/>
 * When "options" is an object, the formatting options are taken from its
 * properties:<br/>
 * <pre>
 *  - before:     prefix symbol
 *  - after:      postfix symbol
 *  - zero:       string for value 0
 *  - places:     number of decimal places
 *  - thousands:  thousands separator
 *  - decimals:   decimal point
 *  - negative:   negative indicator
 * </pre>
 * 
 * @public
 * @function
 * @param {Number} number        This is a floating point number
 * @param {Object} options       This is the formatting options
 * @return {String}               The formatted number
 */
GeckoJS.NumberHelper.prototype.format = function (number, options) {
    return GeckoJS.NumberHelper.format(number, options);
};


/**
 * Formats a number into a currency format.<br/>
 * <br/>
 * By default, this method formats the number with 2 decimal places, no
 * currency prefix, ',' as thousands separator, '.' as the decimal symbol,
 * no currency postfix, '0' as the string for value 0, and '()' as
 * negative indicator.<br/>
 * <br/>
 * If "currency" is given and is one of 'USD', 'EUR', 'GBP', or 'NTD', the
 * default formatting for that currency will be used. If "currency" is given
 * but is not one of the above, it is used as the prefix currency symbol.<br/>
 * <br/>
 * Finally, you can override individual format settings through the "options"
 * object. The following properties are checked for formatting options:<br/>
 * <pre>
 *  - before:     the prefix currency symbol
 *  - after:      the postfix currency symbol
 *  - zero:       string for value 0
 *  - places:     number of decimal places
 *  - thousands:  thousands separator
 *  - decimals:   decimal point
 *  - negative:   negative indicator
 * </pre>
 * Please note that if the number is 0, and the "zero" formatting string is
 * defined, that string is returned without applying any other formatting.
 * 
 * @public
 * @static
 * @function
 * @param {Number} number         This is a floating point number
 * @param {String} currency       The currency (valid values are 'USD', 'EUR', 'GBP', 'NTD')
 * @param {Object} options        This is the formatting option
 * @return {String}                The number formatted as a currency
 */
GeckoJS.NumberHelper.currency = function (number, currency, options) {

    number = number || 0;
    currency = currency || 'USD';
    options = options || {};

    var def = {
        before: '', after:'', zero: '0', places: 2, thousands: ',',
        decimals: '.', negative: '()'
    };

    var currencies = {
        NTD: {
            before:'NT$', after:'', zero: '0', places: 1, thousands: ',',
            decimals: '.', negative: '()'
        },
        USD: {
            before:'$', after:'', zero: '0', places: 2, thousands: ',',
            decimals: '.', negative: '()'
        },
        GBP: {
            before:'\u20a4', after:'', zero: '0', places: 2, thousands: ',',
            decimals: '.', negative: '()'
        },
        EUR: {
            before:'\u20ac', after:'', zero: '0', places: 2, thousands: '.',
            decimals: ',', negative: '()'
        }
    };


    if (typeof currencies[currency] != 'undefined') {
        def = currencies[currency];
    }else if (typeof currency == 'string') {
        options['before'] = currency;
    }

    options = GREUtils.extend(def, options);

    var result = null;

    if (number == 0 ) {
        if (options['zero'] != 0 ) {
            return options['zero'];
        }
        options['after'] = null;
    } else if (number < 1 && number > -1 ) {

        var multiply = parseInt('1' + GeckoJS.String.padLeft('', options['places'], '0'));
        number = number * multiply;
        options['before'] = null;
        options['places'] = null;
    } else {
        options['after'] = null;
    }

    var abs = Math.abs(number);
    
    result = GeckoJS.NumberHelper.format(abs, options);

    if (number < 0 ) {
        if(options['negative'] == '()') {
            result = '(' + result +')';
        } else {
            result = options['negative'] + result;
        }
    }
    return result;
};


/**
 * Formats a number into a currency format.<br/>
 * <br/>
 * By default, this method formats the number with 2 decimal places, no
 * currency prefix, ',' as thousands separator, '.' as the decimal symbol,
 * no currency postfix, '0' as the string for value 0, and '()' as
 * negative indicator.<br/>
 * <br/>
 * If "currency" is given and is one of 'USD', 'EUR', 'GBP', or 'NTD', the
 * default formatting for that currency will be used. If "currency" is given
 * but is not one of the above, it is used as the prefix currency symbol.<br/>
 * <br/>
 * Finally, you can override individual format settings through the "options"
 * object. The following properties are checked for formatting options:<br/>
 * <pre>
 *  - before:     the prefix currency symbol
 *  - after:      the postfix currency symbol
 *  - zero:       string for value 0
 *  - places:     number of decimal places
 *  - thousands:  thousands separator
 *  - decimals:   decimal point
 *  - negative:   negative indicator
 * </pre>
 * Please note that if the number is 0, and the "zero" formatting string is
 * defined, that string is returned without applying any other formatting.
 *
 * @public
 * @function
 * @param {Number} number         This is a floating point number
 * @param {String} currency       The currency (valid values are 'USD', 'EUR', 'GBP', 'NTD')
 * @param {Object} options        This is the formatting option
 * @return {String}                The number formatted as a currency
 */
GeckoJS.NumberHelper.prototype.currency = function (number, currency, options) {
    return GeckoJS.NumberHelper.prototype.currency(number, currency, options);
};
/**
 * Defines GeckoJS.Behavior namespace
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Behavior', GeckoJS.global);

/**
 * Creates a new GeckoJS.Behavior instance and initializes it with model and
 * config.
 * 
 * @class GeckoJS.Behavior is a base class that may be used to associate
 * "behaviors" with models. "Behaviors" refer to actions that occur before and
 * after typical model activities such as "find", "save", "delete". This is
 * useful in situations where the same set of actions need to occur after 
 * changes have been applied to models even though the underlying models are
 * different. These actions may be consolidated into and implemented by a
 * single Behavior class.<br/>
 * <br/>
 * A Behavior instance hooks into a model through the following model
 * events:<br/>
 * <pre>
 *  - beforeFind<br/>
 *  - afterFind<br/>
 *  - beforeSave<br/>
 *  - afterSave<br/>
 *  - beforeDelete<br/>
 *  - afterDelete<br/>
 * </pre>
 * GeckoJS.Behavior should not be instantiated, but is designed instead to
 * be extended with actual implementations of the various behaviors.<br/>
 *
 * @name GeckoJS.Behavior
 * @extends GeckoJS.BaseObject
 *
 * @property {GeckoJS.Model} model       The model to apply the behavior to (read-only)
 * @property {String} config             The database configuration identifying the data source (read-only)
 * 
 * @param {GeckoJS.Model} model          The model that exhibits this behavior (read-only)
 * @param {String} config                Name of the database configuration to use
 */

GeckoJS.Behavior = GeckoJS.BaseObject.extend('Behavior', {
    name: 'Behavior',

    init: function(model, config) {
        this._model = model || null;
        this._config = config || {};
    }
});


// unnamed Behavior counter
GeckoJS.Behavior.unnamedCounter = 1;

/**
 * addObject to ClassRegistry, when Behavior has been extended.
 */
GeckoJS.Behavior.extended = function(klass) {

    if (klass.prototype.name == 'Behavior') {
        klass.prototype.name = 'Unnamed' + GeckoJS.Behavior.unnamedCounter++;
    }

    var name = klass.prototype.name;
    klass.className = name;

    GeckoJS.Behavior.setBehaviorClass(name, klass);
    
};

/**
 * Registers the Behavior sub-class in the Class Registry.
 *
 * @public
 * @static
 * @function   
 * @param {String} name               This is the name to register the sub-class with
 * @param {GeckoJS.Behavior} klass    This is the Behavior sub-class to register
 */
GeckoJS.Behavior.setBehaviorClass = function(name, klass) {
    
    if (GeckoJS.ClassRegistry.isKeySet("BehaviorClass_" + name)) return ;
    GeckoJS.ClassRegistry.addObject("BehaviorClass_" + name, klass);

};


/**
 * Retrieves the Behavior sub-class object by name from the Class Registry.
 *
 * @public
 * @static
 * @function   
 * @param {String} name                 This is the name of the Behavior sub-class to retrieve
 * @return {GeckoJS.Behavior}           The Behavior sub-class identified by name
 */
GeckoJS.Behavior.getBehaviorClass = function(name) {
    
    return GeckoJS.ClassRegistry.getObject("BehaviorClass_" + name);

};


GeckoJS.Behavior.prototype.__defineGetter__('model', function(){
    return this._model;
});

GeckoJS.Behavior.prototype.__defineGetter__('config', function(){
    return this._config;
});


/**
 * Handles the "beforeFind" event.<br/>
 * <br/>
 * This method is invoked before the model carries out a find() operation.
 * The "type" and the "params" parameters from the find() operation are passed
 * to this event handler in the event.data field.
 *
 * @public
 * @function  
 * @param {GeckoJS.EventItem} event         This is the "beforeFind" event data containing the "type" and "params" parameters from the find() invocation
 */
GeckoJS.Behavior.prototype.beforeFind = function(event) {
    //
    };



/**
 * Handles the "afterFind" event.<br/>
 * <br/>
 * This method is invoked after the model carries out a find() operation.
 * The results of the find() operation are passed to this event handler in the
 * event.data field.<br/>
 * <br/>
 * This method can be used to modify the results returned by find().
 *
 * @public
 * @function  
 * @param {GeckoJS.EventItem} event         This is the "afterFind" event data containing the results from the find() invocation
 * @access public
 * 
 */
GeckoJS.Behavior.prototype.afterFind = function(event) {
    //
    };


/**
 * Handles the "beforeSave" event.<br/>
 * <br/>
 * This method is invoked before the model carries out a save() operation.
 * The data to save is passed to this event handler in the event.data field.
 * This data is identical to "this.model.data". 
 *
 * @public
 * @function  
 * @param {GeckoJS.EventItem} event         This is the "beforeSave" event data containing the data from the save() invocation
 */
GeckoJS.Behavior.prototype.beforeSave = function(event) {
    //
    };


/**
 * Handles the "afterSave" event.<br/>
 * <br/>
 * This method is invoked after the model carries out a save() operation.
 * A boolean value is passed to this event handler in the event.data field
 * indicating if the save() operation created a new record. 
 *
 * @public
 * @function  
 * @param {GeckoJS.EventItem} event         This is the "afterSave" event data containing a boolean flag indicating if a new record has been created by the save() invocation
 */
GeckoJS.Behavior.prototype.afterSave = function(event) {
    //
    };


/**
 * Handles the "beforeDelete" event.<br/>
 * <br/>
 * This method is invoked before the model carries out a delete() operation.
 * The model id to delete is passed to this event handler in the event.data
 * field.
 *
 * @public
 * @function  
 * @param {GeckoJS.EventItem} event         This is the "beforeDelete" event data containing the model id from the delete() invocation
 */
GeckoJS.Behavior.prototype.beforeDelete = function(event) {
    //
    };

/**
 * Handles the "afterDelete" event.<br/>
 * <br/>
 * This method is invoked after the model carries out a delete() operation.
 * The model id to delete is passed to this event handler in the event.data
 * field.
 *
 * @public
 * @function  
 * @param {GeckoJS.EventItem} event         This is the "afterDelete" event data containing the model id from the delete() invocation
 */
GeckoJS.Behavior.prototype.afterDelete = function(event) {
    //
    };

/**
 * Defines GeckoJS.Component namespace
 *
 * @public
 * @namespace
 */
GREUtils.define('GeckoJS.Component', GeckoJS.global);

/**
 * Creates a new GeckoJS.Component instance and initializes with controller.
 * 
 * @class GeckoJS.Component provides a means of encapsulating a set of methods
 * that collectively work together to expand and/or supplement the
 * functionality of a Controller.<br/>
 * <br/>
 * This is the base Component class and should be extended by sub-classes that
 * implement the actual functionalities.<br/>
 *    
 * @name GeckoJS.Component
 * @extends GeckoJS.BaseObject
 *
 * @property {GeckoJS.Controller} controller       The controller to which the component is attached
 */

GeckoJS.Component = GeckoJS.BaseObject.extend('Component', {
    name: 'Component',
    
    init: function(controller) {
        this._controller = controller || null;
    }
});

// unnamed Component counter
GeckoJS.Component.unnamedCounter = 1;


/**
 * addObject to ClassRegistry, when Component has been extended.
 * @private
 */
GeckoJS.Component.extended = function(klass) {
    
    if (klass.prototype.name == 'Component') {
        klass.prototype.name = 'Unnamed' + GeckoJS.Component.unnamedCounter++;
    }

    var name = klass.prototype.name;
    klass.className = name;

    GeckoJS.Component.setComponentClass(name, klass);
    
};

/**
 * Registers the Component sub-class in the Class Registry.
 *
 * @public
 * @static
 * @function   
 * @param {String} name               This is the name to register the sub-class with
 * @param {GeckoJS.Component} klass   This is the Component sub-class to register
 */
GeckoJS.Component.setComponentClass = function(name, klass) {
    
    if (GeckoJS.ClassRegistry.isKeySet("ComponentClass_" + name)) return ;

    GeckoJS.ClassRegistry.addObject("ComponentClass_" + name, klass);

};

/**
 * Retrieves the Component sub-class object by name from the Class Registry.
 *
 * @public
 * @static
 * @function   
 * @param {String} name                 This is the name of the Component sub-class to retrieve
 * @return {GeckoJS.Component}          The Component sub-class identified by name
 */
GeckoJS.Component.getComponentClass = function(name) {
    
    return GeckoJS.ClassRegistry.getObject("ComponentClass_" + name);

};

GeckoJS.Component.prototype.__defineGetter__('controller', function(){
    return this._controller;
});

GeckoJS.Component.prototype.__defineSetter__('controller', function(controller){
    this._controller = controller;
});
/**
 * Defines GeckoJS.AclComponent namespace
 *
 */
GREUtils.define('GeckoJS.AclComponent', GeckoJS.global);


/**
 * Creates a new GeckoJS.AclComponent instance.
 * 
 * @class GeckoJS.AclComponent implements a J2EE-like access control list (ACL).
 * In thi scheme, applications associate access privileges and authorizations
 * with roles. Roles are arranged into groups, and each user may be a member of
 * exactly one group. Through his group membership a user gains access
 * privileges and authorizations assigned to the roles in that group.<br/>
 * <br/>
 * Internally, user authentication and authorization information are stored in
 * the following set of models:<br/>
 * <pre>
 *  - AclUser,
 *  - AclGroup,
 *  - AclRole,
 *  - AclGroupRole
 * </pre>
 *
 * @name GeckoJS.AclComponent
 * @extends GeckoJS.Component
 *
 */
GeckoJS.AclComponent = GeckoJS.Component.extend({
    name: 'Acl',

    userModel: GeckoJS.Model.extend({
        name: 'AclUser',
        indexes: ['username'],
        belongsTo: ['AclGroup']
    }),
    
    groupModel: GeckoJS.Model.extend({
        name: 'AclGroup',
        indexes: ['name'],
        hasMany: ['AclUser']
    }),

    roleModel: GeckoJS.Model.extend({
        name: 'AclRole',
        indexes: ['name']
    }),

    groupRoleModel: GeckoJS.Model.extend({
        name: 'AclGroupRole',
        belongsTo: ['AclRole', 'AclGroup']
        
    })

});


/**
 * Logs in a user using the provided username and password.<br/>
 * <br/>
 * The password is first encrypted using MD5 before comparing it against the
 * stored credential. If the username/password combination is valid, the user's
 * group and roles are automatically loaded from the ACL models and stored in 
 * the application Session Singleton under the key "User". The "User" object
 * will have the following properties:<br/>
 * <pre>
 *   - username
 *   - password
 *   - description 
 *   - Roles
 *   - Groups
 * </pre>
 * 
 * @public
 * @function   
 * @param {String} username           This is the user's login
 * @param {String} password           This is the password
 * @param {Boolean} checkOnly         This flag, if true, indicates that the user shall not be logged in
 * @return {Boolean}                  "true" if authentication succeeds; "false" otherwise
 */
GeckoJS.AclComponent.prototype.securityCheck = function (username, password, checkOnly ) {

    if(!username || !password) {
        return false;
    }

    checkOnly = checkOnly || false ;
    
    var userModel = new this.userModel;
    var cond = "username='"+ username+"'";
    var someone = userModel.find('first',{conditions: cond});

    if(!someone) {
        return false;
    }

    // Compare the MD5 encrypted version of the password against recorded encrypted password.
    if( !someone['password'] || someone['password'] != password ) {
        return false;
    }
    if (checkOnly) return true;
    
    var groupId = someone.AclGroup.id;
    
    var groupRoleModel = new this.groupRoleModel;
    
    var groupRoles = groupRoleModel.find('all', {
        conditions: "acl_group_id='"+groupId+"'"
    });

    if (groupRoles) {

        var roles = [];
        groupRoles.forEach(function(group_role) {
            roles.push(group_role.AclRole.name);
        });
        someone['Roles'] = roles;

        // just on group now
        someone['Groups'] = [someone.AclGroup.name];
    }

    this.controller.Session.set('User', someone);

    GeckoJS.Observer.notify(null, "acl-session-change", "securityCheck");

    /*
    var data = GREUtils.extend({}, someone);
    data.wrappedJSObject = data;
    GREUtils.XPCOM.getUsefulService("observer-service").notifyObservers(data,"acl-session-change","securityCheck");
    */
    return true;

};

/**
 * Logs out the current user and removes his credentials from the application
 * Session singleton. 
 *  
 * @public
 * @function   
 */
GeckoJS.AclComponent.prototype.invalidate = function () {
    this.controller.Session.remove('User');

    GeckoJS.Observer.notify(null, "acl-session-change", "invalidate");
    /*
    var data = {};
    data.wrappedJSObject = data;
    GREUtils.XPCOM.getUsefulService("observer-service").notifyObservers(data,"acl-session-change","invalidate");
    */
};


/**
 * Returns an object containing the credentials of the current authenticated
 * user. If the current user has not been authenticated, the method returns
 * null.
 *
 * @public
 * @function
 * @static
 * @return {Object}             An object containing the credentials of the user making this request; null if the user has not been authenticated
 */
GeckoJS.AclComponent.getUserPrincipal = function() {
    
    var session = GeckoJS.Session.getInstance();

    if( !session.has('User') ) return null;
    else return session.get('User');

};

/**
 * Returns an object containing the credentials of the current authenticated
 * user. If the current user has not been authenticated, the method returns
 * null.
 *
 * @public
 * @function
 * @return {Object}             An object containing the credentials of the user making this request; null if the user has not been authenticated
 */
GeckoJS.AclComponent.prototype.getUserPrincipal = function() {

    return GeckoJS.AclComponent.getUserPrincipal();

};


/**
 * Returns a boolean indicating whether the current user has been assigned
 * the specified role. Roles and role membership can be defined using
 * deployment descriptors.<br/>
 * <br/>
 * If the current user has not been authenticated, the method returns false.
 *
 * @public
 * @function
 * @param {String} roleName       This is the name of the role or use ',' for multiple roles
 * @return {Boolean}              "true" if the user making this request has been assigned the given role; "false" if the user has not been assigned the role or has not been authenticated
 */
GeckoJS.AclComponent.isUserInRole = function(roleName) {

    roleName = roleName || null;

    // no roleName parameter return false
    if (roleName == null) return false;

    // not login return false
    var principal = GeckoJS.AclComponent.getUserPrincipal();

    if(principal == null) return false;

    var self = this;
    var roles = roleName.split(',');
    var isInRole = false;

    roles.forEach(function(role){
        if(!isInRole) {
            isInRole = (GeckoJS.Array.inArray(role, principal.Roles) != -1);
        }
    });

    return isInRole;

};



/**
 * Returns a boolean indicating whether the current user has been assigned
 * the specified role. Roles and role membership can be defined using
 * deployment descriptors.<br/>
 * <br/>
 * If the current user has not been authenticated, the method returns false.
 *
 * @public
 * @function  
 * @param {String} roleName       This is the name of the role or use ',' for multiple roles
 * @return {Boolean}              "true" if the user making this request has been assigned the given role; "false" if the user has not been assigned the role or has not been authenticated
 */
GeckoJS.AclComponent.prototype.isUserInRole = function(roleName) {

    return GeckoJS.AclComponent.isUserInRole(roleName);

};

/**
 * Adds an ACL user.<br/>
 * <br/>
 * If the ACL user is successfully created, the corresponding
 * uuid is returned. A return value of "false" indicates that an error occurred
 * while adding the ACL user.  
 *
 * @public
 * @function  
 * @param {String} username           The login of the user to add
 * @param {String} password           The password of the user to add
 * @param {String} userDescription    A string describing the user
 * @return {Boolean|String}           The new ACL user uuid, or "false" if the user fails to be added
 */
GeckoJS.AclComponent.prototype.addUser = function(username, password, userDescription) {
    
    username = username || null;
    password = password || null;
    userDescription = userDescription || username;
        
    // no roleName parameter return false
    if (username == null || password == null) return false;
         
    var userModel = new this.userModel;

    var count = userModel.find("count", {
        conditions: "username='"+username+"'"
    });
    if (count >0) return false;

    userModel.create();
    userModel.save({
        username: username,
        password: password,
        description: userDescription
    });
      
    var id = userModel.id;
    
    delete userModel;
    
    return id;


};


/**
 * Removes an ACL user. If "cascade" is "true", its group membership is also
 * removed.<br/>
 * <br/>
 * Returns "true" if the ACL user has been successfully removed; "false"
 * otherwise.    
 *
 * @public
 * @function  
 * @param {String} username           This is the login of the user to add
 * @param {Boolean} cascade           This flag indicates if the removal should cascade to group membership
 * @return {Boolean}                  Whether the ACL user has been successfully removed
 */
GeckoJS.AclComponent.prototype.removeUser = function(username, cascade) {
    
    username = username || null;
    cascade = cascade || false;
        
    // no roleName parameter return false
    if (username == null) return false;
         
    var userModel = new this.userModel;

    var user = userModel.find("first", {
        conditions: "username='"+username+"'"
    });
    if (user == null) return false;

    var userId = user.id;
    var groupId = user.AclGroup.id;

    userModel.id = userId;
    userModel.del(userId);
    
    if (cascade) {
        var groupModel = new this.groupModel;
        var group = groupModel.findById(groupId);
        if(group != null) {
            if (group.AclUser.length == 1) this.removeGroup(group.name);
        }
    }
    
    delete userModel;
    delete groupModel;
    
    return true;


};


/**
 * Changes an ACL user's password.<br/>
 * <br/>
 * If the ACL user does not exist, "false" is returned.
 *   
 * @public
 * @function  
 * @param {String} username     This is the login of the user to change password for
 * @param {String} password     This is the new password
 * @return {Boolean}            "true" if password changed; "false" otherwise
 */
GeckoJS.AclComponent.prototype.changeUserPassword = function(username, password) {
    
    username = username || null;
    password = password || null;
        
    // no roleName parameter return false
    if (username == null || password == null) return false;
         
    var userModel = new this.userModel;

    var user = userModel.find("first", {
        conditions: "username='"+username+"'"
    });
    if (user == null) return false;

    var userId = user.id;

    userModel.id = userId;
    userModel.save({
        password: password
    });
      
    delete userModel;
    
    return true;

};


/**
 * Adds an ACL role.<br/>
 * <br/>
 * If the role does not exist, it is added and its uuid is returned.
 * If the role already exists, it is not added again, and the
 * method returns "false". 
 *
 * @public
 * @function  
 * @param {String} roleName         This is the name of the role to add
 * @param {String} roleDescription  This is a description of the role
 * @return {Boolean|String}         The new ACL role uuid, or "false" if the role fails to be added
 */
GeckoJS.AclComponent.prototype.addRole = function(roleName, roleDescription) {
    
    roleName = roleName || null;
    roleDescription = roleDescription || roleName;
        
    // no roleName parameter return false
    if (roleName == null) return false;
         
         
    var roleModel = new this.roleModel;
    var count = roleModel.find("count", {
        conditions: "name='"+roleName+"'"
    });
    if (count >0) return false;
    
    roleModel.create();
    roleModel.save({
        name: roleName,
        description: roleDescription
    });
   
    var id =  roleModel.id;
    
    delete roleModel;
    
    return id;


};


/**
 * Removes an ACL role. This automatically removes the role from all ACL groups
 * to which the role has been added.<br/>
 * <br/>
 * If the role does not exist, "false" is returned.
 *
 * @public
 * @function  
 * @param {String} roleName         This is the name of the role to remove
 * @return {Boolean}                "true" if the role is successfully removed; "false" otherwise
 */
GeckoJS.AclComponent.prototype.removeRole = function(roleName) {
    
    roleName = roleName || null;
        
    // no roleName parameter return false
    if (roleName == null) return false;
         
         
    var roleModel = new this.roleModel;
    var role = roleModel.find("first", {
        conditions: "name='"+roleName+"'"
    });

    if (role == null) return false;

    var roleId = role.id;

    // remove
    roleModel.id = roleId;
    roleModel.del(roleId);
    
    delete roleModel;

    // remove cascade grouprole
    var groupRoleModel = new this.groupRoleModel;

    var cond = "acl_role_id='"+roleId+"'";
    var groupRoles  = groupRoleModel.find('all', {
        conditions: cond
    });
    
    if (groupRoles == null || groupRoles.length == 0) return true;
    
    groupRoles.forEach(function(groupRole) {
        var grId = groupRole.id;
        groupRoleModel.id = grId;
        groupRoleModel.del(grId);
    });
    
    delete groupRoleModel;

    return true;

};


/**
 * Adds an ACL group.<br/>
 * <br/>
 * If the group does not exist, it is added and its uuid is returned.
 * If the group already exists, it is not added again, and the
 * method returns "false".
 *
 * @param {String} groupName          This is the name of the group to add
 * @param {String} groupDescription   This is a description of the group
 * @return {Boolean|String}           The new ACL group uuid, or "false" if the group fails to be added
 */
GeckoJS.AclComponent.prototype.addGroup = function(groupName, groupDescription) {
    
    groupName = groupName || null;
    groupDescription = groupDescription || groupName;
        
    // no roleName parameter return false
    if (groupName == null) return false;
         
    var groupModel = new this.groupModel;
    var count = groupModel.find("count", {
        conditions: "name='"+groupName+"'"
    });
    if (count >0) return false;
    
    groupModel.create();
    groupModel.save({
        name: groupName,
        description: groupDescription
    });
    
    delete groupModel;
   
    return groupModel.id;

};


/**
 * Removes an ACL group.<br/>
 * <br/>
 * If the group does not exist, "false" is returned.
 *
 * @public
 * @function  
 * @param {String} groupName        This is the name of the group to remove
 * @return {Boolean}                "true" if the group is successfully removed; "false" otherwise
 */
GeckoJS.AclComponent.prototype.removeGroup = function(groupName) {
    
    groupName = groupName || null;
        
    // no roleName parameter return false
    if (groupName == null) return false;
         
    var groupModel = new this.groupModel;
    var group = groupModel.find("first", {
        conditions: "name='"+groupName+"'"
    });
    if (group == null) return false;
    

    var groupId = group.id;

    // remove
    groupModel.id = groupId;
    groupModel.del(groupId);

    delete groupModel;

    // remove cascade grouprole
    var groupRoleModel = new this.groupRoleModel;

    var cond = "acl_group_id='"+groupId+"'";
    var groupRoles  = groupRoleModel.find('all', {
        conditions: cond
    });
    
    if (groupRoles == null || groupRoles.length == 0) return true;
    
    groupRoles.forEach(function(groupRole) {
        var grId = groupRole.id;
        groupRoleModel.id = grId;
        groupRoleModel.del(grId);
    });
    
    delete groupRoleModel;

    return true;

};


/**
 * Adds an ACL user to an ACL group.<br/>
 * <br/>
 * No action is taken if the user is already a membership of the given group.
 * 
 * @public
 * @function  
 * @param {String} username             This is the login of the user to add to group
 * @param {String} groupName            This is the name of the group to add the user to
 * @return {Boolean}                    "true" if the user is successfully added to the group; "false" otherwise
 */
GeckoJS.AclComponent.prototype.addUserToGroup = function(username, groupName) {
    
    username = username || null;
    groupName = groupName || null;
        
    // no roleName parameter return false
    if (groupName == null || username == null ) return false;
         
    var userModel = new this.userModel;
    var groupModel = new this.groupModel;

    var user = userModel.find('first', {
        conditions: "username='" + username + "'"
    });
    if (user == null) return false;
    var userId = user.id;
    
    var group = groupModel.find('first', {
        conditions: "name='" + groupName + "'"
    });
    var groupId = null;
    
    if (group == null) {
        // auto create
        groupId = this.addGroup(groupName);
        if (!groupId) return false;
    }else {
        groupId = group.id;
    }
    
    // update group id
    userModel.id = userId;
    userModel.save({
        acl_group_id: groupId
    });

    delete userModel;
    delete groupModel;
    delete user;
    delete group;

    return true;


};


/**
 * Removes an ACL user from an ACL group.
 *
 * @public
 * @function  
 * @param {String} username             This is the login of the user to remove from the group
 * @param {String} groupName            This is the name of the group to remove the user from
 * @return {Boolean}                    "true" if the user is successfully removed from the group; "false" otherwise
 */
GeckoJS.AclComponent.prototype.removeUserFromGroup = function(username, groupName) {
    
    username = username || null;
    groupName = groupName || null;
        
    // no roleName parameter return false
    if (groupName == null || username == null ) return false;
         
    var userModel = new this.userModel;
    var groupModel = new this.groupModel;

    var user = userModel.find('first', {
        conditions: "username='" + username + "'"
    });
    if (user == null) return false;
    var userId = user.id;
    
    var group = groupModel.find('first', {
        conditions: "name='" + groupName + "'"
    });
    if (group == null) return false;
    var groupId = group.id;
    
    
    // update group id
    userModel.id = userId;
    userModel.save({
        acl_group_id: ''
    });

    delete userModel;
    delete groupModel;
    delete user;
    delete group;

    return true;


};


/**
 * Assigns an ACL role to an ACL group.<br/>
 * <br/>
 * If the role has already been assigned to the group, it is not assigned
 * again, and the method returns "false".
 *
 * @param {String} groupName      This is the group to assign the role to
 * @param {String} roleName       This is the role to assign to the group
 * @return {String|Boolean}       The groupRole uuid if the role is successfully assigned; "false" otherwise
 */
GeckoJS.AclComponent.prototype.addRoleToGroup = function(groupName, roleName) {
    
    roleName = roleName || null;
    groupName = groupName || null;
        
    // no roleName parameter return false
    if (groupName == null || roleName == null ) return false;
         
    var roleModel = new this.roleModel;
    var groupModel = new this.groupModel;

    var role = roleModel.find('first', {
        conditions: "name='" + roleName + "'"
    });
    if (role == null) return false;

    var group = groupModel.find('first', {
        conditions: "name='" + groupName + "'"
    });
    if (group == null) return false;
    
    var groupRoleModel = new this.groupRoleModel;
    
    var cond = "acl_group_id='"+group.id+"' AND acl_role_id='"+role.id+"'";
    var count = groupRoleModel.find('count', {
        conditions: cond
    });
    
    if (count > 0) return false;

    groupRoleModel.create();

    groupRoleModel.save({
        acl_group_id: group.id,
        acl_role_id: role.id
    });

    var id = groupRoleModel.id;
    
    delete roleModel;
    delete groupModel;
    delete groupRoleModel;
    
    return id;

};

/**
 * Removes an ACL role from an ACL group.
 *
 * @public
 * @function  
 * @param {String} groupName          This is the group from which to remove the role
 * @param {String} roleName           This is the role to remove from the group
 * @return {Boolean}                  "true" if the role is successfully removed from the group; "false" otherwise
 */
GeckoJS.AclComponent.prototype.removeRoleFromGroup = function(groupName, roleName) {
    
    roleName = roleName || null;
    groupName = groupName || null;
        
    // no roleName parameter return false
    if (groupName == null || roleName == null ) return false;
         
    var roleModel = new this.roleModel;
    var groupModel = new this.groupModel;

    var role = roleModel.find('first', {
        conditions: "name='" + roleName + "'"
    });
    if (role == null) return false;

    var group = groupModel.find('first', {
        conditions: "name='" + groupName + "'"
    });
    if (group == null) return false;
    
    var groupRoleModel = new this.groupRoleModel;
    
    var cond = "acl_group_id='"+group.id+"' AND acl_role_id='"+role.id+"'";
    var groupRoles = groupRoleModel.find('all', {
        conditions: cond
    });
    
    if (groupRoles == null || groupRoles.length == 0) return false;
    
    groupRoles.forEach(function(groupRole) {
        var grId = groupRole.id;
        groupRoleModel.id = grId;
        groupRoleModel.del(grId);
    });
    
    delete roleModel;
    delete groupModel;
    delete groupRoleModel;
    
    return true;

};


/**
 * Retrievs the list of ACL users that satisfy the given conditions.
 *
 * @public
 * @function  
 * @param {String} conditions          This is the criteria used to filter the users
 * @return {Object}                 An array of ACL users
 */
GeckoJS.AclComponent.prototype.getUserList = function(conditions) {

    var params = null;
    if(conditions) {
        params = {conditions: conditions};
    }    

    var userModel = new this.userModel;

    var users = userModel.find("all", params);
    
    delete userModel;

    return users;

};


/**
 * Retrieves the list of ACL users in a given group.
 *
 * @public
 * @function  
 * @param {String} groupName          This is the name of the group
 * @return {Object}              An array of ACL users   
 */
GeckoJS.AclComponent.prototype.getUserListInGroup = function(groupName) {

    groupName = groupName || null;
        
    // no groupName parameter return false
    if (groupName == null) return this.getUserList();

    var groupModel = new this.groupModel;

    var group = groupModel.find('first', {
        conditions: "name='" + groupName + "'"
    });
    var groupId = null;
    if (group == null) {
        return this.getUserList();
    }else {
        groupId = group.id;
    }

    var userModel = new this.userModel;

    var users = userModel.find("all", {conditions: "acl_group_id='"+ groupId+"'"});
    
    delete userModel;
    delete groupModel;

    return users;

};


/**
 * Retrievs the list of ACL groups that satisfy the given conditions.
 *
 * @public
 * @function  
 * @param {String} conditions          This is the criteria used to filter the groups
 * @return {Object}                 An array of ACL groups
 */
GeckoJS.AclComponent.prototype.getGroupList = function(conditions) {
    
    var params = null;
    if(conditions) {
        params = {conditions: conditions};
    }    

    var groupModel = new this.groupModel;

    var groups = groupModel.find("all", params);
    
    delete groupModel;

    return groups;
    
    
};


/**
 * Retrievs the list of ACL roles that satisfy the given conditions.
 *
 * @public
 * @function  
 * @param {String} conditions          This is the criteria used to filter the roles
 * @return {Object}                 An array of ACL roles
 */
GeckoJS.AclComponent.prototype.getRoleList = function(conditions) {
    
    var params = null;
    if(conditions) {
        params = {conditions: conditions};
    }    

    var roleModel = new this.roleModel;

    var roles = roleModel.find("all", params);
    
    delete roleModel;

    return roles;
    
    
};


/**
 * Retrieves the list of ACL roles that have been assigned to an ACL group.
 *
 * @public
 * @function  
 * @param {String} groupName         This is the name of the ACL group
 * @return {Object}                 An array of ACL roles
 */
GeckoJS.AclComponent.prototype.getRoleListInGroup = function(groupName) {
    
    groupName = groupName || null;
        
    // no groupName parameter return false
    if (groupName == null) return this.getRoleList();

    var groupModel = new this.groupModel;

    var group = groupModel.find('first', {
        conditions: "name='" + groupName + "'"
    });
    var groupId = null;
    if (group == null) {
        return this.getRoleList();
    }else {
        groupId = group.id;
    }

    var groupRoleModel = new this.groupRoleModel;

    var groupRoles = groupRoleModel.find("all", {conditions: "acl_group_id='"+ groupId+"'"});
    
    delete groupRoleModel;
    delete groupModel;

    return GeckoJS.Array.objectExtract(groupRoles, '{n}.AclRole');
    
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
GeckoJS.Scaffold = GeckoJS.BaseObject.extend('Scaffold', {
   
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


/**
 * _addControllerEvents
 *
 * @private
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
 * @private 
 * @param {String} command
 * @param {Object} data
 */
GeckoJS.Scaffold.prototype.__invoke = function(command, data) {
    
    this._command = command || null;
    this._data = data || null;

    if (GeckoJS.Array.inArray(command, GeckoJS.Scaffold.Actions) == -1) {
        // error command not found
        // this.log('ERROR', 'GeckoJS.Scaffold command not found for '+ command);
        this.log('WARN', 'GeckoJS.dispatch command not found for '+ command);
        return ;
    }

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


/*
 * Renders a view action of scaffolded model.
 *
 * @private 
 */
GeckoJS.Scaffold.prototype.__scaffoldView = function() {
    
    var window = window || GeckoJS.global;
    var document = document || window.document || GeckoJS.global.document ||  GeckoJS.global;

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
            
            this.controller.Form.unserializeFromObject(this.formId, data);

            this.controller.dispatchEvent('afterScaffoldView', data);
        }
    }

};
    
/*
 * Renders index action of scaffolded model.
 *
 * @private 
 */
GeckoJS.Scaffold.prototype.__scaffoldIndex = function() {

    var window = window || GeckoJS.global;
    var document = document || window.document || GeckoJS.global.document ||  GeckoJS.global;

    if (this.controller.dispatchEvent('beforeScaffold', 'index')) {
        var datas = this.ScaffoldModel.find('all');
        
        this.controller.Form.reset(this.formId);
        this.currentData = datas[0];
        this.controller.Form.unserializeFromObject(this.formId, datas[0]);
        
        this.controller.dispatchEvent('afterScaffoldIndex', datas);
    }

};

  
/*
 * Saves or updates the scaffolded model.
 *
 * @private 
 * @param {String} action add or edt
 */
GeckoJS.Scaffold.prototype.__scaffoldSave = function(action) {
    
    var window = window || GeckoJS.global;
    var document = document || window.document || GeckoJS.global.document ||  GeckoJS.global;

    action = action || 'edit';

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
                    this.ScaffoldModel.save(formObj);
                    formObj[primaryKey] = this.ScaffoldModel.id;
                }
                this.controller.dispatchEvent('afterScaffoldSave', formObj);

            }
            this.controller.dispatchEvent('afterScaffoldAdd', formObj)
        }

    }
};
    
/*
 * Performs a delete on given scaffolded Model.
 *
 * @private
 */
GeckoJS.Scaffold.prototype.__scaffoldDelete = function() {

    var window = window || GeckoJS.global;
    var document = document || window.document || GeckoJS.global.document ||  GeckoJS.global;

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
GeckoJS.NSITreeViewArray = GeckoJS.BaseObject.extend('NSITreeViewArray', {
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
 * @param {nsITreeBoxObject} tree       The nsITreeBoxObject to attach this view to
 */
GeckoJS.NSITreeViewArray.prototype.setTree = function(tree) {
    this.tree = tree;
};


/**
 * isContainer    implemented nsITreeView interface
 *
 * @param {Number} row      the index of the row.
 * @return {Boolean} 
 */
GeckoJS.NSITreeViewArray.prototype.isContainer = function(row) {
    return false;
};


/**
 * isContainerOpen    implemented nsITreeView interface
 *
 * @param {Number} row      the index of the row.
 * @return {Boolean}
 */
GeckoJS.NSITreeViewArray.prototype.isContainerOpen = function(row) {
    return false;
};


/**
 * isContainerEmpty    implemented nsITreeView interface
 *
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
 * @param {Number} row      the index of the row.
 * @return {Boolean} 
 */
GeckoJS.NSITreeViewArray.prototype.isSeparator = function(row) {
    return false;
};

/**
 * isSorted    implemented nsITreeView interface
 * 
 * @return {Boolean}
 */
GeckoJS.NSITreeViewArray.prototype.isSorted = function() {
    return false;
};


GeckoJS.NSITreeViewArray.prototype.canDrop = function (index, orientation) {
    return false;
};

GeckoJS.NSITreeViewArray.prototype.drop = function (index, orientation) {
    return false;
};


/**
 * isEditable    implemented nsITreeView interface
 *
 * isEditable is called to ask the view if the cell contents are editable.
 * A value of true will result in the tree popping up a text field when the user tries to inline edit the cell.
 *
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
 * @param {nsITreeColumn} col           The column to cycle.
 */
GeckoJS.NSITreeViewArray.prototype.cycleHeader = function(col) {
    };

/**
 * cycleCell    implemented nsITreeView interface
 *
 * Called on the view when a cell in a non-selectable cycling column (e.g., unread/flag/etc.) is clicked.
 *
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
 */
GeckoJS.NSITreeViewArray.prototype.getRowProperties = function(row, props) {
    
    };

/**
 * getCellProperties    implemented nsITreeView interface
 *
 */
GeckoJS.NSITreeViewArray.prototype.getCellProperties = function(row, col, props) {

    };

/**
 * getColumnProperties    implemented nsITreeView interface
 *
 */
GeckoJS.NSITreeViewArray.prototype.getColumnProperties = function(col, props) {

    };

/**
 * selectionChanged    implemented nsITreeView interface
 *
 * Should be called from a XUL onselect handler whenever the selection changes.
 * 
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
 * @param {String} action            The action to perform. 
 */
GeckoJS.NSITreeViewArray.prototype.performAction = function(action) {

    };

/**
 * performActionOnRow    implemented nsITreeView interface
 *
 * A command API that can be used to invoke commands on a specific row.
 *
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
 * @class
 * @extends GeckoJS.BaseObject
 * @extends GeckoJS.Singleton
 *
 * @property {GeckoJS.Event} events                 A list of event listeners for updates on the string bundle (read-only)
 * @property {GeckoJS.Map} map                      A collection of the key-value pairs in the string bundle (read-only)
 * @property {nsIStringBundleService} bundleService A reference to the XPCOM nsIStringBundleService service {read-only}
 */
GeckoJS.StringBundle = GeckoJS.BaseObject.extend('StringBundle', {
    init: function(){

        if (Application.storage.has('GeckoJS_StringBundle_map')) {
            this._map = Application.storage.get('GeckoJS_StringBundle_map',  (new GeckoJS.Map()) );
        }else {
            this._map = new GeckoJS.Map();
            Application.storage.set('GeckoJS_StringBundle_map', this._map);
        }

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
 * @public
 * @static
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
            window.addEventListener('unload', function(evt) {
                self.map.remove(md5);
            }, true);

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
 * @public
 * @static
 * @function
 * @param {String} name               This is the name of the string to retrieve
 * @param {String} URLSpec            This is the location of a string bundle to add to the bundle cache; defaults to null
 * @return {String}                   The requested string
 */
GeckoJS.StringBundle.getStringFromName = function(name, URLSpec){
	return GeckoJS.StringBundle.getInstance().GetStringFromName(name, URLSpec);
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
 * @public
 * @function
 * @param {String} name               This is the name of the string to retrieve
 * @param {String} URLSpec            This is the location of a string bundle to add to the bundle cache; defaults to null
 * @return {String}                   The requested string
 */
GeckoJS.StringBundle.prototype.getStringFromName = function(name, URLSpec) {

	var str = null;

	var bundles = (URLSpec) ? [].push(this.createBundle(URLSpec)) : this.map.getValues();

	bundles.forEach(function(bundle){
		try {
			str = bundle.getStringFromName(name);
		}catch(e){

		}
		// first match then return ?
		if(str) return str;
	});
	if (str == null) {
		str = name;
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
 * @public
 * @function
 * @param {String} name               This is the name of the string to retrieve
 * @param {Object} params             This is the array of strings to use as arguments to the formatting codes
 * @param {String} URLSpec            This is the location of a string bundle to add to the bundle cache; defaults to null
 * @return {String}                   The formatted string
 */
GeckoJS.StringBundle.prototype.formatStringFromName = function(name, params, URLSpec) {

	var str = null;
	var bundles = (URLSpec) ? [].push(this.createBundle(URLSpec)) : this.map.getValues();

	bundles.forEach(function(bundle){
		try {
			str = bundle.formatStringFromName(name, params, params.length);
		}catch(e){

		}
		// first match then return ?
		if(str) return str;
	});

	if(str == null) {
		str = name;
		params.forEach(function(s){
			str = str.replace(/%S/, s);
		});
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
 * @class
 * @extends GeckoJS.BaseObject
 * @extends GeckoJS.Singleton
 */
GeckoJS.I18n = GeckoJS.BaseObject.extend('I18n', {
    init: function(){

        this._stringbundle = GeckoJS.StringBundle.getInstance();
    }
});

// make I18n support singleton
GeckoJS.Singleton.support(GeckoJS.I18n);


/**
 * Translates a string.<br/>
 * <br/>
 * If a single argument is passed in, this method treats it as a key and returns
 * the first matching string from the cached string bundles. If a second argument
 * is present, then the method returns the formatted string produced by calling
 * GeckoJS.StringBundle.formatStringFromName() on the two arguments.    
 * 
 * @public
 * @function  
 * @param {String} str                This is the string to translate
 * @param {Array} arguments           This is an array of strings to use as arguments to the formatting codes in "str"
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
 * Returns the application locale for messages.
 *
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
 * @public
 * @static 
 * @function  
 * @param {String} str                This is the string to translate
 * @param {Array} arguments           This is an array of strings to use as arguments to the formatting codes in "str"
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
 * @class
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
GeckoJS.HttpRequest = GeckoJS.BaseObject.extend('HttpRequest', {

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

// _requestSettings
GeckoJS.HttpRequest.prototype.__defineGetter__('requestSettings', function(){
    return this._requestSettings;
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

    }
    catch (e) {
        this.events.dispatch('error', e);
    }

    // dispatch send event
    this.events.dispatch('send', [xml, s]);

    var onreadystatechange = function(aEvt){
        if (!requestDone && req && (xml.readyState == 4 || aEvt == "timeout")) {

            // clear Timeout Timer
            clearTimeout(timeoutObj);
            
            requestDone = true;
            status = "success";
            data = xml.responseData;
            data = GeckoJS.HttpRequest.httpData(data, s.dataType);
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
        this.events.dispatch('error', e);
    }

    // gecko doesn't fire statechange for sync requests
    if (!s.async)
        onreadystatechange();


    function success(){
        // If a local callback was specified, fire it and pass it the data
        if (s.success)
            s.success(data, status);

        // Fire the global callback
        xml.events.dispatch('success', [xml, s]);
    }

    function complete(){
        // Process result
        if (s.complete)
            s.complete(data, status);

        // The request was completed
        xml.events.dispatch('complete', [xml, s]);
    }

    // return Data.
    return data;
};

/**
 * Restores a JavaScript object from its JSON representation.<br/>
 * <br/>
 * If type given is "json", decodes the JSON data  into the corresponding
 * object. Otherwise simply returns the data.
 *
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
 * GeckoJS.Application is a namespace for application-wide Singleton objects.
 * <br/>
 * @namespace 
 * @name GeckoJS.Application
 */
GREUtils.define('GeckoJS.Application', GeckoJS.global);

/**
 * This is the Application Session singleton.<br/>
 * 
 * @public
 * @static
 * @property {GeckoJS.Application.Session} Session
 */ 
GeckoJS.Application.Session = GeckoJS.Session.getInstance();

/**
 * This is the Application Configuration singleton.<br/>
 *
 * @public
 * @static
 * @property {GeckoJS.Application.Configure} Configure
 */ 
GeckoJS.Application.Configure = GeckoJS.Configure.getInstance();

// auto load vivipos preferences to configure entry
GeckoJS.Application.Configure.loadPreferences('vivipos');

/**
 * This is the Application ClassRegistry singleton.<br/>
 * 
 * @public
 * @static
 * @property {GeckoJS.Application.ClassRegistry} ClassRegistry
 */
GeckoJS.Application.ClassRegistry = GeckoJS.ClassRegistry.getInstance();

// GeckoJS.Application.Dispatcher = GeckoJS.Dispatcher.getInstance();

/**
 * This is the Application StringBundle singleton.<br/>
 *
 * @public
 * @static
 * @property {GeckoJS.Application.StringBundle} StringBundle
 */ 
GeckoJS.Application.StringBundle = GeckoJS.StringBundle.getInstance();

/**
 * This is the Application I18n singleton.<br/>
 * 
 * @public
 * @static
 * @property {GeckoJS.Application.I18n} I18n
 */ 
GeckoJS.Application.I18n = GeckoJS.I18n.getInstance();

/**
 * This is the Application ConnectionManager singleton.<br/>
 * 
 * @public
 * @static
 * @property {GeckoJS.Application.I18n} ConnectionManager Application ConnectionManager Singleton
 */ 
GeckoJS.Application.ConnectionManager = GeckoJS.ConnectionManager.getInstance();


/*
 * Initial Logging System
 */
GeckoJS.Log.init("WARN");
GeckoJS.Log.addAppender('console', new GeckoJS.Log.ConsoleAppender(GeckoJS.Log.WARN));

