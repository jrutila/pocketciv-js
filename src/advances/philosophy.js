module.exports = {
    name: "philosophy",
    title: "Philosophy",
    points: 12,
    cost: { 'tribes': 6 },
    resources: [ 'food' ],
    requires: [ 'meditation' ],
    required_by: [ 'law' ],
    events: {
        'visitation': {
            'steps': {
                // TODO:
            }
        }
    },
    phases: { },
    actions: { }
}