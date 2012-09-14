define(['../lib/gen', 'shared'], function(gen, shared){
    
    return {
        'module': "Map Tests",
        'tests': [
            ["Simple Map",
            function(){
                var g = gen.map(shared.count(2), function(v){ return v + 1;});
                assert.equal(g(), 1);
                assert.equal(g(), 2);
                assert.throws(g);
                
                var g2 = gen(shared.count(2)).map(function(v){ return v + 1;});
                assert.equal(g2(), 1);
                assert.equal(g2(), 2);
                assert.throws(g2);
            }],
            ["Custom Yield",
            function(){
                var x;
                var g = gen.map(shared.count(2), function(v){ return v + 1;});
                var y = function(v){ x = v; return function(){ return v; } };
                
                g(y);
                assert.equal(x, 1);
                g(y);
                assert.equal(x, 2);
                assert.throws(g);
            }],
            
            ["Custom Break",
            function(){
                var m, n;
                var g = gen.map(shared.count(2), function(v){ return v + 1;});
                var y = function(v){ m = v; return function(){ return v; } };
                var b = function(v){ n = true; return function(){ } };
                
                g(y, b);
                assert.equal(m, 1);
                assert.equal(n, undefined);
                g(y, b);
                assert.equal(m, 2);
                assert.equal(n, undefined);
                g(y, b);
                assert.equal(n, true);
            }],
            
           
        ],
    };
});
