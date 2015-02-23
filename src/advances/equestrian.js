var reducer = require("../core/reducer");
var _ = require("underscore");

module.exports = {
    name: "equestrian",
    title: "Equestrian",
    description: "You may move any Tribe to any Region.",
    points: 8,
    cost: { 'tribes': 6 },
    resources: [ 'food', 'wood' ],
    requires: [ ['agriculture', 'horticulture'] ],
    required_by: [ 'cavalry' ],
    events: {
        'epidemic': {
            'steps': {
                    '2.2': "- If you have {{ adv:roadbuilding }} or {{ adv:equestrian }}\
                    Epidemics continue through Regions with no Tribes. {% skipempty = true %}"
            }
        },
        'attack': {
            'steps': {
                    '5.1': "+ If you have {{ adv:equestrian }} \
                    Reduce strength of Attacking Force by 2 when entering a new \
                    Region with Tribes. {% border_reduce = 2 %}"
            }
        },
    },
    actions: { },
    phases: { },
    acquired: function() {
        this.params.moveLimit = 8;
    },
}