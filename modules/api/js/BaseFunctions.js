Game = {};
Game.Debug = true;
Game.scale = 10;
Game.log = function(m) {
  if (Game.Debug === true) {
    console.log(m);
    return true;
  }
};
Game.merge = function(a, b) {
  if (b)
    for (var c in b) {
      var
				d = a[c],
        e = b[c];
      var r = e === null ? delete a[c] : typeof d == "object" && typeof e == "object" && !(d instanceof Array) ? Game.merge(d, e) : a[c] = e;
    }
};
Game.mergeOptions = function(a, b) {
  var c = {};
  Game.merge(c, a);
  Game.merge(c, b);
  return c;
};
Game.copyOptions = function(a) {
  b = {};
  for (var i in a)
    b[i] = a[i];
  return b;
};
Game.uniqueId = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return function() {
    return s4() + s4() + s4() + s4() + s4() + s4();
  };
})();
Game.comparePartial = function (a,b,strict) {
  for (var i in a) {
    if (typeof a[i] !== 'object' && typeof b[i] !== 'object') {
      if ((strict && a[i] !== b[i]) || (!strict && a[i] != b[i])) {
        return false;
      }
    } else {
      if (Game.comparePartial(a[i],b[i]) === false)
        return false;
    }
  }
  return true;
};
Game.arrayReverse = function (a) {
  var
    b = [], i,
    l = a.length;
  for ( i = 0; i < l; i++ ) {
    b[i] = a[l-i-1];
  }
  return b;
};
Game.inArray = function(needle, haystack, strict) {
  //	original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  var
    found = false,
    key;
  for (key in haystack) {
    if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
      found = true;
      break;
    }
  }
  return found;
};
Game.addClass = function(o, c) {
  var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");
  if (re.test(o.className)) return;
  o.className = (o.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "");
};
Game.removeClass = function(o, c) {
  var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");
  o.className = o.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "");
};
