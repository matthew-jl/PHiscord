import path from 'path'
import { app, ipcMain, Menu, nativeTheme, Tray } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

let tray = null;

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1024,
    height: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true, // hides default menu bar, press ALT to show
    backgroundColor: '#5865F2',
    icon: 'renderer/public/images/discord-mark-blue-square.png', 
    // TODO: custom title bar
    // frame: false,
    // titleBarStyle: 'hidden',
    // titleBarOverlay: {
    //   color: '#2f3241',
    //   symbolColor: '#74b1be',
    //   height: 60
    // },
  })

  // Maximize window
  mainWindow.maximize();

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }

  // Tray Icon
  const iconPath = 'renderer/public/images/discord-mark-blue-square.png';
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open PHiscord',
      click: () => {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      }
    },
    { type: 'separator' },
    {
      label: 'Mute',
      click: () => {
        mainWindow.webContents.send('tray-mute');
      }
    },
    {
      label: 'Deafen',
      click: () => {
        mainWindow.webContents.send('tray-deafen');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('PHiscord');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  });

  // Listen for theme changes
  ipcMain.on('theme-change', (event, theme) => {
    if (theme === 'dark') {
      nativeTheme.themeSource = 'dark';
      mainWindow.setBackgroundColor('#000000');
      mainWindow.setTitleBarOverlay({ color: '#000000', symbolColor: '#ffffff' });
    } else {
      nativeTheme.themeSource = 'light';
      mainWindow.setBackgroundColor('#ffffff');
      mainWindow.setTitleBarOverlay({ color: '#ffffff', symbolColor: '#000000' });
    }
  });
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})
