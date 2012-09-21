define(['gen', 'bat', 'shared'], function(gen, bat, shared){
        
    return {
        'module': "Take Tests",
        'tests': [
            ["Simple Take",
            function(){
                var g = bat.take(gen(shared.count()), 2).sync();
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.throws(g);
            }],
            ["Zero Take",
            function(){
                var g = bat.take(gen(shared.count()), 0).sync();
                assert.throws(g);
            }],
            ["Bad Take",
            function(){
                var g = bat.take(gen(shared.count()), -1).sync();
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.equal(g(), 2);
            }],
            ["Length Take",
            function(){
                var g = bat.take(gen(shared.count(2)), 4).sync();
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.throws(g);
            }], 
            ["Custom Yield",
            function(){
                var b;
                var g = bat.take(gen(shared.count()), 2).sync().bind(undefined, function(v){ b = v; return function(){}});
                
                g();
                assert.equal(b, 0);
                g();
                assert.equal(b, 1);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = bat.take(gen(shared.count()), 2).sync().bind(undefined, undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                g();
                assert.equal(b, 10);
            }],
        ],
    };
});
