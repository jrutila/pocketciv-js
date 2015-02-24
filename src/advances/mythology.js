module.exports = {
    name: "mythology",
    title: "Mythology",
    points: 2,
    cost: { 'tribes': 2 },
    resources: [ 'food' ],
    requires: [ ],
    required_by: [ 'meditation', 'org_religion' ],
    events: {
        'civil_war': {
            'steps': {
                '2.2': "- If you have {{ adv:mythology }}, Reduce City AV in \
                        Active Region by 3 instead of 2.\
                        {% activeCityReduce = -3 %}"
            }
        },
    },
    phases: { },
    actions: { }
}