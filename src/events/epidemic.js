var reducer = require('../core/reducer')
var _ = require('underscore')
module.exports = {
    name: 'epidemic',
    title: 'Epidemic',
    punchline: 'Interesting rash you have there...',
    description: "",
    steps: {
      '1': "Draw the next card.{%; area_card() %} Circle denotes the Active Region {{ active_region }}.",
      '1.1': " If the Active \
      Region has no Tribes, disregard the Epidemic Event \
      {% break_if(! active_region.tribes) %}",
      '2': " Draw the next Event Card {%; draw_card() %}. Based on the symbols on \
      {% population_loss = card_value(event.expr) %} \
      the original Event card ({{ event.expr }}) calculate your Population loss ({{ population_loss }}).",
      '2.1': "Starting with the Active \
      Region {{ active_region }}, and working your way through Neighboring \
      Regions, Decimate Tribes equal to the amount of \
      Population Loss. Tribes in Regions must be fully \
      Decimated before moving on to a new Region.",
      '3': "You must Reduce as many Tribes as possible until you \
      have reached the Population Loss ({{ population_loss }}) value, or you have 2 \
      Tribes remaining in your Empire. \
      {%; reduce() %}"
    },
    reduce: function() {
      if (typeof(skipempty) === 'undefined') skipempty = false;
      var opts = {
        initial: this.engine.map.areas,
        map: this.engine.map.areas,
        amount: Math.min(population_loss, this.engine.map.tribeCount-2),
        decimateCities: typeof decimate_empty_cities != "undefined",
        pre: [this.active_region.id],
        shows: ['tribes', 'city'],
        edits: [],
        skip_empty: skipempty,
        reduce: function(key) {
          var r = Math.min(this.initial[key].tribes, this.amount);
          this.amount -= r;
          
          var ret = { 'tribes': this.initial[key].tribes - r };
          // If all tribes are decimated
          if (this.initial[key].city > 0 && this.opts.decimateCities && this.initial[key].tribes == r)
            ret.city = Math.max(this.initial[key].city-2, 0)
          return ret;
        },
        current: function(chg, key, val) {
          this.current = {};
          if (key == undefined) return;
          _.each(this.initial, function(i, ik) {
            ik = parseInt(ik);
            if (_.contains(this.map[key].neighbours, ik))
                if (i.tribes > 0 && !_.contains(chg, ik))
                  this.current[ik] = i;
          }, this);
          
        },
      }
      var rdc = new reducer.Reducer(opts);
      var ctx = this;
      ctx.engine.reducer(rdc, function(chg) {
          ctx.changes = chg;
          ctx.done && ctx.done();
      });
    }
}
