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
          if (area === undefined && _.some(_.values(v), function(val) { return val != 0; }))
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


var NewReducer = function(opts) {
  this.opts = opts;
  this.reduce = opts.reduce;
  this.currentFunc = opts.current || this._defaultCurrent;
  this.check = opts.check || this._defaultCheck;
}

NewReducer.prototype = {
  _mergeChg: function(key, val) {
    _.each(val, function(v, k) {
      var d = v - this.initial[key][k];
      if (d > 0)
        d = "+"+d;
      else if (d < 0)
        d = d.toString();
      else
        return
      this.changes[key] = this.changes[key] || {};
      this.changes[key][k] = d;
    }, this);
  },
  _defaultCheck: function() {
    return this.amount == 0;
  },
  _defaultCurrent: function(chg, key, val) {
      //current[key] = _.extend(this.current[key], val)
      //delete current[key];
      if (key == undefined)
      {
        this.current = _.clone(this.initial);
        return;
      }
      this.current = {};
      var curArea = this.map[key];
      _.each(this.initial, function(i, ik) {
        if (_.isArray(chg)) {
          if (_.contains(curArea.neighbours, parseInt(ik)))
          {
            if (!_.has(chg, ik))
              this.current[ik] = i;
          }
        } else {
            if (!_.has(chg, ik))
              this.current[ik] = i;
        }
      }, this);
  },
  ok: function(chg) {
    var opts = this.opts;
    this.amount = opts.amount || 0;
    this.map = _.clone(opts.map) || {};
    this.name = opts.name;
    this.initial = _.clone(opts.initial) || {};
    this.current = {};
    this.changes = {};
    this.targets = {};
    this.failed = [];
    this.currentFunc.call(this, chg);
    if (_.isArray(chg) && _.isArray(opts.pre))
      chg = _.union(opts.pre, chg);
    _.each(chg, function(c, key) {
      if (this.failed.length > 0)
        return;
      if (_.isArray(chg))
        key = c;
      //this.current[key] = _.clone(this.initial[key]);
      var trg = this.reduce(key, c);
      if (trg === false) {
        this.failed.push('reduce failed');
        this.current = _.clone(opts.initial);
        return;
      }
      var key = _.isArray(trg) ? trg[0] : key;
      var val = _.isArray(trg) ? trg[1] : trg;
      this._mergeChg(key, val);
      this.targets[key] = val;
      this.currentFunc.call(this, chg, key, val);
    }, this);
    var ret = {
      changes: this.changes,
      current: this.current,
      ok: this.check(),
      amount: this.amount,
      failed: this.failed,
    }
    return ret;
  }
}

module.exports = {
  Reducer: NewReducer,
  Modes: Modes,
  isSea: function(n) { return typeof n == "string" && n != "frontier"; },
}
