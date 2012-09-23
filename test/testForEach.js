define(['gen', 'shared'], function(gen, shared){
    
    return {
        'module': "ForEach Tests",
        'tests': [
            ["Simple ForEach",
            function(){
                var b = 0;
                var g = gen.forEach(shared.count(4), function(v){ b += v;})
                    .sync();
                g();
                assert.equal(b, 6);
                assert.throws(g);
                
                var b2 = 0;
                var g2 = gen(shared.count(4)).forEach(function(v){ b2 += v;})
                    .sync();
                g2()
                assert.equal(b2, 6);
                assert.throws(g2);
            }],
            ["Custom Yield",
            function(){
                var x, b = 0;
                var g = gen.forEach(shared.count(4), function(v){ b += v;})
                    .sync(function(v){ x = 100; return function(){ return v; } });
                
                g();
                assert.equal(x, 100);
                assert.equal(b, 6);
                assert.throws(g);
            }],
            
            ["Custom Break",
            function(){
                var m, n, x = 0;
                var g = gen.forEach(shared.count(4), function(v){ x += v;})
                    .sync(function(v){ m = 100; return function(){ return v; } }, function(v){ n = true; return function(){ } });
                
                g();
                assert.equal(m, 100);
                assert.equal(x, 6);
                assert.equal(n, undefined);
                g();
                assert.equal(n, true);
            }],
            
           
        ],
    };
});
