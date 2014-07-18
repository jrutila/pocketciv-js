Reducer = function(engine) {
  this.engine = engine;
  this.amount = 0;
  this.changes = {};
  this.visited = [];
  this.currentArea = undefined;
}

var visitArea = function(area, done) {
  if (area == undefined) {
    done && done(this.changes)
    return
  }
  var chg = this.reduce(area);
  this.changes[area.id] = chg;
  this.currentArea = area;
  this.visited.push(area.id)
  if (this.amount <= 0)
  {
    visitArea.call(this, undefined, done)
    return;
  }
  var areas = this.areas()
  var rdc = this;
  this.engine.selector(areas, function(area) {
    visitArea.call(rdc, area, done);
  });
}

Reducer.prototype = {
  start: function(done) {
    var rdc = this;
    if (this.currentArea)
      visitArea.call(rdc, this.currentArea, done);
    else
      this.engine.selector(this.areas(), function(area) {
        visitArea.call(rdc, area, done);
      });
  },
  set startAmount(value) {
    this.start_amount = value;
    this.amount = value;
  },
  get startAmount() {
    return this.start_amount;
  }
}

module.exports = {
  Reducer: Reducer
}
