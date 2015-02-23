module.exports = {
    name: "patronge",
    title: "Patronage",
    points: 8,
    cost: { 'tribes': 6, 'gold': 5 },
    resources: [ 'food', 'stone' ],
    requires: [ 'arts', 'theater' ],
    required_by: [ ],
    events: { },
    phases: {
        'gold_management': {
            // TODO: For every city you have over 4 collect 1 gold
        }
    },
    actions: { }
}