var _ = require('underscore')
module.exports = {
    name: "medicine",
    title: "Medicine",
    points: 8,
    cost: { 'tribes': 3, 'gold': 1 },
    resources: [ 'food', 'wood' ],
    requires: [ 'literacy' ],
    required_by: [ ],
    events: {
        'flood': {
            'steps': {
                '4': "+ If you have {{ adv:medicine }}, Create 2 Tribes in each \
                        region affected by the Tsunami.",
                '--': "{% healTribes() %}"
            },
            healTribes: function() {
                console.log("Healing tribes")
                _.forEach(this.changes, function(change, area) {
                    var atrb= this.engine.map.areas[area].tribes;
                    // TODO: Affected so also cities and wonders!
                    if (atrb > 0 && parseInt(change.tribes) < 0)
                        change.tribes = (atrb + parseInt(change.tribes) + 2).toString();
                }, this)
            }
        },
        'epidemic': {
            'steps': {
                '2.3': "+ If you have {{ adv:medicine }}, the amount of \
                Population Loss is divided by 2. You may round down fractions.\
                {% population_loss = Math.floor(population_loss/2) %}"
            }
        },
        'earthquake': {
            'steps': {
                'f4.2': "+ If you have {{ adv:medicine }}, Create 2 Tribes in each \
Affected Regions that had at least 1 Tribe \
Decimated. {% healTribes() %}"
            },
            healTribes: function() {
                _.forEach(this.changes, function(change, area) {
                    var atrb= this.engine.map.areas[area].tribes;
                    if (atrb> 0 && parseInt(change.tribes) < 0)
                        change.tribes = (atrb + parseInt(change.tribes) + 2).toString();
                }, this)
            }
        },
        'volcano': {
            'steps': {
                'f3': "+ If you have {{ adv:medicine }}, Create 1 Tribe in each \
Region that was affected by the Volcano. \
{% healTribes() %}"
            },
            healTribes: function() {
                console.log("Healing tribes")
                _.each(this.ctx.changes, function(change, area) {
                    this.ctx.change(area, {tribes: 1});
                }, this)
            }
        },
        'civil_war': {
            'steps': {
                '4.4': "+ If you have {{ adv:medicine }}, after applying \
                        Collateral Damage create 1 Tribe in each affected \
                        region.{% healTribes() %}"
            },
            healTribes: function() {
                console.log("Healing tribes");
                var affected = _.keys(areas).concat(this.active_region.id);
                _.each(affected, function(a) {
                    var c = {};
                    c[a] = { 'tribes': '+1' };
                    this.merge(c);
                },this);
            }
        }
    },
    phases: {
    },
    actions: {
    }
}