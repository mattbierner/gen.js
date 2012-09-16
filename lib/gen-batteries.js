(function(define){

define(['gen'], function(gen) {
"use strict";

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
    var innerY = function(v) {
        condition = pred.call(thisObj, v, i);
        return function() { return v; };
    };
    var innerB = function() {
        condition = false;
        return function() { };
    };
    
    return gen(function(y, b) {
        if (!condition) return b();
        var value = source(innerY, innerB);
        if (!condition) return b();
        ++i;
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
    return (count === Infinity ? source :
        takeWhile(source, function(v, i) { return (i < count); }));
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
 *
 */
var any = function(source, predicate, thisObj) {
    
};

/**
 *
 */
var every = function(source, predicate, thisObj) {
    
};



/* Export
 ******************************************************************************/
return {
    'take': take,
    'takeWhile': takeWhile,
    'skip': skip,
    'skipWhile': skipWhile,
    'count': count,
    'any': any,
    'ever': every
};

});

}(
    typeof define !== 'undefined' ? define : function(factory) { genBatteries = factory(); }
));