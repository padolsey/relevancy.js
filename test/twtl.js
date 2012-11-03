/**
 * Teensy Weensy Testing Library
 * twtl.js
 * v 0.1
 */
(function(global) { try { throw Error(); } catch(e) {
    // Save the starting line of this very script
    var stSkipStart = stackTrace(e)[0];
  }

  var _console = 'console';
  var toString = {}.toString;

  /**
   * Find an assertion's likely 'source' by removing any references to twtl
   * in the stack trace
   */
  function findAssertionSourceInTrace(trace) {

    var found = null;

    for (var i = 0, l = trace.length; i < l; ++i) {
      if (
        trace[i].file === stSkipStart.file &&
        trace[i].line >= stSkipStart.line &&
        trace[i].line <= stSkipEnd.line
      ) {
        break;
      }
      found = trace[i];
    }

    return found;

  }

  /** 
   * Produce an array of {file:..., line:...} objects from the 
   * native stack trace
   */
  function stackTrace(e) {

    var trace = [];

    // Remove node.js trace pollutants:
    var stack = (e.stack || e.stacktrace).replace(/at Module._compile \(module\.js:\d+:\d+\)[\s\S]+$/, '');

    var match;
    var regex = /(?:at (?!<)(?:.+?\()?|@).*?(.+?):(\d+)(?=:\d+)?/g;

    while (match = regex.exec(stack)) {
      trace.push({
        file: match[1],
        line: +match[2]
      });
    }

    return trace;

  }


  var assertions = {
    toBe: function(a, b) {
      return a === b;
    },
    toEqual: function(a, b) {
      var ok = true;
      var typeA = toString.call(a);
      var typeB = toString.call(b);
      if (typeA !== typeB) {
        return false;
      }
      if (Object(a) === a && Object(b) === b) {
        var keys = Object.getOwnPropertyNames(a);
        for (var i = 0, l = keys.length; i < l; ++i) {
          if (a.hasOwnProperty(keys[i]) && !assertions.toEqual(a[keys[i]], b[keys[i]])) {
            return false;
          }
        }
        return true;
      } else if (/Boolean|Number|String/.test(typeA)) {
        return a == b;
      }
      return a === b;
    }
  };

  function AssertionSet(value) {
    this.v = value;
    this.a = true;
    this.not = new NotAssertionSet(value);
  }

  function NotAssertionSet(value) {
    this.v = value;
    this.a = false;
  }

  for (var i in assertions) {
    augment(i, assertions[i]);
  }

  function augment(methodName, assertionFn) {
    var term = methodName.replace(/[A-Z]/g, function(cap) {
      return ' ' + cap.toLowerCase();
    });
    NotAssertionSet.prototype[methodName] = AssertionSet.prototype[methodName] = function(expectedValue) {
      var val = this.v;
      if (this.a !== assertionFn(val, expectedValue)) {
        var err;

        // Grab a stacktrace by throwing then catching an exception:
        try {
          throw Error();
        } catch(e) {
          err = e;
        }

        var trace = stackTrace(err).slice(1);

        var source = findAssertionSourceInTrace(
          // Get stack trace and remove error thrown artifically above:
          trace
        );

        source.file = source.file.replace(/^.+\/(?!\/)/, '');

        twtl[_console].warn(
          'Expected ', val, (this.a ? '' : 'not ') + term, expectedValue, '(' + source.file + ':' + source.line + ')'
        );

        twtl.failures++;
      }
    };
  }

  var twtl = global.twtl = {
    expect: function(v) {
      return new AssertionSet(v);
    },
    module: function(m, fn) {
      twtl[_console].group('Module: ' + m);
      var c = twtl.failures;
      fn();
      if (twtl.failures === c) {
        twtl[_console].log('100% Pass');
      }
      twtl[_console].groupEnd('Module: ' + m);
    },
    failures: 0
  };

  var c = console;
  twtl[_console] = c;
  c.warn = c.warn || c.log;
  c.group = c.group || String;
  c.groupEnd = c.groupEnd || String;

  global.expect = twtl.expect;
  global.module = twtl.module;
  twtl.augment = augment;

// Save the ending line of this very script
try { throw Error(); } catch(e) { var stSkipEnd = stackTrace(e)[0]; } }(this));