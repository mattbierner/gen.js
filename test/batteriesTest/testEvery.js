define(['gen', 'bat', 'shared'], function(gen, bat, shared){
        
    return {
        'module': "every Tests",
        'tests': [
            ["Simple every",
            function(){
                var g = bat.every(gen(shared.count(4)), function(v, i){ return v < 10 });
                assert.equal(g(), true);
                assert.throws(g);
                
                var g2 = bat.every(gen(shared.count(4)), function(v, i){ return v < 2 });
                assert.equal(g2(), false);
                assert.throws(g2);
            }],
            ["None every",
            function(){
                var g = bat.every(gen(shared.count(4)), function(){ return false; });
                assert.equal(g(), false);
                assert.throws(g);
            }],
            ["Empty every",
            function(){
                var g2 = bat.every(gen(shared.count(0)), function(){ return true; });
                assert.equal(g2(), true);
                assert.throws(g2);
            }],
            ["Lazy every",
            function(){
                var g = bat.every(gen(shared.count()), function(){ return false; });
                assert.equal(g(), false);
                assert.throws(g);
            }],
            ["Custom Yield",
            function(){
                var b;
                var g = bat
                    .every(gen(shared.count(4)), function(v){ return v < 10; })
                    .bind(undefined, function(v){ b = v; return function(){}});
                
                g();
                assert.equal(b, true);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = bat
                    .every(gen(shared.count(4)), function(v){ return v < 10; })
                    .bind(undefined, undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), true);
                g();
                assert.equal(b, 10);
            }],
        ],
    };
});
