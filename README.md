# gen.js - Generator Javascript Library #

## About ##
gen.js is a library for working with continuation based generator functions in
regular Javascript. Generators allow lazy generation and evaluation of
potetially infinite data structures:

    // Simple generator for Fibonacci numbers.
    // The definition of fibonacci can be found later in the document.
    var f = gen(fibonacci());
    f() -> 0
    f() -> 1
    f() -> 1
    f() -> 2
    f() -> 3
    f() -> 5
    ...

Operations can also be applied to generators:

    // Square each Fibonacci number.
    var f = gen(fibonacci()).map(function(v){ return v * v;});
    f() -> 0
    f() -> 1
    f() -> 1
    f() -> 4
    f() -> 9
    f() -> 25
    ....
    
    // Return only even Fibonacci numbers
    var f = gen(fibonacci()).filter(function(v) { return ((v % 2) === 0); });
    f() -> 0
    f() -> 2
    f() -> 8
    f() -> 34
    f() -> 144
    ...

# Using gen.js #
gen.js can be used either as an AMD style module or in the global scope.

## With AMD ##
Include any AMD style module loader and load gen:

    <!DOCTYPE html>
    <html>
    <head></head>
    <body>
        <script type="application/javascript" src="require.js"></script>
        <script type="application/javascript">
            require(['gen'], function(gen) {
                var g = gen(...);
            });
        </script>
    </body>

## Global ##
Include gen.js file directly and use 'gen' global.

    <!DOCTYPE html>
    <html>
    <head></head>
    <body>
        <script type="application/javascript" src="callable.js"></script>
        <script type="application/javascript">
            var g = gen(...);
        </script>
    </body>

# High Level Overview #
In this context, a generator is a special function that yields values from a
sequence with each call. Generator functions often maintain internal state.

## Generators ##
Here is an example of a generator that yields the fibonacci sequence:

    function fibonacci() {         // Factory for generator
        var c = 0, d = 1;          // Generator's implicit state
        return function(y, b) {    // Actual generator function.
            var next = c;          // fibonacci logic
            c = d;
            d = next + d;
            return y(next);        // Yield the value 'next'.
        };
    }

In gen.js, generator's must conform to a set API to behave correctly. As seen
here, stateful generators usually are created using a factory. The factory defines
an implicit state for generator with its context and arguments can be passed to
the factory function to control the behavior output generator.

Generator functions themselves take two continuations, 'y' and 'b', as arguments
and must return the result of one of these continuations. Because we cannot support
a language level yield statement, generators in gen.js are bit more difficult to
write than generators in languages like Python.

'y' is the yield continuation that yields a value from the generator. 'b' is the
break continuation that is called when the generator has no more values to yield.
When a generator does not return a value, this is assumed to be an implicit 
continue request and the generator function will be invoked again until it 
returns a yield or break.

## Gen Continuations ##



# API #
