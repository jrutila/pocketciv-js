var reducer = require('../core/reducer');

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
        this.reducer(new reducer.Reducer(opts), function(changes) {
            ctx.changes = changes;
            ctx.done && ctx.done();
        });
    }
};