module.exports = {
    name: "civil_service",
    title: "Civil Service",
    description: "During Upkeep, you can increase one City AV by 1. \
    You may discard the Culture of Thievery and Black \
    Food Market advances when you acquire Civil Service.",
    points: 15,
    cost: { },
    resources: [ 'wood', 'stone', 'food' ],
    requires: [ 'democracy' ],
    required_by: [ ],
    events: {
        'flood': {
            'steps': {
                '3.2.2': "+ If you have {{ adv:civil_service }}, 1 Tribe = 3 Damage and 1 City AV = 5 Damage.\
                {% dmgTr = 3; dmgCt = 5 %}"
            }
        },
        'civil_war': {
            'steps': {
                '2.3': "+ If you have {{ adv:civil_service }}, Cities cannot be \
                reduced below 1.\
                {% cityMin = 1 %}"
            }
        },
    },
    acquired: function() {
        this.params.city_advance_limit++;
        console.log('Civil Service city advance limit is now '+this.params.city_advance_limit)
        // TODO: Ask for discarding Thievery and Black Market
    },
    phases: { },
    actions: { },
}