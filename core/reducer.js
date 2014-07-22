var _ = require('underscore')

Reducer = function(engine) {
  this.engine = engine;
  this.init();
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
  this.interactive && this.engine.selector(areas, function(area) {
    visitArea.call(rdc, area, done);
  });
}

Reducer.prototype = {
  init: function() {
    this.amount = this.startAmount;
    this.changes = {};
    this.visited = [];
    this.currentArea = this.startRegion;
  },
  start: function(done) {
    if (done) this.interactive = true;
    var rdc = this;
    if (this.currentArea)
      visitArea.call(rdc, this.currentArea, done);
    else
      this.interactive && this.engine.selector(this.areas(), function(area) {
        visitArea.call(rdc, area, done);
      });
  },
  ok: function(phases) {
    this.init();
    var rdc = this;
    if (this.currentArea) {
      visitArea.call(rdc, this.currentArea)
    }
    _.each(phases, function(p) {
      var area = rdc.areas()[p]
      if (!area) return false;
      visitArea.call(rdc, area)
    })
    if (this.amount > 0)
    {
      return {
        'ok': false,
        'amount': this.amount,
        'areas': this.areas(),
      };
    }
    return this.changes
  },
  set startAmount(value) {
    this.start_amount = value;
    this.amount = value;
  },
  get startAmount() {
    return this.start_amount;
  },
  set startRegion(value) {
    this.start_region = value;
    this.currentArea = value;
  },
  get startRegion() {
    return this.start_region;
  }
}

module.exports = {
  Reducer: Reducer
}
