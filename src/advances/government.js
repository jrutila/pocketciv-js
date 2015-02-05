module.exports = {
    name: "government",
    title: "Government",
    points: 8,
    cost: { 'tribes': 4 },
    resources: [ 'food' ],
    requires: [ 'sense_of_community' ],
    required_by: [ 'diplomacy' ],
    events: {
        'tribal_war': {
            'steps': {
                '0': "+ If you have {{ adv:government }}, disregard Tribal War.\
                {% break_if(true) %}"
            }
        },
        'corruption': {
            'steps': {
                '1.1': "- If you have {{ adv:government }}, add 3 to your corruption value.\
                {% corruption = corruption + 3 %}"
            }
        }
    },
    actions: { },
}