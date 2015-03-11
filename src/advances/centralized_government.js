module.exports = {
    name: "centralized_government",
    title: "Centralized Government",
    description: "Allows for the creation of a Capitol.",
    points: 10,
    cost: { 'tribes': 6, 'gold': 8 },
    resources: [ 'food', 'stone', 'wood' ],
    requires: [ 'military' ],
    required_by: [  ],
    events: { },
    acquired: function() {
        this.params.capitol = true;
    },
}