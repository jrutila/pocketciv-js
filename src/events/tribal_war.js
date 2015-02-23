var reducer = require('../core/reducer')
var _ = require('underscore')

module.exports = {
    name: 'tribal_war',
    title: 'Tribal War',
    punchline: 'What did you say?',
    description: "",
    steps: {
            '1': "Draw the next card.{%; area_card() %} Circle denotes the Active Region {{ active_region }}.",
            '1.1': "Disregard event if there is no tribes. \
                    {% break_if(active_region.tribes == 0) %}",
            '2': "The amount of Tribes in the Active Region \
                becomes the base Warring Tribes amount \
                {% warring_tribes = active_region.tribes %} ({{ warring_tribes }})",
            '2.1': "Multiply the base Warring Tribes amount by 2.\
                {% warring_tribes = warring_tribes * 2 %} \
                ",
            '3.1': "Select two neighboring regions with tribes (if possible).\
                {% neighbourCount = 2 %} {%; selectAreas() %}",
            '3.2': "Reduce Neighboring Tribes by the amount of \
                    Warring Tribes {{ warring_tribes }}",
            '4': "Reduce Tribes in Active Region by 3.\
                 {% change({ 'tribes': '-3' }) %}"
    },
    selectAreas: function() {
        var ctx = this;
        var initial = {};
        _.each(_.pick(this.engine.map.areas, this.active_region.neighbours), function(a, k) {
            if (a.tribes > 0)
                initial[k] = a;
        });
        var opts = {
            initial: initial,
            map: this.engine.map.areas,
            amount: 2,
            shows: ['tribes'],
            edits: [],
            warring_tribes: warring_tribes,
            reduce: function(key) {
                if (!_.has(this.initial, key))
                    return false;
                this.amount--;
                if (this.amount < 0) return false;
                var trg = Math.max(this.initial[key].tribes - this.opts.warring_tribes, 0);
                return { 'tribes': trg };
            },
            check: function() {
                return this._defaultCheck() ||
                _.size(this.initial) == 0 ||
                (_.size(this.initial) == 1 && this.amount == 1);
            }
        };
        var rdc = new reducer.Reducer(opts);
        ctx.engine.reducer(rdc, function(chg) {
            ctx.changes = chg;
            ctx.done && ctx.done();
        });
    }
}