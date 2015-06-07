Game.Object = Game.Class.extend({
  init: function(options) {
    this.id = uniqueId();
    this.mergeOptions(options);
    this.registerSelf();
  },
  mergeOptions: function (options) {
    if (typeof options === "object") {
      for (var i in options) {
        this[i] = options[i];
      }
      return true;
    }
    return false;
  },
  use: function(module) {
    if (typeof module === "string") {
      var name = module+"Module";
      if (Game[name] && typeof Game[name] === "function") {
        var
          mod = new Game[name](this),
          isInstance = mod instanceof Game.Module;
        if (isInstance) return mod; else throw new TypeError("Incorrect object Type");
      } else throw new Error("Module does not exists!");
    } else {
      if (typeof module === "object") {
        return module;
      } else throw new Error("Incorrect arguments");
    }
  },
  coordinates : {
    x : 0,
    y : 0
  },
  id : "",
  registerSelf : function () {
    if (Game.registerObject(this.id,this))
      return true;
    return false;
  },
  getCoordinates : function () {
    return this.use("Coordinates").get();
  },
  setCoordinates : function (x,y) {
    this.use("Coordinates").set(x,y);
    return this;
  },
  getSize : function () {
    return this.size;
  },
  setSize : function (width, height) {
    this.size = {
      width : width,
      height : height
    };

    return this;
  },
  size : {
    width : 1,
    height : 1
  }
});
