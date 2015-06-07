(function() {
  var a = false,
    b = /xyz/.test(function() {}) ? /\b_super\b/ : /.*/;
  Game.Class = function() {};
  Game.Class.extend = function(c) {
    function d() {
      !a && this.init && this.init.apply(this, arguments)
    }
    var e = this.prototype;
    a = true;
    var f = new this;
    a = false;
    for (var h in c) f[h] = typeof c[h] == "function" && typeof e[h] == "function" && b.test(c[h]) ?
      function(a, b) {
        return function() {
          var c = this._super;
          this._super = e[a];
          var d = b.apply(this, arguments);
          this._super = c;
          return d
        }
      }(h, c[h]) : c[h];
    d.prototype = f;
    d.constructor = d;
    d.extend = arguments.callee;
    return d
  }
})();
// Actions
Game.Action = Game.Class.extend({
  init: function() {},
  run: function() {},
  stop: function(callback) {
    var
      object = this.callee,
      timer = object.id();

    if (typeof callback !== 'function') {
      callback = function() {};
    }

    if (object !== 'undefined')
      if (window[timer])
        this.stopContinuousAction(timer, callback.bind(this));

    return this;
  },
  setContinuousAction: function(id, action, interval) {
    window[typeof id === 'string' ?
      id : Game.uniqueId()] = setInterval(
      action.bind(this),
      typeof interval === 'number' ?
      interval : 100);
  },
  stopContinuousAction: function(id, onstop) {
    onstop.bind(this)();
    clearInterval(window[id]);
  },
  applyScale: function(number) {
    return number * this.scale;
  },
  visualInteraction: 'DOM',
  scale: Game.scale || 10
});
Game.ActionMove = Game.Action.extend({
  init: function() {},
  run: function(object) {
    this.changeCoordinates(object);
  },
  changeCoordinates: function(object, coordinates) {
    if (this.visualInteraction === 'DOM') {
      object.element.style.top = this.applyScale(coordinates.y) + "px";
      object.element.style.left = this.applyScale(coordinates.x) + "px";
    }
  }
});
Game.ActionGo = Game.ActionMove.extend({
  init: function(object) {
    this.callee = object;
  },
  run: function(path, callback) {
    var
      i = path.length - 1,
      unit = this.callee;

    this.callback = callback;
    this.timer = unit.id();
    this.path = path;

    unit.dispatchEvent("onmovestart");

    this.setContinuousAction(this.timer,
      function() {
        var unit = this.callee;
        if (i === 0) {
          this.stopContinuousAction(this.timer, function() {
            this.callee.dispatchEvent("onmoveend");
            this.callback.bind(this.callee)(path);
          });
        }
        this.changeCoordinates(unit, {
          x: this.path[i].x,
          y: this.path[i].y,
        });
        unit.dispatchEvent("onmove", {
          path: this.path,
          step: i
        });
        if (i >= 1) i--;
      }, 100);

    return this;
  },
  callback: function() {},
  path: [],
  timer: '',
});
Game.ActionPatrol = Game.ActionGo.extend({
  init: function(object) {
    this.callee = object;
  },
  run: function(path, callback) {
    var
      i = path.length - 1,
      unit = this.callee;

    this.timer = unit.id();
    this.path = path;
    this.callback = callback;

    unit.dispatchEvent("onmovestart");

    this.setContinuousAction(this.timer,
      function() {
        var unit = this.callee;

        if (i === 0) {
          this.path = Game.arrayReverse(this.path);
          i = this.path.length - 1;
          this.callee.dispatchEvent("onmoveend");
          this.callback.bind(this.callee)(path);
        }

        this.changeCoordinates(unit, {
          x: this.path[i].x,
          y: this.path[i].y
        });

        unit.dispatchEvent("onmove", {
          path: this.path,
          step: i
        });

        i--;
      }, 100);

    return this;
  },
});
Game.ActionFollow = Game.ActionGo.extend({
  init: function(object) {
    this.callee = object;
  },
  run: function(path,onstep,callback) {
    var unit = this.callee;

    this.step = path.length - 1;
    this.path = path;
    this.onstep = onstep;

    this.setContinuousAction(this.callee.id(),
      function () {
        if (this.step===0) this.stop();
        this.changeCoordinates(unit, {
          x: this.path[this.step].x,
          y: this.path[this.step].y,
        });
        this.onstep.bind(unit)(this.path,this.step);
        this.step--;
      }, 100);

    return this;
  },
  step : false
});
Game.ActionBuild = Game.Action.extend({
  init: function(object) {
    this.callee = object;
    this.map = Game.Map;
  },
  run: function(type, options) {
    var
      objectClass = options.object,
      mapElement = this.map.element,
      element, object;

    element = this.createElement(type, options.style);
    object = this.createObjectClass(objectClass, [element, type]);
    console.log(object);
    element.object = object;
    mapElement.appendChild(element);

    this.child = object;

    return this;
  },
  createElement: function(type, options) {
    var element = document.createElement("div");

    element.style.position = 'absolute';

    for (var i in options)
      element.style[i] = options[i];
    Game.addClass(element, type || '');

    return element;
  },
  createObjectClass: function(className, params) {
    console.log(params, Game);
    return typeof Game[className] === 'function' ?
      new Game[className](params[0], params[1]) :
      false;
  }
});
// Controllers
Game.BaseActions = {
  hit: function(aim) {
    var
      t = this.id(),
      u = this,
      i = 0;

    if (typeof aim === "undefined") aim = this.aim;

    this.onmove = function() {};

    window[t] = setInterval(function() {
      if (Math.abs(this.coordinates().x - aim.coordinates().x) < 2 &&
        Math.abs(this.coordinates().y - aim.coordinates().y) < 2) {
        if (i % (this.options.attackRate * 1) === 0) {
          aim.health -= this.options.attack || 0;
          console.log('hit-hit!');
        }
        i++;
      } else {
        this.onmove = function(e) {
          if ((e.path.length - e.path.step) % 2 === 0) {
            if (Math.abs(this.aim.coordinates().x != this.aimCoords.x) > 1 ||
              Math.abs(this.aim.coordinates().y != this.aimCoords.y) > 1) {
              console.log('should change route');
              this.aimCoords = this.aim.coordinates();
              this.go(this.aim.coordinates().x, this.aim.coordinates().y, this.attack);
            }
          }
        };
        this.go(aim.coordinates().x, aim.coordinates().y, this.attack);
      }
    }.bind(this), 5);
  },
  speak: function(text) {
    alert(text);
  },
  build: function(type, options) {
    var b = document.createElement("div");

    b.setAttribute("class", type);
    b.style.position = "absolute";

    for (var i in options)
      b.style[i] = options[i];

    switch (type[0]) {
      case "b":
        Game.BuildingContainer.push(new Game.BuildingObject(b));
        b.object = Game.BuildingContainer.slice(-1)[0];
        break;
      case "u":
        Game.UnitContainer.push(new Game.UnitObject(b));
        b.object = Game.UnitContainer.slice(-1)[0];
        break;
    }
    Game.Map.element.appendChild(b);

    return true;
  },
  mine: function(base, mine) {
    tG = function() {
      this.currentItem = 10 + " gold";
      this.element.setAttribute("class", "hasGold");
      this.go(base.coordinates().x + base.size().width, base.coordinates().y + base.size().width, tB);
    }.bind(this);
    tB = function() {
      this.currentItem = "";
      this.element.setAttribute("class", "");
      this.go(mine.coordinates().x + mine.size().width, mine.coordinates().y + mine.size().width, tG);
    }.bind(this);
    var currentItem = this.currentItem == 10 + " gold" ? tG() : tB();
  }
};
Game.BuildOptions = {
  b1: {
    style: {
      height: 3,
      width: 3,
      background: "#a0a0a0"
    },
    class: "b1",
    object: "BuildingObject"
  },
  b2: {
    style: {
      width: 2,
      height: 4,
      background: "#dfadca"
    },
    object: "BuildingObject"
  },
  u1: {
    style: {
      width: 1,
      height: 1,
      background: "#00ff00"
    },
    object: "UnitObject"
  }
};
Game.EventsObject = Game.Class.extend({
  /**
		@init calls the @createEvents function
		which adds events from the list given to
		the @EventsObject
	*/
  init: function() {
    this.createEvents([
      "oncontainerinit",
      "onleave", {
        name: "oneventsinit",
        data: this
      },
      "onmapcreated",
      "onmoveend"
    ]);
  },
  /**
		@createEvents function takes array of strings
		and objects
		if argument is a string, it creates just
		basic @Event
		if argument is an object, argument must contain
		two variables: @name - name of event and @data -
		data to put as @detail in @CustomEvent
	*/
  createEvents: function(eventArray) {
    for (i = 0; i < eventArray.length; i++) {
      if (typeof eventArray[i] == "string") {
        this[eventArray[i]] = new Event(eventArray[i]);
      } else {
        if (typeof eventArray[i] == "object")
          this[eventArray[i].name] = new CustomEvent(eventArray[i].name, {
            "detail": eventArray[i].data
          });
      }
    }
  }
});
Game.MapObject = Game.Class.extend({
  init: function(attributes, map) {
    this.scale = Game.scale;
    return (typeof map[0] == "object") ? this.createMap(map, Game.mergeOptions({
      "class": "map",
      "id": "map"
    }, attributes)) : console.log("wrong map format");
  },
  createMap: function(a, b) {
    map = document.createElement("div");
    /** change once **/
    con = document.querySelector(".f");
    document.body.insertBefore(map, con);
    /** change once **/
    this.element = map;
    this.element.oncontextmenu = function(e) {
      e.preventDefault();
      of = this.getBoundingClientRect();

      var
        x = Math.floor(((e.x || e.clientX) - of.left) / Game.scale || 0),
        y = Math.floor(((e.y || e.clientY) - of.top) / Game.scale || 0);

      Game.Selected.act({
        x: x,
        y: y
      });

    };

    this.size = {
      width: a.length,
      height: a[0].length,
    };

    for (var i in b) map.setAttribute(i, b[i]);

    map.style.width = a.length * this.scale + "px";
    map.style.height = a[0].length * this.scale + "px";
    map.style.position = "relative";
    map.style.marginTop = "10px";
    map.style.marginRight = "auto";
    map.style.marginLeft = "auto";

    //map.style.left = "0px";
    //map.style.top = "0px";
    /** ---- Побочная функция для генерации карты ---- */
    function createBlock(map, type) {
        block = document.createElement("div");
        map.appendChild(block);
        block.setAttribute("class", "block" + type);
        return block;
      }
      /** ---- окончание функции для генерации карты ---- */
    console.time('creating map');
    for (i = 0; i < a.length; i++)
      for (j = 0; j < a[0].length; j++)
        if (a[i][j] == 1) {
          block = createBlock(map, a[i][j]);
          block.style.left = i * this.scale + "px";
          block.style.top = j * this.scale + "px";
          block.style.width = this.scale + "px";
          block.style.height = this.scale + "px";
        }
    console.timeEnd('creating map');
    return true;
  }
});
Game.BaseObject = Game.Class.extend({
  init: function(element, options) {
    this.element = element;
    this.element.setAttribute('id', Game.uniqueId());
    this.modules = {
      path: Game.PathModule,
      map: Game.Map,
      selected: Game.Selected
    };
    this.options = {
      speed: 10
    };
    this.actions = Game.BaseActions;
    this.element.onclick = function(e) {
      e.stopPropagation();
      this.object.click.call(this.object, e);
    };
  },
  scale: Game.scale,
  click: function(e) {
    this.select(e);
  },
  contextmenu: function(e) {
    // ...
    // ...
    // ...
  },
  select: function(e) {
    this.modules.selected.add(this);
  },
  coordinates: function() {
    return {
      x: parseInt(this.element.style.left) / this.scale,
      y: parseInt(this.element.style.top) / this.scale
    };
  },
  size: function() {
    var
      w = (parseInt(this.element.style.width) + 1) / this.scale,
      h = (parseInt(this.element.style.height) + 1) / this.scale;
    return {
      width: w,
      height: h
    };
  },
  act: function(action, object) {
    if (typeof this.actions[action] != "undefined" && typeof object != "undefined") {
      if (this.stopAction()) {
        this.currentAction = action;
        this.actions[action].apply(this, object);
        return true;
      } else throw "something wrong - can't stop currentAction";
    } else throw "undefined action || object";
  },
  currentAction: undefined,
  id: function() {
    return this.element.getAttribute('id') || "";
  },
  events: {},
  addEventHandlers: function(eventList) {
    for (i = 0; i < eventList.length; i++) {
      this.events[eventList[i]] = new CustomEvent(eventList[i], {
        'detail': {
          'object': this,
          'element': this.element,
          'event': eventList[i]
        }
      });
      this[eventList[i]] = function(e) {};
      this.element.addEventListener(eventList[i], function(e) {
        e.srcElement.object[e.type](e);
      }, false);
    }
  },
  dispatchEvent: function(event, params) {
    this.events[event].detail.data = Game.copyOptions(params);
    if (typeof this.events[event] !== 'undefined')
      this.element.dispatchEvent(this.events[event]);
  }
});
Game.GoldMine = Game.BaseObject.extend({
  init: function(element) {
    this.element = element;
    this.element.setAttribute('id', Game.uniqueId());
    this.type = "g1";
    this.modules = {
      path: Game.PathModule,
      map: Game.Map,
      selected: Game.Selected
    };
    this.element.onclick = function(e) {
      e.stopPropagation();
      this.object.click.call(this.object, e);
    };
  }
});
Game.BuildingObject = Game.BaseObject.extend({
  init: function(element) {
    this.element = element;
    this.element.setAttribute('id', Game.uniqueId());
    this.modules = {
      path: Game.PathModule,
      map: Game.Map,
      selected: Game.Selected
    };
    this.type = this.element.getAttribute("class");
    this.actions = Game.BaseActions;
    this.element.onclick = function(e) {
      e.stopPropagation();
      this.object.click.call(this.object, e);
    };
  },
  build: function(type) {
    options = Game.copyOptions(Game.BuildOptions[type]);
    scale = Game.scale;
    var map = this.modules.path.getObjectMatrix(this.modules.map);
    for (i = 0; i < options.width; i++)
      for (j = 0; j < options.height; j++)
        if (map[i + this.coordinates().x + this.size().width][j + this.coordinates().y + this.size().height] != -2)
          throw "there\'s an object!";
        else console.log(map[i + this.coordinates().x + this.size().width][j + this.coordinates().y + this.size().height]);
    for (var i in options)
      if (typeof options[i] == "number") options[i] = (options[i] * scale - 1) + "px";
    options.left = (scale * (this.coordinates().x + this.size().width)) + "px";
    options.top = (scale * (this.coordinates().y + this.size().height)) + "px";
    if (this.act("build", [type, options])) return true;
  }
});
Game.UnitObject = Game.BaseObject.extend({
  init: function(element, type) {
    this.element = element;
    this.element.setAttribute('id', Game.uniqueId());
    this.type = typeof type == "undefined" ? "u1" : type;
    this.modules = {
      path: Game.PathModule,
      map: Game.Map,
      selected: Game.Selected
    };
    this.options = {
      speed: 1,
      attackRate: 10,
      attack: 5
    };
    this.actions = Game.BaseActions;
    this.currentItem = {};
    this.addEventHandlers([
      "onmovestart",
      "onmove",
      "onmoveend",
      "onminestart",
      "onmineend",
      "onattack",
      "onattacked",
    ]);
    this.element.onclick = function(e) {
      e.stopPropagation();
      this.object.click.call(this.object, e);
    };
  },
  stop: function() {
    if (typeof this.currentAction !== 'undefined')
      if (this.currentAction.stop()) {
        this.currentAction = undefined;
        return this;
      } else throw new Error('Unable to stop action');
    else console.warn('No action to stop');
  },
  go: function(x, y, callback) {
    var path = this.tracePath(x, y);
    if (typeof callback != "function") callback = function() {};

    this.currentAction = new Game.ActionGo(this).stop().run(path, callback);

    return this;
  },
  patrol: function(x, y) {
    var path = this.tracePath(x, y);
    if (typeof callback != "function") callback = function() {};

    this.currentAction = new Game.ActionPatrol(this).stop().run(path, callback);

    return this;
  },
  follow: function(object, callback) {
    var
      coords = object.coordinates(),
      path = this.tracePath(coords.x,coords.y),
      action = new Game.ActionFollow(this),
      onstep = function () {};

    this.aim = object;
    this.currentAction = action;

    onstep = function (p,i) {
      var oldCoords = {
        x : p[0].x,
        y : p[0].y
      };

      if (!Game.comparePartial(oldCoords,this.aim.coordinates()))
        action.stop().run(this.tracePath(
          this.aim.coordinates().x,
          this.aim.coordinates().y
        ),onstep);
    };


    action
      .stop()
      .run(path,onstep);

    return this;
  },
  attack: function(aim) {
    /*
    console.log("attack!");
    var param;
    if (typeof aim != "undefined") {
      param = aim;
      this.aim = aim;
      this.aimCoords = aim.coordinates();
    } else {
      if (typeof this.aim != "undefined") {
        param = this.aim;
        this.aimCoords = param.coordinates();
      } else throw "no aim specified";
    }
    this.act("hit", [aim]);
    */
  },
  mine: function( /*base,mine*/ ) {
    var
      pathModule = this.modules.path,
      mineCoords = pathModule.searchMapObject(this.coordinates(), "g1", this.modules.map),
      baseCoords = pathModule.searchMapObject(this.coordinates(), "b1", this.modules.map);

    if (mineCoords) {
      mine = pathModule.getElementByCoords(mineCoords, this.modules.map).object;
      if (baseCoords) {
        base = pathModule.getElementByCoords(baseCoords, this.modules.map).object;
        this.currentAction = new ActionMine(this).stop().run(mine, base);
      } else console.log('nowhere to carry');
    } else console.log('can not find a place to mine');
  },
  build: function(type) {
    var
      options = Game.copyOptions(Game.BuildOptions[type]),
      scale = this.scale,
      map = this.modules.path.getObjectMatrix(this.modules.map);

    for (i = 1; i < options.style.width + 1; i++)
      for (j = 1; j < options.style.height + 1; j++)
        if (map[i + this.coordinates().x][j + this.coordinates().y] != -2)
          throw "there\'s an object!";
    for (var i in options.style)
      if (typeof options.style[i] == "number")
        options.style[i] = (options.style[i] * scale - 1) + "px";
    options.style.left = (scale * (this.coordinates().x + 1)) + "px";
    options.style.top = (scale * (this.coordinates().y + 1)) + "px";

    this.currentAction = new Game.ActionBuild(this).stop().run("u1", options);

    return this;
  },
  tracePath: function(x, y) {
    if (typeof this.modules.map !== 'undefined' && typeof this.modules.path !== 'undefined') {
      var
        map = this.modules.map;
      if (x >= map.size.width || y >= map.size.height)
        throw new Error("Passed non-existing coordinates");
      var
        path = this.modules.path.tracePath(
          this.coordinates().x,
          this.coordinates().y, x, y,
          this.modules.path.getObjectMatrix(map)
        );
      return path;
    } else throw new Error('Path or Map modules are not defined in object');
  }
});
// Game functionality
Game.containerList = ["BaseContainer", "UnitContainer", "BuildingContainer"];
Game.addEventHandlers = function() {
  window.Events = new Game.EventsObject();
  document.addEventListener('oneventsinit', function(e) {
    console.log('events added, full list : ', e.detail);
  }, false);
  document.addEventListener('oncontainerinit', function(e) {
    console.log('containers created', Game.containerList);
  }, false);
  document.addEventListener('onmapcreated', function(e) {
    console.log('map object created', Game.Map);
    /** ---- Побочная функция для проверки работы пути ----
			Game.Map.element.oncontextmenu = function (e) {
				e.preventDefault();

				if (e.which == 3 ) {
					var way = Game.Map.element.querySelectorAll(".path");
					if (way.length>0)
						for(i=0;i<way.length;i++)
							way[i].parentNode.removeChild(way[i]);

					var fx,fy,sx,sy;
						fx = Math.floor(e.x/Game.Map.scale || 0);
						fy = Math.floor(e.y/Game.Map.scale || 0);
						sx = 0;
						sy = 0;


					var path = Game.PathModule.tracePath(sx,sy,fx,fy,Game.PathModule.getObjectMatrix(Game.Map));

					//moveObject(man,path);
				}	else console.log(e);
			}
		/** ---- окончание функции для проверки работы пути ---- */
  }, false);
  document.dispatchEvent(window.Events.oneventsinit);
};
Game.createRandomMap = function(width, height) {
  function getNum() {
    switch (Math.floor((Math.random() * 10) + 0)) {
      case 0, 1, 2, 3:
        return 1;
      case 4, 5, 6, 7, 8, 9:
        return 2;
      default:
        return 2;
    }
  }
  var arr = [];
  for (i = 0; i < width; i++) {
    arr.push([]);
    for (j = 0; j < height; j++) {
      arr[i].push(getNum());
    }
  }
  return arr;
};
Game.init = function(options) {
  /**
		@addEventHandlers creates @Events object
		and adds event listeners for each step of initialization
	*/
  this.addEventHandlers();
  /**
		containers initialization
		needed to provide relations between
		@GameObject and its containers
	*/
  for (i = 0; i < this.containerList.length; i++)
    this[this.containerList[i]] = [];
  document.dispatchEvent(window.Events.oncontainerinit);
  /**
		we give DOM-element attributes to
		@MapObject during initialization
	*/
  var mArray = JSON.parse(window.mapArray);

  Game.Map = new Game.MapObject({
    "class": "mapObject"
  }, mArray);

  document.dispatchEvent(window.Events.onmapcreated);

  return "initialization successful";
};
