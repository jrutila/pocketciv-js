module.exports = {
    name: "music",
    title: "Music",
    points: 3,
    cost: { 'tribes': 1 },
    resources: [ 'wood' ],
    requires: [ ],
    required_by: [ 'arts', 'theater' ],
    events: {
        'tribal_war': {
            'steps': {
                '3.1.1': "+ If you have {{ adv:music }}, select one Neighboring area.\
                {% neighbourCount = 1 %}",
                '4.1': "+ If you have {{ adv:music }}, Reduce Tribes in Active Region by 1.\
                 {% change({ 'tribes': '-1' }) %}"
            }
        }
    },
    actions: { },
}