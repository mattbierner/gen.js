define(['../lib/gen', 'shared'], function(gen, shared){
    
    function isOdd(v) { return v % 2; }
    
    return {
        'module': "Filter Tests",
        'tests': [
            ["Simple Filter",
            function(){
                var g = gen.filter(shared.count(4), isOdd);
                assert.equal(g(), 1);
                assert.equal(g(), 3);
                assert.throws(g);
                
                var g2 = gen(shared.count(4)).filter(isOdd);
                assert.equal(g2(), 1);
                assert.equal(g2(), 3);
                assert.throws(g2);
            }], 
            ["Custom Yield",
            function(){
                var b;
                var g = gen(shared.count(4)).filter(isOdd).bind(undefined, function(v){ b = v; return function(){}});
                
                g();
                assert.equal(b, 1);
                g();
                assert.equal(b, 3);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = gen(shared.count(4)).filter(isOdd).bind(undefined, undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 1);
                assert.equal(g(), 3);
                g();
                assert.equal(b, 10);
            }],
            ["Filter Stack Size Test",
            function(){
                var g = gen.filter(shared.count(), function(v){ return v > 100000; });
                assert.equal(g(), 100001);
            }],
        ],
    };
});
