define(['gen', 'shared'], function(gen, shared){
    
    function add(p, c) {
        return p + c ;
    }
    
    return {
        'module': "Reduce Tests",
        'tests': [
            ["Simple Reduce",
            function(){
                var g = gen.reduce(shared.count(4), add, 0);
                assert.equal(g(), 6);
                assert.throws(g);
                
                var g2 = gen(shared.count(4)).reduce(add, 0);
                assert.equal(g2(), 6);
                assert.throws(g2);
            }],
            ["Empty Reduce",
            function(){
                var g = gen.reduce(shared.count(0), add, 100);
                assert.equal(g(), 100);
                assert.throws(g);
            }],
            ["Custom Yield",
            function(){
                var b;
                var g = gen(shared.count(4)).reduce(add, 0).bind(undefined, function(v){ b = v; return function(){}});
                
                g();
                assert.equal(b, 6);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = gen(shared.count(4)).reduce(add, 0).bind(undefined, undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 6);
                g();
                assert.equal(b, 10);
            }],
            ["Reduce Stack Size",
            function(){
                var g = gen.reduce(shared.count(10000), add, 0);
                assert.equal(g(), 49995000);
                assert.throws(g);
            }],
        ],
    };
});
