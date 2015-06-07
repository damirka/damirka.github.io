Game.PathModule = {
  tracePath: function(sx, sy, fx, fy, map) {

		console.log(fx, fy);

    var
			max,
      stop = 0,
      delta = this.neighborhood.Moore;

    map[sx][sy] = 0;

		if (map[fx][fy] == -1) return "wrong ending point";

    for (a = 0; a < map.length * map.length; a++) {
      if (stop === 0)
        for (i = 0; i < map.length - 1; i++)
          for (j = 0; j < map[0].length - 1; j++)
            if (map[i][j] == a) {
              // console.warn(a,i,j);
              for (k = 0; k < delta.length; k++)
                if (!((i + delta[k].x) >= map.length || (j + delta[k].y) >= map[0].length || (i + delta[k].x) < 0 || (j + delta[k].y) < 0)) {
                  if (map[i + delta[k].x][j + delta[k].y] == -2) map[i + delta[k].x][j + delta[k].y] = a + 1;
                  if ((i + delta[k].x) == fx && (j + delta[k].y) == fy) stop = a + 1;
                }
            }
    }

    console.log("stop", stop);
    /** Мы подготовили карту, обозначив на ней весь маршрут */

    var
			x = fx,
      y = fy,
      path = [{
        x: fx,
        y: fy,
        a: stop
      }],
      stp = 0;
    for (a = stop; a >= 0; a--) {
      stp = 0;
      for (k = 0; k < delta.length; k++)
        if (!stp)
          if (!((x + delta[k].x) >= map.length || (y + delta[k].y) >= map[0].length || (x + delta[k].x) < 0 || (y + delta[k].y) < 0))
            if (map[x + delta[k].x][y + delta[k].y] == a - 1 && map[x + delta[k].x][y + delta[k].y] != -1) {
              x += delta[k].x;
              y += delta[k].y;
              path.push({
                x: x,
                y: y,
                a: a - 1
              });
              stp = 1;
            }
    }
    return path;
  },

  searchMapObject: function(coords, type, mapObject) {

    console.log("searching for " + type);

    map = this.getObjectMatrix(mapObject);

    var
			delta = this.neighborhood.Moore,
      sx = coords.x,
      sy = coords.y;

    map[sx][sy] = 0;

    for (a = 0; a < map.length * map.length; a++) {
      for (i = 0; i < map.length - 1; i++)
        for (j = 0; j < map[0].length - 1; j++)
          if (map[i][j] == a) {
            for (k = 0; k < delta.length; k++)
              if (!((i + delta[k].x) >= map.length || (j + delta[k].y) >= map[0].length || (i + delta[k].x) < 0 || (j + delta[k].y) < 0)) {
                if (map[i + delta[k].x][j + delta[k].y] == -2) map[i + delta[k].x][j + delta[k].y] = a + 1;
                if (map[i + delta[k].x][j + delta[k].y] == type) {
                  console.log("search successful");
                  return {
                    x: i + delta[k].x,
                    y: j + delta[k].y
                  };
                }
              }
          }
    }
    return false;
  },

  getElementByCoords: function(coords, mapObject) {
    var
      map = mapObject.element,
      scale = mapObject.scale,
      elements = map.querySelectorAll("div"),
      sx = coords.x,
      sy = coords.y;

    for (i = 0; i < elements.length; i++) {
      a = parseInt(elements[i].style.left) / scale;
      b = parseInt(elements[i].style.top) / scale;
      da = parseInt(elements[i].style.width) / scale;
      db = parseInt(elements[i].style.height) / scale;
      if (sx <= (a + da) && sx >= a)
        if (sy <= (b + db) && sy >= b)
          return elements[i];
    }
    return false;
  },

  getObjectMatrix: function(map) {
    console.time('gettingObjectMap');
    var
      objectMatrix = [],
      width = parseInt(map.element.style.width),
      height = parseInt(map.element.style.height),
      scale = map.scale;

		for (i = 0; i < width / scale; i++) {
      objectMatrix.push([]);
      for (j = 0; j < height / scale; j++)
        objectMatrix[i].push(-2);
    }

		var elements = map.element.querySelectorAll("div");

		for (i = 0; i < elements.length; i++) {
      var
        a = parseInt(elements[i].style.left) / scale,
        b = parseInt(elements[i].style.top) / scale,
        da = parseInt(elements[i].style.width) / scale,
        db = parseInt(elements[i].style.height) / scale;
      if (da == 1 && db == 1)
        objectMatrix[a][b] = (elements[i].object) ? elements[i].object.type : -1;
      else {
        for (k = 0; k < da; k++)
          for (p = 0; p < db; p++)
            objectMatrix[a + k][b + p] = (elements[i].object) ? elements[i].object.type : -1;
      }
    }

		console.timeEnd('gettingObjectMap');

		return objectMatrix;
  },
  neighborhood: {
    VonNeumann: [{
      x: 1,
      y: 0
    }, {
      x: 0,
      y: 1
    }, {
      x: -1,
      y: 0
    }, {
      x: 0,
      y: -1
    }],
    Moore: [{
      x: 1,
      y: 0
    }, {
      x: 0,
      y: 1
    }, {
      x: -1,
      y: 0
    }, {
      x: 0,
      y: -1
    }, {
      x: +1,
      y: -1
    }, {
      x: +1,
      y: +1
    }, {
      x: -1,
      y: +1
    }, {
      x: -1,
      y: -1
    }]
  }
};
