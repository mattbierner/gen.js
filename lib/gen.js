(function(define){

define(function() {
//"use strict";

/* Forward declarations
 ******************************************************************************/
var gen;

/* Helper functions
 ******************************************************************************/
var identity = function(v) { return v; };

var constant = function(v) { return identity.bind(undefined, v); };

var noop = constant(function(){});

/* Built-In Simple Generators
 ******************************************************************************/
/**
 * Factory for generator that yields a single value.
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
 * Factory for generator that greedily iterates over a source generator.
 * 
 * Returned generator does not return a value.
 * 
 * @param {gen} source Source generator being iterated over.
 * @param {function(value, index)} callback Function called for each element of
 *     source.
 * 
 * @return {function(yield, break)} Generator function that performs
 *    the forEach operation when invoked.
 */
var forEach = function(source, callback, t) {
    return single(function() {
        var i = 0;
        source(function(v) {
            callback.call(t, v, i++);
        }, noop);
    });
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
 * @return {function(yield, break)} Generator function that reduces the
 *     source generator when invoked.
 */
var reduce = function(source, callback, initial) {
    return single(function() {
        var p = initial;
        forEach(source, function(v, i) {
            p = callback(p, v, i);
        })(noop, noop);
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
 * @return {function(yield, break)} Transformed generator that yields transformed
 *     values when invoked.
 */
var map = function(source, callback, thisObj) {
    var innerY = function(v) {
        return constant(callback.call(thisObj, v));
    };
    return gen(function(y, b) {
        return y(source(innerY, b));
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
 * @return {function(yield, break)} Generator that yields filtered source
 *     generator values.
 */
var filter = function(source, predicate, thisObj) {
    var innerY = function(v) {
        if (predicate.call(thisObj, v))
            return constant(v);
    };
    return gen(function(y, b) {
        return y(source(innerY, b));
    });
};

/**
 * Factory for generators that greedily transform a source generator into an array.
 * 
 * Returned generator yields a single value, an array of all source generator
 * values.
 * 
 * @param {gen} source Source generator
 * 
 * @return {function(yield, break)} Generator that yields all source generator
 *     values as an array when invoked.
 */
var toArray = (function(){
    function arrayReduce(p, c) {
        p.push(c);
        return p;
    }
    return function(source) {
        return reduce(source, arrayReduce, []);
    };
}());


/* Exported Objects
 ******************************************************************************/
/**
 * Exception thrown by default when a generator function breaks.
 */
var GenBreak = function(){};
GenBreak.prototype = new Error();
GenBreak.prototype.name = "GenBreak";

/**
 * Properties exported on gen instances. 
 * 
 * Because we cannot cleanly define a prototype of a function object using
 * standard code, any properties for gen instances must be set using properties.
 * Unlike prototype, adding or changing properties only effects instances created
 * after the property is set.
 */
var properties = {
    'map': {
        'value': function(c, t) { return map(this, c, t ); },
        'writable': true
    },
    'filter': {
        'value': function(p, t) { return filter(this, p, t); },
        'writable': true
    },
    'reduce': {
        'value': function(c, i) { return reduce(this, c, i); },
        'writable': true
    },
    'toArray': {
        'value': function() { return toArray(this); },
        'writable': true
    },
    'forEach': {
        'value': function(c, t) { return forEach(this, c, t); },
        'writable': true
    }
};

/**
 * Factory for gen style generators.
 * 
 * Adds flow control logic to generator and default values for yield and break
 * continuations.
 * 
 * @param {function(yield, break)} source A generator function that produces
 *     values for this generator.
 * 
 * @return {function(yield, break)} A gen style generator function that yields
 *    values from the source generator.
 */
gen = (function(){
    var defaultY = constant;
    var defaultB = constant(function() { throw new GenBreak(); });
    
    var syncNext = function(source, y, b) {
        var continuation;
        do
        {
            continuation = source(y, b);
        } while (continuation === undefined);
        return continuation();
    };
    
    var asyncNext = function(source, y, b) {
        var continuation;
        setTimeout(function getNext(){
            continuation = source(y, b);
            if (continuation === undefined) {
                setTimeout(getNext, 0);
            } else {
                continuation();
            }
        }, 0);
    };
    
    return function(source) {
        var next = syncNext;
        var generator = function(y, b) {
            return next(source, y || defaultY, b || defaultB);
        };
        Object.defineProperties(generator, properties);
        generator.async = function(){ next = asyncNext; return this; };
        return generator;
    };
}());

/* Export
 ******************************************************************************/
return Object.defineProperties(gen, {
    'properties': {
        'value': properties
    },
    'GenBreak': GenBreak,
    'single': {
        'value': single,
        'writable': true
    },
    'map': {
        'value': function(s, c, t) { return map(gen(s), c, t); },
        'writable': true
    },
    'filter': {
        'value': function(s, p, t) { return filter(gen(s), p, t); },
        'writable': true
    },
    'reduce': {
        'value': function(s, c, i) { return reduce(gen(s), c, i); },
        'writable': true
     },
    'toArray': {
        'value': function(s) { return toArray(gen(s)); },
        'writable': true
    },
    'forEach': {
        'value': function(s, c, t) { return forEach(gen(s), c, t); },
        'writable': true
    }
});


});

}(
    typeof define !== 'undefined' ? define : function(factory) { gen = factory(); }
));