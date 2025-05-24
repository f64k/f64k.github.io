Ext.define('MyApp.view.EastPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'eastpanel',
    title: 'Info Panel',
    bodyPadding: 10,

    tools: [{
        type: 'close',
        handler: function(panel) {
            panel.collapse();
            Ext.log('[EAST] Panel closed');
        }
    }],

    html: '<p>System information:</p><ul><li>Version: 1.0</li><li>Status: OK</li></ul>'
});