var reducer = require("../core/reducer");
var _ = require("underscore");

module.exports = {
    name: "roadbuilding",
    title: "Roadbuilding",
    description: "Tribes may move across two borders",
    points: 6,
    cost: { 'tribes': 1 },
    resources: [ 'stone', 'wood' ],
    requires: [ 'cartage' ],
    required_by: [ 'common_tongue' ],
    events: {
        'epidemic': {
            'steps': {
                    '2.2': "- If you have {{ adv:roadbuilding }} or {{ adv:equestrian }}\
                    Epidemics continue through Regions with no Tribes. {% skipempty = true %}"
                }
            }
        },
    actions: { },
    phases: { },
    acquired: function() {
        if (!this.params.moveLimit || this.params.moveLimit < 2)
            this.params.moveLimit = 2;
    },
}