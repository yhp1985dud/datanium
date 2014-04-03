Ext.define('Datanium.view.ElementPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.elementPanel',
	padding : 10,
	defaults : {},
	initComponent : function() {
		Ext.apply(this, {});
		this.items = [];
		this.callParent();
		this.addEvents('refreshElementPanel');
		this.addEvents('selectionChange');
		this.on('refreshElementPanel', function() {
			if (Datanium.util.CommonUtils.getCmpInActiveTab('elementPanel') != null) {
				var ep = Datanium.util.CommonUtils.getCmpInActiveTab('elementPanel');
				ep.removeAll();
				var dims = Datanium.GlobalData.qubeInfo.dimensions;
				var msrs = Datanium.GlobalData.qubeInfo.measures;
				Ext.Array.each(dims, function(d) {
					var btn = {
						itemId : 'dimension.' + d.uniqueName,
						xtype : 'splitbutton',
						text : d.text,
						iconCls : 'fa fa-bars',
						cls : 'elementBtn',
						enableToggle : true,
						textAlign : 'left',
						toggleHandler : function() {
							Datanium.util.CommonUtils.updateQueryParamByEP();
							Datanium.util.CommonUtils.getCmpInActiveTab('elementPanel').fireEvent('selectionChange');
						},
						menu : [ {
							text : 'Remove'
						} ]
					}
					ep.add(btn);
				});
				Ext.Array.each(msrs, function(m) {
					var btn = {
						itemId : 'measure.' + m.uniqueName,
						xtype : 'splitbutton',
						text : m.text,
						iconCls : 'fa fa-bar-chart-o',
						cls : 'elementBtn',
						enableToggle : true,
						textAlign : 'left',
						toggleHandler : function() {
							Datanium.util.CommonUtils.updateQueryParamByEP();
							Datanium.util.CommonUtils.getCmpInActiveTab('elementPanel').fireEvent('selectionChange');
						},
						menu : [ {
							text : 'Remove'
						} ]
					}
					ep.add(btn);
				});
				ep.doLayout();
				Datanium.util.CommonUtils.updateQueryParamByEP();
				Datanium.util.CommonUtils.refreshAll();
			}
		});
	}
});