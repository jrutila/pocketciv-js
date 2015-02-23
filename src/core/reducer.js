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
  _getChangeString: function(prev, now) {
    var d = now-prev;
    if (d > 0)
      return "+"+d;
    if (d < 0)
      return d.toString();
    return null;
  },
  _mergeChg: function(key, val) {
    if (!parseInt(key)) {
      var d = this._getChangeString(this.initial[key], this.targets[key]);
      if (d)
        this.changes[key] = d;
    } else
      _.each(val, function(v, k) {
        var d = v;
        if(!isNaN(parseInt(v))) {
          d = this._getChangeString(this.initial[key][k], v)
        }
        if (d == null) return;
        this.changes[key] = this.changes[key] || {};
        this.changes[key][k] = d;
      }, this);
  },
  _defaultCheck: function() {
    if (this.amount == 0) return true;
    if (_.size(this.current) == 0) return true;
    return false;
  },
  _defaultCurrent: function(chg, key, val) {
      //current[key] = _.extend(this.current[key], val)
      //delete current[key];
      if (key == undefined)
      {
        this.current = this.initial;
        return;
      }
      this.current = {};
      var curArea = this.map[key];
      _.each(this.initial, function(i, ik) {
        if (_.isArray(chg)) {
          //if (_.contains(curArea.neighbours, parseInt(ik)))
          //{
            if (!_.contains(_.first(chg, chg.indexOf(key)+1), parseInt(ik)))
              this.current[ik] = i;
          //}
        } else {
            if (!_.has(chg, ik))
              this.current[ik] = i;
        }
      }, this);
  },
  _gotInitial: function(init) {
    var ret = {};
    var shows = this.opts.shows != undefined || this.opts.edits != undefined ?
    _.union(this.opts.shows, this.opts.edits) : [];
    _.each(init, function(val, a) {
      if (_.contains(shows, a) || (isNaN(parseInt(a)) && shows.length == 0)) {
        ret[a] = val;
      } else if (_.isObject(val)) {
        ret[a] = shows.length > 0 ? _.pick(val, shows) : _.clone(val);
      }
    });
    return ret;
  },
  ok: function(chg) {
    var opts = this.opts;
    this.amount = opts.amount || 0;
    this.map = _.clone(opts.map) || {};
    this.name = opts.name;
    this.initial = this._gotInitial(opts.initial);
    this.current = {};
    this.changes = {};
    this.targets = _.clone(this.initial);
    this.failed = [];
    this.currentFunc.call(this, chg);
    if (_.isArray(chg) && _.isArray(opts.pre))
      chg = (opts.pre || []).concat(chg);
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
      this.targets[key] = val;
      this._mergeChg(key, val);
      this.currentFunc.call(this, chg, key, val);
    }, this);
    this._mergeChg('gold');
    var ret = {
      chg: chg,
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
  Templates: {
    'basic': function(ctx, properties, reduces) {
      var initial = {};
      _.each(ctx.engine.map.areas, function(area, ak) {
        _.each(properties, function(p) {
          var pp = area[p] + 
              parseInt(ctx.changes[ak] && ctx.changes[ak][p] || 0);
          initial[ak] = initial[ak] || {};
          initial[ak][p] = pp;
        });
      });
      return {
        map: ctx.engine.map.areas,
        initial: initial,
        shows: properties,
        edits: properties,
        reduce: function(key, chg) {
          var ret = {};
          _.each(chg, function(r, p) {
            var d = this.initial[key][p] - r;
            this.amount -= d;
            ret[p] = r;
          },this);
          return ret;
        }
      }
    }
  }
}
