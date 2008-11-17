(function(){

    /**
     * Class ViviPOS.MainController
     */
    GeckoJS.Controller.extend( {

        name: 'Condiments',
        _selectedIndex: null,

        createCondimentPanel: function () {
            /*
            var categories;

            var cateModel = new CategoryModel();
            categories = cateModel.find('all', {
                order: "no"
            });
            // GeckoJS.Session.add('categories', categories);
            */

            var condiments = GeckoJS.Session.get('condiments');

            // bind categories data
            var condPanelView =  new NSICategoriesView(condiments);
            var condscrollablepanel = document.getElementById('condimentscrollablepanel');
            condscrollablepanel.datasource = condPanelView;


            // bind plu data
            var firstCondNo = condiments[0]['no'];

        },

        changeCondimentPanel: function(index) {

            var condiments = GeckoJS.Session.get('condiments');
            var condNo = condiments[index]['no'];

            this._selectedIndex = index;
            this.setInputData(condiments[index]);

        },

        getInputData: function () {

            var no  = this.query('#category_no').val();
            var name  = this.query('#category_name').val();
            var visible  = this.query('#category_visible').val() || 0;
            var button_color  = this.query('#category_button_color').val();
            var font_size  = this.query('#category_font_size').val();

            return {
                no: no,
                name: name,
                visible: visible,
                button_color: button_color,
                font_size: font_size
            };

        },

        resetInputData: function () {

            this.query('#category_no').val('');
            this.query('#category_name').val('');
            this.query('#category_visible').val('0');
            this.query('#category_button_color').val('os');
            this.query('#category_font_size').val('medium');

        // return {no: no, name: name, visible: visible, button_color: button_color, font_color: font_color};

        },

        setInputData: function (valObj) {

            this.query('#category_no').val(valObj.no);
            this.query('#category_name').val(valObj.name);
            this.query('#category_visible').val() || 0;
            this.query('#category_button_color').val(valObj.button_color);
            this.query('#category_font_size').val(valObj.font_size);
            this.query('#cat_no').val(valObj.no);

        // return {no: no, name: name, visible: visible, button_color: button_color, font_color: font_color};

        },

        add: function  () {
            var inputData = this.getInputData();
            /*
            var inputData = {};
            GREUtils.Dialog.prompt(null, "New Department", "Department No", input);
            inputData.no = input;
            GREUtils.Dialog.prompt(null, "New Department", "Department Name", input);
            inputData.name = input;
            */
            var category = new CategoryModel();
            category.save(inputData);

            var categories = cateModel.find('all', {
                order: "no"
            });
            GeckoJS.Session.add('categories', categories);

            this.resetInputData();
        },

        modify: function  () {
            var inputData = this.getInputData();
            var cateModel = new CategoryModel();

            if(this._selectedIndex >= 0) {

                var categories = GeckoJS.Session.get('categories');
                var category = categories[this._selectedIndex];

                inputData.id = category.id;
                cateModel.id = category.id;
                cateModel.save(inputData);

                var categories = cateModel.find('all', {
                    order: "no"
                });
                GeckoJS.Session.add('categories', categories);
            }
        },

        remove: function() {

            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?")) {
                var cateModel = new CategoryModel();
                if(this._selectedIndex >= 0) {
                    var categories = GeckoJS.Session.get('categories');
                    var category = categories[this._selectedIndex];
                    cateModel.del(category.id);

                    var categories = cateModel.find('all', {
                        order: "no"
                    });
                    GeckoJS.Session.add('categories', categories);
                }
            }
        }

    });

})();

