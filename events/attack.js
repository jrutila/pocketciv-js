var reducer = require('../core/reducer');
var _ = require('underscore');

var AttackReducer = {
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
      var RCITY = this.city_reduce;
      var RGOLD = this.gold_reduce;
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
};


module.exports = {
    attack: function() {
        var ctx = this;
        var rdc = new reducer.Reducer(ctx.engine);
        rdc.areas = AttackReducer.areas;
        rdc.reduce = AttackReducer.reduce;
        rdc.startRegion = this.active_region;
        rdc.startAmount = attack_force;
        ctx.engine.reducer(rdc, function(chg) {
            ctx.changes = chg;
            ctx.done && ctx.done();
        });
    },
    name: 'attack',
    title: 'Attack',
    steps: {
        '2': "Starting with the Active Region {{ active_region }}, Reduce \
            Attacking force {{ attack_force }} as follows:",
        '3': "Reduce 1 Attacking Force by reducing 1 Tribe. {% tribe_reduce = 1 %}",
        '4': "Reduce 5 Attacking Force by reducing 1 City AV. {% city_reduce = 5 %}",
        '4.1': "For every City AV reduced, decimate 2 gold from you common stock. {% gold_reduce = 2 %}",
        '5': "If Attacking Force remains, move to Neighboring Region with the \
             least amount of Tribes. In case of a tie then move to Neighboring \
             Region with highest City AV. Otherwise, you choose. \
             Attacking Forces do not move through empty Regions.\
             {%; attack() %}"
    },
    reducer: AttackReducer
};
