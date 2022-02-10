const electron = require('electron');
const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow, addWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({webPreferences: {nodeIntegration: true, contextIsolation: false}});
    mainWindow.loadURL(`file://${__dirname}/main.html`);
    mainWindow.on('closed', () => app.quit());

    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

const menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New Todo',
                click() {
                    createAddWindow()
                }
            },
            {
                label: 'Clear TODOs',
                click() {
                    mainWindow.webContents.send('todo:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];


const createAddWindow = () => {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add New TODO',
        webPreferences: {nodeIntegration: true, contextIsolation: false}
    });
    addWindow.loadURL(`file://${__dirname}/add.html`);
    // remove add window from memory / collect garbage
    addWindow.on('closed', () => addWindow = null);
}

// receive data from add window
ipcMain.on('todo:add', (event, todo) => {
    mainWindow.webContents.send('todo:add', todo);
    //close add window
    addWindow.close();
});

if (process.platform === 'darwin') {
    menuTemplate.unshift({});
}

if (process.env.NODE_ENV !== 'production') {
    menuTemplate.push({
        label: 'View',
        submenu: [
            {role: 'reload'},
            {
                label: 'Toggle Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            }]
    })
}

