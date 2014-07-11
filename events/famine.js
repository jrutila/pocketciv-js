module.exports = {
    name: 'famine',
    title: 'Famine',
    punchline: 'Famine is upon us!',
    description: "",
    steps: {
            '1': "{%; area_card() %}",
            '2.1': "In {{ Active Region|active_region }}, Decimate Tribes and Farms. Reduce City AV by 2. {% change({ tribes: '0', farm: false, city: '-2' }) %}",
    }
}