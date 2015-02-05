module.exports = {
    name: "literacy",
    title: "Literacy",
    points: 3,
    cost: { 'tribes': 2 },
    resources: [ 'wood' ],
    requires: [ ],
    required_by: [ 'written_record', 'medicine', 'arts', 'theater'  ],
    events: {
        'anarchy': {
            'steps': {
                '1.1': "+ If you have {{ adv:literacy }}, Reduce tribes by 5\
                instead of 3.{% tribeCount = 5 %}",
            }
        },
        'corruption': {
            'steps': {
                '1.2': "+ If you have {{ adv:literacy }}, divide your level\
                of Corruption in half, round down.\
                {% corruption = Math.floor(corruption / 2) %}"
            }
        },
    },
    actions: { }
}