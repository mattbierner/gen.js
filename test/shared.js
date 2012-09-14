define(['../lib/gen'], function(gen){
    return {
        'count':
            function(n) {
                n == (!isNaN(n) && n >= 0  ? n : Infinity);
                var i = 0;
                return function(y, b) {
                    if (i >= n) return b()
                    return y(i++);
                };
            },
        'fib': 
            function() {
                var c = 0, d = 1;
                return function(y, b){
                    var next = c;
                    c = d;
                    d = next + d;
                    return y(next);
                };
            }
    };
})
