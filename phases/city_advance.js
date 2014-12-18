var reducer = require("../core/reducer");
var _ = require('underscore')

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
      t -= c - (this.advance_discount > 0 ? this.advance_discount : 0);
      if (t < 0) return false;
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

module.exports = {
    run: function(ctx) {
        console.log("Max city is " + this.params.max_city)
        console.log("Max city advance is " + this.params.city_advance_limit)
        console.log("City advance discount is " + this.params.city_advance_discount)
        ctx.changes = {};
        if (this.params.city_advance_limit && this.params.max_city > 1) {
            var rdc = new reducer.Reducer(this);
            rdc.mode = reducer.Modes.Overall;
            rdc.max_city = this.params.max_city
            rdc.advance_discount = this.params.city_advance_discount;
            rdc.startAmount = -1 * this.params.city_advance_limit;
            rdc.areas = CityAdvance.areas
            rdc.reduce = CityAdvance.reduce

            if (_.isEmpty(rdc.ok({}).areas)) {
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