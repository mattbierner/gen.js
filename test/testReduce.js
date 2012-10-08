define(['gen', 'shared'], function(gen, shared){
    
    function add(p, c) {
        return p + c ;
    }
    
    return {
        'module': "Reduce Tests",
        'tests': [
            ["Simple Reduce",
            function(){
                var g = gen.reduce(shared.count(4), add, 0)
                    .sync(undefined, shared.b);
                assert.equal(g(), 6);
                assert.throws(g);
                
                var g2 = gen(shared.count(4))
                    .reduce(add, 0)
                    .sync(undefined, shared.b);
                assert.equal(g2(), 6);
                assert.throws(g2);
            }],
            ["Empty Reduce",
            function(){
                var g = gen.reduce(shared.count(0), add, 100)
                    .sync(undefined, shared.b);
                assert.equal(g(), 100);
                assert.throws(g);
            }],
            ["Custom Yield",
            function(){
                var b;
                var g = gen(shared.count(4))
                    .reduce(add, 0)
                    .sync(function(v){ b = v; return function(){}}, shared.b);
                
                g();
                assert.equal(b, 6);
                assert.throws(g);
            }],
            ["Custom Break",
            function(){
                var b;
                var g = gen(shared.count(4))
                    .reduce(add, 0)
                    .sync(undefined, function(){ b = 10; return function(){}});
                
                assert.equal(g(), 6);
                g();
                assert.equal(b, 10);
            }],
            ["Reduce Stack Size",
            function(){
                var g = gen.reduce(shared.count(10000), add, 0)
                    .sync(undefined, shared.b);
                assert.equal(g(), 49995000);
                assert.throws(g);
            }],
        ],
        'asyncTests': [
            ["Reduce Async",
            function(){
                expect(1);
                var g = gen(shared.count(100))
                    .reduce(add, 0)
                    .async();
                
                var count = 0;
                var sched;
                g(function(v){
                    clearInterval(sched);
                    assert.equal(count > 20, true);
                    start();
                });
                
                sched = setInterval(function(){ ++count; }, 0);
            }],
        ],
    };
});
