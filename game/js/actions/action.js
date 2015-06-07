Game.Action = Game.Class.extend({
  init: function() {},
  run: function() {},
  stop: function(callback) {
    this.stopContinuousAction(
      typeof callback !== "function" ?
      function() {} :
      callback.bind(this)
    );
    return this;
  },
  stateList: {
    notStarted: -1,
    stopped: -0,
    running: 1
  },
  state: -1,
  setState: function(state) {
    if (state in this.stateList) {
      this.state = this.stateList[state];
      return state;
    }
    throw new Error("undefined state " + state);
  },
  getState: function() {
    return getKeyByValue.call(this.stateList, this.state);
  },
  setContinuousAction: function(action, interval) {
    if (typeof action === "function") {
      this.id = Game.addQueue(
        action,
        this,
        typeof interval === "number" ?
        interval : false
      );
      this.setState("running");
      return true;
    } else throw new Error("Wrong argument passed");
  },
  stopContinuousAction: function(callback) {
    if (this.id) {
      if (Game.removeQueue(this.id)) {
        callback.bind(this)();
        this.setState("stopped");
        return true;
      }
    }
    return false;
  },
  applyScale: function(number) {
    return number * this.scale;
  },
  addParams: function(params) {
    for (var i in params) {
      try {
        this["set" + i.charAt(0).toUpperCase() + i.substring(1)] =
          eval("(function () {return function (param) {if (typeof param === '" + params[i] + "') {this." + i + " = param; return this;} else return false;}})()");
      } catch (e) {
        throw e;
      } finally {
        this[i] = undefined;
        return true;
      }
    }
  },
  visualInteraction: 'DOM',
  scale: Game.scale || 10
});
