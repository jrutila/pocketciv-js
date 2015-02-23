module.exports = {
    name: "law",
    title: "Law",
    description: "You may discard the Culture of Thievery and Black \
    Food Market advances when you acquire Law.",
    points: 10,
    cost: { 'tribes': 5, 'gold': 6 },
    resources: [ 'wood', 'stone' ],
    requires: [ 'government', 'philosophy' ],
    required_by: [ ],
    events: {
        'anarchy': {
            'steps': {
                // TODO:
            }
        },
        'corruption': {
            'steps': {
                // TODO:
            }
        },
        'uprising': {
            'steps': {
                // TODO:
            }
        },
        'civil_war': {
            'steps': {
                // TODO:
            }
        },
    },
    acquired: function() {
        // TODO: Ask for discarding Thievery and Black Market
    },
    phases: { },
    actions: { },
}