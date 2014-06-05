function markSelection(selectedItem) {
	var menuitems = selectedItem.parentMenu.items.items;
	Ext.Array.each(menuitems, function(item, i) {
		item.setIconCls('');
	});
	selectedItem.setIconCls('fa fa-star-o');
}

Ext.define('Datanium.view.charts.ChartToolbar', {
	extend : 'Ext.toolbar.Toolbar',
	xtype : 'basic-buttons',
	alias : 'widget.chart-toolbar',
	shadowOffset : 10,
	minHeight : 38,
	padding : '0 5',
	items : [ {
		xtype : 'splitbutton',
		iconCls : 'fa fa-bar-chart-o',
		cls : 'chartTypeBtn',
		scale : 'medium',
		tooltip : 'Column Chart',
		tooltipType : 'title',
		text : 'Column Chart',
		menu : [ {
			iconCls : 'fa fa-star-o',
			text : 'Column Chart',
			handler : function() {
				this.parentMenu.ownerButton.setText('Column Chart');
				markSelection(this);
				if (Datanium.GlobalData.chartMode != 'columnchart') {
					Datanium.GlobalData.chartMode = 'columnchart';
					Datanium.util.CommonUtils.generateChart();
				}
			}
		}, {
			text : 'Stack Chart',
			handler : function() {
				this.parentMenu.ownerButton.setText('Stack Chart');
				markSelection(this);
				if (Datanium.GlobalData.chartMode != 'stackchart') {
					Datanium.GlobalData.chartMode = 'stackchart';
					Datanium.util.CommonUtils.generateChart();
				}
			}
		}, {
			text : 'Line Chart',
			handler : function() {
				this.parentMenu.ownerButton.setText('Line Chart');
				markSelection(this);
				if (Datanium.GlobalData.chartMode != 'linechart') {
					Datanium.GlobalData.chartMode = 'linechart';
					Datanium.util.CommonUtils.generateChart();
				}
			}
		} ]
	}, {
		xtype : 'tbseparator',
		height : 14,
		margins : '0 0 0 1'
	}, {
		iconCls : 'fa fa-arrows fa',
		cls : 'chartTypeBtn',
		scale : 'medium',
		tooltip : 'Auto Scale',
		tooltipType : 'title',
		text : 'Auto Scale',
		action : 'auto-scale',
		enableToggle : true,
		pressed : false
	} ]
});