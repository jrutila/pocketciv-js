module.exports = {
    name: "slave_labor",
    title: "Slave Labor",
    points: 1,
    cost: { },
    resources: [ 'food' ],
    requires: [ ],
    required_by: [ 'government' ],
    events: {
        'anarchy': {
            'steps': {
            }
        },
        'uprising': {
            
        },
        'bandits': {
            
        }
    },
    phases: {
        'city_advance.pre': function(ctx) {
            console.log('Slave labor max city 2')
            this.max_city = !this.max_city || this.max_city < 2 ? 2 : this.max_city;
            if (this.round.city_advance_limit === undefined)
                this.round.city_advance_limit = 1;
            else
                this.round.city_advance_limit++;
            ctx.done && ctx.done();
        }
    },
    actions: { },
}