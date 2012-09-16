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

In gen.js, generator's must conform to an API to behave correctly. As seen
here, stateful generators usually are created using a factory. The factory defines
an implicit state for generator with its context and arguments can be passed to
the factory function to control the behavior output generator.

Generator functions themselves take two continuations factories, 'y' and 'b', as
arguments and must return a continuation (usually one from the factory). Because
we cannot support a language level yield statement, generators in gen.js are bit
more difficult to write than generators in languages such as Python.

'y' is the yield continuation that yields a value from the generator. 'b' is the
break continuation that is called when the generator has no more values to yield.
When a generator does not return a value, this is assumed to be an implicit 
continue request and the generator function will be invoked again until it 
returns a yield or break.

## Gen Continuations ##
Any generator function created by gen will provide default yield and break
continuation factories, but the caller can also supply custom ones:

    var b;
    function y(v) {             // Custom Yield continuation factory that sets b.
        b = v;                  // Custom on create behavior
        return function(){};    // Returned continuation.
    };
    
    g(y); -> b = 0
    g(y); -> b = 1

The generator function can also be bound to always use a continuation factory:

    var b;
    var g = gen(fibonacci())
        .bind(undefined, function(v){
            b = v;
            return function(){}
        });
    
    g(); -> b = 0
    g(); -> b = 1

As the custom continuation demonstrates, yield and break continuation factories
return a continuation that actualy performs the executed behavior. Factories can
define behaviors to execute when the continuation is created and when the
continuation is actually executed. The result of the continuation is what the
generator function actually returns.

To be compatible with all generators, custom yield and break continuation
factories should stick to this standard api. If a factory does not return a
continuation, gen assumes the continuation be a continue statement and will
attempt to fetch the next value from the generator.

### Yield Continuation Factory ###
Takes a single argument for the value being yielded. The default behavior is 
to return a continuation that returns the yielded value.


### Break Continuation Factory ###
Takes no arguments. The default behavior is return a continuation that throws a
'GenBreak' exception. Overriding this can be useful when you do not want to deal
with exceptions.


# API #
High level overview and examples of the API. More detailed information can be
found in the sources.

Many generator functions have two versions, a static one defined on 'gen' that
takes a source as an argument and a method style one defined on the returned
generator function (this is noted as gen()).

## gen.properties ##
An object that defines the properties, in 'Object.defineProperties' notation, to
set on returned generator functions. Unlike prototype, adding or changing
properties only effects instances created after the property is changed.

## gen.map(source, callback: function(value), thisObj): gen ##
####gen().map(callback: function(value), thisObj): gen####
Creates a mapped generator for a source generator. Mapped generator runs source
generator values through a callback function and returns the result.

    var g = gen.map(fibonacci(), function(v){ return v + 1;});
    g(); -> 1
    g(); -> 2

## gen.filter(source, predicate: function(value): boolean, thisObj) ##
####gen().filter(predicate: function(value): boolean, thisObj)####
Creates a filtered generator for a source generator. Filtered generator only
returns filtered generator results that satisfy a given predicate.

    var g = gen.filter(fibonacci(), function(v) { return ((v % 2) === 0); });
    g(); -> 0
    g(); -> 2

## gen.reduce(source, callback: function(previous, current), initial) ##
####gen().reduce(callback: function(previous, current), initial)####
Creates a reduce generator for a source generator. Reduce generator attempts
to reduce the source generator using the callback function and yield a single
result. Will attempt the entire reduction when called. Calling on an infinite
source will stall the program.

    var g = gen.reduce(count(4), function add(p, c) { return p + c ; }, 0);
    g(); -> 6
    g(); -> Break

## gen.toArray(source) ##
####gen().toArray()####
Creates a toArray generator for a source generator. ToArray generator attempts
to reduce the source generator to an array of its elements and yield this array.
Calling on an infinite source will stall the program.

    var g = gen.toArray(count(4));
    g(); -> [0, 1, 2, 3]
    g(); -> Break

## gen.forEach(source, callback: function(value), t) ##
####gen().forEach(callback: function(value), t)####
Creates a forEach generator for a source generator. forEach generator attempts to
iterate over entire source generator and call callback for each value. Yields
a single value, void. Calling on an infinite source will stall the program.

    var g = gen.forEach(count(4), function(v){ alert(v); });
    g(); -> alerts '0', '1', '2', '3'
    g(); -> Break
