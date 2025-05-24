Ext.define('MyApp.view.WestPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'westpanel',
    title: 'Navigation',
    layout: 'accordion',

    requires: ['MyApp.store.Navigation'],

    items: [{
        title: 'System Settings',
        iconCls: 'x-fa fa-cog',
        items: [{
            xtype: 'treepanel',
            rootVisible: false,
            store: 'navigation',
            listeners: {
                itemclick: function(view, record) {
                    Ext.log('[NAV] Selected: ' + record.get('text'));
                }
            }
        }]
    }, {
        title: 'Documents',
        iconCls: 'x-fa fa-folder',
        html: 'Document management'
    }]
});