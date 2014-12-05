module.exports = {
    name: "masonry",
    title: "Masonry",
    description: "During Upkeep, you can increase one City AV by 1. \
The maximum AV of a City is 2, unless otherwise noted.",
    points: 3,
    cost: { 'tribes': 2 },
    resources: [ 'stone' ],
    requires: [ ],
    required_by: [ 'engineering' ],
    events: { },
    phases: {
        'city_advance.pre': function(ctx) {
            console.log('Masonry max city 2')
            this.max_city = !this.max_city || this.max_city < 2 ? 2 : this.max_city;
            if (this.round.city_advance_limit === undefined)
                this.round.city_advance_limit = 1;
            else
                this.round.city_advance_limit++;
            ctx.done && ctx.done();
        }
    },
    actions: {
    }
}