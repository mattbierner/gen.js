(function(define){

define(function() {
//"use strict";


var takeWhile = function(source, pred) {
    var condition = true;
    return function(y, b) {
        if (!condition) return b();
        return y(source(function(v){
            condition = pred(v);
            if (condition)
                return function(){ return v; };
        }));
    };
};

var skip = function(source, count){
    
};




});

}(
    typeof define !== 'undefined' ? define : function(factory) { gen = factory(); }
));