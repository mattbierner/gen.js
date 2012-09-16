define(['gen', 'shared'], function(gen, shared){
    
    return {
        'module': "ForEach Tests",
        'tests': [
            ["Simple ForEach",
            function(){
                var b = 0;
                var g = gen.forEach(shared.count(4), function(v){ b += v;});
                g();
                assert.equal(b, 6);
                assert.throws(g);
                
                var b2 = 0;
                var g2 = gen(shared.count(4)).forEach(function(v){ b2 += v;});
                g2()
                assert.equal(b2, 6);
                assert.throws(g2);
            }],
            ["Custom Yield",
            function(){
                var x, b = 0;
                var g = gen.forEach(shared.count(4), function(v){ b += v;});
                var y = function(v){ x = 100; return function(){ return v; } };
                
                g(y);
                assert.equal(x, 100);
                assert.equal(b, 6);
                assert.throws(g);
            }],
            
            ["Custom Break",
            function(){
                var m, n, x = 0;
                var g = gen.forEach(shared.count(4), function(v){ x += v;});
                var y = function(v){ m = 100; return function(){ return v; } };
                var b = function(v){ n = true; return function(){ } };
                
                g(y, b);
                assert.equal(m, 100);
                assert.equal(x, 6);
                assert.equal(n, undefined);
                g(y, b);
                assert.equal(n, true);
            }],
            
           
        ],
    };
});
