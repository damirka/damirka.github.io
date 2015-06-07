// Original taken here http://habrahabr.ru/post/116852/
(function() {
  var global = this;
  var original = global.console;
  if ('console' in global) delete global.console;
  var console = global.console = {};
  console.production = false;

  if (original && !original.time) {
    original.time = function(name, reset) {
      if (!name) return;
      var time = new Date().getTime();
      if (!console.timeCounters) console.timeCounters = {};

      var key = "KEY" + name.toString();
      if (!reset && console.timeCounters[key]) return;
      console.timeCounters[key] = time;
    };

    original.timeEnd = function(name) {
      var time = new Date().getTime();

      if (!console.timeCounters) return;

      var key = "KEY" + name.toString();
      var timeCounter = console.timeCounters[key];
      var diff = false;

      if (timeCounter) {
        diff = time - timeCounter;
        var label = name + ": " + diff + "ms";
        console.info(label);
        delete console.timeCounters[key];
      }
      return diff;
    };
  }

  var methods = ['assert', 'count', 'debug', 'dir', 'dirxml', 'error', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'trace', 'warn'];

  for (var i = methods.length; i--;) {
    (function(methodName) {
      console[methodName] = function() {
        if (original && methodName in original && !console.production) {
          Function.prototype.apply.call(original[methodName], original, arguments);
        }
      };
    })(methods[i]);
  }
})();
