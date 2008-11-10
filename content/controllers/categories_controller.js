(function(){
    /**
 * Class ViviPOS.CategoriesController
 */
    // GeckoJS.define('ViviPOS.CategoriesController');

    GeckoJS.Controller.extend( {
        name: 'Categories',
        _listObj: null,
        _listDatas: null,
        _selCateNo: null,

        getListObj: function() {
            //if(this._listObj == null) this._listObj = this.query("#simpleListBoxCategory")[0];
            //return this._listObj;
            return this.query("#simpleListBoxCategory")[0];
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
            // this.query('#category_visible').val() || 0;
            this.query('#category_button_color').val(valObj.button_color);
            this.query('#category_font_size').val(valObj.font_size);
            this.query('#cat_no').val(valObj.no);
		
        // return {no: no, name: name, visible: visible, button_color: button_color, font_color: font_color};
        
        },

        add: function  () {
            var inputData = this.getInputData();

            var category = new CategoryModel();
            category.save(inputData);
        
            this.resetInputData();
            this.load();
        },
    
        load2: function () {
            // alert('dddd');
        },
        load: function() {

            var listObj = this.getListObj();
            var cateModel = new CategoryModel();
		
            var categories = cateModel.find('all', {
                order: "no"
            });
            this._listDatas = categories;
            listObj.loadData(categories);
    
        },

        modify: function  () {
            var inputData = this.getInputData();

            var listObj = this.getListObj();
            selectedIndex = listObj.selectedIndex;

            var cateModel = new CategoryModel();

            if(selectedIndex >= 0) {
			
                var category = this._listDatas[selectedIndex];

                inputData.id = category.id;
                cateModel.id = category.id;
                cateModel.save(inputData);
                this.load();
            }
        },
    
        remove: function() {

            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?")) {
                var listObj = this.getListObj();
                selectedIndex = listObj.selectedIndex;
                var cateModel = new CategoryModel();

                if(selectedIndex >= 0) {
                    var category = this._listDatas[selectedIndex];
                    cateModel.del(category.id);
                    this.load();
                }
            }
        },
	
        select: function(){

            var listObj = this.getListObj();
            selectedIndex = listObj.selectedIndex;
            var category = this._listDatas[selectedIndex];

            this._selCateNo = category.no;
            this.resetInputData();
            this.setInputData(category);
		
            // ViviPOS.ProductsController.getInstance().setCatNo(category.no);
            this.window.$do('setCatNo', this._selCateNo, 'Products');

            // this.load_product();
            this.window.$do('load', this._selCateNo, 'Products');

        }
	
    });

})();
