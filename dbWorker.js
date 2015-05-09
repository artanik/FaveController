var fs = require('fs');
var ipc = require('ipc');
var jf = require('jsonfile');
var util = require('util');
var dbWorker = {};
var path = __dirname + '/data/posts.json';
var pathPhotos = __dirname + '/data/photos.json';
var pathVideos = __dirname + '/data/videos.json';

var _path = __dirname + '/data/_posts.json';
var _pathPhotos = __dirname + '/data/_photos.json';
var _pathVideos = __dirname + '/data/_videos.json';


//photos
dbWorker.checkPhotos = function() {
  var data = fs.readFileSync(pathPhotos);
  return !!data.length;
};

dbWorker.getPhotos = function(callback) {
  var data = fs.readFileSync(pathPhotos);
  return data.toString();
};

dbWorker.dropPhotos = function() {
  fs.writeFile(pathPhotos, '', function (err) {
    if (err) throw err;
  });
};

dbWorker.setPhotos = function(data, progress, callback) {
  var _savedData = fs.readFileSync(pathPhotos).toString();
  var _json = !!_savedData?jf.readFileSync(pathPhotos):'';
  var _data = JSON.parse(data);
  var _items = _data.items;
  var toSave = {};

  if(_json == '') {
    toSave.items = _items || [];
    jf.writeFileSync(pathPhotos, toSave);
    callback(progress == 100? 'done': undefined);
  } else if(progress == 100) {
    toSave.items = _json.items.concat(_items);
    jf.writeFileSync(pathPhotos, toSave);
    callback('done');
  } else {
    toSave.items = _json.items.concat(_items);
    jf.writeFileSync(pathPhotos, toSave);
    callback();
  }
};

ipc.on('checkPhotos', function(event, arg) { event.returnValue = dbWorker.checkPhotos(); });
ipc.on('dropPhotos', function(event, arg) { event.returnValue = dbWorker.dropPhotos(); });
ipc.on('getPhotos', function(event, arg) { event.returnValue = dbWorker.getPhotos(); });
ipc.on('setPhotos', function(event, data, progress) {
  dbWorker.setPhotos(data, progress, function(res) {
    event.returnValue = res || 'false';
    event.sender.send('setPhotos', res || 'false');
  });
});


//videos
dbWorker.checkVideos = function() {
  var data = fs.readFileSync(pathVideos);
  return !!data.length;
};

dbWorker.getVideos = function(callback) {
  var data = fs.readFileSync(pathVideos);
  return data.toString();
};

dbWorker.dropVideos = function() {
  fs.writeFile(pathVideos, '', function (err) {
    if (err) throw err;
  });
};

dbWorker.setVideos = function(data, progress, callback) {
  var _savedData = fs.readFileSync(pathVideos).toString();
  var _json = !!_savedData?jf.readFileSync(pathVideos):'';
  var _data = JSON.parse(data);
  var _items = _data.items;
  var _profiles = _data.profiles;
  var _groups = _data.groups;
  var toSave = {};

  if(_json == '') {
    toSave.items = _items || [];
    toSave.profiles = _profiles || [];
    toSave.groups = _groups || [];
    jf.writeFileSync(pathVideos, toSave);
    if(progress == 100) {
      callback('done');
    } else {
      callback();
    }
  } else if(progress == 100) {
    toSave.items = _json.items.concat(_items);
    jf.writeFileSync(pathPhotos, toSave);
    callback('done');
  } else {
    toSave.items = _json.items.concat(_items);
    toSave.profiles = _json.profiles.concat(_profiles);
    toSave.groups = _json.groups.concat(_groups);
    jf.writeFileSync(pathVideos, toSave);
    callback();
  }
};

ipc.on('checkVideos', function(event, arg) { event.returnValue = dbWorker.checkVideos(); });
ipc.on('dropVideos', function(event, arg) { event.returnValue = dbWorker.dropVideos(); });
ipc.on('getVideos', function(event, arg) { event.returnValue = dbWorker.getVideos(); });
ipc.on('setVideos', function(event, data, progress) {
  dbWorker.setVideos(data, progress, function(res) {
    event.returnValue = res || 'false';
    event.sender.send('setVideos', res || 'false');
  });
});


//data
dbWorker.checkData = function() {
  var data = fs.readFileSync(path);
  return !!data.length;
};

dbWorker.getData = function(callback) {
  var data = fs.readFileSync(path);
  return data.toString();
};

dbWorker.dropData = function() {
  fs.writeFile(path, '', function (err) {
    if (err) throw err;
  });
};

dbWorker.setData = function(data, progress, callback) {
  var _savedData = fs.readFileSync(path).toString();
  var _json = !!_savedData?jf.readFileSync(path):'';
  var _data = JSON.parse(data);
  var _items = _data.items;
  var _wall = _data.wall;
  var _profiles = _data.profiles;
  var _groups = _data.groups;
  var toSave = {};

  if(progress == 100) {
    callback('done');
  } else if(_json !== '') {
    toSave.items = _json.items.concat(_items);
    toSave.wall = _json.wall.concat(_wall);
    toSave.profiles = _json.profiles.concat(_profiles);
    toSave.groups = _json.groups.concat(_groups);
    jf.writeFileSync(path, toSave);
    callback();
  } else {
    toSave.items = _items || [];
    toSave.wall = _wall || [];
    toSave.profiles = _profiles || [];
    toSave.groups = _groups || [];
    jf.writeFileSync(path, toSave);
    callback();
  }
};

ipc.on('checkData', function(event, arg) { event.returnValue = dbWorker.checkData(); });
ipc.on('dropData', function(event, arg) { dbWorker.dropData(); });
ipc.on('getPosts', function(event, arg) { event.returnValue = dbWorker.getData(); });
ipc.on('setData', function(event, data, progress) {
  dbWorker.setData(data, progress, function(res) {
    event.returnValue = res || 'false';
    event.sender.send('setData', res || 'false');
  });
});



ipc.on('syncData', function(event, data) {
  jf.writeFile(path, JSON.parse(data));
});

ipc.on('syncPhotos', function(event, data) {
  jf.writeFile(pathPhotos, JSON.parse(data));
});

ipc.on('syncVideos', function(event, data) {
  jf.writeFile(pathVideos, JSON.parse(data));
});

module.exports = dbWorker;