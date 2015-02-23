module.exports = {
    name: "meditation",
    title: "Meditation",
    points: 4,
    cost: { 'tribes': 3 },
    resources: [ 'food', 'wood' ],
    requires: [ 'mythology' ],
    required_by: [ 'philosophy' ],
    events: {
        'civil_war': {
            'steps': {
                // TODO:
            }
        },
        'superstition': {
            'steps': {
                // TODO:
            }
        }
    },
    phases: { },
    actions: { }
}