var reducer = require("../core/reducer");
var _ = require('underscore')

module.exports = {
    name: "slave_labor",
    title: "Slave Labor",
    description: "During Upkeep, you can increase one City AV by 1. \
The maximum AV of a City is 2, unless otherwise noted.",
    points: 1,
    cost: { },
    resources: [ 'food' ],
    requires: [ ],
    required_by: [ ],
    events: {
        'anarchy': {
            'steps': {
                '3': "- If you have {{ adv:slave_labor }}, Draw the next card {%; draw_card() %}. \
                       Reduce Tribes throughout your Empire an \
                       additional amount as shown in the RED CIRCLE. \
                       {%; reduceTribes(card_value('c')) %}"
            },
            reduceTribes: function(amount) {
                console.log("reduceTribes")
                var ctx = this;
                var opts = reducer.Templates.basic(ctx, ['tribes']);
                _.each(opts.initial, function(i,ik) {
                    if (ctx.ctx.targets[ik])
                        i.tribes = ctx.ctx.targets[ik].tribes;
                });
                console.log(opts.initial)
                opts.amount = amount;
                ctx.engine.reducer(new reducer.Reducer(opts), function(ok) {
                    ctx.change(ok.changes);
                    ctx.done && ctx.done();
                });
            }
        },
        'uprising': {
            'steps': {
                '3': "- If you have {{ adv:slave_labor }}, Decimate farms in areas that have no cities.\
                     {% reduceFarms() %}"
            },
            reduceFarms: function() {
                var ctx = this;
                _.each(this.engine.map.areas, function(area, ak) {
                    if (!area.city && area.farm)
                        ctx.change({ 'farm': false }, parseInt(ak));
                },this);
            }
        },
        'bandits': {
            'steps': {
                '3.4': "- If you have {{ adv:slave_labor }}, increase the value of the \
                        Attacking Force by one BLUE HEX \
                        {% attack_force += card_value('h') %}"
            }
        },
    },
    acquired: function() {
        console.log('Slave labor max city 2')
        this.params.max_city = !this.params.max_city || this.params.max_city < 2 ? 2 : this.params.max_city;
        if (this.params.city_advance_limit === undefined)
            this.params.city_advance_limit = 1;
        else
            this.params.city_advance_limit++;
        console.log('Slave labor city advance limit is now '+this.params.city_advance_limit)
    },
    phases: { },
    actions: { },
}