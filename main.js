const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const dialog = electron.dialog;
const fs = require('fs')
var mainWindow = null;
app.on('ready',function(){
    mainWindow = new BrowserWindow({
        width:612,
        height:384
    });
    //mainWindow.webContents.openDevTools();

    var template = [
        {
            label: 'Open',
        submenu:[
            {
                label: 'Sound Control',
                accelerator: 'CommandOrControl+O',
                click:function(){
                    openFolderDialog();
                }
            }
        ]
        }]
    var Menu = electron.Menu;
    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    mainWindow.loadURL(`file://${__dirname}/app/index.html`);
})

function openFolderDialog(){
dialog.showOpenDialog(mainWindow,{
    properties:['openFile']
},function(filepath){
    mainWindow.webContents.send('modal-file-content',filepath[0]);
    console.log(filepath[0]);
})
}
