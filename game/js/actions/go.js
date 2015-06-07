Game.ActionGo = Game.ActionMove.extend({
  init: function(object) {
    this.callee = object;
  },
  run: function(path, callback, onstep) {
    var
      i = path.length - 1;

    this.callback = callback;
    this.onstep = onstep;
    this.path = path;

    this.setContinuousAction(
      function() {
        if (i === -1) {
          return this.stopContinuousAction(function() {
            this.callback.bind(this.callee)(path);
          });
        }
        this.callee.setCoordinates(
          this.path[i].x,
          this.path[i].y
        );
        this.onstep.bind(this.callee)(path);
        if (i >= 0) i--;
        else return this;
      }, 1);

    return this;
  },
  callback: function() {},
  path: [],
  timer: '',
});
