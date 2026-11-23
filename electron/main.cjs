/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

const PORT = process.env.PORT || 3001;
const isDev = !app.isPackaged;

function checkServerReady(url, callback, maxTries = 30) {
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (tries > maxTries) {
      clearInterval(timer);
      callback(false);
      return;
    }

    http.get(url, (res) => {
      // Only a real response from the app's own server counts as ready.
      // Accepting 404 (or any other status) meant that ANY process
      // listening on this port satisfied the check -- including a
      // completely unrelated one -- so the app would load the wrong
      // content or a blank page instead of reporting the failure.
      res.resume(); // drain the response so the socket can be reused
      if (res.statusCode === 200 || res.statusCode === 304) {
        clearInterval(timer);
        callback(true);
      }
    }).on('error', () => {
      // server not ready yet
    });
  }, 250);
}

function startBackendServer() {
  if (isDev) {
    console.log('Running in Development mode. Pointing to current dev server.');
    return;
  }

  // Ensure NODE_ENV is set to production in the packaged app
  process.env.NODE_ENV = 'production';

  // Robustly resolve path to unpacked resources on physical disk
  let serverPath = path.join(__dirname, '..', 'dist', 'server.cjs');
  const unpackedPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'server.cjs');
  try {
    const fs = require('fs');
    if (fs.existsSync(unpackedPath)) {
      serverPath = unpackedPath;
      console.log(`Using unpacked physical disk server path: ${serverPath}`);
    } else {
      console.log(`Unpacked path not found, using standard path: ${serverPath}`);
    }
  } catch (e) {
    console.warn('Failed to verify unpacked server path, falling back:', e);
  }

  console.log(`Starting backend server: ${serverPath}`);

  try {
    require(serverPath);
  } catch (err) {
    console.error('Failed to start local background server:', err);
    dialog.showErrorBox(
      'Server Launch Error',
      `Could not start the background server process: ${err.message}`
    );
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 720,
    title: 'PixelCraft QR Studio - Desktop App',
    icon: path.join(__dirname, 'icons', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Remove standard default browser menu
  mainWindow.removeMenu();

  const targetUrl = `http://localhost:${PORT}`;

  if (isDev) {
    // Load local development server
    mainWindow.loadURL(targetUrl);
    mainWindow.webContents.openDevTools();
  } else {
    // Check if background server is ready before loading content to prevent rendering a blank page
    checkServerReady(targetUrl, (isReady) => {
      if (isReady) {
        mainWindow.loadURL(targetUrl);
      } else {
        dialog.showErrorBox(
          'Connection Error',
          'Failed to connect to the internal QR Generator engine. Please restart the app.'
        );
      }
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle app events
app.whenReady().then(() => {
  startBackendServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On MacOS it is common for applications to stay open untilCmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Server runs in-process, will be cleaned up automatically
});
