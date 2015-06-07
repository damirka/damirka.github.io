getKeyByValue = function(value) {
  for (var prop in this) {
    if (this.hasOwnProperty(prop)) {
      if (this[prop] === value)
        return prop;
    }
  }
  return false;
};
copy = function() {
  var obj = {};
  for (var i in this) {
    obj[i] = this[i];
  }
  return obj;
};
removeElementByValue = function(value) {
  var elem = this.indexOf(value);
  if (elem > -1) {
    this.splice(elem, 1);
    return true;
  }
  return false;
};
inArray = function(needle, haystack, strict) {
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
objectLength = function(object) {
  var
    size = 0,
    i;
  for (i in object)
    size++;

  return size;
};
uniqueId = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return function() {
    return s4() + s4() + s4() + s4() + s4() + s4();
  };
})();
