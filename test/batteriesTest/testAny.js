define(['gen', 'bat', 'shared'], function(gen, bat, shared){
        
    return {
        'module': "Any Tests",
        'tests': [
            ["Simple Any",
            function(){
                var g = bat.any(gen(shared.count(4)), function(v, i){ return v == 2 });
                assert.equal(g(), true);
                assert.throws(g);
            }],
            ["None Any",
            function(){
                var g = bat.any(gen(shared.count(4)), function(){ return false; });
                assert.equal(g(), false);
                assert.throws(g);
                
                var g2 = bat.any(gen(shared.count(0)), function(){ return true; });
                assert.equal(g2(), false);
                assert.throws(g2);
            }],
            ["Lazy Any",
            function(){
                var g = bat.any(gen(shared.count()), function(){ return true; });
                assert.equal(g(), true);
                assert.throws(g);
            }],
            ["Custom Yield",
            function(){
                var b;
                var g = bat
                    .any(gen(shared.count(4)), function(v){ return v == 2; })
                    .bind(undefined, function(v){ b = v; return function(){}});
                
                g();
                assert.equal(b, true);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = bat
                    .any(gen(shared.count(4)), function(v){ return v == 2; })
                    .bind(undefined, undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), true);
                g();
                assert.equal(b, 10);
            }],
        ],
    };
});
