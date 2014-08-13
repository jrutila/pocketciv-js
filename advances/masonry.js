module.exports = {
    name: "masonry",
    title: "Masonry",
    points: 3,
    cost: { 'tribes': 2 },
    resources: [ 'stone' ],
    requires: [ ],
    required_by: [ 'engineering' ],
    events: { },
    phases: {
        'city_advance.pre': function(ctx) {
            console.log('Masonry max city 2')
            this.max_city = this.max_city < 2 ? 2 : this.max_city;
            ctx.done && ctx.done();
        }
    },
    actions: {
    }
}