var _ = require('underscore')

module.exports = {
    name: 'volcano',
    title: 'Volcano',
    punchline: "Lawa eruption",
    description: "",
    steps: {
            '1': "{%; area_card() %} \
            {% change({'volcano': true}) %}",
            '2.1': "If the Active Region has no Mountains or Volcanoes: \
                    Create a new Volcano in the Active Region. \
                    Tribes in the Active Region are reduced to 1. \
                {% if (!active_region.mountain && !active_region.volcano && active_region.tribes) { %} \
                    {% change({ 'tribes': '1' }) %} \
                {% } %}",
            '2.2': " If the Active Region has a Mountain, but no Volcano: \
                Re-draw the Mountain as a Volcano. \
                Reduce City AVs by 2 in the Active Region. \
                Reduce Tribes to 1 in the Active Region. \
                Farms and Wonders are Decimated in the Active Region. \
                {% if (active_region.mountain) { %} \
                    {% change({ 'city': '-2', 'farm': false }) %} \
                    {% if (active_region.tribes) change({ 'tribes': '1' }) %} \
                {% } %} \
                ",
            '2.3': "If the Active Region has a Volcano: \
                Decimate Cities, Farms, Tribes, Forest and Wonders \
                in the Active Region. \
                Create a Desert in the Active Region. \
                In all Neighboring Regions, Reduce Tribes by 2. \
                {% if (active_region.volcano) { %} \
                    {% change({ 'city': '0', 'farm': false, 'tribes': '0', forest: false, 'desert': true }) %} \
                    {% reduceNeighbours() %} \
                {% } %} \
                "
    },
    reduceNeighbours: function() {
        _.each(this.active_region.neighbours, function(n) {
            var area = this.engine.map.areas[n];
            area && this.change({'tribes': '-2'}, area)
        }, this)
    }
}