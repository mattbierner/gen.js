define(['gen', 'bat', 'shared'], function(gen, bat, shared){
    bat(gen);
    return {
        'module': "Skip Tests",
        'tests': [
            ["Simple Skip",
            function(){
                var g = gen(shared.count())
                    .skip(4)
                    .sync(undefined, shared.b);
                assert.equal(g(), 4);
                assert.equal(g(), 5);
            }],
            ["Break Skip",
            function(){
                var g = gen(shared.count(4))
                    .skip(2)
                    .sync(undefined, shared.b)
                assert.equal(g(), 2);
                assert.equal(g(), 3);
                assert.throws(g);
            }],
            ["Zero Skip",
            function(){
                var g = gen(shared.count())
                    .skip(0)
                    .sync(undefined, shared.b);
                assert.equal(g(), 0);
                assert.equal(g(), 1);
            }],
            ["Bad Skip",
            function(){
                var g = gen(shared.count())
                    .skip(-1)
                    .sync(undefined, shared.b);
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.equal(g(), 2);
            }], 
            ["Custom Yield",
            function(){
                var b;
                var g = gen(shared.count())
                    .skip(4)
                    .sync(function(v){ b = v; return function(){}});
                
                g();
                assert.equal(b, 4);
                g();
                assert.equal(b, 5);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = gen(shared.count(4))
                    .skip(2)
                    .sync(undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 2);
                assert.equal(g(), 3);
                g();
                assert.equal(b, 10);
            }],
        ],
    };
});
