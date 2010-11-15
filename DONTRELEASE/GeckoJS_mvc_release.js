/*
 * GeckoJS is simple and easy framework for XULRunner Application.
 * 
 * it base on GREUtils - is simple and easy use APIs libraries for GRE (Gecko Runtime Environment).
 *
 * Copyright (c) 2008 Rack Lin (racklin@gmail.com)
 *
 */
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
GeckoJS.ClassRegistry = GeckoJS.BaseObject.extend('ClassRegistry',
/** @lends GeckoJS.ClassRegistry.prototype */
{
    /**
     * ClassRegistry contructor
     *
     * initial _events and _map
     *
     * @name GeckoJS.ClassRegistry#init
     * @public
     * @function
     */
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
 * @name GeckoJS.ClassRegistry#getEvents
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
 * @name GeckoJS.ClassRegistry#getMap
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
 * @name GeckoJS.ClassRegistry#flush
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
 * @name GeckoJS.ClassRegistry.flush
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
 * @name GeckoJS.ClassRegistry#removeObject
 * @public
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
 * @name GeckoJS.ClassRegistry.removeObject
 * @public
 * @static
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
 * @name GeckoJS.ClassRegistry#addObject
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
 * @name GeckoJS.ClassRegistry.addObject
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
 * @name GeckoJS.ClassRegistry#setObject
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
 * @name GeckoJS.ClassRegistry.setObject
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
 * @name GeckoJS.ClassRegistry#getObject
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
 * @name GeckoJS.ClassRegistry.getObject
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
 * @name GeckoJS.ClassRegistry#isKeySet
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
 * @name GeckoJS.ClassRegistry.isKeySet
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
 * @name GeckoJS.ClassRegistry#keys
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
 * @name GeckoJS.ClassRegistry.keys
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
 * @name GeckoJS.ClassRegistry#clone
 * @public
 * @function
 */
GeckoJS.ClassRegistry.prototype.clone = function(){
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
 * @name GeckoJS.Model
 * @extends GeckoJS.BaseModel 
 *
 * @property {Number} cursor       a last cursor of cachedDatas
 *
 */
GeckoJS.Model = GeckoJS.BaseModel.extend('Model', 
/** @lends GeckoJS.Model.prototype */
{
    name: 'Model',

    /**
     * GeckoJS.Model contructor
     *
     * @name GeckoJS.Model#init
     * @public
     * @function
     * @param {Object} data
     * @param {Number} recursive
     */
    init: function(data, recursive) {
        this._super(data, recursive);
    }
});


// unnamed Model counter
GeckoJS.Model.unnamedCounter = 1;

/**
 * addObject to ClassRegistry, when Model has been extended.
 *
 * @name GeckoJS.Model.extended
 * @private
 * @function
 * @static
 */
GeckoJS.Model.extended = function(klass) {
    
    if (klass.prototype.name == 'Model' || klass.prototype.name == 'BaseModel') {
        klass.prototype.name = 'Unnamed' + GeckoJS.Model.unnamedCounter++;
    }

    var name = klass.prototype.name;
    klass.className = name;

    GeckoJS.Model.setModelClass(name, klass);
    
};

/**
 * Registers the Model sub-class in the Class Registry.
 *
 * @name GeckoJS.Model.setModelClass
 * @public
 * @static
 * @function
 * @param {String} name               This is the name to register the sub-class with
 * @param {GeckoJS.Model} klass       This is the Model sub-class to register
 */
GeckoJS.Model.setModelClass = function(name, klass) {

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
 * @name GeckoJS.Model.getModelClass
 * @public
 * @static
 * @function
 * @param {String} name                 This is the name of the Model sub-class to retrieve
 * @return {GeckoJS.Model}              The Model sub-class identified by name
 */
GeckoJS.Model.getModelClass = function(name) {

    return  GeckoJS.ClassRegistry.getObject("ModelClass_" + name);

};

/**
 * Instantiates a model by name.
 *
 * @name GeckoJS.Model.getInstanceByName
 * @public
 * @static
 * @function
 * @param {String} name           This is the name of the model to instantiate
 * @return {GeckoJS.Model}    The new model instance, or null if the model class does not exist
 */
GeckoJS.Model.getInstanceByName = function(name) {

    var modelClass = null;
    var modelName = name || null;

    if (modelName) {
        modelClass = GeckoJS.Model.getModelClass(modelName);
    }

    if (modelClass) {
        return new modelClass;
    }else {
        return null;
    }

};


/**
 * _generateAssociation
 *
 * @name GeckoJS.Model#_generateAssociation
 * @private
 * @function
 * @param {Number} recursive
 * 
 */
GeckoJS.Model.prototype._generateAssociation =	function (recursive) {

    recursive =  typeof recursive != 'undefined' ?  recursive : 1;

    // ignore BaseModel or Model
    if (this.getClassName() == 'BaseModel' || this.getClassName() == 'Model' ) return;

    var self = this;

    // process hasOne hasMany belongsTo relations
    this._associations.forEach(function(type) {

        if (self[type].length > 0) {

            // convert associate string to object
            for (var i=0; i < self[type].length; i++) {

                var name = "" ;
                var assocData = {};

                switch(typeof self[type][i]) {
                    default:
                    case "string":
                        name = self[type][i];
                        assocData['name'] = name;
                        break;

                    case "object":
                        assocData = GREUtils.extend({}, self[type][i]);
                        name = assocData['name'];
                        break;
                }
                self[type][i] = assocData;
            }
        }

    });

    if (recursive >= 1) return ;


    // auto create Association Model.
    this._associations.forEach(function(type) {

        if (self[type].length > 0) {

            for (var i=self[type].length-1; i >= 0; i--) {

                var assocData = self[type][i];
                var name = assocData.name;

                if(self._getAssociationModel(name, ++recursive) == null) {
                    // remove assoctype in current instance model
                    self[type].splice(i, 1);
                }else {
                    self[name] = self._getAssociationModel(name, ++recursive);
                }

            }
        }

    });

};


/**
 * _getAssociationModel
 *
 * @name GeckoJS.Model#_getAssociationModel
 * @private
 * @function
 * @param {String} name
 * @param {Number} recursive
 * @return {Class}
 */
GeckoJS.Model.prototype._getAssociationModel = function(name, recursive) {
    
    recursive = recursive || 1;
    
    //var model = GeckoJS.ClassRegistry.getObject("ModelAssoc_" + name);
    var model = null;
    var modelClass = GeckoJS.ClassRegistry.getObject("ModelClass_"+name);

    if (model == null && modelClass != null){

        model = new modelClass(null, recursive);
        
        // add Model to ClassRegistry for later use
        // GeckoJS.ClassRegistry.addObject("ModelAssoc_" + name, model);
        
    }
    return model;
};


/**
 * _addModelEvents
 *
 * @name GeckoJS.Model#_addModelEvents
 * @private
 * @function
 */
GeckoJS.Model.prototype._addModelEvents = function() {
    
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
 * @name GeckoJS.Model#_addBehaviors
 * @private
 * @function
 */
GeckoJS.Model.prototype._addBehaviors = function() {

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
            ['beforeSave', 'afterSave', 'beforeFind', 'afterFind', 'beforeDelete', 'afterDelete', 'beforeTruncate','afterTruncate'].forEach( function(evt){
                events.addListener(evt, behavior[evt], behavior);
            }, self);
        }
    });

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
 *  - beforeTruncate<br/>
 *  - afterTruncate<br/>
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

GeckoJS.Behavior = GeckoJS.BaseObject.extend('Behavior',
/** @lends GeckoJS.Behavior.prototype */
{
    name: 'Behavior',

    /**
     * GeckoJS.Behavior contructor
     *
     * @name GeckoJS.Behavior#init
     * @public
     * @function
     * @param {GeckoJS.Model} model
     * @param {Object} config
     */
    init: function(model, config) {
        this._model = model || null;
        this._config = config || {};
    }
});


GeckoJS.Behavior.prototype.__defineGetter__('model', function(){
    return this._model;
});

GeckoJS.Behavior.prototype.__defineGetter__('config', function(){
    return this._config;
});

// unnamed Behavior counter
GeckoJS.Behavior.unnamedCounter = 1;

/**
 * addObject to ClassRegistry, when Behavior has been extended.
 *
 * @name GeckoJS.Behavior.extended
 * @public
 * @static
 * @function
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
 * @name GeckoJS.Behavior.setBehaviorClass
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
 * @name GeckoJS.Behavior.getBehaviorClass
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
 * @name GeckoJS.Behavior#beforeFind
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
 * @name GeckoJS.Behavior#afterFind
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
 * @name GeckoJS.Behavior#beforeSave
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
 * @name GeckoJS.Behavior#afterSave
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
 * @name GeckoJS.Behavior#beforeDelete
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
 * @name GeckoJS.Behavior#afterDelete
 * @public
 * @function  
 * @param {GeckoJS.EventItem} event         This is the "afterDelete" event data containing the model id from the delete() invocation
 */
GeckoJS.Behavior.prototype.afterDelete = function(event) {
    //
    };


/**
 * Handles the "beforeTruncate" event.<br/>
 * <br/>
 * This method is invoked before the model carries out a truncate() operation.
 *
 * @name GeckoJS.Behavior#beforeTruncate
 * @public
 * @function
 * @param {GeckoJS.EventItem} event         This is the "beforeTruncate" event data containing the model id from the truncate() invocation
 */
GeckoJS.Behavior.prototype.beforeTruncate = function(event) {
    //
    };

/**
 * Handles the "afterTruncate" event.<br/>
 * <br/>
 * This method is invoked after the model carries out a truncate() operation.
 *
 * @name GeckoJS.Behavior#afterTruncate
 * @public
 * @function
 * @param {GeckoJS.EventItem} event         This is the "afterTruncate" event data containing the model id from the truncate() invocation
 */
GeckoJS.Behavior.prototype.afterTruncate = function(event) {
    //
    };
/**
 * Defines GeckoJS.Controller namespace
 *
 * @public
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
 * @property {jQuery} query               The query function used to look for a document element; normally jQuery, but document.getElementById if jQuery is not available (read-only)
 * @property {Window} window              activeWindow's window object || ChromeWindow (read-only)
 * @property {Document} document          activeWindow's document object || XULDocument (read-only)
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
 * @name GeckoJS.Controller.extended
 * @private
 * @function
 */
GeckoJS.Controller.extended = function(klass) {

    if (klass.prototype.name == 'Controller' || klass.prototype.name == 'BaseController') {
        klass.prototype.name = 'Unnamed' + GeckoJS.Controller.unnamedCounter++;
    }

    var name = klass.prototype.name;
    klass.className = name;

    GeckoJS.Controller.setControllerClass(name, klass);
};

/**
 * Registers the Controller sub-class in the Class Registry.
 *
 * @name GeckoJS.Controller.setControllerClass
 * @public
 * @static
 * @function
 * @param {String} name                 This is the name to register the sub-class with
 * @param {GeckoJS.Controller} klass    This is the Controller sub-class to register
 */
GeckoJS.Controller.setControllerClass = function(name, klass) {

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
 * @name GeckoJS.Controller.getControllerClass
 * @public
 * @static
 * @function
 * @param {String} name                 This is the name of the Model sub-class to retrieve
 * @return {GeckoJS.Controller}         The Controller sub-class identified by name
 */
GeckoJS.Controller.getControllerClass = function(name) {

    return GeckoJS.ClassRegistry.getObject("ControllerClass_" + name);

};

/**
 * Retrieves a controller's Singleton instance by the controller's name.
 *
 * @name GeckoJS.Controller.getInstanceByName
 * @public
 * @static
 * @function
 * @param {String} name           This is the controller's name
 * @return {GeckoJS.BaseController}    The controller's Singleton instance, or null
 */
GeckoJS.Controller.getInstanceByName = function(name) {

        var controllerClass = null;
        var controllerName = name || null;

        if (controllerName) {
            controllerClass = GeckoJS.Controller.getControllerClass(controllerName);
        }

        if (controllerClass) {
            return controllerClass.getInstance();
        }else {
            return null;
        }

};


//domquery getter
GeckoJS.Controller.prototype.__defineGetter__('query', function(){

    return window.jQuery || function(id) { return document.getElementById(id.replace('#',''));  };
});

//document object getter
GeckoJS.Controller.prototype.__defineGetter__('document', function(){

    return document || this.window.document;

});

//window object getter
GeckoJS.Controller.prototype.__defineGetter__('window', function(){

    return window || this.activeWindow ;

});


/**
 * _addComponents
 *
 * @name GeckoJS.Controller#_addComponents
 * @private
 * @function
 */
GeckoJS.Controller.prototype._addComponents = function() {

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
 * @name GeckoJS.Controller#_addHelpers
 * @private
 * @function
 */
GeckoJS.Controller.prototype._addHelpers = function() {

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
 * @name GeckoJS.Controller#_loadModels
 * @private
 * @function
 */
GeckoJS.Controller.prototype._loadModels = function() {

    var modelClasses = [GeckoJS.Inflector.classify(this.name)].concat(this.uses);

    /* ifdef DEBUG 
    this.log('TRACE', '_loadModels classify: ' + GeckoJS.Inflector.classify(this.name));
    /* endif DEBUG */

    modelClasses.forEach(function(modelClass){

        if (typeof this[modelClass] != 'undefined' ) return;

        var model = GeckoJS.Model.getModelClass(modelClass);

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
 * Dispatches a command to a controller.
 *
 * @name GeckoJS.Controller#requestCommand
 * @public
 * @function
 * @param {String} command              This is the command to dispatch
 * @param {Object} data                 This is the data to pass to the controller
 * @param {Object} context              This is the controller to dispatch the command to
 * @return {GeckoJS.BaseObject}
 */
GeckoJS.Controller.prototype.requestCommand = function(command, data, context) {
    context = context || this;
    return GeckoJS.BaseObject.requestCommand(command, data, context, this.window);
};

/**
 * Dispatches a command to a controller.
 *
 * @name GeckoJS.Controller#newScaffold
 * @public
 * @function
 * @param {String} command              This is the command to dispatch
 * @param {Object} data                 This is the data to pass to the controller
 * @param {Object} context              This is the controller to dispatch the command to
 * @return {GeckoJS.BaseObject}
 */
GeckoJS.Controller.prototype.newScaffold = function() {
    this.wrappedJSObject['Scaffold'] = new GeckoJS.Scaffold(this);
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
 * @name GeckoJS.Component.setComponentClass
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
 * @name GeckoJS.Component.getComponentClass
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
 * @public
 * @namespace
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
GeckoJS.AclComponent = GeckoJS.Component.extend(
{
    name: 'Acl',

    userModel: GeckoJS.Model.extend({
                    useDbConfig: 'acl',

                    name: 'AclUser',
                    indexes: ['username'],
                    belongsTo: ['AclGroup']
                }),

    groupModel: GeckoJS.Model.extend({
                useDbConfig: 'acl',

                name: 'AclGroup',
                indexes: ['name'],
                hasMany: ['AclUser']
            }),

    groupRoleModel: GeckoJS.Model.extend({
                useDbConfig: 'acl',

                name: 'AclGroupRole',
                belongsTo: [/*'AclRole',*/ 'AclGroup']
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
 * @name GeckoJS.AclComponent#securityCheck
 * @public
 * @function
 * @param {String} username           This is the user's login
 * @param {String} password           This is the password
 * @param {Boolean} checkOnly         This flag, if true, indicates that the user shall not be logged in
 * @param {Boolean} force             This flag, if true, indicates that the user force logged.
 * @return {Boolean}                  "true" if authentication succeeds; "false" otherwise
 */
GeckoJS.AclComponent.prototype.securityCheck = function (username, password, checkOnly, force ) {

    checkOnly = checkOnly || false ;
    force = force || false;
    
    if(!username || !password) {
        return false;
    }
    
    var userModel = new this.userModel;
    var cond = "username='"+ username+"'";
    var someone = userModel.find('first',{conditions: cond});

    if(!someone) {
        return false;
    }

    // Compare the MD5 encrypted version of the password against recorded encrypted password.
    if( !force && (!someone['password'] || someone['password'] != password) ) {
        return false;
    }
    if (checkOnly) return true;

    someone['Roles'] = [];
    someone['RolesByName'] = {};

    var groupId = someone.AclGroup.id;


    var roles = [], rolesByName = {};

    // superuser or admin group has all roles
    if (someone.username == 'superuser' || (someone.AclGroup != null && someone.AclGroup.name == 'admin') ){

        var allRoles = this.getRoleList();

        if (allRoles) {
            allRoles.forEach(function(rolePref) {
                roles.push(rolePref);
                rolesByName[rolePref] = true;
            });
        }

    }else {
        
        var groupRoleModel = new this.groupRoleModel;

        var groupRoles = groupRoleModel.find('all', {
            conditions: "acl_group_id='"+groupId+"'",
            recursive: 0
        });

        if (groupRoles) {

            groupRoles.forEach(function(group_role) {
                // roles.push(group_role.AclRole.name);
                roles.push(group_role.role);
                rolesByName[group_role.role] = true;
            });
        }

    }

    someone['Roles'] = roles;
    someone['RolesByName'] = rolesByName;

    // just on group now
    someone['Groups'] = (someone.AclGroup != null) ? [someone.AclGroup.name] : [];

    this.controller.Session.set('User', someone);

    GeckoJS.Observer.notify(null, "acl-session-change", "securityCheck");

    return true;

};


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
 * @name GeckoJS.AclComponent#securityCheckByPassword
 * @public
 * @function
 * @param {String} password           This is the password
 * @param {Boolean} checkOnly         This flag, if true, indicates that the user shall not be logged in
 * @return {Boolean}                  "true" if authentication succeeds; "false" otherwise
 */
GeckoJS.AclComponent.prototype.securityCheckByPassword = function (password, checkOnly ) {

    if(!password) {
        return false;
    }

    checkOnly = checkOnly || false ;

    var userModel = new this.userModel;
    var cond = "\"password\"='"+ password+"'";
    var someone = userModel.find('first',{conditions: cond});

    if(!someone) {
        return false;
    }

    if (checkOnly) return true;

    return this.securityCheck(someone.username, someone.password);

};


/**
 * Logs out the current user and removes his credentials from the application
 * Session singleton. 
 *
 * @name GeckoJS.AclComponent#invalidate
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
 * @name GeckoJS.AclComponent.getUserPrincipal
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
 * @name GeckoJS.AclComponent#getUserPrincipal
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
 * @name GeckoJS.AclComponent.isUserInRole
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

    // superuser always true
    if (principal.username == 'superuser') return true;
    
    // if admin group always true
    if (typeof principal.AclGroup == 'object' && principal.AclGroup != null) {
        if (principal.AclGroup.name == 'admin') return true;
    }

    var self = this;
    var roles = roleName.split(',');
    var isInRole = false;

    roles.forEach(function(role){
        if(!isInRole) {
            isInRole = principal.RolesByName[role] || false; // for quick search
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
 * @name GeckoJS.AclComponent#isUserInRole
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
 * @name GeckoJS.AclComponent#addUser
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
         
    var userModel = new this.userModel();

    var user = userModel.find("first", {
        conditions: "username='"+username+"'"
    });
    if (user) userModel.id = user.id;
    else userModel.create();
    
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
 * @name GeckoJS.AclComponent#removeUser
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
 * @name GeckoJS.AclComponent#changeUserPassword
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
 * Adds an ACL group.<br/>
 * <br/>
 * If the group does not exist, it is added and its uuid is returned.
 * If the group already exists, it is not added again, and the
 * method returns "false".
 *
 * @name GeckoJS.AclComponent#addGroup
 * @public
 * @function
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
 * @name GeckoJS.AclComponent#removeGroup
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
 * @name GeckoJS.AclComponent#addUserToGroup
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
         
    var userModel = new this.userModel();
    var groupModel = new this.groupModel();

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
 * @name GeckoJS.AclComponent#removeUserFromGroup
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
         
    var userModel = new this.userModel();
    var groupModel = new this.groupModel();

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
 * @name GeckoJS.AclComponent#addRoleToGroup
 * @public
 * @function
 * @param {String} groupName      This is the group to assign the role to
 * @param {String} roleName       This is the role to assign to the group
 * @return {String|Boolean}       The groupRole uuid if the role is successfully assigned; "false" otherwise
 */
GeckoJS.AclComponent.prototype.addRoleToGroup = function(groupName, roleName) {
    
    roleName = roleName || null;
    groupName = groupName || null;
        
    // no roleName parameter return false
    if (groupName == null || roleName == null ) return false;
         
//    var roleModel = new this.roleModel;
    var groupModel = new this.groupModel();
/*
    var role = roleModel.find('first', {
        conditions: "name='" + roleName + "'"
    });
    if (role == null) return false;
*/
    var group = groupModel.find('first', {
        conditions: "name='" + groupName + "'"
    });
    if (group == null) return false;
    
    var groupRoleModel = new this.groupRoleModel();
    
    var cond = "acl_group_id='"+group.id+"' AND role='"+roleName+"'";
    var count = groupRoleModel.find('count', {
        conditions: cond
    });
    
    if (count > 0) return false;

    groupRoleModel.create();

    groupRoleModel.save({
        acl_group_id: group.id,
        role: roleName
    });

    var id = groupRoleModel.id;
    
    //delete roleModel;
    delete groupModel;
    delete groupRoleModel;
    
    return id;

};

/**
 * Removes an ACL role from an ACL group.
 *
 * @name GeckoJS.AclComponent#removeRoleFromGroup
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
         
    // var roleModel = new this.roleModel;
    var groupModel = new this.groupModel;

    /*
    var role = roleModel.find('first', {
        conditions: "name='" + roleName + "'"
    });
    if (role == null) return false;
    */
   
    var group = groupModel.find('first', {
        conditions: "name='" + groupName + "'"
    });
    if (group == null) return false;
    
    var groupRoleModel = new this.groupRoleModel;
    
    var cond = "acl_group_id='"+group.id+"' AND role='"+roleName+"'";
    var groupRoles = groupRoleModel.find('all', {
        conditions: cond
    });
    
    if (groupRoles == null || groupRoles.length == 0) return false;
    
    groupRoles.forEach(function(groupRole) {
        var grId = groupRole.id;
        groupRoleModel.id = grId;
        groupRoleModel.del(grId);
    });
    
    // delete roleModel;
    delete groupModel;
    delete groupRoleModel;
    
    return true;

};


/**
 * Retrievs the list of ACL users that satisfy the given conditions.
 *
 * @name GeckoJS.AclComponent#getUserList
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
 * @name GeckoJS.AclComponent#getUserListInGroup
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
 * @name GeckoJS.AclComponent#getGroupList
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
 * @name GeckoJS.AclComponent#getRoleList
 * @public
 * @function  
 * @param {String} conditions          This is the role used to filter the roles
 * @return {Object}                 An array of ACL roles
 */
GeckoJS.AclComponent.prototype.getRoleList = function(conditions) {

    /*
    var params = null;
    if(conditions) {
        params = {conditions: conditions};
    }    

    var roleModel = new this.roleModel;

    var roles = roleModel.find("all", params);
    
    delete roleModel;
    */

    var rolesObj = GeckoJS.Configure.read('vivipos.fec.acl.roles');

    var roles = GeckoJS.BaseObject.getKeys(rolesObj);

    if (conditions) {
        if (GeckoJS.Array.inArray(conditions, roles) != -1) {
            return [conditions];
        }
    }
    return roles;
    
    
};


/**
 * Retrieves the list of ACL roles that have been assigned to an ACL group.
 *
 * @name GeckoJS.AclComponent#getRoleListInGroup
 * @public
 * @function  
 * @param {String} groupName         This is the name of the ACL group
 * @return {Object}                 An array of ACL roles
 */
GeckoJS.AclComponent.prototype.getRoleListInGroup = function(groupName) {
    
    groupName = groupName || null;
        
    // no groupName parameter return false
    if (groupName == null || groupName == 'admin') return this.getRoleList();

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

    return GeckoJS.Array.objectExtract(groupRoles, '{n}.role');
    
};

/**
 * Adds an ACL role.<br/>
 * <br/>
 * If the role does not exist, it is added and its uuid is returned.
 * If the role already exists, it is not added again, and the
 * method returns "false".
 *
 * @name GeckoJS.AclComponent#addRole
 * @public
 * @function
 * @param {String} roleName         This is the name of the role to add
 * @param {String} roleDescription  This is a description of the role
 * @return {Boolean|String}         The new ACL role uuid, or "false" if the role fails to be added
 */
/*
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
*/

/**
 * Removes an ACL role. This automatically removes the role from all ACL groups
 * to which the role has been added.<br/>
 * <br/>
 * If the role does not exist, "false" is returned.
 *
 * @name GeckoJS.AclComponent#removeRole
 * @public
 * @function
 * @param {String} roleName         This is the name of the role to remove
 * @return {Boolean}                "true" if the role is successfully removed; "false" otherwise
 */
/*
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
*/

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
 *
 * @name GeckoJS.Helper.extended
 * @private
 * @function
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
 * @name GeckoJS.Helper.setHelperClass
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
 * @name GeckoJS.Helper.getHelperClass
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

    return window.jQuery || function(id) { return document.getElementById(id.replace('#',''));  };

});

/**
 * Creates a DOM element of the given document type and element tag.
 *
 * @name GeckoJS.Helper#createElement
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
 * @name GeckoJS.Helper.createElement
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
 * @name GeckoJS.Helper#removeAllChildren
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
 * @name GeckoJS.Helper.removeAllChildren
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
 * @public
 * @namespace
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
 * @name GeckoJS.FormHelper.reset
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
 * @name GeckoJS.FormHelper#reset
 * @public
 * @function   
 * @param {String} form           This is the name of the DOM element with 'form' attribute. 
 */
GeckoJS.FormHelper.prototype.reset = function(form) {

    // jQuery way
    jQuery('[form='+form+']').each(function() {
        var n = this.name || this.getAttribute('name');
        if (!n) return;
        var v = this.getAttribute('default');
        
        if (typeof v != 'undefined') {
            GeckoJS.FormHelper.setFieldValue(this, v);
        }
    });        
};

/**
 * Resets all inputable fields in a form to default if the field has a
 * 'default' attribute.
 *
 * @name GeckoJS.FormHelper.getDefaultValues
 * @public
 * @static
 * @function
 * @param {String} form           This is the name of the DOM element with 'form' attribute.
 */
GeckoJS.FormHelper.getDefaultValues = function(form) {
    return GeckoJS.FormHelper.getInstance().getDefaultValues(form);
};


/**
 * Resets all inputable fields in a form to default if the field has a
 * 'default' attribute.
 *
 * @name GeckoJS.FormHelper#getDefaultValues
 * @public
 * @function
 * @param {String} form           This is the name of the DOM element with 'form' attribute.
 */
GeckoJS.FormHelper.prototype.getDefaultValues = function(form) {

    var data = {};
    // jQuery way
    jQuery('[form='+form+']').each(function() {
        var n = this.name || this.getAttribute('name');
        if (!n) return;
        var v = this.getAttribute('default');

        if (typeof v != 'undefined') {
            data[n] = v;
        }
    });
    return data;
};



/**
 * Serializes all inputable fields in a form and stores them in an Object.<br/>
 * <br/>
 * Each inputable field is stored in the return object as a property of the
 * object.
 *
 * @name GeckoJS.FormHelper.serializeToObject
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
 * @name GeckoJS.FormHelper#serializeToObject
 * @public
 * @function   
 * @param {String} form           This is the name of the DOM element with 'form' attribute. 
 * @param {Boolean} successful    This is a flag indicating if only enabled and selected fields are to be included; defaults to "true"
 * @return {Object}               An object containing the values of all inputable fields in the form
 */
GeckoJS.FormHelper.prototype.serializeToObject = function(form, successful) {

    var a = {};

    // jQuery way
    jQuery('[form='+form+']').each(function() {
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
 * @name GeckoJS.FormHelper.serialize
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
 * @name GeckoJS.FormHelper#serialize
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
 * @name GeckoJS.FormHelper.unserialize
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
 * @name GeckoJS.FormHelper#unserialize
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
 * @name GeckoJS.FormHelper.unserializeFromObject
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
 * @name GeckoJS.FormHelper#unserializeFromObject
 * @public
 * @function  
 * @param {String} form           This is the name of the DOM element with 'form' attribute. 
 * @param {Object} data           This is an object used as the source of the inputable field values
 */
GeckoJS.FormHelper.prototype.unserializeFromObject = function (form, data) {

    if(typeof data == 'undefined' || typeof form == 'undefined') return;
    
    // jQuery way
    jQuery('[form='+form+']').each(function() {
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
 * @name GeckoJS.FormHelper.isFormModified
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
 * @name GeckoJS.FormHelper#isFormModified
 * @public
 * @static
 * @function
 * @param {String} form           This is the name of the DOM element with 'form' attribute.
 * @return {Boolean}              Return true is form 's value != org_value
 */
GeckoJS.FormHelper.prototype.isFormModified = function (form) {

    if(typeof form == 'undefined') return false;

    // jQuery way
    var result = false;
    
    jQuery('[form='+form+']').each(function() {
        
        var n = this.name || this.getAttribute('name');
        if (!n) return;

        var v = GeckoJS.FormHelper.getFieldValue(this);
        var org_value = this.getAttribute('org_value');

        if(typeof org_value != 'undefined' && typeof v != 'undefined' && v != null && org_value != null)  {

            if (v.constructor.name == 'Array') {
                v = v.join(',');
            }
            if( (v+'') != (org_value+'')) result = true;
        }
    });

    return result;

};


/**
 * Returns the value of an XUL inputable field.
 *
 * @name GeckoJS.FormHelper.getFieldValue
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
 * @name GeckoJS.FormHelper#getFieldValue
 * @public
 * @function  
 * @param {Element} el            This is a DOM element representing an XUL inputable field
 * @param {Boolean} successful    This is a flag indicating if only enabled and selected fields are to be retrieved; defaults to "true"
 * @return {String}               The value of the inputable field
 */
GeckoJS.FormHelper.prototype.getFieldValue = function(el, successful) {

    if(el == null) return null;
    
    var n = el.name || el.getAttribute('name'), tag = el.tagName.toLowerCase(), t = el.type || el.getAttribute('type') || tag;

    if (typeof successful == 'undefined') successful = false;

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
    }else if (tag == 'radiogroup') {
        return (el.selectedItem ? el.selectedItem.value : "");
    }
    return el.value;
    
};


/**
 * Sets the value of an XUL inputable field.
 *
 * @name GeckoJS.FormHelper.setFieldValue
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
 * @name GeckoJS.FormHelper#setFieldValue
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
    if ( (!n) /*|| el.disabled */)  return ;

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

            if (data && data.constructor.name == 'Array') {
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
    if (typeof data != 'undefined' && data !== null){
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
 * @name GeckoJS.FormHelper.appendItems
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
 * @name GeckoJS.FormHelper#appendItems
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
 * @name GeckoJS.FormHelper.clearItems
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
 * @name GeckoJS.FormHelper#clearItems
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
 * @name GeckoJS.NumberHelper.round
 * @public
 * @function
 * @static
 * @parameter {Float} value         this is the value to round
 * @parameter {Number} precision    this is the precision to round the result to
 * @parameter {Number} policy       this is the rounding policy
 * @return {Number}                 the result after rounding
 */

GeckoJS.NumberHelper.round = function (value, precision, policy, table) {
    if (isNaN(value) || isNaN(precision)) return value;
    
    var p = Math.round(precision);
    var result = value.toFixed(12) * Math.pow(10, p);
    if (p > 0) result = result.toFixed(Math.max(0, 12 - p));
    
    switch(policy) {
        
        case 'to-nearest-precision':
            result = Math.round(result);
            break;
            
        case 'to-nearest-half':
            result = Math.round(result * 0.02) * 50;
            break;
            
        case 'to-nearest-quarter':
            result = Math.round(result * 0.04) * 25;
            break;
            
        case 'to-nearest-nickel':
            result = Math.round(result * 0.1) * 10;
            break;
            
        case 'always-round-up':
            result = (result >= 0) ? Math.ceil(result) : Math.floor(result);
            break;
            
        case 'always-round-down':
            result = (result >= 0) ? Math.floor(result) : Math.ceil(result);
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
    return (precision>=0) ? parseFloat(result2.toFixed(precision)) : parseInt(result2);
    // return (result * Math.pow(10, -p)).toFixed(digits);
}

/* 
 * Rounds a number to a given precision using the indicated rounding policy.<br/>
 * <br/>
 * Please see <pre>GeckoJS.NumberHelper.round</pre> for usage. 
 * 
 * @name GeckoJS.NumberHelper#round
 * @public
 * @static
 * @function
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
 * @name GeckoJS.NumberHelper.precision
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
 * @name GeckoJS.NumberHelper#precision
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
 * @name GeckoJS.NumberHelper.toReadableSize
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
 * @name GeckoJS.NumberHelper#toReadableSize
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
 * @name GeckoJS.NumberHelper.toPercentage
 * @public
 * @static
 * @function
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
 * @name GeckoJS.NumberHelper#toPercentage
 * @public
 * @function
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
 * @name GeckoJS.NumberHelper.format
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
 * @name GeckoJS.NumberHelper#format
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
 * @name GeckoJS.NumberHelper.currency
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
 * @name GeckoJS.NumberHelper#currency
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
