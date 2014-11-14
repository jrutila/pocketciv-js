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
                '2': "- If you have {{ adv:slave_labor }}, Draw the next card {%; draw_card() %}. \
                       Reduce Tribes throughout your Empire an \
                       additional amount as shown in the RED CIRCLE. \
                       {%; reduce('tribes', card_value('c')) %}"
            }
        },
        'uprising': {
            'steps': {
                '3': "- If you have {{ adv:slave_labor }}, Decimate farms in areas that have no cities.\
                     {% reduceFarms() %}"
            },
            reduceFarms: function() {
                
            }
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