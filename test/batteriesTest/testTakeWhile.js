define(['gen', 'bat', 'shared'], function(gen, bat, shared){
    bat(gen);
    
    return {
        'module': "TakeWhile Tests",
        'tests': [
            ["Simple TakeWhile",
            function(){
                var g = gen(shared.count())
                    .takeWhile(function(v){ return v < 2; })
                    .sync();
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.throws(g);
            }],
            ["Zero TakeWhile",
            function(){
                var g = gen(shared.count())
                    .takeWhile(function(v){ return false; })
                    .sync();
                assert.throws(g);
            }],
            ["Length TakeWhile",
            function(){
                var g = gen(shared.count(2))
                    .takeWhile(function(v){ return v < 4; })
                    .sync();
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.throws(g);
            }], 
            ["Custom Yield",
            function(){
                var b;
                var g = gen(shared.count())
                    .takeWhile(function(v){ return v < 2; })
                    .sync(function(v){ b = v; return function(){}});
                
                g();
                assert.equal(b, 0);
                g();
                assert.equal(b, 1);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = gen(shared.count())
                    .takeWhile(function(v){ return v < 2; })
                    .sync(undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                g();
                assert.equal(b, 10);
            }],
        ],
    };
});
