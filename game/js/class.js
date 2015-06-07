(function() {
  var a = false,
    b = /xyz/.test(function() {}) ? /\b_super\b/ : /.*/;
  Game.Class = function() {};
  Game.Class.extend = function(c) {
    function d() {
      !a && this.init && this.init.apply(this, arguments)
    }
    var e = this.prototype;
    a = true;
    var f = new this;
    a = false;
    for (var h in c) f[h] = typeof c[h] == "function" && typeof e[h] == "function" && b.test(c[h]) ?
      function(a, b) {
        return function() {
          var c = this._super;
          this._super = e[a];
          var d = b.apply(this, arguments);
          this._super = c;
          return d
        }
      }(h, c[h]) : c[h];
    d.prototype = f;
    d.constructor = d;
    d.extend = arguments.callee;
    return d
  }
})();
