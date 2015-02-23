module.exports = {
    name: "mythology",
    title: "Mythology",
    points: 2,
    cost: { 'tribes': 2 },
    resources: [ 'food' ],
    requires: [ ],
    required_by: [ 'meditation', 'org_religion' ],
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