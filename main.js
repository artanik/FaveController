var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var Menu = require('menu');
var Tray = require('tray');
var dialog = require('dialog');
var ipc = require('ipc');
var dbWorker = require('./dbWorker.js');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    'min-width': 850,
    'min-height': 600,
    'zoom-factor': 1
  });

  // and load the index.html of the app.
  if(dbWorker.checkData()) {
    mainWindow.loadUrl('file://' + __dirname + '/static/index.html');
  } else {
    mainWindow.loadUrl('file://' + __dirname + '/static/login.html');
  }

  ipc.on('getVersion', function(event, arg) {
    event.returnValue = app.getVersion();
  });

  ipc.on('open-dialog', function(event, arg) {
    arg.icon = null;
    
    if(arg.detail) {
      arg.detail = arg.detail.replace('{app_version}', app.getVersion());
    }
      
    dialog.showMessageBox(arg);
  });

  // Emitted when the window is closed.
  mainWindow.on('devtools-opened', function() {
    mainWindow.closeDevTools();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});