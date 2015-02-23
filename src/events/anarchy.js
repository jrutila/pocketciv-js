module.exports = {
    name: 'anarchy',
    title: 'Anarchy',
    punchline: 'We are tired of those cities!',
    description: "",
    steps: {
            '1': "In any Region {% active_regions(function(a) { return a.city > 0 && a.tribes > a.city }) %} \
            where the amount of Tribes is greater \
            than the City AV, Reduce the City AV by 1 and \
            Reduce Tribes by 3. Continue to Reduce Tribes and \
            City AV’s this way until the City AV is 1, or until \
            amount of Tribes is less than the City AV.\
            {% tribeCount = 3 %}",
            '-': "{% reduceAreas() %}"
    },
    reduceAreas: function() {
        for (var ar in this.active_region)
        {
            var area = this.active_region[ar];
            // Org religion might have areas with no cities on them
            if (area.city >= area.tribes || area.city == 0 || area.city == undefined)
                continue;
                
            // Law
            if (typeof(hasLaw) != "undefined" && hasLaw)
            {
                this.change({'tribes': (-1*area.city).toString() }, area.id)
                continue;
            }
                
            var chg = { 'tribes': 0, 'city': 0 }
            do
            {
                chg.tribes -= tribeCount;
                chg.city -= 1;
            } while (area.city + chg.city > 1 && area.tribes + chg.tribes > area.city + chg.city)
            
            chg.tribes = chg.tribes.toString()
            chg.city = chg.city.toString()
            
            this.change(chg, area.id)
        }
    }
}