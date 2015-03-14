var reducer = require("../core/reducer");
var _ = require('underscore')

var CityAdvance = {
  current: function(chg, key, val) {
    if (!key) {
      this.city_amount = this.opts.city_amount;
      this.capitol_used = false;
      this.resource_decimated = false;
      this.cap_amount = undefined;
      
      // Basic case
      this.current = {};
      var anyCity = false;
      _.each(this.initial, function(i, ik) {
        if (i.tribes > 0 || (i.city > 0 && i.city < this.opts.max_city))
          this.current[ik] = i;
        if (i.city > 0)
          anyCity = true;
      }, this);
      if (!anyCity)
        this.current = {};
    }
  },
  check: function() {
    console.log("CA "+this.cap_amount)
    console.log("RD "+this.resource_decimated)
    return (
      this.amount == 0 &&
      (this.resource_decimated == true ||
        (this.resource_decimated == false && this.cap_amount === undefined))
      && (this.cap_amount === undefined || this.cap_amount === 0));
  },
  reduce: function(key, chg) {
    var resources = ['mountain', 'volcano', 'forest', 'farm'];
    var area = this.initial[key];
    
    var pickFalsedResources = function(c) {
      return _.keys(_.pick(c, function(v,k) {
        return _.contains(resources, k) && v == false && area[k] == true;
      }));
    };
    
    var ret = {};
    var dcity = chg.city - area.city;
    var dtribes = chg.tribes - area.tribes;
    
    if (area.city == 0 && dcity > 0) return "musthavecity"; // Can't advance zero
    if (dtribes > 0 || chg.tribes < 0) return false;
    if (dcity < 0 || chg.city < 0) return false;
    
    var fres = pickFalsedResources(chg, area);
    if (fres.length == 1)
    {
      if (this.resource_decimated) return "alreadydecimatedresource";
      this.resource_decimated = true;
      ret[fres[0]] = false;
    }
    
   if (dcity && area.city < this.opts.max_city) {
      var c = area.city;
      while (c < Math.min(chg.city, this.opts.max_city)) {
        // If there is not enough tribes
        c++;
        this.amount += c - (this.opts.discount > 0 ? this.opts.discount : 0);
        this.city_amount--;
        dcity--;
      }
      ret.city = chg.city;
    }
    
    //                  | only one capitol incr per turn
    if (chg.city > 4 && dcity <= 1 && this.opts.capitol && !this.capitol_used) // Capitol
    {
      if (this.capitol_used) return "onlyonecapitol";
      this.capitol_used = true;
      this.resource_decimated = this.resource_decimated || false;
      ret.city = chg.city;
      ret.tribes = chg.tribes;
      
      if (dcity) {
        this.city_amount--;
        this.cap_amount = Math.max(chg.city + dtribes, 0)
        dtribes += chg.city;
      }
    } else if (chg.city > this.opts.max_city)
      return "notvalidcityamount";
      
    if (dtribes) {
      this.amount += dtribes; // + capitolized ? 0 : this.cap_amount;
      ret.tribes = chg.tribes;
    }
      
    if (this.city_amount < 0) return "cityadvancelimit";
    return ret;
  }
};

module.exports = {
    run: function(ctx) {
        console.log("Max city is " + this.params.max_city)
        console.log("Max city advance is " + this.params.city_advance_limit)
        console.log("City advance discount is " + this.params.city_advance_discount)
        var capitol = this.params.capitol || false;
        if (capitol)
          console.log("Can create capitol")
        if (this.params.city_advance_limit && this.params.max_city > 1) {
          var initial = {};
          var validCities = 0;
          _.each(this.map.areas, function(area, ak) {
            if ((area.city > 0 && area.city < (capitol ? 10 : this.params.max_city))) {
              initial[ak] = area;
              validCities++;
            }
            if (area.tribes > 0)
              initial[ak] = area;
          },this);
          var edits = capitol ?
                      ['tribes', 'city', 'forest', 'mountain', 'volcano', 'farm']
                      : ['tribes', 'city'];
          var opts = {
            map: this.map.areas,
            initial: initial,
            city_amount: this.params.city_advance_limit,
            amount: 0,
            discount: this.params.city_advance_discount,
            max_city: this.params.max_city,
            capitol: capitol,
            shows: edits,
            edits: edits,
            reduce: CityAdvance.reduce,
            check: CityAdvance.check,
            current: CityAdvance.current,
          }
          var rdc = new reducer.Reducer(opts);
          
          if (_.isEmpty(rdc.ok({}).current) || validCities == 0) {
              ctx.done && ctx.done();
          }
          else {
              this.reducer(rdc, function(rdc) {
                  ctx.target(rdc.target);
                  ctx.done && ctx.done();
              });
          }
        }
        else ctx.done && ctx.done();
    },
    CityAdvance: CityAdvance
}