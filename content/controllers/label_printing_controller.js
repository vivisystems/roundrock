(function(){

    var __controller__ = {

       name: 'Tab',

       uses: ['Product', 'InventoryRecord'],

       components: ['Barcode'],

       screenwidth:  GeckoJS.Session.get('screenwidth'),
       screenheight:  GeckoJS.Session.get('screenheight'),

       catePanelView: null,
       individualcatePanelView:null,
       productPanelView: null,

       _decimals: GeckoJS.Configure.read('vivipos.fec.settings.DecimalPoint') || '.',
       _thousands: GeckoJS.Configure.read('vivipos.fec.settings.ThousandsDelimiter') || ',',
       _precision:  GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || ',' ,
       _positivePrice: GeckoJS.Configure.read('vivipos.fec.settings.PositivePriceRequired') || ',' ,

       _tabListPanel: null,
       _countTextbox: null,
       _priceTextbox: null,
       _priceMenuList:null,
       _deleteListButton: null,
       _modifyProductButton: null,
       _deleteProduct:null,
       _template:null,
       _barcodeType:null,
       _template:null,

       _categoriesByNo: {},
       _categoryIndexByNo: {},
       _menulistElement: null,
       _commitments: [],
       _fileNameList: [],
       _replaceProducts: [],
       _barcodeTypeList: [],
       tabList:[],
       legalList:[],

       _selCateIndex: -1,
       _selListIndex: -1,
       _priority: 1,

       _isSave: false,
       _isModify: false,
       _searchButton: true,

        createDepartmentPanel: function (){

            // construct categoryByNo lookup table
            var categories = GeckoJS.Session.get('categories') || [];
            for (var i = 0; i < categories.length; i++) {
                this._categoriesByNo['' + categories[i].no] = categories[i];
                this._categoryIndexByNo['' + categories[i].no] = i;
            };

            // NSIDepartmentsView use rows and columns from preferences, so let's
            // save rows and columns attribute values here and restore them later
            var catpanel = document.getElementById('catescrollablepanel');
            var rows = catpanel.getAttribute('rows');
            var cols = catpanel.getAttribute('cols');

            this.catePanelView =  new NSIDepartmentsView('catescrollablepanel');

            // restore department panel rows and columns here
            catpanel.setAttribute('rows', rows);
            catpanel.setAttribute('cols', cols);
            catpanel.initGrid();

            this.catePanelView.hideInvisible = false;
            this.catePanelView.refreshView(true);

            catpanel.selectedIndex = -1;
            catpanel.selectedItems = [];
        },

        selectDepartment: function(index){

                /* 1.catch department info */
            var category = this.catePanelView.getCurrentIndexData(index);

                /* 2.open dialogWindos */

              // set screen size
            if(this.screenwidth == 1024){
                var width = 450;
                var height = 600;
            }
            else{
                 var width = 400;
                 var height = 470;
            }
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width='+width+',height='+height;
            var priceLevelObj = { selected:"", priceLevel:[] };

            priceLevelObj = this._getPriceLevelObj(category,'category');

            var inputObj = {
                            input0:1, require0:true, numberOnly0:true,digitOnly0:true,
                            numpad:{}, type0:"number", priceLevel:priceLevelObj
                     //   input1:null, require1:false
                            };

             //set defaul peice level
            
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, '', features,
                                       _(category.name), '', _('Number of labels to print'), '', inputObj);

            /* 3.if 'ok' button == true */
            if (inputObj.ok && inputObj.input0 ){

                /* 3.1 query this department products */
                var productTable = new ProductModel();
                var products = [];
                var selectedPriceLevel = inputObj.priceLevel.selected;
                          /* case 1. department */
                    if(!category.Plugroup)
                        products = productTable.find("all", "cate_no="+"'"+category.no+"'");

                          /* case 2. group */
                    else products = productTable.find("all", "link_group LIKE '%"+category.id+"%'");

                if(products.length == 0) return ;
                /* 3.2 a for loop assign count to all product(the department) && push it in tabList[]*/
                products = this.addListProperty(products);
                    for(var i = 0; i< products.length ; i++)
                        {
                            products[i].priority = this._priority;
                            products[i].count = inputObj.input0;
                            products[i].selectedPrice = products[i]['price_level'+selectedPriceLevel];
                            products[i].selectedPrice = this._formatPrice(products[i].selectedPrice);
                            this.tabList.push(products[i]);
                        }
                /* 3.3 show tabList[] */
                this._tabListPanel.datasource = this.validateList();
                this._priority++;
            }
        },

        createIndividualDepartmentPanel: function (){
            // construct categoryByNo lookup table
            var categories = GeckoJS.Session.get('categories') || [];
            for (var i = 0; i < categories.length; i++) {
                this._categoriesByNo['' + categories[i].no] = categories[i];
                this._categoryIndexByNo['' + categories[i].no] = i;
            };

            // NSIDepartmentsView use rows and columns from preferences, so let's
            // save rows and columns attribute values here and restore them later
            var catpanel = document.getElementById('individual_catescrollablepanel');
            var rows = catpanel.getAttribute('rows');
            var cols = catpanel.getAttribute('cols');

            this.individualcatePanelView =  new NSIDepartmentsView('individual_catescrollablepanel');

            // restore department panel rows and columns here
            catpanel.setAttribute('rows', rows);
            catpanel.setAttribute('cols', cols);
            catpanel.initGrid();

            var prodpanel = document.getElementById('individual_prodscrollablepanel');
            rows = prodpanel.getAttribute('rows');
            cols = prodpanel.getAttribute('cols');

            this.productPanelView = new NSIPlusView('individual_prodscrollablepanel');

            // restore department panel rows and columns here
            prodpanel.setAttribute('rows', rows);
            prodpanel.setAttribute('cols', cols);
            prodpanel.initGrid();

            this.individualcatePanelView.hideInvisible = false;
            this.individualcatePanelView.refreshView(true);

            this.productPanelView.hideInvisible = false;
            this.productPanelView.updateProducts();

            this.productPanelView.setCatePanelView(this.individualcatePanelView);

            catpanel.selectedIndex = -1;
            catpanel.selectedItems = [];
        },

        viewProduct: function(index) {

            this.productPanelView.setCatePanelIndex(index);
            this._selCateIndex = index;
        },

        clickPluPanel: function(index){

            var product = this.productPanelView.getCurrentIndexData(index);
            var cloneProduct = GeckoJS.BaseObject.clone(product);
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';

            // set screen size
            if(this.screenwidth == 1024){
                var width = 450;
                var height = 600;
            }
            else{
                 var width = 400;
                 var height = 470;
            }
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width='+width+',height='+height;

            var priceLevelObj = { selected:"", priceLevel:[] };

            priceLevelObj = this._getPriceLevelObj(product,'individual');
            var inputObj = {
                            input0:1, require0:true, numberOnly0:true,digitOnly0:true,
                            numpad:{}, type0:"number", priceLevel:priceLevelObj
                       //   input1:null, require1:false
                            };
           /*var priceLevelObj = { selected:"", priceLevel:[] };

            priceLevelObj = this._getPriceLevelObj(category,'category');

            var inputObj = {
                            input0:1, require0:true, numberOnly0:true,digitOnly0:true,
                            numpad:{}, type0:"number", priceLevel:priceLevelObj
                     //   input1:null, require1:false
                            };*/

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, '', features,
                                       _(product.name),'', _('Number of labels to print'), '', inputObj);

            /* 3.if 'ok' button == true */
            if (inputObj.ok && inputObj.input0 ) {

                var selectedPriceLevel = inputObj.priceLevel.selected;
                cloneProduct.priority = this._priority;
                cloneProduct.count = inputObj.input0;
                cloneProduct.selectedPrice = cloneProduct['price_level'+selectedPriceLevel];
                cloneProduct.selectedPrice = this._formatPrice(cloneProduct.selectedPrice);
                this.tabList.push(cloneProduct);
                this._tabListPanel.datasource = this.validateList();
                this._priority++;
            }
       },

       loadCommitments: function(){

           var inventoryCommitmentModel = new InventoryCommitmentModel();
           this._commitments = inventoryCommitmentModel.getDataSource().fetchAll("SELECT * FROM Inventory_commitments WHERE type='procure'");
           var commitmentList = document.getElementById('commitmentscrollableTablist');
           var CommitmentDateList = [];

           for(var i = 0; i < this._commitments.length; i++){

               var theDay = new Date(this._commitments[i].created*1000);
               CommitmentDateList.push({date:theDay.toLocaleDateString(), memo: this._commitments[i].memo, supplier: this._commitments[i].supplier})
           }
           commitmentList.datasource = CommitmentDateList ;
       },

       searchCommitments: function(){

            var start = document.getElementById('start_date');
            var end = document.getElementById('end_date');

            var startTime = start.value/1000 - 86400
            var endTime = end.value/1000 

           var inventoryCommitmentModel = new InventoryCommitmentModel();
           this._commitments = inventoryCommitmentModel.getDataSource().fetchAll("SELECT * FROM Inventory_commitments WHERE type='procure' AND created >= '"+startTime+"' AND created <= '"+endTime+"'");
           var commitmentList = document.getElementById('commitmentscrollableTablist');
           var CommitmentDateList = [];

           for(var i = 0; i < this._commitments.length; i++){

               var theDay = new Date(this._commitments[i].created*1000);
               CommitmentDateList.push({date:theDay.toLocaleDateString(), memo: this._commitments[i].memo, supplier: this._commitments[i].supplier})
           }
           
           commitmentList.datasource = CommitmentDateList ;
           

         /*
            var query = "SELECT * FROM inventory_records INNER JOIN products WHERE inventory_records.created >= '"+startTime+"' AND inventory_records.created <= '"+endTime+"'  AND inventory_records.product_no = products.no"

            var selectedCommitment = this.InventoryRecord.getDataSource().fetchAll(query);

            selectedCommitment = this.countProductQuentity(selectedCommitment);

            for(var i = 0 ; i< selectedCommitment.length ; i++){

                selectedCommitment[i].priority = this._priority;
                selectedCommitment[i].count = selectedCommitment[i].value;
                this.tabList.push(selectedCommitment[i]);
            }
            this._tabListPanel.datasource = this.validateList();
            this._priority++;*/
       },

        selectCommitment: function(){

            var commitmentListObj = document.getElementById('commitmentscrollableTablist');

            var productDB = this.Product.getDataSource().path + '/' + this.Product.getDataSource().database;
            var sql = "ATTACH '" + productDB + "' AS vivipos;";

            this.InventoryRecord.execute( sql );

            this.sleep(100);
 /*           var selectedCommitmentString ="(";
                  /* selected multiple commitment
                   * the query is
                   *               "SELECT * FROM inventory_records INNER JOIN products
                   *                WHERE all selected.commitment_id by OR
                   *                AND inventory_records.product_no = products.no"          */
  /*          for(var index = 0 ; index < commitmentListObj.selectedItems.length ; index ++){

                selectedCommitmentString = selectedCommitmentString + "inventory_records.commitment_id = '" + this._commitments[commitmentListObj.selectedItems[index]].id + "'";
                    /* if not last element */
 /*               if(!(index +1 == commitmentListObj.selectedItems.length))
                    selectedCommitmentString = selectedCommitmentString + " OR ";
            }
*/
            var selectedCommitmentString = "inventory_records.commitment_id = '" + this._commitments[commitmentListObj.selectedIndex].id + "'";

            var query = "SELECT * FROM inventory_records INNER JOIN products WHERE " + selectedCommitmentString + " AND inventory_records.product_no = products.no"

            var commitmentProducts = this.InventoryRecord.getDataSource().fetchAll(query);          

            for(var i = 0 ; i< commitmentProducts.length ; i++){

                commitmentProducts[i].priority = this._priority;
                commitmentProducts[i].count = commitmentProducts[i].value;
                commitmentProducts[i].selectedPrice = commitmentProducts[i].price_level1;
                commitmentProducts[i].selectedPrice = this._formatPrice(commitmentProducts[i].selectedPrice);
                this.tabList.push(commitmentProducts[i]);
            }
            this._tabListPanel.datasource = this.validateList();
            this._priority++;

       },
/*
       selectAperiod: function(){

            var start = document.getElementById('start_date');
            var end = document.getElementById('end_date');

            var startTime = start.value/1000
            var endTime = end.value/1000

            var productDB = this.Product.getDataSource().path + '/' + this.Product.getDataSource().database;
            var sql = "ATTACH '" + productDB + "' AS vivipos;";

            this.InventoryRecord.execute( sql );
            this.sleep(100);

            var query = "SELECT * FROM inventory_records INNER JOIN products WHERE inventory_records.created >= '"+startTime+"' AND inventory_records.created <= '"+endTime+"'  AND inventory_records.product_no = products.no"

            var selectedCommitment = this.InventoryRecord.getDataSource().fetchAll(query);

            selectedCommitment = this.countProductQuentity(selectedCommitment);

            for(var i = 0 ; i< selectedCommitment.length ; i++){

                selectedCommitment[i].priority = this._priority;
                selectedCommitment[i].count = selectedCommitment[i].value;
                this.tabList.push(selectedCommitment[i]);
            }
            this._tabListPanel.datasource = this.validateList();
            this._priority++;
       },*/

       addBySearch: function(index){

          if(this._searchButton) return;

           var searchVivitreeObject = document.getElementById('plusearchscrollablepanel');

           var product = searchVivitreeObject.datasource.data[index];
           var cloneProduct = GeckoJS.BaseObject.clone(product);


                cloneProduct.priority = this._priority;
                cloneProduct.count = 1;
                cloneProduct.selectedPrice = cloneProduct.price_level1;
                cloneProduct.selectedPrice = this._formatPrice(cloneProduct.selectedPrice);

                this.tabList.push(cloneProduct);
                this._tabListPanel.datasource = this.validateList();
                this._priority++;

                searchVivitreeObject.selectedIndex = -1;
       },

       detectOnlyOneMatch: function(){

           var searchVivitreeObject = document.getElementById('plusearchscrollablepanel');
           if(searchVivitreeObject._datasource.data.length == 1){

                var product = searchVivitreeObject._datasource.data[0];
                product.priority = this._priority;
                product.count = 1;
                product.selectedPrice = product.price_level1;
                product.selectedPrice = this._formatPrice(product.selectedPrice);
                this.tabList.push(product);
                this._tabListPanel.datasource = this.validateList();
                this._priority++;
           }
           this._searchButton = false;
       },

       setSearchButtonFalse: function(){

          this._searchButton = false;
       },

       setSearchButtonTrue: function(){

          this._searchButton = true;
       },

       validateList: function(){

            /* is element repeated ?
             * 1.find repeated item
             * 2.check priority
             * 3.remove low priority*/
           for(var i = 0; i<this.tabList.length; i++){

               this.removeRepeatedProduct();
             }
           // this.alertReplaceProducts();
           this._isSave = false ;

           this.setCount(this._tabListPanel.selectedIndex);

           //set price configureation
         
           return this.tabList;
        },

        _formatPrice: function(price){

                var options = {
                decimals: this._decimals,
                thousands: this._thousands,
                places: ((this._precision>0)?this._precision:0)
            };
            // format display precision
               return  GeckoJS.NumberHelper.format(price, options);
        },

       detectTabList: function(){

         if(this.tabList == ""){

               this._modifyProductButton.disabled = true;
               this._deleteProduct.disabled = true;
               return ;
           }else{ /*this.setCount(this._tabListPanel.selectedIndex); */}

           if(this._tabListPanel.selectedIndex >= 0){

               this._deleteProduct.disabled = false;
               this._modifyProductButton.disabled = false;
           }
       },

       /* If found the repeated products in list. Compare ther priority, then delete low priority.
        * biger number is higher priority*/
       removeRepeatedProduct: function(){

           for(var i = 0; i<this.tabList.length; i++){
               for(var j = i; j<this.tabList.length; j++){

                   if(this.tabList[i].name === this.tabList[j].name){

                       if(this.tabList[i].priority > this.tabList[j].priority){

                           this._replaceProducts.push(this.tabList[j])
                           this.tabList.splice(j,1);
                           return ;
                       }
                       else if(this.tabList[i].priority < this.tabList[j].priority){

                                this._replaceProducts.push(this.tabList[i])
                                this.tabList.splice(i,1);
                                return ;
                            } //end of else if
                   } //end of if
               } //end of for
           } // end of for
       },

       countProductQuentity: function(list){

           for(var i = 0; i<list.length; i++){

               list = this.plusRepeatedProductQuentity(list);
           }
           return list
        },

        plusRepeatedProductQuentity: function(list){

            for(var i = 0; i< list.length; i++){
                for(var j = i+1; j< list.length; j++){

                    if(list[i].name === list[j].name){

                        list[i].value = list[i].value + list[j].value
                        list.splice(j,1);
                        return list;
                    }
                }
            }
            return list ;
        },

        /* add two property 1.priority to determine order
         *                  2.tab count*/
        addListProperty: function(list){

            for(var i = 0; i<list.length; i++){
                list[i].priority = 0;
                list[i].count = 0;
                return list;
            }
        },

        setCount: function(index){

            if(index == -1 ) return;

            GeckoJS.FormHelper.unserializeFromObject('setProductForm', this.tabList[index]);
            
            this.setPrice(index);

            this._modifyProductButton.disabled = false;
            this._deleteProduct.disabled = false;
            this._countTextbox.removeAttribute('disabled');
      //      this._priceMenuList.selectedIndex = -1;
      //      this._priceTextbox.disabled = false ;
            this._priceMenuList.disabled = false ;

            if(this.tabList.length != 0)
            this._priceMenuList.selectedIndex = this.findMatchPrice( this._priceMenuList, this.tabList[index].selectedPrice );
         },

      /* load product info and set pricelevel menulist*/
        setPrice:function(index){
            
            var product = this.tabList[index];

            if(!product)
                return;

            this._priceMenuList.removeAllItems();
            this._priceMenuList.setAttribute('label',_('Price Level'));

            if(product.level_enable1 ){
                 this._priceMenuList.appendItem(_('Level 1')+' :  '+product.price_level1, product.price_level1);
            }
            if(product.level_enable2 ){
                 this._priceMenuList.appendItem(_('Level 2')+' :  '+product.price_level2, product.price_level2);
            }
            if(product.level_enable3 ){
                 this._priceMenuList.appendItem(_('Level 3')+' :  '+product.price_level3, product.price_level3);
            }
            if(product.level_enable4 ){
                 this._priceMenuList.appendItem(_('Level 4')+' :  '+product.price_level4, product.price_level4);
            }
            if(product.level_enable5 ){
                 this._priceMenuList.appendItem(_('Level 5')+' :  '+product.price_level5, product.price_level5);
            }
            if(product.level_enable6 ){
                 this._priceMenuList.appendItem(_('Level 6')+' :  '+product.price_level6, product.price_level6);
            }
            if(product.level_enable7 ){
                 this._priceMenuList.appendItem(_('Level 7')+' :  '+product.price_level7, product.price_level7);
            }
            if(product.level_enable8 ){
                 this._priceMenuList.appendItem(_('Level 8')+' :  '+product.price_level8, product.price_level8);
            }
            if(product.level_enable9 ){
                 this._priceMenuList.appendItem(_('Level 9')+' :  '+product.price_level9, product.price_level9);
            }


        },

        modifyCount: function(){

            if( !GeckoJS.FormHelper.isFormModified('setProductForm'))
               return ;
            if(this._tabListPanel.selectedIndex == -1) return ;
            this.tabList[this._tabListPanel.selectedIndex].count = this._countTextbox.value;
            this.tabList[this._tabListPanel.selectedIndex].selectedPrice = this._priceMenuList.value;

            GeckoJS.FormHelper.unserializeFromObject('setProductForm', this.tabList[this._tabListPanel.selectedIndex]);            
            
            this.validateList();
            this._tabListPanel.refresh();

        },

        removeTabListProduct: function(){

             this.tabList.splice( this._tabListPanel.selectedIndex, 1);

             if(this.tabList.length == this._tabListPanel.selectedIndex)
                  this._tabListPanel.view.selection.select(this._tabListPanel.selectedIndex-1);

             this._tabListPanel.datasource = this.tabList;
             this._tabListPanel.ensureRowIsVisible(this._tabListPanel.selectedIndex);
           //  this.validateList();
             this._tabListPanel.refresh();
             this.setCount(this._tabListPanel.selectedIndex);

             if(this.tabList == ""){

                 this._countTextbox.value = 0;         
                 this.initialList();
             }
        },

        saveList: function(){

            if(this.tabList == ""){

                GREUtils.Dialog.alert(this.topmostWindow, _('Save Product List'), _('The list is empty'));
                return ;
            }
           if(this._tabListPanel.selectedIndex != -1)
            this.modifyCount();

            // set screen size
            if(this.screenwidth == 1024){
                var width = 450;
                var height = 300;
            }
            else{
                 var width = 300;
                 var height = 233;
            }
           
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width='+width+',height='+height;
            var inputObj = {
                             input0:null, require0:true, numberOnly0:false
                        //   input1:null, require1:false
                             };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, '', features,
                                        _('Save Product List'), '', _('List Name'), '', inputObj);

             /* 3.if 'ok' button == true */
            if (inputObj.ok && inputObj.input0 ){

            var listName = inputObj.input0;
            var isFileNameExist = Array.indexOf(this._fileNameList, listName)

            if( isFileNameExist != -1){

                var action = this.checkSave('replace',_('This list already exists. Do you want to replace this list?'));

                if(action == 1){
                    this.saveList();
                    return;
                }
            }
               /* check has same filename */
             if( isFileNameExist == -1 )
                 this._fileNameList.push(listName);

             GeckoJS.Configure.write('vivipos.fec.settings.tabs.fileName', GeckoJS.BaseObject.serialize(this._fileNameList));
             GeckoJS.Configure.write('vivipos.fec.settings.tabs.'+listName, GeckoJS.BaseObject.serialize(this.tabList));

             this._isSave = true ;
             this._menulistElement.removeAllItems();
             this.load();

                 if(isFileNameExist == -1){

                    OsdUtils.info(_('New list [%S] has been generated', [listName]));

                    this._menulistElement.selectedIndex = this._fileNameList.length;
                    this._selListIndex = this._fileNameList.length -1;
                }
                else{
                    
                    OsdUtils.info(_('The list [%S] has been replaced', [listName]));
                    isFileNameExist = Array.indexOf(this._fileNameList, listName)
                    this._menulistElement.selectedIndex = isFileNameExist + 1 ;
                    this._selListIndex = isFileNameExist;
                }
                this._deleteListButton.disabled = false ;
            }
        },

        loadList: function(index){

            if( (this.tabList != "" && this._isSave == false )|| GeckoJS.FormHelper.isFormModified('setProductForm')){
                var action = this.checkSave('save',_('You have made changes to the current list. Save changes ?'));

                switch( action )
                {
                    case 0: this.modifyCount();
                            this.saveList();
                            return;

                    case 1: this._menulistElement.selectedIndex = this._selListIndex + 1 ;
                            return ;
                    case 2:
                }
            }
            if(index === 0){

                this.initialList();
                return;
            }else if(index == this._selListIndex +1 && this._selListIndex != -1)
                     return;

            this._selListIndex = index-1;
            this.doLoadList();
            this._tabListPanel.selection.clearSelection();
        },

       doLoadList: function(){

           this.tabList = GeckoJS.BaseObject.unserialize( GeckoJS.Configure.read('vivipos.fec.settings.tabs.' + this._fileNameList[this._selListIndex]));

           this._tabListPanel.datasource = this.initialPriority();
           this._tabListPanel.refresh();
           this.initialPriceCount();
           this._isSave = true ;
           this._deleteListButton.disabled = false ;     
       },

       deleteList: function(){

           if(this._selListIndex === -1)
               return;

           var filename = this._fileNameList[this._selListIndex];
           GeckoJS.Configure.remove('vivipos.fec.settings.tabs.'+ filename);

           this._fileNameList.splice(this._selListIndex, 1);

           GeckoJS.Configure.write('vivipos.fec.settings.tabs.fileName', GeckoJS.BaseObject.serialize(this._fileNameList));

           this._menulistElement.removeAllItems();
           this.initialList();
           this.load();
           this._menulistElement.selectedIndex = 0;
           this._selListIndex = -1;
        },

        initialList: function(){

            this.tabList = [];
            this._selListIndex = -1;

            this._tabListPanel.selection.clearSelection();
            this._deleteListButton.disabled = true;
            this._modifyProductButton.disabled = true;
            this._deleteProduct.disabled = true;
            this._countTextbox.setAttribute('disabled',true);
            //this._priceTextbox.disabled = true;
            this._priceMenuList.disabled = true;
            

            this._tabListPanel.datasource = this.tabList;
            
            this._tabListPanel.selectedIndex = -1 ;
            this._tabListPanel.refresh();

            this.initialPriceCount();
           // this.setPrice();
        },

        initialPriceCount: function(){

            GeckoJS.FormHelper.reset('setProductForm');
            this._priceMenuList.setAttribute('label',_('Price Level'));
        },

        printList: function(barcodeType, template){

            var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                    .getService( Components.interfaces.nsIWindowMediator ).getMostRecentWindow( 'Vivipos:Main' );

            var label = mainWindow.GeckoJS.Controller.getInstanceByName( 'Print' );
            barcodeType = '[&'+ barcodeType + ']';

            label.printLabel(this.legalList, barcodeType, template);
        },
       

        load: function(){

            this._countTextbox = document.getElementById('count_textbox');            
            this._priceMenuList = document.getElementById('priceList');
            this._deleteListButton = document.getElementById('delete_list');
            this._modifyProductButton = document.getElementById('modify_product');
            this._deleteProduct= document.getElementById('delete_product');

            this._tabListPanel = document.getElementById('printscrollableTablist');

            /* load savedList*/
            this._menulistElement = document.getElementById('tabList');
            this._fileNameList = GeckoJS.BaseObject.unserialize( GeckoJS.Configure.read('vivipos.fec.settings.tabs.fileName'));
            this._menulistElement.appendItem(_('New List'));

            if(!this._fileNameList)
               this._fileNameList = [];

            for(var i = 0; i < this._fileNameList.length; i++){

                this._menulistElement.appendItem( this._fileNameList[i]);
            }
/*
            var today = new Date();
            var yy = today.getYear() + 1900;InventoryCommitmentModel
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = ( new Date( yy, mm, dd, 0, 0, 0 ) ).getTime();
            var end = ( new Date( yy, mm, dd + 1, 0, 0, 0 ) ).getTime();

            document.getElementById( 'start_date' ).value = start;
            document.getElementById( 'end_date' ).value = end;*/

            GeckoJS.FormHelper.reset('setProductForm');
            this._priceMenuList.setAttribute('label',_('Price Level'));
         },

         loadBarcodeTypes: function(){

             this.getBarcodeTypeList();   
         },

         alertReplaceProducts: function (){

             if(this._replaceProducts.length === 0)
                 return;

             var alert = "";

             for(var i =0 ; i<this._replaceProducts.length;i++){
                         alert = alert + this._replaceProducts[i].name + "\n";
             }
        // alert replaced products
        //     GREUtils.Dialog.alert(this.topmostWindow, _('Replaces products'),
        //                              alert + _("have been replaced"));

             this._replaceProducts = [];
         },

         alertIllegalBarcodeProduct: function(list){

           var alert = "";

            for(var i =0 ; i<list.length;i++){
                    
                         alert = alert + list[i].name +' '+list[i].barcode+"\n";
             }

             return alert;
         },

         initialPriority: function(){

             for(var i = 0; i < this.tabList.length ;i++){

                 this.tabList[i].priority = 0 ;
             }
             return this.tabList ;
         },

         findMatchPrice: function(priceObj, price){
             
             for(var x = 0 ; x < priceObj.itemCount ; x++){

                if( this._formatPrice(priceObj.menupopup.childNodes[x].value) == price)
                    return x ;
             }
         },

         checkSave: function(selecetedCase, messege){

             var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
             switch(selecetedCase){

             case 'save' :

                   var check = {data: false};
                   var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                               prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING +
                               prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;
                /* action = 0  Save
                 * action = 1  Cancal
                 * action = 2  Discard    */
                    var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),messege,
                                               flags, _('Save'), '', _('Discard Changes'), null, check);
                    return action;

             case 'replace':

                   var check = {data: false};
                   var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                               prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING ;
                  /* action = 0  Yes
                   * action = 1  No  */
                    var action = prompts.confirmEx(this.topmostWindow,
                                               _('Save List'),messege,
                                               flags, _('Yes'), _('No'), '', null, check);
                    return action;

              case 'barcode':

                   var check = {data: false};
                   var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                               prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING ;
                  /* action = 0  Yes
                   * action = 1  No  */
                    var action = prompts.confirmEx(this.topmostWindow,
                                               _('Barcode Warning'),messege,
                                               flags, _('Yes'), _('No'), '', null, check);
                    return action;
             }
         },

         getBarcodeTypeList: function(){

             var typeString = GeckoJS.Configure.read('vivipos.fec.registry.devicemodels.argox-os-203.barcodetype');
             var i = 0;

             while(typeString != ""){

                 var end = typeString.indexOf(',');
                 var type = typeString.slice(0,end);

                 this._barcodeTypeList.push({no:i, name:type});
                 i++;

                 typeString = typeString.slice(end+1);

                 if(typeString.indexOf(',') == -1){

                     this._barcodeTypeList.push({no:i, name:typeString});
                     typeString = "";
                 }
             }
        },

        checkBarcodeType3OF9: function(oldObject){

            var object ={list: oldObject.legalList, legalList: [], illegalList: oldObject.illegalList, islegal: oldObject.islegal};

            for(var i =0 ; i< object.list.length ; i++){

                if(this.Barcode.isValid3OF9(object.list[i].barcode))
                     object.legalList.push(object.list[i]);
                                  
                else{
                     list[i].comm = _('Invalid Barcode');
                     object.illegalList.push(object.list[i]);
                     object.islegal = false;
                }
            }          
            return object ; 
        },
        
        _checkHasBarcode: function(obj){

             for(var x = 0 ; x< obj.list.length ; x++){

                  if(obj.list[x].barcode == "" || obj.list[x].barcode.search(" ") != -1){

                       obj.list[x].comm = _('No Barcode');
                       obj.illegalList.push(obj.list[x]);
                       
                       obj.islegal = false ;
                  }
                  else
                      obj.legalList.push(obj.list[x]);
                      
             }

             return obj;
        }
        ,_checkPriceZero: function(obj){
            
             for(var x = 0 ; x< obj.legalList.length ; x++){

                  if(obj.legalList[x].selectedPrice == 0){

                       obj.legalList[x].comm = _('Zero Price');

                       obj.illegalList.push(obj.legalList[x]);
                       obj.legalList.splice(x,1);
                       x--
                       obj.islegal = false ;
                  }
              }
              return obj;
        },

        printlabel: function(){

          if(this.tabList == ""){

                GREUtils.Dialog.alert(this.topmostWindow, _('Print label'), _('The list is empty'));
                return ;
            }                                       

            this.selectTemplate();
        },

        alertErrorpanel: function(list){

            var errorPanel = document.getElementById('error_panel');
                if (errorPanel) {
                    var errorlist = document.getElementById('errorscrollablepanel');
                    if (errorlist) {
                        errorlist.datasource = list;

                        errorPanel.openPopupAtScreen(0, 0);
                    }
                }
        },

        continuePrinting: function(){

             document.getElementById('error_panel').hidePopup();
             this.printList(this._barcodeType, this._template);
        },

        selectTemplate: function(){
            
            var aURL = 'chrome://viviecr/content/select_template.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            var inputObj = {
                selectedTemplate: "",
                selectedBarcode: ""
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('select_template'), aFeatures, inputObj);
            if (inputObj.ok) {

               this._template = inputObj.selectedTemplate
               this._barcodeType = inputObj.selectedBarcode

               var object = {};

               object = this._initCheckBarcode(this.tabList);

               object = this._checkHasBarcode(object);

               if(this._barcodeType == '3OF9')
                   object = this.checkBarcodeType3OF9(object);
               else
                   object = this.isvalidBarcode(object, this._barcodeType);

               if(this._positivePrice != ',')
                   object = this._checkPriceZero(object);

               if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', this.dump(object));

               this.legalList = object.legalList;

               if(this.legalList.length == 0){

                    GREUtils.Dialog.alert(this.topmostWindow, _('Print label'), _('All of the selected products have invalid price or barcode'));
                    return ;
               }

               if(!object.islegal)
                   this.alertErrorpanel(object.illegalList);
               else this.continuePrinting();
            }
        },

        _initCheckBarcode: function(list){

            var object = { list: list, legalList:[], illegalList:[], islegal: true };
            return object ;
        },

         _getPriceLevelObj: function (category, action){

          var DefaultPriceLevel = GeckoJS.Configure.read('vivipos.fec.settings.DefaultPriceLevel');

          var priceLevelObj = { selected: DefaultPriceLevel, priceLevel:[]};
          var products = [];
          var levelArray =['level_enable1','level_enable2','level_enable3','level_enable4','level_enable5','level_enable6','level_enable7','level_enable8','level_enable9',];
          var productTable = new ProductModel();
          var isPriceLevelEnable = true ;
          
          switch( action )
                 {
                     case 'category':
                         
                              if(!category.Plugroup)
                                   products = productTable.find("all", "cate_no="+"'"+category.no+"'");

                              else products = productTable.find("all", "link_group LIKE '%"+category.id+"%'");

                              return this._validatePriceLevel(priceLevelObj, products, levelArray, isPriceLevelEnable);
                              

                      case 'individual':

                               products = [category];
                               
                               return this._validatePriceLevel(priceLevelObj, products, levelArray, isPriceLevelEnable);


                   }
         },

         _validatePriceLevel: function (priceLevelObj, products, levelArray, isPriceLevelEnable){

             for( var levelIndex = 0 ; levelIndex < 9; levelIndex++){

                    if(products.length == 1)
                        isPriceLevelEnable = products[0][levelArray[levelIndex]]

                    for( var i = 0; i< products.length-1 ; i++){

                        isPriceLevelEnable = products[i][levelArray[levelIndex]] && products[i+1][levelArray[levelIndex]]
                    }
                 if(isPriceLevelEnable)
                 priceLevelObj.priceLevel.push(levelIndex+1);
             }
                                 //check if DefaultPriceLevel is validated
             var index = priceLevelObj.priceLevel.indexOf( priceLevelObj.selected );

             if(index == -1)
             priceLevelObj.selected = 1;

             return priceLevelObj ;
         },

         test: function(){

             alert(this.Barcode.getUPCCheckDigit('0654321'));
         },

         exit: function() {

             if( (this.tabList != "" && !this._isSave) || GeckoJS.FormHelper.isFormModified('setProductForm')){

                 var action = this.checkSave('save',_('You have made changes to the current list. Save changes before existing?'));

                 switch( action )
                 {
                     case 0: this.modifyCount();
                             this.saveList();
                              window.close();

                     case 1: return ;

                     case 2: window.close();
                 }
             }
          window.close();
        },
        
/**************************************************** Barcode Checking *************  >_<  ***********  Q_Q  **********  ^_^  ************  +____=  */
      
      /* Checkout Main Function */
       isvalidBarcode: function(object, barcodeType){

            /* Filter isvalidCodes*/
            object = this.isvalidChar(object, barcodeType);

            /* Filter checksum rule*/
            object = this.isvalidChecksum(object, barcodeType);

            return object;
        },
        
/****************  Check isValidCodes by selected barcode type****************>_<  ***********  Q_Q  **********  ^_^  ************  +____= **/

        checkBarcodeValidCodesBySelected: function(barcode, barcodeType){

               switch( barcodeType )
                 {
                        /* length: 11 + 1
                         * valid codes: 0~9  */
                        case 'UPC-A':
                                     if(barcode.length != 11 && barcode.length != 12)
                                         return false;
                                     return this.Barcode.isNumeric(barcode);
                                     break;

                         /* length: 12 + 1
                          * valid codes: 0~9  */
                         case 'EAN-13':
                                     if(barcode.length != 12 && barcode.length != 13)
                                         return false;
                                     return this.Barcode.isNumeric(barcode);
                                     break;

                         /* length: variable
                          * valid codes:  ASCII 0~127  */
                         case 'CODE128':
                                     return this.Barcode.isValidCODE128(barcode);
                                     break;

                         /* length: variable
                         * valid codes: 0~9  */
                         case 'I25':
                                     return this.Barcode.isNumeric(barcode);
                                     break;
                 }
       },

/****************************  Checksum by selected barcode type****************>_<  ***********  Q_Q  **********  ^_^  ************  +____= **/

      checkBarcodeValidChecksumBySelected: function(barcode, barcodeType){

          var checksum = '';

          switch( barcodeType )
                 {
                        case 'UPC-A':
                                     if(barcode.length == 11)
                                         return true;
                                     
                                     checksum = this.Barcode.getUPCCheckDigit(barcode.substr(0,11));
                                     
                                     if(checksum == barcode[11])
                                         return true;                                    
                                     break;

                        case 'EAN-13':
                                     if(barcode.length == 12)
                                         return true;

                                     checksum = this.Barcode.getEAN13CheckDigit(barcode.substr(0,12));

                                     if(checksum == barcode[12])
                                         return true;
                                     break;
                       case 'I25':
                       case 'CODE128': return true ;
                                       break;
                 }
          return false;
      },
/*******************************************************************************>_<  ***********  Q_Q  **********  ^_^  ************  +____= **/
       isvalidChar: function( oldObject, barcodeType){

             var object ={list: oldObject.legalList, legalList: [], illegalList: oldObject.illegalList, islegal: oldObject.islegal};

             for(var i = 0 ; i< object.list.length; i++){

                 if(this.checkBarcodeValidCodesBySelected(object.list[i].barcode, barcodeType))
                     object.legalList.push(object.list[i]);

                 else{
                     object.list[i].comm = _('Invalid Barcode');
                     object.illegalList.push(object.list[i]);
                     object.islegal = false;
                 }
             }
             return object;
       },

       isvalidChecksum: function(oldObject, barcodeType){

            var object = { list: oldObject.legalList, legalList: [], illegalList: oldObject.illegalList, islegal: oldObject.islegal};
               var barcode = '';
               var checksum = 0 ;

               for( var i= 0; i< object.list.length; i++){

                   barcode = object.list[i].barcode;

                   if( this.checkBarcodeValidChecksumBySelected(barcode, barcodeType))
                       object.legalList.push(object.list[i]);

                   else{
                           object.list[i].comm = _('CHECKSUM ERROR');
                           object.illegalList.push(object.list[i]);
                           object.islegal = false;
                       
                   }
               }
               return object;
       }
    };

   GeckoJS.Controller.extend(__controller__);

})();