module.exports = {
    name: 'anarchy',
    title: 'Anarchy',
    punchline: 'We are tired of those cities!',
    description: "",
    steps: {
            '1': "In any Region {% active_regions(function(a) { return a.city > 0 && a.tribes > a.city }) %} \
            where the amount of Tribes is greater \
            than the City AV, Reduce the City AV by 1 and \
            Reduce Tribes by 3. {% tribeCount = 3 %}",
            '2': "Continue to Reduce Tribes and \
            City AV’s this way until the City AV is 1, or until \
            amount of Tribes is less than the City AV.{% reduceAreas() %}"
    },
    reduceAreas: function() {
        for (var ar in this.active_region)
        {
            var area = this.active_region[ar];
                
            // Law
            if (typeof(hasLaw) != "undefined" && hasLaw)
            {
                this.change({'tribes': (-1*area.city).toString() }, ar)
                continue;
            }
            
            var rTribes = area.tribes || 0;
            var rCity = area.city || 0;
            
            
            if (rTribes == 0 || rCity == 0) continue;
            
            while (rTribes > rCity && rCity > 0 && rTribes > 0) {
                rTribes -= Math.min(tribeCount, rTribes);
                rCity--;
            }
            
            var chg = {};
                
            chg.tribes = (rTribes - area.tribes).toString();
            chg.city = (rCity - area.city).toString();
            
            this.change(chg, ar)
        }
    }
}