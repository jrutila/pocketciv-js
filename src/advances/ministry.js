module.exports = {
    name: "ministry",
    title: "Ministry",
    points: 10,
    cost: { 'tribes': 2, 'gold': 8 },
    resources: [ 'stone', 'wood', 'food' ],
    requires: [ 'org_religion' ],
    required_by: [ ],
    events: {
        'attack': {
            'steps': {
                // TODO:
            }
        },
    },
    phases: { },
    actions: { }
}