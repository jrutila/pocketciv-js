module.exports = {
    name: "arts",
    title: "Arts",
    points: 10,
    cost: { 'tribes': 6 },
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