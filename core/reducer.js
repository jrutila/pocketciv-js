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

var Attack = {
  areas: function() {
      var unvisitedngh = _.difference(this.currentArea.neighbours, this.visited)
      var areas = {}
      _.each(this.engine.map.areas, function(area, key) {
        if (unvisitedngh.indexOf(parseInt(key)) > -1)
          if (area.tribes)
            areas[key] = area;
      });
      var sorted = _.sortBy(_.values(areas), function(a) { return a.tribes; })
      var minTribes = 999;
      areas = {}
      for(var s in sorted)
      {
        if (sorted[s].tribes <= minTribes)
        {
          areas[sorted[s].id] = sorted[s]
          minTribes = sorted[s].tribes
        }
          
      }
      return areas;
  },
  reduce: function(area) {
      if (area.tribes == 0)
      {
        this.amount = 0;
        return;
      }
      var rTrb = Math.min(area.tribes, this.amount);
      //if (this.engine.map.tribeCount - (this.original_amount - this.amount - rTrb) <= 2)
      this.amount -= rTrb;
      console.log('Reduce area '+area.id+' with '+rTrb)
      console.log('Loss left: '+this.amount)
      return { 'tribes': (area.tribes - rTrb).toString() }
  }
}

module.exports = {
  Reducer: Reducer,
  Attack: Attack
}
