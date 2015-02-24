var reducer = require("../core/reducer");

module.exports = {
    name: "military",
    title: "Military",
    description: "Single Tribes count as 2 Tribes during Attacks",
    points: 8,
    cost: { 'tribes': 4, 'gold': 3 },
    resources: [ 'stone', 'food' ],
    requires: [ 'government' ],
    required_by: [ 'centralized_government' ],
    events: {
        'attack': {
            'steps': {
                '3.1': "+ If you have {{ adv:military }}, \
                Reduce 2 Attacking Force by reducing 1 Tribe. {% tribe_reduce = 2; has_mm = false; %}",
                '3.3': "+ If you have both {{ adv:military }} and {{ adv:metal_working }}, \
                Reduce 3 Attacking Force by reducing 1 Tribe. \
                {% if (has_mm) tribe_reduce = 3 %}"
            }
        },
        'civil_war': {
            'steps': {
                '2.1': "- If you have {{ adv:military }}, Reduce City AV in \
                        Neighboring Regions by 3 instead of 2.\
                        {% neighbourCityReduce = -3 %}"
            }
        },
        'uprising': {
            'steps': {
                '4': "- If you have {{ adv:military }}, Select a Neighboring \
Region with a City. Reduce Neighboring City \
AV by 1. Decimate Tribes in selected \
Neighboring Region, unless you have \
Organized Religion, then reduce Neighboring Tribes by 2.\
{%; reduceNeighbour() %}"
            },
            reduceNeighbour: function() {
                var ctx = this;
                var engine = this.engine;
                var initial = _.pick(engine.map.areas, function(area, ak) {
                    ak = parseInt(ak);
                    return (_.contains(this.active_region.neighbours, ak) &&
                        area.city > 0);
                        
                },this);
                var opts = reducer.Templates.basic(ctx, ['city']);
                opts.initial = initial;
                opts.tribeChange = tribeChange;
                opts.amount = 1;
                opts.edits = [];
                opts.shows = ['city', 'tribes'];
                opts.reduce = function(key) {
                    this.amount--;
                    var ret = { 'city': this.initial[key].city-1 };
                    if (this.opts.tribeChange == "0")
                        ret.tribes = 0;
                    else
                        ret.tribes = this.initial[key].tribes + parseInt(this.opts.tribeChange);
                    return ret;
                }
                engine.reducer(new reducer.Reducer(opts), function(chg) {
                    ctx.merge(chg);
                    ctx.done && ctx.done();
                });
            }
        }
    },
    acquired: function() { },
    phases: { },
    actions: { }
}