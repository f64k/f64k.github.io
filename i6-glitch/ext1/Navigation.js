Ext.define('MyApp.store.Navigation', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.navigation',

    root: {
        expanded: true,
        children: [{
            text: 'Dashboard',
            iconCls: 'x-fa fa-home',
            leaf: true
        }, {
            text: 'Users',
            iconCls: 'x-fa fa-users',
            leaf: true
        }, {
            text: 'Settings',
            iconCls: 'x-fa fa-cogs',
            leaf: true
        }]
    }
});