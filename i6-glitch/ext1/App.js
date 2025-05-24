/*
├── index.html
├── app.js
├── MainLayout.js
├── Header.js
├── Footer.js
├── WestPanel.js
├── EastPanel.js
├── MainController.js
└── Navigation.js
*/

Ext.application({
    name: 'MyApp',

    requires: [
        'MyApp.view.MainLayout',
        'MyApp.view.Header',
        'MyApp.view.Footer',
        'MyApp.view.WestPanel',
        'MyApp.view.EastPanel',
        'MyApp.controller.MainController'
    ],

    controllers: ['MainController'],

    launch: function() {
        try {
            Ext.create('MyApp.view.MainLayout');
            Ext.log('[APP] Launched successfully');
        } catch(e) {
            Ext.log.error('[APP] Launch failed: ' + e.toString());
            Ext.Msg.alert('Fatal Error', 'Application initialization failed');
        }
    }
});