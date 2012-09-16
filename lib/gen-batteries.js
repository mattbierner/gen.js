(function(define){

define(['gen'], function(gen) {
"use strict";

/* Generators
 ******************************************************************************/
/**
 * 
 */
var takeWhile = function(source, pred, thisObj) {
    var condition = true;
    return gen(function(y, b) {
        if (!condition) return b();
        var value = source(undefined, b);
        condition = pred.call(thisObj, value);
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
 */
 var take = function(source, count) {
    count = (count >= 0 ? count : Infinity);
    var i = 0;
    return takeWhile(source, function(v) { return (i++ < count); });
};

/**
 * 
 */
var skip = function(source, count) {
    count = (count >= 0 ? count : 0);
    var i = 0;
    return source.filter(function(v) {
        return (i++ >= count);
    });
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