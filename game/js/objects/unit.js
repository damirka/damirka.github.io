Game.UnitObject = Game.Object.extend({
  init: function(options) {
    this.id = uniqueId();
    this.mergeOptions(options);
    this.registerSelf();
    this.setCoordinates(10, 10);
  },
  go: function(x, y, callback, onstep) {
    var path = this.tracePath(x, y);
    if (typeof callback !== "function") callback = function() {};
    if (typeof onstep !== "function") onstep = function() {};
    this.currentAction = new Game.ActionGo(this).stop().run(path, callback, onstep);

    console.log(this.currentAction);

    return this;
  },
  tracePath: function(x, y) {
    var
      path = this.use("Path").tracePath(
        this.getCoordinates(), {
          x: x,
          y: y
        },
        Game.getObjectMatrix()
      );
    return path;
  },
});
