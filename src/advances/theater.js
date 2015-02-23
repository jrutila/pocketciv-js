module.exports = {
    name: "theater",
    title: "Theater",
    points: 10,
    cost: { 'tribes': 6, 'gold': 3 },
    resources: [ 'wood' ],
    requires: [ ['literacy', 'music'] ],
    required_by: [ 'patronage' ],
    events: {
        'civil_war': {
            'steps': {
                // TODO:
            }
        }
    },
    phases: { },
    actions: { }
}