# ChangeLog #

## 1.2.0 - October 9, 2012 ##
* Renamed 'single' to 'once' to be more clear on what it does.
* Fixed value propogation through action callbacks to onAction callbacks. Now,
the onYield callback recieves the value supplied by the yield callback, not the
argument value.
* Updated wrap implementation.
* Fixed function and type closure annotations.

## 1.1.0 - October 7, 2012 ##
* Made wrap use 'r' instead of 'sync'.
* Updated param documentation.

## 1.0.0 - October 4, 2012 ##
* Rewrote how async and sync work internally. 
* Added real support for higher level generator scheduling using another
generator correctly. Before, all internal generators used sync to iterate over
another generator. Now a third callback, 'r', has been added for recursive 
scheduling. Reduce and foreach now correctly run async.
* Added explicit continue object to make control flow more explicit. Use is
optional.
* Update core and batteries for new APIs and conventions.
* Changed how batteries exports methods on 'gen.prototype' to be more explicit.


## 0.2.0 - September 23, 2012 ##
* Made creating generators more explicit/flexible. Now, a call to sync or async 
is required to actually create generator from gen expression.
* Moved methods from properties to prototype. Gen instances can now be extended
using 'gen.prototype'.


## 0.1.0 ##
* Inital Release
