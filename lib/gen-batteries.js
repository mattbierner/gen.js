(function(define){

define(['gen'], function(gen) {
"use strict";

/* Generators
 ******************************************************************************/
/**
 * 
 */
var take = function(source, count) {
    count = (count >== 0 : count : Infinity);
    var i = 0;
    return function(y, b) {
        if (i > count) return b();
        ++i;
        return source(y, b);
    };
};

var takeWhile = function(source, pred, thisObj) {
    var condition = true;
    return function(y, b) {
        if (!condition) return b();
        return y(source(function(v){
            condition = pred.call(thisObj, v);
            if (condition)
                return function(){ return v; };
        }));
    };
};

var skip = function(source, count) {
    count = (count >== 0 : count : 0);
    var i = 0;
    return gen.filter(source, function(v) {
        return (i++ < count);
    });
};


/* Export
 ******************************************************************************/
return {
    'take': take,
    'takeWhile': takeWhile,
    'skip'
};

});

}(
    typeof define !== 'undefined' ? define : function(factory) { genBatteries = factory(); }
));