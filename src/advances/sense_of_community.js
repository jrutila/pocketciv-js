module.exports = {
    name: "sense_of_community",
    title: "Sense of Community",
    points: 6,
    cost: { 'tribes': 3 },
    resources: [ 'wood' ],
    requires: [ ],
    required_by: [ 'government' ],
    events: {
        'tribal_war': {
            'steps': {
                '2.1.1': "+ If you have {{ adv:sense_of_community }}, do not multiply the \
                the Warring Tribes amount by 2. {% warring_tribes = warring_tribes / 2 %}"
            }
        }
    },
    actions: { },
}