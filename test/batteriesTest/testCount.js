define(['gen', 'bat', 'shared'], function(gen, bat, shared){
        
    return {
        'module': "Count Tests",
        'tests': [
            ["Simple Count",
            function(){
                var g = bat.count(gen(shared.count(4))).sync();
                assert.equal(g(), 4);
                assert.throws(g);
            }],
            ["Zero Count",
            function(){
                var g = bat.count(gen(shared.count(0))).sync();
                assert.equal(g(), 0);
                assert.throws(g);
            }],
            ["Custom Yield",
            function(){
                var b;
                var g = bat
                    .count(gen(shared.count(4)))
                    .sync(function(v){ b = v; return function(){}});
                
                g();
                assert.equal(b, 4);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = bat
                    .count(gen(shared.count(4)))
                    .sync(undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 4);
                g();
                assert.equal(b, 10);
            }],
        ],
    };
});
