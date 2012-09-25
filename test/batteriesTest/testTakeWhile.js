define(['gen', 'bat', 'shared'], function(gen, bat, shared){
        
    return {
        'module': "TakeWhile Tests",
        'tests': [
            ["Simple TakeWhile",
            function(){
                var g = bat.takeWhile(gen(shared.count()), function(v){ return v < 2; }).sync();
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.throws(g);
            }],
            ["Zero TakeWhile",
            function(){
                var g = bat.takeWhile(gen(shared.count()), function(v){ return false; }).sync();
                assert.throws(g);
            }],
            ["Length TakeWhile",
            function(){
                var g = bat.take(gen(shared.count(2)), function(v){ return v < 4; }).sync();
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.throws(g);
            }], 
            ["Custom Yield",
            function(){
                var b;
                var g = bat
                    .takeWhile(gen(shared.count()), function(v){ return v < 2; })
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
                var g = bat
                    .takeWhile(gen(shared.count()), function(v){ return v < 2; })
                    .sync(undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                g();
                assert.equal(b, 10);
            }],
        ],
    };
});
