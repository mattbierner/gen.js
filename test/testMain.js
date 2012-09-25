define(['gen', 'shared'], function(gen, shared){
    
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
                var g = gen(shared.count(4)).sync();
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.equal(g(), 2);
                assert.equal(g(), 3);
                assert.throws(g);
            }],
            ["evenGen Gen",
            function(){
                var g = gen(evenGen()).sync();
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
                }).sync();
                assert.equal(g(), 0);
                assert.equal(g(), undefined);
                assert.equal(g(), 2);
                assert.equal(g(), undefined);
            }],
            ["Custom Yield",
            function(){
                var b;
                var g = gen(shared.count(2))
                    .sync(function(v){ b = v; return function(){}; } );
                    
                g();
                assert.equal(b, 0);
                g();
                assert.equal(b, 1);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = gen(shared.count(2))
                    .sync(undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                g();
                assert.equal(b, 10);
            }],
            ["Custom On Break",
            function(){
                var b;
                var g = gen(shared.count(2))
                    .sync()
                    .bind(undefined, undefined, function(){ b = 100; });
                
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.throws(g);
                assert.equal(b, 100);
            }],
            ["Test Chaining",
            function(){
                var inc = function(v){ return v + 1;};
                var doub = function(v){ return v * 2;};

                var g = gen(shared.count(2))
                    .map(inc)
                    .map(doub)
                    .sync();
                assert.equal(g(), 2);
                assert.equal(g(), 4);
                assert.throws(g);
                
                var g2 = gen(shared.count(2))
                    .map(doub)
                    .map(inc)
                    .sync();
                assert.equal(g2(), 1);
                assert.equal(g2(), 3);
                assert.throws(g2);
            }],
            ["evenGen Stack Size Gen",
            function(){
                var g = gen(evenGen())
                    .sync();
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
                }).sync();
                assert.equal(g(), 1);
            }],
        ],
    };
});
