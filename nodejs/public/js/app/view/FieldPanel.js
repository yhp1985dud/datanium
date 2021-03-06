Ext.define('Datanium.view.FieldPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.fieldpanel',
	border : false,
	layout : {
		type : 'vbox',
		padding : '0',
		align : 'stretch'
	},

	defaults : {
		margin : '0 0 0 0'
	},

	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			items : [ {
				xtype : 'panel',
				border : false,
				layout : {
					type : 'hbox',
					padding : '2 12 6 12',
					align : 'stretch'

				},
				items : [ {
					xtype : 'button',
					text : '<strong>Dimension</strong>',
					padding : '0 0 2 6',
					textAlign : 'left',
					scale : 'medium',
					width : 85,
					iconAlign : 'right'
				}, {
					xtype : 'fieldtb',
					layout : 'column',
					cls : 'fdtoolbar',
					itemId : Datanium.util.CommonUtils.genItemId('dimField'),
					flex : 9,
					margin : 0
				} ]
			}, {
				xtype : 'panel',
				border : false,
				layout : {
					type : 'hbox',
					padding : '6 12 12 12',
					align : 'stretch'
				},
				items : [ {
					xtype : 'button',
					text : '<strong>Measure</strong>',
					padding : '0 0 2 6',
					textAlign : 'left',
					scale : 'medium',
					/* flex : 1 */
					width : 85,
					iconAlign : 'right'
				}, {
					xtype : 'fieldtb',
					cls : 'fdtoolbar',
					layout : 'column',
					itemId : Datanium.util.CommonUtils.genItemId('meaField'),
					flex : 9,
					margin : 0
				} ]
			}, ]
		});
		me.callParent();
	}
});