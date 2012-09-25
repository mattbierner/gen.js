define(['gen', 'bat', 'shared'], function(gen, bat, shared){
        
    return {
        'module': "Skip Tests",
        'tests': [
            ["Simple Skip",
            function(){
                var g = bat.skip(gen(shared.count()), 4).sync();
                assert.equal(g(), 4);
                assert.equal(g(), 5);
            }],
            ["Break Skip",
            function(){
                var g = bat.skip(gen(shared.count(4)), 2).sync()
                assert.equal(g(), 2);
                assert.equal(g(), 3);
                assert.throws(g);
            }],
            ["Zero Skip",
            function(){
                var g = bat.skip(gen(shared.count()), 0).sync();
                assert.equal(g(), 0);
                assert.equal(g(), 1);
            }],
            ["Bad Skip",
            function(){
                var g = bat.skip(gen(shared.count()), -1).sync();
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.equal(g(), 2);
            }], 
            ["Custom Yield",
            function(){
                var b;
                var g = bat.skip(gen(shared.count()), 4)
                    .sync(function(v){ b = v; return function(){}});
                
                g();
                assert.equal(b, 4);
                g();
                assert.equal(b, 5);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = bat.skip(gen(shared.count(4)), 2)
                    .sync(undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 2);
                assert.equal(g(), 3);
                g();
                assert.equal(b, 10);
            }],
        ],
    };
});
