(function() {

    var NSICondGroupsView = window.NSICondGroupsView = GeckoJS.NSITreeViewArray.extend({

        getValue: function() {

            var selectedItems = this.tree.selectedItems.sort(function(a,b) {return a - b});
            var selectedItemsStr = [];

            var data = this.data;
            selectedItems.forEach(function(idx){
                selectedItemsStr.push(data[idx].id);
            });

            return selectedItemsStr.join(',');
        },

        setValue: function(items) {

            var selectedItemsStr = items.split(',');
            var selectedItems = [];

            var dataIdIndex = GeckoJS.Array.objectExtract(this.data, '{n}.id');

            selectedItemsStr.forEach(function(id){
                var index = GeckoJS.Array.inArray(id, dataIdIndex);
                if (index != -1) selectedItems.push(index);
            });
            this.tree.selectedItems = selectedItems;

        },

        getCurrentIndexData: function (row) {
            return this.data[row];
        },

        renderButton: function(row, btn) {
            
            var buttonColor = this.getCellValue(row,{
                id: 'button_color'
            });
            var buttonFontSize = this.getCellValue(row,{
                id: 'font_size'
            });

            if (buttonColor && btn) {
                $(btn).addClass(buttonColor);
            }
            if (buttonFontSize && btn) {
                $(btn).addClass('font-' + buttonFontSize);
            }
        }

    });

    var NSICondimentsView = window.NSICondimentsView = GeckoJS.NSITreeViewArray.extend({

        supportSoldout: false,
        
        soldoutActive: false,

        getValue: function() {

            var selectedItems = this.tree.selectedItems;
            var selectedItemsStr = [];

            var data = this.data;
            selectedItems.forEach(function(idx){
                selectedItemsStr.push(data[idx].id);
            });

            return selectedItemsStr.join(',');
        },

        getCurrentIndexData: function (row) {
            return this.data[row];
        },


        getSelectType: function(row) {

            if (this.supportSoldout && (this.soldoutActive || this.getCellValue(row, {id: 'soldout'}))) {
                return 'none';
            }
            return this.getCellValue(row,{
                id: 'seltype'
            });

        },

        getSelectGroup: function(row) {
/*
            if (this.supportSoldout && (this.soldoutActive || this.getCellValue(row, {id: 'soldout'}))) {
                GREUtils.log('id');
                return this.getCellValue(row, {id: 'id'});
            }
                GREUtils.log('group id');
*/
            return this.getCellValue(row,{
                id: 'condiment_group_id'
            });
        },

        renderButton: function(row, btn) {

            var buttonColor = this.getCellValue(row,{
                id: 'button_color'
            });
            var buttonFontSize = this.getCellValue(row,{
                id: 'font_size'
            });

            var classStr = '';

            if (buttonColor && btn) {
                // $(btn).addClass(buttonColor);
                classStr += ' ' + buttonColor ;
            }
            if (buttonFontSize && btn) {
                // $(btn).addClass('font-' + buttonFontSize);
                classStr += ' font-' + buttonFontSize ;
            }
            if (this.supportSoldout && this.getCellValue(row, {id: 'soldout'})) {
                btn.label = _('Sold Out -') + ' ' + btn.label;
            }

            var preset = this.getCellValue(row,{
                id: 'preset'
            });
            if (preset) {
                classStr += ' PresetCondiment';
                btn.label = '* ' + btn.label;
            }
            else {
                classStr += ' NotPresetCondiment';
            }

            if (classStr.length > 0) {
                // $btn.addClass(classStr);
                btn.className += " " + classStr;
            }

        }
    });

})();
