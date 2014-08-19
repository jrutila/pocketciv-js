module.exports = {
    name: "architecture",
    title: "Architecture",
    points: 8,
    cost: { 'tribes': 6, 'gold': 6 },
    resources: [ 'stone', 'wood' ],
    requires: [ 'engineering' ],
    required_by: [ ],
    events: { },
    phases: {
        'city_advance.pre': function(ctx) {
            console.log('Architecture max city 4')
            this.max_city = !this.max_city || this.max_city < 4 ? 4 : this.max_city;
            ctx.done && ctx.done();
        }
    },
    actions: {
    }
}