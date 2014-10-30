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

var Attack = {
  areas: function() {
      var unvisitedngh = _.difference(this.currentArea.neighbours, this.visited)
      var areas = {}
      _.each(this.engine.map.areas, function(area, key) {
        if (unvisitedngh.indexOf(parseInt(key)) > -1)
          areas[key] = area;
      });
      var sorted = _.sortBy(_.values(areas), function(a) { return a.city ? -1*a.city : 0; })
      sorted = _.sortBy(sorted, function(a) { return a.tribes || 0; })
      var minTribes = 999;
      var maxTribes = 0;
      var maxCity = 0;
      areas = {}
      for(var s in sorted)
      {
        var tribes = sorted[s].tribes || 0;
        var city = sorted[s].city || 0;
        
        if (tribes > 0 && tribes <= minTribes && (tribes > 0 || tribes == maxTribes)
        &&
        (city >= maxCity))
        {
          areas[sorted[s].id] = sorted[s]
          minTribes = tribes
          maxCity = city || maxCity
        }
        
        maxTribes = tribes > maxTribes ? tribes : maxTribes;
      }
      if (minTribes === 0 && maxCity === 0 && maxTribes === 0)
      {
        return {};
      }
      return areas;
  },
  reduce: function(area) {
      var rTrb = Math.min(area.tribes || 0, this.amount);
      //if (this.engine.map.tribeCount - (this.original_amount - this.amount - rTrb) <= 2)
      this.amount -= rTrb;
      var RCITY = 5;
      var RGOLD = 2;
      var rCity = 0;
      while (this.amount >= RCITY && area.city - rCity > 0)
      {
        rCity++;
        this.amount -= RCITY;
      }
      // If there is not enough force to decimate all cities (3.3)
      if (this.amount > 0 && area.city - rCity > 0)
        this.amount = 0;
      var chg =  {};
      
      if (rCity > 0)
      {
        if (!_.has(this.changes, 'gold')) this.changes['gold'] = '0';
        this.changes['gold'] = (parseInt(this.changes['gold']) - RGOLD*rCity).toString()
      }
      
      if (area.tribes && rTrb)
        chg['tribes'] = (area.tribes - rTrb).toString()
      if (area.city && rCity)
        chg['city'] = (area.city - rCity).toString()
        
      return chg;
  }
}

var CityAdvance = {
  areas: function() {
    var areas = {};
    var max_city = this.max_city;
    _.each(this.engine.map.areas, function(a) {
      if (a.city && a.tribes) {
        var chg = this.changes[a.id] || {};
        var t = chg.tribes ? eval(a.tribes + chg.tribes) : a.tribes;
        var c = chg.city ? eval(a.city + chg.city) : a.city;
        if (t >= c + 1 && c + 1 <= max_city) areas[a.id] = a;
      }
    }, this)
    return areas;
  },
  reduce: function(r, area) {
    var c = area.city;
    var t = area.tribes;
    while (c < area.city + r.city) {
      // If there is not enough tribes
      c++;
      if (t - c < 0) return false;
      t -= c;
      this.amount++;
    }
    console.log(this.amount)
    if (c - area.city > 0)
      return {
        'city': '+' + (c - area.city),
        'tribes': (t - area.tribes).toString()
      }
    else
      return {}
  }
}

var Modes = { AreaWalker: 'AreaWalker', Overall: 'Overall', Selector: 'Selector' };

module.exports = {
  Reducer: Reducer,
  Attack: Attack,
  CityAdvance: CityAdvance,
  Modes: Modes,
}
