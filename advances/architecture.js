module.exports = {
    name: "architecture",
    title: "Architecture",
    points: 8,
    cost: { 'tribes': 6, 'gold': 6 },
    resources: [ 'stone', 'wood' ],
    requires: [ 'engineering' ],
    required_by: [ ],
    events: {
        'civil_war': {
            'steps': {
                '2.4': "+ If you have {{ adv:architecture }}, City AV reductions are reduced by 1 \
                {% activeCityReduce++; neighbourCityReduce++ %}"
            }
        }
    },
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