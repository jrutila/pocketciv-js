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
        if (!isNaN(parseInt(key))) 
            this.targets[key] = this._chn(this.targets[key], value);
        else if (_.isString(key))
            this.targets[key] = this._chn(this.targets[key], value);
        else if (_.isObject(key)) {
            value = key;
            _.each(value, function(v,k) {
                this.change(k,v);
            },this);
        } else 
            throw "NotSupportedChangeKey";
    },
    _chn: function(o, n) {
        if (_.isNumber(o) && _.isNumber(n))
            return o+n;
        else if (_.isObject(n)) {
            var ret = _.isObject(o) ? o : {};
            _.each(n, function(nn, nk) {
                ret[nk] = this._chn(o[nk], nn);
            },this);
            return ret;
        } else
            return n;
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
            else if (_.isNumber(val))
                ret[key] = val - initial[key];
            else if (_.isBoolean(val))
                ret[key] = val;
                
            if ((_.isNumber(ret[key]) && ret[key] == 0) ||
                (!_.isNumber(ret[key]) && _.isEmpty(ret[key])))
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