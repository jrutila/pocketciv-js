var reducer = require('../core/reducer')
var _ = require('underscore')
module.exports = {
    name: 'epidemic',
    title: 'Epidemic',
    punchline: 'Interesting rash you have there...',
    description: "",
    steps: {
      '1': "{%; area_card() %}",
      '2': " Draw the next {{ Event Card| {%; draw_card() %} }}. Based on the symbols on \
      the right side of the Event box of the ORIGINAL \
      Epidemic Event, add up the values in the same symbols on the newly drawn card.",
      '2.1': "Starting with the Active \
      Region, and working your way through Neighboring \
      Regions, Decimate Tribes equal to the amount of \
      Population Loss. Tribes in Regions must be fully \
      Decimated before moving on to a new Region. \
      {% population_loss = card_value(event.expr) %}",
      '3': "You must Reduce as many Tribes as possible until you \
      have reached the Population Loss value, you have 2 \
      Tribes remaining in your Empire. \
      {%; reduce() %}"
    },
    reduce: function() {
      var rdc = new reducer.Reducer(this.engine)
      console.log('Current area '+this.active_region.id)
      rdc.startRegion = this.active_region
      console.log('Population loss '+population_loss)
      rdc.startAmount = population_loss
      rdc.initValues = {
        tribeCount: this.engine.map.tribeCount-2
      }
      console.log(rdc.initValues)
      rdc.reduce = function(area) {
        if (area.tribes == 0)
        {
          this.amount = 0;
          return;
        }
        var rTrb = Math.min(area.tribes, this.amount, this.tribeCount);
        this.tribeCount -= rTrb;
        //if (this.engine.map.tribeCount - (this.original_amount - this.amount - rTrb) <= 2)
        this.amount -= rTrb;
        if (this.tribeCount === 0)
        {
          this.amount = 0;
        }
        console.log('Reduce area '+area.id+' with '+rTrb)
        console.log('Loss left: '+this.amount)
        return { 'tribes': (area.tribes - rTrb).toString() }
      }
      rdc.areas = function() {
        var unvisitedngh = _.difference(this.currentArea.neighbours, this.visited)
        var areas = {}
        _.each(this.engine.map.areas, function(area, key) {
          if (unvisitedngh.indexOf(parseInt(key)) > -1)
          {
            if (area.tribes > 0)
              areas[key] = area;
          }
        });
        console.log('Possible ares to '+this.currentArea.id+' are ')
        console.log(areas)
        return areas;
        //return this.engine.map.areas;
      }
      var ctx = this;
      ctx.engine.reducer(rdc, function(chg) {
          ctx.changes = chg;
          ctx.done && ctx.done();
      });
    }
}
