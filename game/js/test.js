window.Test = function() {

  this.runGame = function() {

    // Running Game with options

    var options = {
      speed: 100
    };

    console.log(Game.start(options), Game.getState());

    console.log("Random blocks on map", Game.Map.createRandomObjects());

  };

  this.testMultipleActions = function() {

    // Setting array of units

    var units = ["Adam", "Bob"];

    for (var i in units) {

      // Creating Game.Units

      console.log("Unit created - " + units[i], window[units[i]] = new Game.UnitObject({ height : 3 }));

      var callback = function(e) {

        // getting context of callback

        console.log("callback", this);

      };

      // Adding actions to queue

      console.log(window[units[i]].go(
        2 * (i + 1), 4 * (i + 1), callback
      ));

    }
  };

  this.checkActionInQueue = function() {

    // Creating stack for copying actions

    window.stack = [];

    var
      j = 0,
      i;

    for (i in Game.stack) {
      window.stack[j++] = Game.stack[i];
    }

  };

  this.run = function() {

    this.runGame();
    this.testMultipleActions();
    this.checkActionInQueue();

  };

};

window.test = new Test();
