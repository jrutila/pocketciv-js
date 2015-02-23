module.exports = {
    name: "org_religion",
    title: "Organized Religion",
    points: 8,
    cost: { 'tribes': 6, 'gold': 6 },
    resources: [ 'stone', 'wood' ],
    requires: [ 'mythology' ],
    required_by: [ 'ministry' ],
    events: {
        'uprising': {
            'steps': {
                // TODO:
            }
        },
        'anarchy': {
            'steps': {
                // TODO:
            }
        }
    },
    phases: { },
    actions: { }
}