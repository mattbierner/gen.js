(function(define){

define(['gen'], function(gen) {
"use strict";

var noop = function(){ return function(){}; };

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
    var innerB = function() {
        condition = false;
        return function() { };
    };
    return gen(function(y, b) {
        if (!condition) return b();
        var value = source(undefined, innerB);
        condition = condition && pred.call(thisObj, value);
        if (!condition) return b();
        return y(value);
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
    if (count === Infinity)
        return source;
    var i = 0;
    return takeWhile(source, function(v) { return (i++ < count); });
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
    var i = 0;
    return source.filter(function(v) {
        return (i++ >= count);
    });
};

/**
 *
 */
var count = function(source) {
    return source.reduce(function(p, c) { return p + 1; }, 0);
};


/* Export
 ******************************************************************************/
return {
    'take': take,
    'takeWhile': takeWhile,
    'skip': skip
};

});

}(
    typeof define !== 'undefined' ? define : function(factory) { genBatteries = factory(); }
));