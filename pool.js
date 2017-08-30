var cp = require('child_process');

var app = '';
var unused = [];
var supply = new Map();
var removed = new Map();
var pending = new Map();

var supplySetOne = function(cfg) {
  var w = cfg.split('=');
  if(w[0].search(/(DATABASE|POSTGRESQL)\S*URL/g)<0) return;
  w[1] = w[1].substring(1, w[1].length-1);
  console.log(`- pool.supplySetOne(${w[0]}, ${w[1]})`);
  supply.set(w[0], w[1]);
  return w[0];
};

var supplySet = function() {
  return new Promise((fres, frej) => {
    console.log('pool.supplySet()');
    cp.exec(`./heroku config -s --app ${app}`, (err, stdout) => {
      if(err) return frej(err);
      var cfgs = stdout.toString();
      for(var cfg of cfgs.match(/[^\r\n]+/g))
        supplySetOne(cfg);
      fres(supply);
    });
  });
};

var setup = function(nam) {
  app = nam;
  console.log('pool.setup()');
  return supplySet().then((ans) => {
    for(var key of supply.keys())
      unused.push(key);
    return ans;
  });
};

var remove = function(id) {
  console.log(`pool.remove(${id})`);
  return new Promise((fres) => {
    if(unused.length===0) {
      console.log(`pool.remove:addToPending(${id})`);
      return pending.set(id, fres);
    }
    var key = unused.shift();
    removed.set(id, key);
    console.log(`pool.remove:getFromUnused(${id}, ${key})`);
    fres(key);
  });
};

var supplyReset = function(key) {
  console.log(`pool.supplyReset(${key})`);
  return new Promise((fres, frej) => {
    console.log(`pool.supplyReset:resetCredentials(${key})`);
    cp.exec(`./heroku pg:credentials ${key} --reset --app ${app}`, (err) => {
      if(err) return frej(err);
      console.log(`pool.supplyReset:resetItem(${key})`);
      cp.exec(`./heroku pg:reset ${key} --app ${app}`, (err) => {
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
  var id = pending.keys().next();
  var fres = pending.get(id);
  pending.delete(id);
  var key = unused.shift();
  removed.set(id, key);
  console.log(`pool.pendingRemove:setRemoved(${id}, ${key})`);
  fres(key);
  return id;
};

var add = function(id) {
  console.log(`pool.add(${id})`);
  if(pending.has(id)) {
    console.log(`pool.add:deleteFromPending(${id})`);
    pending.delete(id);
  }
  if(removed.has(id)) {
    var key = removed.get(id);
    removed.delete(id);
    unused.push(key);
    console.log(`pool.add:deleteFromRemoved(${id}, ${key})`);
    return supplyReset(key).then(() => id);
  }
  pendingRemove();
  return Promise.resolve(id);
};

var get = function(key) {
  var val = supply.get(key);
  console.log(`pool.get(${key}) -> ${val}`);
  return val;
};

var $ = module.exports;
$.get = get;
$.add = add;
$.remove = remove;
$.setup = setup;
