Game.CoordinatesModule = Game.Module.extend({
  init : function (object) {
    this.callee = object;
  },
  get : function () {
    return {
      x : this.callee.coordinates.x,
      y : this.callee.coordinates.y
    };
  },
  set : function (x,y) {
    this.callee.coordinates = {
      x : x,
      y : y
    };
    return this;
  }
});
