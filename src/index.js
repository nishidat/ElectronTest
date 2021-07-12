const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store')
const cron = require('node-cron');
const store = new Store()
store.set('time', '09:50');
var task = cron.schedule('0 50 9 * * *', () => {
  createWindow();
});
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    'icon': __dirname + '/Icon.icns',
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

const settingsWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 300,
    height: 100,
    'icon': __dirname + '/Icon.icns',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: __dirname + '/preload.js',
    }
  });
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'settings.html'));
  mainWindow.webContents.send(
    "setDefaultTime",
    {
      defaultTime: store.get('time'),
    }
  );
  // mainWindow.webContents.openDevTools(); 
};

// メインプロセス（受信側）
ipcMain.on("set-time", (event, arg) => {
  setTimer(arg);
  store.set('time', arg);
});

let tray = null;
const createTrayIcon = () => {
  let imgFilePath;
  if (process.platform === 'win32') {
    imgFilePath = __dirname + '/images/tray-icon/white/100.ico';
  }else{
    imgFilePath = __dirname + '/taskicon.png';
  }
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Display the QR code', click:createWindow },
    { label: 'Settings', click:settingsWindow },
    { label: 'Quit', role: 'quit' }
  ]);
  tray = new Tray(imgFilePath);
  tray.setToolTip(app.name);
  tray.setContextMenu(contextMenu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  createTrayIcon();
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const setTimer = (t) => {
  const hm = t.split(':');
  const hour = Number(hm[0]);
  const min = Number(hm[1]);
  const schedule = '0 ' + min + ' ' + hour + ' * * *';
  task.stop();
  task = cron.schedule(schedule, () => {
    createWindow();
  });
};


