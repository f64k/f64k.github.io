Ext.define('MyApp.controller.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    refs: {
        west: 'westpanel',
        east: 'eastpanel'
    },

    toggleWestPanel: function() {
        const panel = this.getWest();
        panel && panel[panel.collapsed ? 'expand' : 'collapse']();
        Ext.log('[CTRL] WestPanel toggled');
    },

    toggleEastPanel: function() {
        const panel = this.getEast();
        panel && panel[panel.collapsed ? 'expand' : 'collapse']();
        Ext.log('[CTRL] EastPanel toggled');
    }
});