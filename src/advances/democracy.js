var reducer = require('../core/reducer');

module.exports = {
    name: "democracy",
    title: "Democracy",
    points: 12,
    cost: { 'tribes': 4, 'gold': 6 },
    resources: [ 'wood', 'stone' ],
    requires: [ 'government' ],
    required_by: [ 'civil_service' ],
    events: {
        'uprising': {
            'steps': {
                // TODO:
            },
        },
        'bandits': {
            'steps': {
                // TODO:
            },
        },
    },
    actions: { },
}