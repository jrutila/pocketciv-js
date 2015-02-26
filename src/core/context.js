var _ = require("underscore");

function PhaseContext(engine) {
    this.initial = {};
    this.targets = {};
    _.each(engine.map.areas, function(area, ak) {
        this.initial[ak] = _.clone(_.omit(area, 'neighbours'));
        this.targets[ak] = _.clone(_.omit(area, 'neighbours'));
    },this);
    this.initial.gold = engine.gold;
    this.targets.gold = engine.gold;
    this.params = engine.params;
}

PhaseContext.prototype = {
    target: function(key, value) {
        if (!isNaN(parseInt(key)))
            _.extend(this.targets[key], value);
        else if (_.isString(key))
            this.targets[key] = value;
        else if (_.isObject(key)) {
            value = key;
            _.each(value, function(value, key) {
                this.target(key, value);
            },this);
        } else {
            throw "NotSupportedTargetKey";
        }
    },
    change: function(key, value) {
        var ak = parseInt(key);
        if (isNaN(ak)) 
            this.targets[key] += value;
        else {
            _.each(value, function(v,k) {
                this.targets[key][k] = this.targets[key][k] || 0;
                this.targets[key][k] += v;
                if (this.targets[key][k] < 0)
                    throw "InvalidTargetValue"
            },this);
        }
    },
    get changes() {
        return changes(this.initial, this.targets);
    }
}
function changes(initial, target) {
        var ret = {};
        var keys = _.union(_.keys(initial), _.keys(target));
        _.each(keys, function(key) {
            var val = target[key];
            if (val) {
                if (_.isObject(val)) {
                    ret[key] = {};
                    _.each(val, function(v,k) {
                        if (_.isNumber(v)) {
                            //var vv = _getChangeString((initial[key][k] || 0), v);
                            var vv = v - (initial[key][k] || 0);
                            if (vv != 0) ret[key][k] = vv;
                        } else if (_.isBoolean(v)) {
                            var vv = v != (initial[key][k] || false);
                            if (vv) ret[key][k] = v;
                        }
                    });
                }
            }
            if (_.isEmpty(ret[key]))
                delete ret[key];
        },this);
        return ret;
    };
function changeString(chg) {
    var ret = undefined;
    if (_.isObject(chg)) {
        ret = {};
        _.each(chg, function(v,k) {
            ret[k] = changeString(v);
        });
    } else if (_.isNumber(chg)) {
        return chg > 0 ? "+"+chg.toString() : chg.toString();
    } else {
        return chg;
    }
    return ret;
    };

module.exports = {
    Context: PhaseContext,
    changes: changes,
    getString: changeString,
}