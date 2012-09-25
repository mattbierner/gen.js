define(['gen', 'bat', 'shared'], function(gen, bat, shared){
        
    return {
        'module': "Skip While Tests",
        'tests': [
            ["Simple SkipWhile",
            function(){
                var g = gen(shared.count())
                    .skipWhile(function(v){ return v < 4; })
                    .sync();
                assert.equal(g(), 4);
                assert.equal(g(), 5);
            }],
            ["Break SkipWhile",
            function(){
                var g = gen(shared.count(4))
                    .skipWhile(function(v){ return v < 2; })
                    .sync();
                assert.equal(g(), 2);
                assert.equal(g(), 3);
                assert.throws(g);
            }],
            ["Zero SkipWhile",
            function(){
                var g = gen(shared.count())
                    .skipWhile(function(){ return false; })
                    .sync();
                assert.equal(g(), 0);
                assert.equal(g(), 1);
            }],
            ["Custom Yield",
            function(){
                var b;
                var g = bat
                    .skipWhile(gen(shared.count()), function(v){ return v < 4; })
                    .sync(function(v){ b = v; return function(){}});
                
                g();
                assert.equal(b, 4);
                g();
                assert.equal(b, 5);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = bat
                    .skipWhile(gen(shared.count(4)), function(v){ return v < 2; })
                    .sync(undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 2);
                assert.equal(g(), 3);
                g();
                assert.equal(b, 10);
            }],
        ],
    };
});
