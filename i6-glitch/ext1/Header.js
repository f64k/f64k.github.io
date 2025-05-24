Ext.define('MyApp.view.Header', {
    extend: 'Ext.panel.Panel',
    xtype: 'appheader',

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'right',
        items: [{
            iconCls: 'x-fa fa-bars',
            tooltip: 'Toggle Navigation',
            handler: 'toggleWestPanel'
        }, {
            xtype: 'tbseparator'
        }, {
            iconCls: 'x-fa fa-info-circle',
            tooltip: 'Toggle Info Panel',
            handler: 'toggleEastPanel'
        }]
    }]
});