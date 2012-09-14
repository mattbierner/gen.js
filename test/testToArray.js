define(['../lib/gen', 'shared'], function(gen, shared){
    
    return {
        'module': "ToArray Tests",
        'tests': [
            ["Simple ToArray",
            function(){
                var g = gen.toArray(shared.count(4));
                assert.deepEqual(g(), [0, 1, 2, 3]);
                assert.throws(g);
                
                var g2 = gen(shared.count(4)).toArray();
                assert.deepEqual(g2(), [0, 1, 2, 3]);
                assert.throws(g2);
            }],
            ["Empty ToArray",
            function(){
                var g = gen(shared.count(0)).toArray();
                assert.deepEqual(g(), []);
                assert.throws(g);
            }],
        ],
    };
});
