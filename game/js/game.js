Game = {};
Game.debug = true;
Game.setLogging = function() {
  window.console.production = this.debug === true ? false : true;
};
Game.stateList = {
  notStarted: -2,
  stopped: -1,
  paused: 0,
  running: 1
};
Game.state = -2;
Game.stack = {};
Game.stackList = [];
Game.scale = 10;
Game.speed = 100;
Game.graphics = false;
Game.setState = function(state) {
  if (state in this.stateList) {
    this.state = this.stateList[state];
    return state;
  }
  throw new Error("undefined state " + state);
};
Game.getState = function() {
  return getKeyByValue.call(this.stateList, this.state);
};
Game.addQueue = function(action, context, interval) {
  var
    id = uniqueId(),
    action = action,
    context = context;

  this.stack[id] = {
    action: typeof action === "function" ? action : false,
    context: typeof context !== "undefined" ? context : window,
    interval: typeof interval === "number" ? interval : false,
    start: this.getInterationCount() || 0,
    id: id
  };

  this.stackList.push(id);
  return id;
};
Game.removeQueue = function(id) {
  if (inArray(id, this.stackList, true)) {
    try {
      removeElementByValue.call(this.stackList, id);
      delete this.stack[id];
    } catch (e) {
      throw e;
    }
  }
  return true;
};
Game.objectContainer = {};
Game.registerObject = function(id, object) {
  if (typeof id === "string") {
    if (!this.objectContainer[id]) {
      var objectReference = object;

      this.objectContainer[id] = objectReference;

      // adding graphics to it

      if (this.graphics) {
        objectReference.graphicModel = this.graphics.createCube({
          coordinates: objectReference.getCoordinates() || false,
          color: objectReference.color || false,
          height: objectReference.height || false
        });
      }

      return true;
    }
  } else throw new Error("Incorrect argument type");
};
Game.getObjectMatrix = function() {
  return this.objectMatrix ? this.objectMatrix : new Game.PathModule().getObjectMatrix();
};
Game.iteration = function() {
  var
    stack = this.stack,
    count = this.stack.length,
    iteration = this.getInterationCount();

  if (this.stackList.length > 0 && Game.Path) {
    this.objectMatrix = new Game.Path().getObjectMatrix();
  }

  for (var i in stack) {
    try {
      if (typeof stack[i] === "object") {
        if (typeof stack[i].start === "number" && typeof stack[i].interval === "number") {
          if ((iteration - stack[i].start) % stack[i].interval === 0) {
            var model = stack[i].context.callee;
            stack[i].action.bind(stack[i].context)();
            this.graphics.updateModel(model);
          }
        } else {
          stack[i].action();
        }
      }
    } catch (e) {
      if (this.debug)
        throw e;
    }
  }

  this.setIterationCount(iteration + 1);
};
Game.setIterationCount = function(number) {
  if (typeof number === "number") {
    this._iterationCount = number;
    return number;
  } else
    throw new Error("Wrong arguments passed");
};
Game.getInterationCount = function() {
  return this._iterationCount;
};
// to be implemented
Game.scriptMap = function() {
  return [];
};
// to be implemented
Game.loadScripts = function() {
  return true;
};
Game.init = function(options) {
  this.setLogging();
  if (typeof options === "object")
    for (var i in options) {
      this[i] = options[i];
    }

  this.graphics = new Game.GraphicsModule({});

  return this;
};
Game.start = function(options) {
  if (typeof this.getInterationCount() === "undefined")
    this.setIterationCount(0);
  this.timer = window.setInterval(
    this.iteration.bind(this),
    this.speed
  );
  if (this.graphics) this.graphics.render();
  this.setState("running");

  return this;
};
Game.pause = function() {
  window.clearInterval(this.timer);
  this.setState("paused");
};
Game.stop = function() {
  window.clearInterval(this.timer);
  this.stackList = [];
  this.stack = {};
  this.setIterationCount(0);
  this.setState("stopped");
};
Game.Map = {
  parent: Game,
  getSize: function() {
    return {
      width: 100,
      height: 100
    };
  },
  getScale: function() {
    return parent.scale;
  },
  createRandomObjects: function() {
    function getNum() {
      switch (Math.floor((Math.random() * 10) + 0)) {
        case 0:
          return 1;
        default:
          return 0;
      }
    }
    console.groupCollapsed("Objects created");
    for (i = 0; i < this.getSize().width; i++) {
      for (j = 0; j < this.getSize().height; j++) {
        if (getNum() === 1) {
          object = new Game.Object({
            color: "#000"
          });
          object.setCoordinates(i, j);
          this.parent.graphics.updateModel(object);
        }
      }
    }
    console.groupEnd();
    return true;
  },
};
