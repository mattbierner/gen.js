define(['gen', 'shared'], function(gen, shared){
    
    return {
        'module': "ToArray Tests",
        'tests': [
            ["Simple ToArray",
            function(){
                var g = gen.toArray(shared.count(4))
                    .sync();
                assert.deepEqual(g(), [0, 1, 2, 3]);
                assert.throws(g);
                
                var g2 = gen(shared.count(4))
                    .toArray()
                    .sync();
                assert.deepEqual(g2(), [0, 1, 2, 3]);
                assert.throws(g2);
            }],
            ["Empty Generator",
            function(){
                var g = gen(shared.count(0))
                    .toArray()
                    .sync();
                assert.deepEqual(g(), []);
                assert.throws(g);
            }],
            ["Custom Yield",
            function(){
                var a;
                var g = gen.toArray(shared.count(4))
                    .sync(function(v){ a = v; return function(){} });
                
                g();
                assert.deepEqual(a, [0, 1, 2, 3]);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var a;
                var g = gen.toArray(shared.count(4))
                    .sync(undefined, function(v){ a = 10; return function(){} });
                
                assert.deepEqual(g(), [0, 1, 2, 3]);
                g();
                assert.equal(a, 10);
            }],
        ],
    };
});
