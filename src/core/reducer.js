var _ = require('underscore');
var ph = require('./context');

var NewReducer = function(opts) {
  this.opts = opts;
  this.reduce = opts.reduce;
  this.currentFunc = opts.current || this._defaultCurrent;
  this.check = opts.check || this._defaultCheck;
}

NewReducer.prototype = {
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
            if (!_.contains(_.first(chg, chg.indexOf(parseInt(key))+1), parseInt(ik)))
              this.current[ik] = i;
        } else {
            if (!_.has(chg, ik) || !_.contains(this.opts.edits, 'id'))
              this.current[ik] = i;
        }
      }, this);
  },
  _gotInitial: function(init) {
    var ret = {};
    var shows = this.opts.shows != undefined || this.opts.edits != undefined ?
    _.union(this.opts.shows, _.without(this.opts.edits, 'id')) : [];
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
    this.values = {};
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
      this.values[key] = val;
      this.currentFunc.call(this, chg, key, val);
    }, this);
    var ret = {
      chg: chg,
      changes: ph.changes(this.initial, this.targets),
      target: this.targets,
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
  isSea: function(n) { return typeof n == "string" && n != "frontier"; },
  Templates: {
    'basic': function(ctx, properties, reduces) {
      var initial = {};
      _.each(ctx.engine.map.areas, function(area, ak) {
        _.each(properties, function(p) {
          var pp = area[p];
          if (ctx.changes[ak] && !isNaN(parseInt(ctx.changes[ak][p])))
            pp += parseInt(ctx.changes[ak][p]) || 0;
          if (pp > 0)
          {
            initial[ak] = initial[ak] || {};
            initial[ak][p] = pp;
          }
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
        },
        check: function() {
          if (this._defaultCheck()) return true;
          if (_.every(this.targets, function(val, key) {
            return _.every(val, function(v) {
              return v == 0;
            });
          })) return true;
          return false;
        }
      }
    }
  }
}
