module.exports = {
    name: "metal_working",
    title: "Metal Working",
    description: "The maximum AV of a City is 3, unless otherwise noted.",
    points: 7,
    cost: { 'tribes': 3 },
    resources: [ 'stone', 'food' ],
    requires: [ 'mining' ],
    required_by: [ 'magnetics', 'machining' ],
    events: { },
    acquired: function() {
        console.log('Metal working max city 3')
        this.params.max_city = !this.params.max_city || this.params.max_city < 3 ? 3 : this.params.max_city;
    },
    phases: { },
    actions: { }
}