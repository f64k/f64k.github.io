Ext.define('MyApp.view.MainLayout', {
    extend: 'Ext.container.Viewport',
    xtype: 'mainlayout',
    controller: 'main',

    layout: 'border',

    items: [{
        xtype: 'appheader',
        region: 'north',
        height: 60
    }, {
        xtype: 'appfooter',
        region: 'south',
        height: 30
    }, {
        xtype: 'westpanel',
        region: 'west',
        width: 250,
        collapsible: true,
        split: true
    }, {
        xtype: 'eastpanel',
        region: 'east',
        width: 300,
        collapsible: true,
        split: true,
        collapsed: true
    }, {
        region: 'center',
        xtype: 'panel',
        bodyPadding: 20,
        html: '<h2>Main Content Area</h2><p>Application content</p>'
    }]
});