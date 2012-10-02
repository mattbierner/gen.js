define(['gen', 'bat', 'shared'], function(gen, bat, shared){
    bat(gen);
    
    return {
        'module': "every Tests",
        'tests': [
            ["Simple every",
            function(){
                var g = gen(shared.count(4))
                    .every(function(v, i){ return v < 10 })
                    .sync();
                assert.equal(g(), true);
                assert.throws(g);
                
                var g2 = gen(shared.count(4))
                    .every(function(v, i){ return v < 2 })
                    .sync();
                assert.equal(g2(), false);
                assert.throws(g2);
            }],
            ["None every",
            function(){
                var g = gen(shared.count(4))
                    .every(function(){ return false; })
                    .sync();
                assert.equal(g(), false);
                assert.throws(g);
            }],
            ["Empty every",
            function(){
                var g2 = gen(shared.count(0))
                    .every(function(){ return true; })
                    .sync();
                assert.equal(g2(), true);
                assert.throws(g2);
            }],
            ["Lazy every",
            function(){
                var g = gen(shared.count())
                    .every(function(){ return false; })
                    .sync();
                assert.equal(g(), false);
                assert.throws(g);
            }],
            ["Custom Yield",
            function(){
                var b;
                var g = gen(shared.count(4))
                    .every(function(v){ return v < 10; })
                    .sync(function(v){ b = v; return function(){}});
                
                g();
                assert.equal(b, true);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = gen(shared.count(4))
                    .every(function(v){ return v < 10; })
                    .sync(undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), true);
                g();
                assert.equal(b, 10);
            }],
        ],
    };
});
