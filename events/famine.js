module.exports = {
    name: 'famine',
    title: 'Famine',
    punchline: 'Famine is upon us!',
    description: "",
    steps: {
            '1': "Draw the next card.{%; area_card() %} \
            Circle denotes the Active Region {{ active_region }}.",
            '2.1': "In Active Region {{ active_region }}, Decimate Tribes and Farms. Reduce City AV by 2. {% change({ tribes: '0', farm: false, city: '-2' }) %}",
    }
}