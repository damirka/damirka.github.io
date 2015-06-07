Game = {
  stack: [],
  time: 0,
	status : 'stopped',
  start : function() {
		this.gameLoop = window.setInterval(
      function() {
        if (this.stack.length > 0) {
          for (i = 0; i < this.stack.length; i++) {
						if (typeof this.stack[i] === 'function') {
							this.stack[i]();
						}
					}
					this.stack = [];
        }
      }.bind(this),
    100);
		this.status = 'running';
  },
	stop : function() {
		window.clearInterval(this.gameLoop);
		this.status = 'stopped';
	},
	addQueue : function (action) {
		if (typeof action === 'function')
			this.stack.push(action);
	}
};
