(function() {

    var NSIRoleGroupsView = window.NSIRoleGroupsView = GeckoJS.NSITreeViewArray.extend({

        getValue: function() {
            
            var selectedItems = this.tree.selectedItems;
            var selectedItemsStr = [];

            var data = this.data;
            selectedItems.forEach(function(idx){
                selectedItemsStr.push(data[idx].name);
            });

            return selectedItemsStr.join(',');
        },

        setValue: function(items) {

            var selectedItemsStr = items.split(',');
            var selectedItems = [];
            var selectedIndex = -1;
            var dataNameIndex = GeckoJS.Array.objectExtract(this.data, '{n}.name');

            selectedItemsStr.forEach(function(name){
                var index = GeckoJS.Array.inArray(name, dataNameIndex);
                if (index != -1) {
                    selectedItems.push(index);
                    if (selectedIndex == -1) selectedIndex = index;
                }
            });
            if (selectedIndex >=0) this.tree.selectedIndex = selectedIndex;
            this.tree.selectedItems = selectedItems;
            
        },

        getCurrentIndexData: function (row) {
            return this.data[row];
        }

    });

    var NSIRolesView = window.NSIRolesView = GeckoJS.NSITreeViewArray.extend({

        getValue: function() {

            var selectedItems = this.tree.selectedItems;
            var selectedItemsStr = [];

            var data = this.data;
            selectedItems.forEach(function(idx){
                selectedItemsStr.push(data[idx].name);
            });

            return selectedItemsStr.join(',');
        },

        setValue: function(items) {

            var selectedItemsStr = items.split(',');
            var selectedItems = [];

            var dataNameIndex = GeckoJS.Array.objectExtract(this.data, '{n}.name');

            selectedItemsStr.forEach(function(name){
                var index = GeckoJS.Array.inArray(name, dataNameIndex);
                if (index != -1) selectedItems.push(index);
            });

            this.tree.selectedItems = selectedItems;

        },

        getCurrentIndexData: function (row) {
            return this.data[row];
        }

    });

})();
