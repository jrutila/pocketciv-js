module.exports = {
    name: "written_record",
    title: "Written Record",
    description: "Add 4 to the amount of Advances you may use when \
                    determining Glory at the end of an Era",
    points: 5,
    cost: { 'tribes': 2, 'gold': 1 },
    resources: [ 'stone', 'wood' ],
    requires: [ 'literacy' ],
    required_by: [ ],
    events: { },
    phases: {
        'glory': {
            // TODO: Add 4 to the amount of advances
        }
    },
    actions: { }
}