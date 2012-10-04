(function(define){

define(['gen'], function(gen) {
//"use strict";

var noop = function() { return function(){ }; }; 

/* Helper Functions
 ******************************************************************************/
var setIfUndef = function(obj, key, val) {
    obj[key] = obj[key] || val;
};

/* Exported Objects
 ******************************************************************************/
/**
 * Factory for generator that attempts to yield elements from a source generator
 * while a condition holds true. Breaks once the condition is no longer true.
 * 
 * @param {gen} source Source generator to yield elements from.
 * @param {function(value): boolean} pred Predicate function that determines when
 *     to step taking elements.
 * @param thisObj 'this' object used for predicate function.
 * 
 * @returns {function(yield, break)} Generator that yields elements until the
 *     predicate is no longer true, then breaks.
 */
var takeWhile = function(source, pred, thisObj) {
    var condition = true;
    var i = 0;
    var onY = function(v) { condition = pred.call(thisObj, v, i++); };
    var onB = function() { condition = false; };
    source = source.sync(undefined, noop);
    return gen(function(y, b) {
        if (!condition) return b();
        var value = source(onY, onB);
        if (condition) {
            y(value)
        } else {
            b();
        }
    });
};

/**
 * Factory for generator that attempts to yield at most 'count' elements from
 * source generator.
 * 
 * May yield fewer elements if generator breaks. Otherwise, behaves like normal
 * generator.
 * 
 * @param {gen} source Source generator to yield elements from.
 * @param {number} count Number of elements to take. Must be greater than or 
 *     equal to zero. Defaults to 'Infinity'.
 * 
 * @returns {function(yield, break)} Generator that yields at most count elements
 *    from source.
 */
 var take = function(source, count) {
    count = (count >= 0 ? count : Infinity);
    return (count === Infinity ? source :
        takeWhile(source, function(v, i) { return (i < count); }));
};

/**
 * Factory for generator that skips elements while a predicate holds true.
 * 
 * May break during the skip stage if the source generator breaks before the
 * predicate is false.
 * 
 * @param {gen} source Source generator to yield elements from.
 * @param {function(value, index): boolean} pred Predicate that determines 
 *     how many elements to skip. 
 * @param thisObj 'this' object used for the predicate function.
 * 
 * @returns {function(yield, break)} Generator that skips skips 'count' elements
 *    before yielding anything.
 */
var skipWhile = function(source, pred, thisObj) {
    var condition = true;
    var i = 0;
    return source.filter(function(v) {
        return !condition || !(condition = pred.call(thisObj, v, i++));
    });
};

/**
 * Factory for generator that skips 'count' elements before yielding anything.
 * 
 * May break during the skip stage if the source generator has less than 'count'
 * elements.
 * 
 * @param {gen} source Source generator to yield elements from.
 * @param {number} count Number of elements to skip. Must be greater than or 
 *     equal to zero. Defaults to zero.
 * 
 * @returns {function(yield, break)} Generator that skips skips 'count' elements
 *    before yielding anything.
 */
var skip = function(source, count) {
    count = (count >= 0 ? count : 0);
    return (count === 0 ? source :
        skipWhile(source, function(v, i) { return (i < count); }));
};

/**
 * Factory for generator that reduces a source while a predicate holds true.
 * 
 * @param {gen} source Source generator to yield elements from.
 * @param {function(value): boolean} pred Predicate function that determines when
 *     to step taking elements. Takes the currently reduced value as only argument.
 * @param {function(previous, current, index)} callback Function that reduces 
 *     the source.
 * @param initial The initial value used for reduce.
 * 
 * @returns {function(yield, break)} Generator that reduces the source generator
 *     while the predicate function holds true. Yields reduced result.
 */
var reduceWhile = function(source, pred, callback, initial) {
    return gen.single(function(y, b, r) {
        var p = initial;
        r(source.takeWhile(function() { return pred(p); })
            .forEach(function(v, i) { p = callback(p, v, i); }), noop, noop)(function(){ y(p); });
    });
};

/**
 * Factory for generator that attempts to count the number of elements in the
 * source generator.
 * 
 * Generator yields a single number value, the number of elements in the source
 * generator.
 * 
 * @param {gen} source Source generator to count elements from.
 * 
 * @returns {function(yield, break)} Generator that counts source generator
 *     elements and yields the result.
 */
var count = (function(){
    function inc(p) { return p + 1; }
    
    return function(source) {
        return source.reduce(inc, 0);
    };
}());

/**
 * Factory for generator that tests a source generator against a predicate to see
 * if any element of the source generator is true.
 * 
 * Generator yields a single boolean value. Stops iterating over source generator
 * when first value found. May stall on an infinite source if predicate is 
 * never true.
 * 
 * @param {gen} source Source generator to test.
 * @param {function(value, index): boolean} pred Predicate function that tests
 *     values from the source generator.
 * @param {object} thisObject 'this' object used when calling predicate function.
 * 
 * @return {function(yield, break)} Generator that tests source generator
 *     against predicate function.
 */
var any = (function(){
    function not(v) { return !v; }
    
    return function(source, pred, thisObj) {
        return reduceWhile(source, not,
            function(p, c, i) {
                return !!(pred.call(thisObj, c, i));
            }, false);
    };
}());

/**
 * Factory for generator that tests a source generator against a predicate to see
 * if the predicate is true for every element of the source generator.
 * 
 * Generator yields a single boolean value. Stops iterating over source generator
 * when first false is found. May stall on an infinite source if predicate is 
 * always true.
 * 
 * @param {gen} source Source generator to test.
 * @param {function(value, index): boolean} pred Predicate function that tests
 *     values from the source generator.
 * @param {object} thisObject 'this' object used when calling predicate function.
 * 
 * @return {function(yield, break)} Generator that tests source generator
 *     against predicate function.
 */
var every = (function(){
    function identity(v) { return v; }
    
    return function(source, pred, thisObj) {
        return reduceWhile(source, identity,
            function(p, c, i) {
                return !!(pred.call(thisObj, c, i));
            }, true);
    };
}());

/* Export
 ******************************************************************************/
return Object.defineProperties(function(base) {
    setIfUndef(base.prototype, 'take', function(c) { return take(this, c); });
    setIfUndef(base.prototype, 'takeWhile', function(p, t) { return takeWhile(this, p, t); });
    setIfUndef(base.prototype, 'skip', function(c) { return skip(this, c); });
    setIfUndef(base.prototype, 'skipWhile', function(p, t) { return skipWhile(this, p, t); });
    setIfUndef(base.prototype, 'count', function() { return count(this); });
    setIfUndef(base.prototype, 'any', function(p, t) { return any(this, p, t); });
    setIfUndef(base.prototype, 'every', function(p, t) { return every(this, p, t); });
}, {
    'take': {
        'value': take
    },
    'takeWhile':{
        'value':  takeWhile
    },
    'skip': {
        'value': skip
    },
    'skipWhile': {
        'value': skipWhile
    },
    'count': {
        'value': count
    },
    'any': {
        'value': any
    },
    'every': {
        'value': every
    }
});

});

}(
    typeof define !== 'undefined' ? define : function(factory) { genBatteries = factory(); }
));