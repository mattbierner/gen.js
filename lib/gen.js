(function(define){

define(['composed'], function(composed) {
"use strict";

/* Forward declarations
 ******************************************************************************/
var gen, GenBreak;
var CONTINUE = undefined;

/* Helper functions
 ******************************************************************************/
var identity = function(v) { return v; };

var constant = function(v) { return identity.bind(this, v); };

var empty = function() { };

var noop = constant(empty);


/* Built-In Generators
 ******************************************************************************/
/**
 * Factory for generator that yields a single value.
 * 
 * Returned generator yields a single value.
 * 
 * @param {function} source Function that returns single value to yield.
 * 
 * @return {gen} Generator function that performs
 *    the forEach operation when invoked.
 */
var single = function(source) {
    var hasRun;
    return gen(function(y, b, r) {
        if (hasRun) {
            b();
        } else {
            hasRun = true;
            source(y, b, r);
        }
    });
};

/**
 * 
 */
var wrap = function(source, innerY, innerB) {
    return gen(function(y, b, r) {
        var didBreak;
        var val = r(source, innerY, function(){ didBreak = true; return empty; })();
        if (didBreak) {
            if (innerB) {
                innerB();
            }
            b();
        } else {
            y(val);
        }
    });
};

/**
 * Factory for generator that greedily iterates over a source generator.
 * 
 * Returned generator does not return a value.
 * 
 * @param {gen} source Source generator being iterated over.
 * @param {function(value, index): *} callback Function called for each element of
 *     source.
 * @param {Object} [t] 'this' object used when invoking the callback.
 * 
 * @return {gen} Generator that performs forEach operation when invoked.
 */
var forEach = function(source, callback, t) {
    return single(function(y, b, r) {
        var i = 0;
        r(source,
            function(v) { callback.call(t, v, i++); return CONTINUE; }
        )(undefined, y);
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
 * @param [initial] The initial value used for reduce.
 * 
 * @return {gen} Generator that reduces the source generator when invoked.
 */
var reduce = function(source, callback, initial) {
    return single(function(y, b, r) {
        var p = initial;
        r(forEach(source, function(v, i) {
            p = callback(p, v, i);
        }))(function() { y(p); });
    });
};

/**
 * Factory for generator that transforms values from a source generator.
 * 
 * @param {gen} source Source generator being transformed.
 * @param {function(value)} callback Function that transforms source values and
 *     returns the transformed value.
 * @param {Object} [t] 'this' object used for callback.
 * 
 * @return {gen} Generator that yields transformed values when invoked.
 */
var map = function(source, callback, t) {
    return wrap(source, function(v) {
        return function() {
            return callback.call(t, v);
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
 * @param [t] 'this' object used for predicate.
 * 
 * @return {gen} Generator that yields filtered source
 *     generator values.
 */
var filter = function(source, predicate, t) {
    return wrap(source, function(v) {
        return (predicate.call(t, v) ? constant(v) : CONTINUE);
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
        return reduce(source, arrayReduce, []);
    };
}());

/* Helper Objects.
 ******************************************************************************/
var next = (function(){
    var defaultY = constant;
    var defaultB = noop;

    var inner = function(action, onAction) {
        return (!onAction ? action :
            function(/* ... */) {
                var val;
                try {
                    val = action.apply(undefined, arguments);
                } finally {
                    onAction.apply(undefined, arguments);
                    return val;
                }
            });
    };
    
    return function(impl, source, y, b) {
        y = y || defaultY;
        b = b || defaultB;
        return function(onY, onB) {
            return impl(source, inner(y, onY), inner(b, onB));
        };
    };
}());

/* Exported Objects
 ******************************************************************************/
/**
 * Exception thrown by default when a generator function breaks.
 */
GenBreak = function() { };
GenBreak.prototype = new Error();
GenBreak.prototype.name = "GenBreak";

/**
 * Create a synchronous generator function from a gen instance.
 * 
 * Synchronous yield and break synchronously when generating values. Synchronous
 * generators may return values but will block on infinite sources.
 * 
 * @param {function(value): function()} y Yield continuation factory. Takes
 *     the value being yielded and returns a continuation that actually yields
 *     the value. Not returning a continuation is assumed to be a implicit
 *     continue.
 * @param {function(value): function()} b Break continuation factory. Returns
 *     a continuation that actually breaks.
 * 
 * @return {function(onYield: function(v), onBreak: function())} Synchronous generator
 *     function. Takes two callback arguments, onYield and onBreak. These are called
 *     when the generator yields or breaks before a value is returned.
 */
var sync = next.bind(undefined, function(source, y, b) {
    var continuation;
    var outerY = function(/*...*/) { continuation = y.apply(undefined, arguments); };
    var outerB = function() { continuation = b(); };
    var outerR = function(/*...*/) { return (continuation = sync.apply(undefined, arguments)); };
    
    do
    {
        source.source(outerY, outerB, outerR);
    } while (continuation === CONTINUE);
    return continuation();
});

/**
 * Create a asynchronous generator function from a gen instance.
 * 
 * Asynchronous yield and breaks when generating values. Asynchronous may only
 * return values using callbacks but will not block on infinite sources.
 * 
 * @param {function(value): function()} y Yield continuation factory. Takes
 *     the value being yielded and returns a continuation that actually yields
 *     the value. Not returning a continuation is assumed to be a implicit
 *     continue.
 * @param {function(value): function()} b Break continuation factory. Returns
 *     a continuation that actually breaks.
 * 
 * @return {function(onYield: function(v), onBreak: function())} Asynchronous generator
 *     function. Takes two callback arguments, onYield and onBreak. These are called
 *     when the generator yields or breaks.
 */
var async = next.bind(undefined, function(source, y, b) {
    var getNext;
    var extract = function(continuation) { 
         if (continuation === CONTINUE) {
            setTimeout(getNext, 0);
        } else {
            return continuation;
        }
    };
    
    setTimeout(getNext = source.source.bind(undefined,
        composed.compose(extract, y),
        composed.compose(extract, b), 
        composed.compose(extract, async)
    ), 0);
}); 

/**
 * Prototype of gen instances.
 */
var prototype = {
    'map':      function(c, t)  { return map(this, c, t); },
    'filter':   function(p, t)  { return filter(this, p, t); },
    'reduce':   function(c, i)  { return reduce(this, c, i); },
    'toArray':  function()      { return toArray(this); },
    'forEach':  function(c, t)  { return forEach(this, c, t); },
    
    'sync': function(y, b) { return sync(this, y, b); },
    'async': function(y, b) { return async(this, y, b); }
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
            'value': source
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
    'CONTINUE': {
        'value': CONTINUE
    },
    'GenBreak': {
        'value': GenBreak
    },
    'single': {
        'value': single
    },
    'wrap': {
        'value': function(s, y, b) { return wrap(gen(s), y, b); }
    },
    'map': {
        'value': function(s, c, t) { return map(gen(s), c, t); }
    },
    'filter': {
        'value': function(s, p, t) { return filter(gen(s), p, t); }
    },
    'reduce': {
        'value': function(s, c, i) { return reduce(gen(s), c, i); }
     },
    'toArray': {
        'value': function(s) { return toArray(gen(s)); }
    },
    'forEach': {
        'value': function(s, c, t) { return forEach(gen(s), c, t); }
    }
});


});

}(
    typeof define !== 'undefined' ? define : function(factory) { gen = factory(); }
));