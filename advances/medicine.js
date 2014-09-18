module.exports = {
    name: "medicine",
    title: "Medicine",
    points: 8,
    cost: { 'tribes': 3, 'gold': 1 },
    resources: [ 'food', 'wood' ],
    requires: [ 'literacy' ],
    required_by: [ ],
    events: {
        'tsunami': {
        },
        'epidemic': {
        },
        'earthquake': {
            'steps': {
                'f4.2': "+ If you have {{ adv:medicine }}, Create 2 Tribes in each \
Affected Regions that had at least 1 Tribe \
Decimated. {% healTribes() %}"
            },
            healTribes: function() {
                console.log("Healing tribes")
                _.forEach(this.changes, function(change, area) {
                    var atrb= this.engine.map.areas[area].city;
                    if (atrb> 0 && parseInt(change.tribes) < 0)
                        change.tribes = (atrb + parseInt(change.tribes) + 2).toString();
                }, this)
            }
        },
        'volcano': {
        },
        'civil_war': {
        }
    },
    phases: {
    },
    actions: {
    }
}