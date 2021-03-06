define(['gen'], function(gen){
    return {
        'b': function(){ return function(){ throw new gen.GenBreak; }},
        'count':
            function(n) {
                n == (!isNaN(n) && n >= 0  ? n : Infinity);
                var i = 0;
                return function(y, b) {
                    i >= n ? b() : y(i++);
                };
            },
        'fib': 
            function() {
                var c = 0, d = 1;
                return function(y, b){
                    var next = c;
                    c = d;
                    d = next + d;
                    y(next);
                };
            }
    };
})
