module.exports = {
    name: "engineering",
    title: "Engineering",
    points: 5,
    cost: { 'tribes': 3 },
    resources: [ 'stone', 'wood' ],
    requires: [ 'masonry' ],
    required_by: [ 'architecture' ],
    events: { },
    phases: {
        'city_advance.pre': function(ctx) {
            console.log('Engineering max city 3')
            this.max_city = this.max_city < 3 ? 3 : this.max_city;
            ctx.done && ctx.done();
        }
    },
    actions: {
    }
}