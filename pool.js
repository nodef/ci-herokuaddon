var cp = require('child_process');

module.exports = function(id, app, opt) {
  var unused = [];
  var supply = new Map();
  var removed = new Map();
  var pending = new Map();

  var supplySetOne = function(cfg) {
    var w = cfg.split('=');
    if(w[0].search(opt.config)<0) return;
    w[1] = w[1].substring(1, w[1].length-1);
    console.log(`- ${id}.supplySetOne(${w[0]})`);
    supply.set(w[0], w[1]);
    return w[0];
  };

  var supplySet = function() {
    return new Promise((fres, frej) => {
      cp.exec(`./heroku config -s --app ${app}`, (err, stdout) => {
        if(err) return frej(err);
        var cfgs = stdout.toString();
        for(var cfg of cfgs.match(/[^\r\n]+/g))
          supplySetOne(cfg);
        fres(supply);
      });
    });
  };

  var setup = function() {
    console.log(`${id}.setup()`);
    return supplySet().then((ans) => {
      for(var key of supply.keys())
        unused.push(key);
      return ans;
    });
  };

  var remove = function(ref) {
    return new Promise((fres) => {
      if(unused.length===0) {
        console.log(`${id}.remove:addToPending(${ref})`);
        return pending.set(ref, fres);
      }
      var key = unused.shift();
      removed.set(ref, key);
      console.log(`${id}.remove:getFromUnused(${ref}, ${key})`);
      fres(key);
    });
  };

  var supplyReset = function(key) {
    console.log(`${id}.supplyReset(${key})`);
    return new Promise((fres, frej) => {
      var res = key.substring(0, key.length-4);
      cp.exec(`./heroku addons:destroy ${res} --app ${app} --confirm ${app}`, (err) => {
        if(err) return frej(err);
        cp.exec(`./heroku addons:create ${opt.name} --as ${res} --app ${app}`, (err) => {
          if(err) return frej(err);
          supplySet().then((ans) => {
            fres(ans.get(key));
          });
        });
      });
    });
  };

  var pendingRemove = function() {
    if(!unused.length || !pending.size) return;
    var ref = pending.keys().next().value;
    var fres = pending.get(ref);
    pending.delete(ref);
    var key = unused.shift();
    removed.set(ref, key);
    console.log(`${id}.pendingRemove:setRemoved(${ref}, ${key})`);
    fres(key);
    return ref;
  };

  var add = function(ref) {
    if(pending.has(ref)) {
      console.log(`${id}.add:deleteFromPending(${ref})`);
      pending.delete(ref);
    }
    if(removed.has(ref)) {
      var key = removed.get(ref);
      removed.delete(ref);
      console.log(`${id}.add:deleteFromRemoved(${ref}, ${key})`);
      return supplyReset(key).then(() => {
        unused.push(key);
        pendingRemove();
        return ref;
      });
    }
    return Promise.resolve(ref);
  };

  var get = function(key) {
    return supply.get(key);
  };

  return {get, add, remove, setup};
};
