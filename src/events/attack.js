var reducer = require('../core/reducer');
var _ = require('underscore');

var AttackReducer = {
  reduce: function(key) {
    console.log(key)
    console.log(this.current)
    if (!_.has(this.current, key)) return false;
    
    var RTRIBE = this.opts.tribe_reduce || 1;
    var RCITY = this.opts.city_reduce;
    var RGOLD = this.opts.gold_reduce;
    var area = this.initial[key];
    
    var rTrb = 0;
    while (this.amount >= RTRIBE && area.tribes - rTrb > 0)
    {
      rTrb++;
      this.amount -= RTRIBE;
    }
    var rCity = 0;
    while (this.amount >= RCITY && area.city - rCity > 0)
    {
      rCity++;
      this.amount -= RCITY;
    }
    // If there is not enough force to decimate all cities and tribes (3.3)
    if (this.amount > 0)
      if (area.tribes - rTrb > 0 || area.city - rCity > 0)
        this.amount = 0;
        
    var chg =  {};
    
    if (rCity > 0)
    {
      this.targets['gold'] -= RGOLD*rCity;
      if (this.targets['gold'] < 0)
        this.targets['gold'] = 0;
    }
    
    if (area.tribes && rTrb)
      chg['tribes'] = area.tribes - rTrb;
    if (area.city && rCity)
      chg['city'] = area.city - rCity;
      
    return chg;
  
  },
  current: function(chg, key, val) {
    this.current = {};
    if (!key) { this.current = this.initial; return; }
    var RTRIBE = this.opts.tribe_reduce || 1;
    var RCITY = this.opts.city_reduce;
    
    var curArea = this.map[key];
    var lowestTribe = 999;
    var biggestCity = -1;
    _.each(this.initial, function(i, ik) {
      ik = parseInt(ik);
      if (_.contains(curArea.neighbours, ik))
      {
        if (_.has(this.values, ik)) return false;
        
        var itribes = i.tribes || 0;
        var icity = i.city || 0;
        
        // Attack does not enter empty regions
        if (itribes == 0 && icity == 0)
          return;
        
        if (itribes > 0 && itribes < lowestTribe) {
          this.current = {};
          biggestCity = -1;
        }
        if (itribes > 0 && lowestTribe == 0)
        {
          lowestTribe = 999;
          this.current = {};
        }
        
        if ((itribes > 0 && itribes <= lowestTribe) ||
          (itribes == 0 && (lowestTribe == 0 || lowestTribe == 999) ))
        {
          if (icity > 0 && icity > biggestCity) this.current = {};
          if ((icity || 0) >= biggestCity) {
            // This is the area they are going to,
            // can the attack force do any damage?
            if (!(itribes >= 1 && this.amount < RTRIBE) && !(
                itribes == 0 && icity >= 1 && this.amount < RCITY
              ))
              this.current[ik] = i;
            lowestTribe = itribes;
            biggestCity = icity || 0;
          }
        }
      }
    }, this);
  }
};


module.exports = {
    attack: function() {
      var ctx = this;
      var initial = _.clone(this.engine.map.areas);
      initial.gold = this.engine.gold;
      if (ctx.changes.gold)
        initial.gold += parseInt(ctx.changes.gold.replace('+',''));
      var opts = {
        map: this.engine.map.areas,
        initial: initial,
        pre: [this.active_region.id],
        tribe_reduce: tribe_reduce,
        city_reduce: city_reduce,
        gold_reduce: gold_reduce,
        shows: ['tribes', 'city', 'gold'],
        edits: [],
        amount: attack_force,
        current: AttackReducer.current,
        reduce: AttackReducer.reduce,
      }
      var rdc = new reducer.Reducer(opts);
      ctx.engine.reducer(rdc, function(chg) {
          ctx.merge(chg);
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
