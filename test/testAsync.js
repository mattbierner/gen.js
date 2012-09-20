define(['gen', 'shared'], function(gen, shared){
    
    return {
        'module': "Async Tests",
        'asyncTests': [ 
            ["Simple Async",
            function(){
                expect(2);
                var g = gen(shared.count(2)).async();
                g(function(v){
                    assert.equal(v, 0);
                    start();
                    return function(){};
                });
                g(function(v){
                    assert.equal(v, 1);
                    start();
                    return function(){};
                });
            }],
            ["Continue Test",
            function(){
                expect(1);
                var vv, ii;
                var g = gen(shared.count(4)).forEach(function(v, i){ vv = v; ii = i;}).async();
                g(function(){
                    assert.equal(vv, 3);
                    start();
                    return function(){};
                });
                
            }]
            
        ],
    };
});
