Game.Module = Game.Class.extend({
  init: function(object) {
    this.callee = object;
  },
  getScale: function() {
    return Game.scale;
  },
  callee: {}
});
