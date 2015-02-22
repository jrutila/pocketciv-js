module.exports = {
    name: "culture_of_thievery",
    title: "Culture of Thievery",
    description: "During Upkeep, if random Region has a Tribe, \
Decimated, draw next Event for Additional Gold.\
You may draw for additional Gold during Visitations at\
the risk turning the Visitation into an Attack.\
You may discard the Culture of Thievery advance\
when you acquire Civil Service or Law.",
    points: 1,
    cost: { },
    resources: [ ],
    requires: [ ],
    required_by: [ 'black_market' ],
    events: { },
    phases: {
        'violent_profits': {
            'run': function(ctx) {
                var engine = this;
                engine.draw(function(c) {
                    var area = engine.map.areas[c.circle];
                    if (area && area.tribes > 0)
                    {
                        engine.draw(function(gc) {
                            ctx.changes = {};
                            if (gc.gold > 0)
                                ctx.changes['gold'] = '+'+gc.gold;
                            ctx.changes[c.circle] = { 'tribes': '-1' };
                            ctx.done && ctx.done();
                        });
                    } else
                        ctx.done && ctx.done();
                });
            }
        }
    },
    acquired: function() {
        if (this.phases.indexOf('violent_profits') == -1) {
            this.phases.splice(this.phases.indexOf('gold_decimate')+1, 0, 'violent_profits')
            console.log("Added violent_profits to phases "+this.phases)
        }
    },
    actions: { },
}