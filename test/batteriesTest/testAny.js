define(['gen', 'bat', 'shared'], function(gen, bat, shared){
    bat(gen);
    
    return {
        'module': "Any Tests",
        'tests': [
            ["Simple Any",
            function(){
                var g = gen(shared.count(4))
                    .any(function(v, i){ return v == 2 })
                    .sync(undefined, shared.b);
                assert.equal(g(), true);
                assert.throws(g);
            }],
            ["None Any",
            function(){
                var g = gen(shared.count(4))
                    .any(function(){ return false; })
                    .sync(undefined, shared.b);
                assert.equal(g(), false);
                assert.throws(g);
                
                var g2 = gen(shared.count(0))
                    .any(function(){ return true; })
                    .sync(undefined, shared.b);
                assert.equal(g2(), false);
                assert.throws(g2);
            }],
            ["Lazy Any",
            function(){
                var g = gen(shared.count())
                    .any(function(){ return true; })
                    .sync(undefined, shared.b);
                assert.equal(g(), true);
                assert.throws(g);
            }],
            ["Custom Yield",
            function(){
                var b;
                var g = gen(shared.count(4))
                    .any(function(v){ return v == 2; })
                    .sync(function(v){ b = v; return function(){}}, shared.b);
                
                g();
                assert.equal(b, true);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = gen(shared.count(4))
                    .any(function(v){ return v == 2; })
                    .sync(undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), true);
                g();
                assert.equal(b, 10);
            }],
        ],
    };
});
