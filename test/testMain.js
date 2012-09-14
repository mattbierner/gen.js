define(['../lib/gen', 'shared'], function(gen, shared){
    
    function evenGen() {
        var i = 0;
        return function(y, b) {
            var v = i;
            i += 2;
            return y(v);
        };
    }
    
    return {
        'module': "Main Tests",
        'tests': [
            ["Simple Gen",
            function(){
                var g = gen(shared.count(4));
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.equal(g(), 2);
                assert.equal(g(), 3);
                assert.throws(g);
            }],
            ["evenGen Gen",
            function(){
                var g = gen(evenGen());
                assert.equal(g(), 0);
                assert.equal(g(), 2);
                assert.equal(g(), 4);
            }],
            ["Undefined Gen",
            function() {
                // Make sure generator can yield undefined.
                var i = 0;
                var g = gen(function(y, b){
                    if (i % 2) { i++; return y(undefined); }
                    return y(i++);
                });
                assert.equal(g(), 0);
                assert.equal(g(), undefined);
                assert.equal(g(), 2);
                assert.equal(g(), undefined);
            }],
            ["Custom Yield",
            function(){
                var b;
                var g = gen(shared.count(2)).bind(undefined, function(v){ b = v; return function(){}});
                
                g();
                assert.equal(b, 0);
                g();
                assert.equal(b, 1);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = gen(shared.count(2)).bind(undefined, undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                g();
                assert.equal(b, 10);
            }],
            ["evenGen Stack Size Gen",
            function(){
                var g = gen(evenGen());
                for (var i = 0; i < 100000; ++i) {
                    g();
                }
                assert.ok(1);
            }],
            ["Continue Stack Size Gen",
            function(){
                var i = 0;
                var g = gen(function(y, b) {
                    if (i++ >= 100000) return y(1);
                    // else implicit continue
                });
                assert.equal(g(), 1);
            }],
        ],
    };
});
