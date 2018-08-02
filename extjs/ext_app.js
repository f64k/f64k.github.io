'use strict';

Ext.application({
    name: 'App1',
    //autoCreateViewport: true,
    mainView: 'App1.view.ViewportShell',
});

(function views() {

    Ext.define('App1.view.ViewportShell', {
        extend: 'Ext.container.Viewport',
        layout: 'border',
        //defaultListenerScope: true,
        //bodyBorder: false,

        defaults: {
            //collapsible: true,
            //split: true,
            //bodyPadding: 10
        },

        items: [
            {
                region: 'west',
                title: 'Navigation',
                collapsible: true,
                split: true,
                floatable: true,
                margin: '5 0 0 0',
                width: 125,
                minWidth: 100,
                maxWidth: 250,
                //html: '<p>WEST content like navigation links could go here</p>'
                xtype: 'usersgrid',
                store: { type: 'users' },
            },
            {
                region: 'east',
                title: 'Свойства',
                stateful: true,
                stateId: 'rightZone',
                split: true,
                collapsible: true,
                collapsed: true,
                floatable: true,
                //margin: '5 0 0 0',
                width: 500,
                //minWidth: 100,
                //maxWidth: 250,
                xtype: 'usersgrid',
            },
            {
                region: 'north',
                //title: 'Header',
                bodyPadding: 10,
                xtype: 'north_panel',
            },
            {
                region: 'south',
                //title: 'footer string',
                floatable: true,
                //collapsible: false,
                collapsed: true,
                //height: 100,
                minHeight: 75,
                maxHeight: 150,
                html: '<p>Footer content</p>'
            },
            {
                region: 'center',
                id: "documentsTab",
                collapsible: false,
                xtype: 'tabpanel',
                items: [],
                //tbar: [{ xtype: 'breadcrumb', showIcons: true, store: { type: 'files' }, }],
            },
        ]
    });

    Ext.define('App1.view.NorthPanel', {
        extend: 'Ext.panel.Panel',
        xtype: 'north_panel',
        //layout: { type: 'hbox', pack: 'start', align: 'stretch' },

        items: [{ html: '<b>q</b> q q' }, ],

        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            items: [{
                iconCls: "x-tree-icon-leaf", //"list",
                glyph: null,
                xtype: 'button'
            }, '-', {
                iconCls: "close",
                //glyph: null,
                xtype: 'button'
            }, {
                iconCls: "paste",
                glyph: null,
                xtype: 'button'
            }, '-', {
                iconCls: "edit",
                glyph: null,
                xtype: 'button'
            }]
        }],

        tbar: {
            //plugins: 'boxreorderer',

            items: [{
                xtype: 'splitbutton',
                text: 'Menu Button',
                iconCls: "list",
                glyph: null,
                menu: [{
                    text: 'Menu Button 1'
                }]
            }, {
                xtype: 'splitbutton',
                text: 'Cut',
                iconCls: "cut",
                glyph: null,
                menu: [{
                    text: 'Cut Menu Item'
                }]
            }, {
                iconCls: "copy",
                glyph: null,
                text: 'Copy'
            }, {
                text: 'Paste',
                iconCls: "paste",
                glyph: null,
                menu: [{
                    text: 'Paste Menu Item'
                }]
            }, {
                iconCls: "format",
                glyph: null,
                text: 'Format'
            }]
        },
    });

    Ext.define('App1.view.Viewport1', {
        extend: 'Ext.container.Viewport',
        requires: [
            //'App1.view.UsersGrid',
            //'App1.store.Users',
        ],

        defaultListenerScope: true,

        items: [{
            title: 'Viewport1: Outer Container',
            xtype: 'panel',
            bodyPadding: 10,
            defaults: {
                margin: '10 0'
            },
            items: [{
                xtype: 'button',
                text: 'Set Read only',
                enableToggle: true,
                handler: 'readOnlyButton_click'
            }, {
                xtype: 'usersgrid',
                title: 'Users',
                border: true,
                store: { type: 'users' },
            }]
        }],

        readOnlyButton_click: function (self) {
            this.down('usersgrid').setReadOnly(self.pressed);
        }
    });


})();

(function user_controls() {

    Ext.define('App1.view.UsersGrid', {
        extend: 'Ext.grid.Panel',
        xtype: 'usersgrid',

        config: {
            /**
            @cfg {Boolean} Read only mode
            */
            readOnly: null
        },

        defaultListenerScope: true,

        tbar: [{
            text: 'Add',
            itemId: 'addButton'
        }, {
            text: 'Remove',
            itemId: 'removeButton'
        }],

        columns: [{
            dataIndex: 'id',
            header: 'id'
        }, {
            dataIndex: 'name',
            header: 'name'
        }],

        listeners: {
            selectionchange: 'grid_selectionchange'
        },

        updateReadOnly: function (readOnly) {
            this.down('#addButton').setDisabled(readOnly);
            this.down('#removeButton').setDisabled(readOnly);
        },

        grid_selectionchange: function (self, selected) {
            var rec = selected[0];
            if (rec) {
                this.down('#removeButton').setText('Remove ' + rec.get('name'));
            }
        }
    });


})();


(function controllers() {

    Ext.define('App1.TwoWayController1', {
        extend: 'Ext.app.ViewController',
        alias: 'controller.twoway1',

        onTitleButtonClick: function () {
            var title = 'Title' + Ext.Number.randomInt(1, 100);
            this.getViewModel().set('title', title);
        }
    });

})();


(function stores() {

    Ext.define('App1.store.Users', {
        extend: 'Ext.data.Store',
        alias: 'store.users',
        fields: ['id', 'name'],

        data: [{
            id: 1,
            name: 'John'
        }, {
            id: 2,
            name: 'Jane'
        }]
    });

    Ext.define('App1.store.Files', {
        extend: 'Ext.data.TreeStore',
        alias: 'store.files',

        rootData: {
            text: 'Ext JS',
            expanded: true,
            children: [
                {
                    text: 'app',
                    children: [
                        { leaf: true, text: 'Application.js' }
                    ]
                },
                {
                    text: 'button',
                    expanded: true,
                    children: [
                        { leaf: true, text: 'Button.js' },
                        { leaf: true, text: 'Cycle.js' },
                        { leaf: true, text: 'Split.js' }
                    ]
                },
                {
                    text: 'container',
                    children: [
                        { leaf: true, text: 'ButtonGroup.js' },
                        { leaf: true, text: 'Container.js' },
                        { leaf: true, text: 'Viewport.js' }
                    ]
                },
                {
                    text: 'core',
                    children: [
                        {
                            text: 'dom',
                            children: [
                                { leaf: true, text: 'Element.form.js' },
                                { leaf: true, text: 'Element.static-more.js' }
                            ]
                        }
                    ]
                },
                {
                    text: 'dd',
                    children: [
                        { leaf: true, text: 'DD.js' },
                        { leaf: true, text: 'DDProxy.js' },
                        { leaf: true, text: 'DDTarget.js' },
                        { leaf: true, text: 'DragDrop.js' },
                        { leaf: true, text: 'DragDropManager.js' },
                        { leaf: true, text: 'DragSource.js' },
                        { leaf: true, text: 'DragTracker.js' },
                        { leaf: true, text: 'DragZone.js' },
                        { leaf: true, text: 'DragTarget.js' },
                        { leaf: true, text: 'DragZone.js' },
                        { leaf: true, text: 'Registry.js' },
                        { leaf: true, text: 'ScrollManager.js' },
                        { leaf: true, text: 'StatusProxy.js' }
                    ]
                },
                {
                    text: 'core',
                    children: [
                        { leaf: true, text: 'Element.alignment.js' },
                        { leaf: true, text: 'Element.anim.js' },
                        { leaf: true, text: 'Element.dd.js' },
                        { leaf: true, text: 'Element.fx.js' },
                        { leaf: true, text: 'Element.js' },
                        { leaf: true, text: 'Element.position.js' },
                        { leaf: true, text: 'Element.scroll.js' },
                        { leaf: true, text: 'Element.style.js' },
                        { leaf: true, text: 'Element.traversal.js' },
                        { leaf: true, text: 'Helper.js' },
                        { leaf: true, text: 'Query.js' }
                    ]
                },
                { leaf: true, text: 'Action.js' },
                { leaf: true, text: 'Component.js' },
                { leaf: true, text: 'Editor.js' },
                { leaf: true, text: 'Img.js' },
                { leaf: true, text: 'Layer.js' },
                { leaf: true, text: 'LoadMask.js' },
                { leaf: true, text: 'ProgressBar.js' },
                { leaf: true, text: 'Shadow.js' },
                { leaf: true, text: 'ShadowPool.js' },
                { leaf: true, text: 'ZIndexManager.js' }
            ]
        },

        constructor: function (config) {
            // Since records claim the data object given to them, clone the data
            // for each instance.
            config = Ext.apply({
                root: Ext.clone(this.rootData)
            }, config);

            this.callParent([config]);
        }
    });

})();

