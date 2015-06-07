Game.ActionMove = Game.Action.extend({
  init: function(object) {
    this.callee = object;
  },
  run: function(object) {
    this.changeCoordinates(object);
  },
  changeCoordinates: function(object, coordinates) {
    object.setCoordinates(
      coordinates.x,
      coordinates.y
    );
  }
});
