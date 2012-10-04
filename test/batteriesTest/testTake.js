define(['gen', 'bat', 'shared'], function(gen, bat, shared){
    bat(gen);

    return {
        'module': "Take Tests",
        'tests': [
            ["Simple Take",
            function(){
                var g = gen(shared.count())
                    .take(2)
                    .sync(undefined, shared.b);
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.throws(g);
            }],
            ["Zero Take",
            function(){
                var g = gen(shared.count())
                    .take(0)
                    .sync(undefined, shared.b);
                assert.throws(g);
            }],
            ["Bad Take",
            function(){
                var g = gen(shared.count())
                    .take(-1)
                    .sync(undefined, shared.b);
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.equal(g(), 2);
            }],
            ["Length Take",
            function(){
                var g = gen(shared.count(2))
                    .take(4)
                    .sync(undefined, shared.b);
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                assert.throws(g);
            }], 
            ["Custom Yield",
            function(){
                var b;
                var g = gen(shared.count())
                    .take(2)
                    .sync(function(v){ b = v; return function(){}}, shared.b);
                
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
                    .take(2)
                    .sync(undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 0);
                assert.equal(g(), 1);
                g();
                assert.equal(b, 10);
            }],
        ],
    };
});
