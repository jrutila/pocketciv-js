module.exports = {
    name: "shipping",
    title: "Shipping",
    points: 8,
    cost: { 'tribes': 4, 'gold': 2 },
    resources: [ 'wood' ],
    requires: [ ['navigation', 'fishing'] ],
    required_by: [],
    events: {
        'trade': {
            'steps': {
                // TODO:
            }
        }
    },
    phases: { },
    actions: { }
}