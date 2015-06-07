Game.Selected = {
  objects: [],
  count: function() {
    return this.objects.length;
  },
  select: function(object) {
    Game.addClass(object.element, "selected");
  },
  unselect: function(object) {
    Game.removeClass(object.element, "selected");
  },
  clear: function() {
    if (this.count() > 1) {
      for (i = 0; i < this.count; i++) {
        this.unselect(this.objects[i]);
      }
    } else if (this.count() == 1) {
      this.unselect(this.objects[0]);
    }
    this.objects = [];
  },
  add: function(object) {
    this.clear();
    if (!Game.inArray(object, this.objects, true)) {
      this.select(object);
      this.objects.push(object);
      return true;
    }
    console.log('already selected');
    return false;
  },
  // This actions need to be refactored - I should check all the logic of game
  act: function(e) {
      if (this.count !== 0) {
        var o = this.objects[0];
        switch (o.type) {
          case "u1":
            if (o.go)
              o.go(e.x, e.y);
            break;
          case "b1":
            if (o.build("u1")) {
              console.log("created u1");
            }
            break;
        }
      }
    }
    // End of action
};
