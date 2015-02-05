module.exports = {
    name: "common_tongue",
    title: "Common Tongue",
    description: "Decimate 2 Tribes to Build a City instead of 4.",
    points: 10,
    cost: { 'tribes': 6 },
    resources: [ 'food' ],
    requires: [ 'roadbuilding' ],
    required_by: [ ],
    events: { },
    phases: { },
    acquired: function() {
        this.params.city_cost = 2;
        console.log("City cost is now "+this.params.city_cost )
    },
    actions: { },
}