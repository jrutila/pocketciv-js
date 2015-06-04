var reducer = require('../core/reducer');
var _ = require("underscore");

module.exports = {
    run: function(ctx) {
        if (this.map.tribeCount >= 3)
        {
            ctx.done && ctx.done();
            return;
        }
            
        console.log("Getting to three tribes");
        var initial = _.pick(this.map.areas, function(area) {
            return area.city > 0;
        });
        
        if (_.size(initial) == 0)
        {
            ctx.done && ctx.done();
            return;
        }
        
        _.each(initial, function(i) {
            if (i.tribes == undefined) i.tribes = 0;
        })
        
        var opts = {
            map: this.map.areas,
            initial: initial,
            shows: ['tribes', 'city'],
            edits: ['tribes'],
            amount: 3-this.map.tribeCount,
            reduce: function(key, chg) {
                this.amount -= chg.tribes - this.initial[key].tribes;
                return { 'tribes': chg.tribes };
            }
        }
        if (opts.amount >= 0)
            this.reducer(new reducer.Reducer(opts), function(rdc) {
                ctx.target(rdc.target);
                ctx.done && ctx.done();
            });
        else
            ctx.done && ctx.done();
    }
};