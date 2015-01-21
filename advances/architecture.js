module.exports = {
    name: "architecture",
    title: "Architecture",
    description: "The maximum AV of a City is 4. \
During Attacks, Reduce 8 Attacking Force for every 1 City AV",
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
        },
        'attack': {
            'steps': {
                '4.1': "+ If you have {{ adv:architecture }}, Reduce 8 Attacking Force for every 1 City AV."
            }
        }
    },
    acquired: function() {
        console.log('Architecture max city 4')
        this.params.max_city = !this.params.max_city || this.params.max_city < 4 ? 4 : this.params.max_city;
    },
    phases: { },
    actions: { }
}