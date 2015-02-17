module.exports = {
    name: 'uprising',
    title: 'Uprising',
    punchline: 'Rising up?',
    description: "",
    steps: {
            '1': "Draw the next card.{%; area_card() %} Circle denotes the Active Region {{ active_region }}.",
            '2.1': "In Active Region {{ active_region }},\
                    Reduce City AV in Active Region by 2.\
                    Decimate Tribes in the Active Region.\
                    Decimate Farms in Active Region.\
                    {% change({ 'city': '-2', 'tribes': '0', 'farm': false }) %}"
    }
}