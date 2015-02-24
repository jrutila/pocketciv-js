module.exports = {
    name: "military",
    title: "Military",
    description: "Single Tribes count as 2 Tribes during Attacks",
    points: 8,
    cost: { 'tribes': 4, 'gold': 3 },
    resources: [ 'stone', 'food' ],
    requires: [ 'government' ],
    required_by: [ 'centralized_government' ],
    events: {
        'attack': {
            'steps': {
                '3.1': "+ If you have {{ adv:military }}, \
                Reduce 2 Attacking Force by reducing 1 Tribe. {% tribe_reduce = 2; has_mm = false; %}",
                '3.3': "+ If you have both {{ adv:military }} and {{ adv:metal_working }}, \
                Reduce 3 Attacking Force by reducing 1 Tribe. \
                {% if (has_mm) tribe_reduce = 3 %}"
            }
        },
        'civil_war': {
            'steps': {
                '2.1': "- If you have {{ adv:military }}, Reduce City AV in \
                        Neighboring Regions by 3 instead of 2.\
                        {% neighbourCityReduce = -3 %}"
            }
        },
    },
    acquired: function() { },
    phases: { },
    actions: { }
}