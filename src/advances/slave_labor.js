module.exports = {
    name: "slave_labor",
    title: "Slave Labor",
    description: "During Upkeep, you can increase one City AV by 1. \
The maximum AV of a City is 2, unless otherwise noted.",
    points: 1,
    cost: { },
    resources: [ 'food' ],
    requires: [ ],
    required_by: [ ],
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
            'steps': {
                '4.4': "- If you have {{ adv:slave_labor }}, increase the attacking force by one \
                        blue hex. {{ attack_force += card_value('h') }}"
            }
            
        }
    },
    acquired: function() {
        console.log('Slave labor max city 2')
        this.params.max_city = !this.params.max_city || this.params.max_city < 2 ? 2 : this.params.max_city;
        if (this.params.city_advance_limit === undefined)
            this.params.city_advance_limit = 1;
        else
            this.params.city_advance_limit++;
        console.log('Slave labor city advance limit is now '+this.params.city_advance_limit)
    },
    phases: { },
    actions: { },
}