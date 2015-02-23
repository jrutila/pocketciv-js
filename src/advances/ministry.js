module.exports = {
    name: "ministry",
    title: "Ministry",
    points: 10,
    cost: { 'tribes': 2, 'gold': 8 },
    resources: [ 'stone', 'wood', 'food' ],
    requires: [ 'org_religion' ],
    required_by: [ ],
    events: {
        'attack': {
            'steps': {
                '1': "+ If you have {{ adv:ministry }} draw the next Event \
card {%; draw_card() %} and Reduce the size of the Attack Force by \
the value in the GREEN SQUARE {% attack_force -= card_value('s') %}. Increase \
your amount of Gold by 1 for each Attacking \
Force Reduced in this manner. {% change({'gold': '+'+card_value('s') }, null) %} ",
            }
        },
    },
    phases: { },
    actions: { }
}