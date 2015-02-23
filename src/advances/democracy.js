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
                '3.2': "+ If you have {{ adv:democracy }}, reduce the value of the \
                        Attacking Force by one BLUE HEX \
                        {% attack_force -= card_value('h') %}"
            }
        },
    },
    actions: { },
}