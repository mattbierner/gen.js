(function(define){

define(function() {
"use strict";

/* Forward declarations
 ******************************************************************************/
var gen, GenBreak;

/* Helper functions
 ******************************************************************************/
var identity = function(v) { return v; };

var constant = function(v) { return identity.bind(this, v); };

var empty = function(){};

var noop = constant(empty);

/* Built-In Simple Generators
 ******************************************************************************/
/**
 * Factory for generator that yields a single value.
 * 
 * Returned generator yields a single value.
 * 
 * @param {function} func Function that returns single value to yield.
 * 
 * @return {gen} Generator function that performs
 *    the forEach operation when invoked.
 */
var single = function(func) {
    var hasRun;
    return gen(function(y, b) {
        if (hasRun) return b();
        hasRun = true;
        return y(func());
    });
};

/* Built-In Higher Order Generators
 ******************************************************************************/
/**
 * 
 */
var wrap = function(source, innerY, innerB) {
    return gen(function(y, b) {
        var didBreak;
        var val = source.sync(innerY, function(){ didBreak = true; return empty; })();
        if (didBreak) {
            innerB && innerB();
            return b();
        }
        else {
            return y(val);
        }
    });
};

/**
 * Factory for generator that greedily iterates over a source generator.
 * 
 * Returned generator does not return a value.
 * 
 * @param {gen} source Source generator being iterated over.
 * @param {function(value, index)} callback Function called for each element of
 *     source.
 * 
 * @return {gen} Generator that performs forEach operation when invoked.
 */
var forEach = function(source, callback, t) {
    var i = 0;
    return single(source.sync(function(v) { callback.call(t, v, i++); }, noop));
};

/**
 * Factory for a generator that reduces a source generator left to right.
 * 
 * Returned generator yields a single value.
 * 
 * @param {gen} source Source generator to reduce.
 * @param {function(previous, current, index)} callback Function that reduces 
 *     the source.
 * @param initial The initial value used for reduce.
 * 
 * @return {gen} Generator that reduces the source generator when invoked.
 */
var reduce = function(source, callback, initial) {
    return single(function() {
        var p = initial;
        source.forEach(function(v, i) {
            p = callback(p, v, i);
        }).sync(noop, noop)();
        return p;
    });
};

/**
 * Factory for generator that transforms values from a source generator.
 * 
 * @param {gen} source Source generator being transformed.
 * @param {function(value)} callback Function that transforms source values and
 *     returns the transformed value.
 * @param [thisObj] 'this' object used for callback.
 * 
 * @return {gen} Generator that yields transformed values when invoked.
 */
var map = function(source, callback, thisObj) {
    return source.wrap(function(v) {
        return function(){
            return callback.call(thisObj, v);
        };
    });
};

/**
 * Factory for generators that filter a source generator.
 * 
 * Returned generator only yields values from the source generator that meet the
 * given condition.
 * 
 * @param {gen} source Source generator being filtered.
 * @param {function(value): boolean} predicate Predicate function used to filter
 *     source generator results.
 * @param [thisObj] 'this' object used for predicate.
 * 
 * @return {gen} Generator that yields filtered source
 *     generator values.
 */
var filter = function(source, predicate, thisObj) {
    return source.wrap(function(v) {
        if (predicate.call(thisObj, v))
            return constant(v);
    });
};

/**
 * Factory for generators that greedily transform a source generator into an array.
 * 
 * Returned generator yields a single value, an array of all source generator
 * values.
 * 
 * @param {gen} source Source generator.
 * 
 * @return {gen} Generator  that yields all source generator
 *     values as an array when invoked.
 */
var toArray = (function(){
    function arrayReduce(p, c) {
        p.push(c);
        return p;
    }
    return function(source) {
        return source.reduce(arrayReduce, []);
    };
}());

/* Helper Objects.
 ******************************************************************************/
var globalY = constant;
var globalB = constant(function() { throw new GenBreak(); });

var next = function(impl, source, defaultY, defaultB) {
    defaultY = defaultY || globalY;
    defaultB = defaultB || globalB;
    return function(y, b) {
        return impl(source, y || defaultY, b || defaultB);
    };
};


/* Exported Objects
 ******************************************************************************/
/**
 * Exception thrown by default when a generator function breaks.
 */
GenBreak = function(){};
GenBreak.prototype = new Error();
GenBreak.prototype.name = "GenBreak";

var sync = (function(){
    function syncNext(source, y, b) {
        var continuation;
        do
        {
            continuation = source(y, b);
        } while (continuation === undefined);
        return continuation();
    }
    
    return function(y, b) { return next(syncNext, this.source, y, b); }
}());

var async = (function(){
    function asyncNext(source, y, b) {
        var continuation;
        setTimeout(function getNext() {
            continuation = source(y, b);
            if (continuation === undefined) {
                setTimeout(getNext, 0);
            } else {
                continuation();
            }
        }, 0);
    }
    
    return function(y, b) { return next(asyncNext, this.source, y, b); };
}());


/**
 * Prototype of gen instances.
 */
var prototype = {
    'wrap':      function(y, b) { return wrap(this, y, b); },
    'map':      function(c, t)  { return map(this, c, t); },
    'filter':   function(p, t)  { return filter(this, p, t); },
    'reduce':   function(c, i)  { return reduce(this, c, i); },
    'toArray':  function()      { return toArray(this); },
    'forEach':  function(c, t)  { return forEach(this, c, t); },
    
    'sync': sync,
    'async': async
};


/**
 * Factory for generator objects.
 * 
 * Adds flow control logic to generator and default values for yield and break
 * continuations.
 * 
 * @param {function(yield, break)} source A generator function that produces
 *     values for this generator.
 * 
 * @return {gen} A object generator function that yields
 *    values from the source generator.
 */
gen = function(source) {
    return Object.create(prototype, {
        'source': {
            'value':source
        }
    });
};


/* Export
 ******************************************************************************/
return Object.defineProperties(gen, {
    'prototype': {
        'value': prototype,
        'writable': true
    },
    'GenBreak': GenBreak,
    'single': {
        'value': single,
        'writable': true
    },
    
    'wrap': {
        'value': function(s, y, b) { return gen(s).wrap(y, b); },
        'writable': true
    },
    'map': {
        'value': function(s, c, t) { return gen(s).map(c, t); },
        'writable': true
    },
    'filter': {
        'value': function(s, p, t) { return gen(s).filter(p, t); },
        'writable': true
    },
    'reduce': {
        'value': function(s, c, i) { return gen(s).reduce(c, i); },
        'writable': true
     },
    'toArray': {
        'value': function(s) { return gen(s).toArray(); },
        'writable': true
    },
    'forEach': {
        'value': function(s, c, t) { return gen(s).forEach(c, t); },
        'writable': true
    }
});


});

}(
    typeof define !== 'undefined' ? define : function(factory) { gen = factory(); }
));