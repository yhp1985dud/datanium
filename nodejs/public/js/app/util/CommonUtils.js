Ext.define('Datanium.util.CommonUtils', {
	statics : {
		genItemId : function(xtype, key) {
			if (key != null && key != '')
				return 'dtnm-' + xtype + '-' + Datanium.GlobalData.tabindex + '-' + key;
			return 'dtnm-' + xtype + '-' + Datanium.GlobalData.tabindex;
		},
		getCmpSearchKey : function(xtype, key) {
			return '#' + Datanium.util.CommonUtils.genItemId(xtype, key);
		},
		getCurrentTab : function(tab) {
			return Ext.getCmp('mainBox').getActiveTab();
		},
		getCmpInActiveTab : function(selector) {
			return this.getCurrentTab().down(selector);
		},
		getCmpInContainer : function(containerId, selector) {
			var container = Ext.getCmp(containerId);
			if (container) {
				return container.down(selector);
			}
		},
		updateQueryParam : function() {
			var dimensionTree = Datanium.util.CommonUtils.getCmpInActiveTab('dimensionTree');
			var dimensions = dimensionTree.getView().getChecked(), dimNodes = [];
			Ext.Array.each(dimensions, function(rec) {
				var id = rec.get('id');
				var name = rec.get('text');
				var dimItem = {
					uniqueName : id,
					text : name,
					data_type : 'dimension',
					field_type : 'row',
					displayOrder : 0,
					display : true
				}
				dimNodes.push(dimItem);
			});
			var measureTree = Datanium.util.CommonUtils.getCmpInActiveTab('measureTree');
			var measures = measureTree.getView().getChecked(), meaNodes = [];
			Ext.Array.each(measures, function(rec) {
				var id = rec.get('id');
				var name = rec.get('text');
				var meaItem = {
					uniqueName : id,
					text : name,
					data_type : 'measure',
					field_type : 'column',
					displayOrder : 0,
					display : true
				}
				meaNodes.push(meaItem);
			});
			var queryParam = Datanium.GlobalData.queryParam;
			queryParam.dimensions = dimNodes;
			queryParam.measures = meaNodes;
			Datanium.util.CommonUtils.updateFields();
		},
		updateFields : function() {
			var dimField = Datanium.util.CommonUtils.getCmpInActiveTab(Datanium.util.CommonUtils
					.getCmpSearchKey('dimField'));
			var meaField = Datanium.util.CommonUtils.getCmpInActiveTab(Datanium.util.CommonUtils
					.getCmpSearchKey('meaField'));
			dimField.removeAll();
			meaField.removeAll();
			var queryParam = Datanium.GlobalData.queryParam;
			if ('dimensions' in queryParam) {
				Ext.Array.each(queryParam.dimensions, function(name, index) {
					var dim = queryParam.dimensions[index];
					var field = {
						uniqueName : dim.uniqueName,
						text : dim.text,
						cls : 'fieldBtn-d'
					};
					dimField.add(field);
				});
			}
			if ('measures' in queryParam) {
				Ext.Array.each(queryParam.measures, function(name, index) {
					var mea = queryParam.measures[index];
					var field = {
						uniqueName : mea.uniqueName,
						text : mea.text,
						cls : 'fieldBtn-m'
					};
					meaField.add(field);
				});
			}
			// console.log(dimField);
			// console.log(meaField);
			// console.log(Datanium.GlobalData.queryParam);
		}
	}
});