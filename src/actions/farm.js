//var i18n = require('../lib/i18n');
var reducer = require("../core/reducer");
var _ = require("underscore");

module.exports = {
    title: "Create a Farm",
    params: {
        forest_free: false,
    },
    run: function(ctx) {
        var engine = this;
        
        var initial = _.pick(ctx.initial, function(area) {
            return area.tribes >= 2 && !area.farm && (area.forest ||
                    ctx.params.forest_free);
        },this);
        if (ctx.params.forest_free)
        _.each(initial, function(i) {
            if (i.forest)
                i.do_not_use_forest = false;
        });
        
        var opts = {
            map: engine.map.areas,
            initial: initial,
            shows: ['tribes', 'forest'],
            edits: ctx.params.forest_free ? ['id', 'do_not_use_forest'] : [],
            amount: 0,
            reduce: function(key, chg) {
                var forest = false;
                if (ctx.params.forest_free && (chg.do_not_use_forest || !this.initial[key].forest))
                {
                    forest = this.initial[key].forest;
                }
                return { farm: true, forest: forest, tribes: this.initial[key].tribes - 2 };
            },
            check: function() {
                var l = _.size(_.pick(this.targets, function(t, key) {
                    var i = this.initial[key];
                    return !i.farm && t.farm && (
                    !i.forest ||
                    (i.forest && t.forest));
                },this),this);
                if (ctx.params.forest_free && l > 1) return false;
                if (!ctx.params.forest_free && l > 0) return false;
                return true;
            }
        }
        
        engine.reducer(new reducer.Reducer(opts), function(rdc) {
            _.each(rdc.chg, function(val, key) {
                if (_.isArray(rdc.chg)) key = val;
                ctx.target(key, {forest: rdc.target[key].forest });
                ctx.change(key, {tribes: -2 });
                ctx.target(key, {farm: true });
            },this)
            ctx.done && ctx.done();
        });
    }
}
