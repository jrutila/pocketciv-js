var reducer = require("../core/reducer");
var _ = require('underscore')

var CityAdvance = {
  current: function(chg, key, val) {
    if (!key) {
      this.city_amount = this.opts.city_amount;
      
      // Basic case
      this.current = {};
      var anyCity = false;
      _.each(this.initial, function(i, ik) {
        if (i.tribes > 0 || (i.city > 0 && i.city < this.opts.max_city))
          this.current[ik] = i;
        if (i.city > 0)
          anyCity = true;
      }, this);
      if (!anyCity)
        this.current = {};
    }
  },
  check: function() {
    return this.amount == 0;
  },
  reduce: function(key, chg) {
    var ret = {};
    var dcity = chg.city - this.initial[key].city;
    if (chg.city > this.opts.max_city)
      return false;
    var dtribes = chg.tribes - this.initial[key].tribes;
    
    if (dtribes > 0) return false;
    if (dcity < 0) return false;
    
    if (dcity)
    {
      var c = this.initial[key].city;
      while (c < chg.city) {
        // If there is not enough tribes
        c++;
        this.amount += c - (this.opts.discount > 0 ? this.opts.discount : 0);
        this.city_amount--;
      }
      ret.city = chg.city;
    }
    if (this.city_amount < 0) return false;
    if (dtribes) 
    {
      this.amount += dtribes;
      ret.tribes = chg.tribes;
    }
    return ret;
  }
};

module.exports = {
    run: function(ctx) {
        console.log("Max city is " + this.params.max_city)
        console.log("Max city advance is " + this.params.city_advance_limit)
        console.log("City advance discount is " + this.params.city_advance_discount)
        if (this.params.city_advance_limit && this.params.max_city > 1) {
          var opts = {
            map: this.map.areas,
            initial: this.map.areas,
            city_amount: this.params.city_advance_limit,
            amount: 0,
            discount: this.params.city_advance_discount,
            max_city: this.params.max_city,
            shows: ['tribes', 'city'],
            edits: ['tribes', 'city'],
            reduce: CityAdvance.reduce,
            check: CityAdvance.check,
            current: CityAdvance.current,
          }
          var rdc = new reducer.Reducer(opts);
          
          if (_.isEmpty(rdc.ok({}).current)) {
              ctx.done && ctx.done();
          }
          else {
              this.reducer(rdc, function(chg) {
                  ctx.changes = chg;
                  ctx.done && ctx.done();
              });
          }
        }
        else ctx.done && ctx.done();
    },
    CityAdvance: CityAdvance
}