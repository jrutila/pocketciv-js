var _ = require('underscore')

var Reducer = function(engine) {
  this.engine = engine;
  this.mode = Modes.AreaWalker;
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
  if (_.size(areas) == 0)
  {
    this.amount = 0;
    visitArea.call(this, undefined, done)
    return;
  }
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
    _.extend(this, this.initValues);
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
  ok: function(reduction) {
    this.init();
    this.changes = {};
    var rdc = this;
    var failed = false;
    
    switch (this.mode) {
      case Modes.Overall:
        _.each(reduction, function(v, k) {
          var area = rdc.areas()[k];
          if (area === undefined)
          {
            failed = true;
            return;
          }
          var rdd = rdc.reduce(v, area);
          if (rdd === false)
            failed = true;
          else
            v = rdd || v;
          var val = rdc.changes[k] || {}; 
          _.each(v, function(vv, kk) {
            if (vv)
            {
              val[kk] = (vv).toString();
              if (area[kk] + vv < 0)
                failed = true;
              rdc.visited.push(area.id)
            }
          })
          if (_.isEmpty(val))
            delete rdc.changes[k];
          else
            rdc.changes[k] = val;
        });
//        if (_.isEmpty(this.areas())) this.amount = 0;
        break;
      case Modes.AreaWalker:
      default:
        if (this.currentArea) {
          visitArea.call(rdc, this.currentArea)
        }
        _.each(reduction, function(p) {
          var area = rdc.areas()[p]
          if (!area) failed = true;
          visitArea.call(rdc, area)
        })
        if (_.isEmpty(this.areas())) this.amount = 0;
    }
    
    if (failed) return false;
    
    return {
      'areas':this.areas(),
      'ok': this.amount <= 0,
      'amount': this.amount,
      'changes': this.changes,
    };
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

var Modes = { AreaWalker: 'AreaWalker', Overall: 'Overall', Selector: 'Selector' };

module.exports = {
  Reducer: Reducer,
  Modes: Modes,
}
