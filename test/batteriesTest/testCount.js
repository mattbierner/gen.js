define(['gen', 'bat', 'shared'], function(gen, bat, shared){
    bat(gen);
    
    return {
        'module': "Count Tests",
        'tests': [
            ["Simple Count",
            function(){
                var g = gen(shared.count(4))
                    .count()
                    .sync(undefined, shared.b);
                assert.equal(g(), 4);
                assert.throws(g);
            }],
            ["Zero Count",
            function(){
                var g = gen(shared.count(0))
                    .count()
                    .sync(undefined, shared.b);
                assert.equal(g(), 0);
                assert.throws(g);
            }],
            ["Custom Yield",
            function(){
                var b;
                var g = gen(shared.count(4))
                    .count()
                    .sync(function(v){ b = v; return function(){}}, shared.b);
                
                g();
                assert.equal(b, 4);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = gen(shared.count(4))
                    .count()
                    .sync(undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 4);
                g();
                assert.equal(b, 10);
            }],
        ],
    };
});
