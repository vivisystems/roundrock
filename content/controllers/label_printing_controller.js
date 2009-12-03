(function(){

    var __controller__ = {

       name: 'Tab',

       uses: ['Product', 'InventoryRecord'],

       screenwidth: 800,
       screenheight: 600,
       catePanelView: null,
       individualcatePanelView:null,
       productPanelView: null,
       _tabListPanel: null,
       _countTextbox: null,
       _priceTextbox: null,
       _priceMenuList:null,
       _deleteListButton: null,
       _modifyProductButton: null,
       _deleteProduct:null,
       
       _categoriesByNo: {},
       _categoryIndexByNo: {},
       _menulistElement: null,
       _commitments: [],
       _fileNameList: [],      
       _replaceProducts: [],
       _barcodeTypeList: [],
       tabList:[],

       _selCateIndex: -1,
       _selListIndex: -1,
       _priority: 1,

       _isSave: false,
       _isModify: false,
       
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
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=350';
            var inputObj = {
                            input0:null, require0:true, numberOnly0:true
                     //   input1:null, require1:false
                            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _(''), features,
                                       _(category.name), '', _('Count'), '', inputObj);

            /* 3.if 'ok' button == true */
            if (inputObj.ok && inputObj.input0 ){

                /* 3.1 query this department products */
                var productTable = new ProductModel();
                var products = [];
                          /* case 1. department */
                    if(!category.Plugroup)
                        products = productTable.find("all", "cate_no="+"'"+category.no+"'");

                          /* case 2. group */
                    else products = productTable.find("all", "link_group LIKE '%"+category.id+"%'");

                /* 3.2 a for loop assign count to all product(the department) && push it in tabList[]*/
                products = this.addListProperty(products);
                    for(var i = 0; i< products.length ; i++)
                        {
                            products[i].priority = this._priority;
                            products[i].count = inputObj.input0;
                            products[i].selectedPrice = products[i].price_level1;
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
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=350';
            var inputObj = {
                          input0:null, require0:true, numberOnly0:true
                     //   input1:null, require1:false
                           };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _(''), features,
                                       _(product.name), '', _('Count'), '', inputObj);

            /* 3.if 'ok' button == true */
            if (inputObj.ok && inputObj.input0 ) {
                
                cloneProduct.priority = this._priority;
                cloneProduct.count = inputObj.input0;
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

       executeProcurement: function(){

       
       },

        selectCommitment: function(){

            var commitmentListObj = document.getElementById('commitmentscrollableTablist');

            var productDB = this.Product.getDataSource().path + '/' + this.Product.getDataSource().database;
            var sql = "ATTACH '" + productDB + "' AS vivipos;";
        
            this.InventoryRecord.execute( sql );

            this.sleep(100);
            var selectedCommitmentString ="(";
                  /* selected multiple commitment 
                   * the query is
                   *               "SELECT * FROM inventory_records INNER JOIN products
                   *                WHERE all selected.commitment_id by OR
                   *                AND inventory_records.product_no = products.no"          */
            for(var index = 0 ; index < commitmentListObj.selectedItems.length ; index ++){

                selectedCommitmentString = selectedCommitmentString + "inventory_records.commitment_id = '" + this._commitments[commitmentListObj.selectedItems[index]].id + "'";
                    /* if not last element */
                if(!(index +1 == commitmentListObj.selectedItems.length))
                    selectedCommitmentString = selectedCommitmentString + " OR ";
            }

            selectedCommitmentString = selectedCommitmentString + ")";
     
            var query = "SELECT * FROM inventory_records INNER JOIN products WHERE" + selectedCommitmentString + "AND inventory_records.product_no = products.no"

            var selectedCommitment = this.InventoryRecord.getDataSource().fetchAll(query);

            selectedCommitment = this.countProductQuentity(selectedCommitment);
              
            for(var i = 0 ; i< selectedCommitment.length ; i++){

                selectedCommitment[i].priority = this._priority;
                selectedCommitment[i].count = selectedCommitment[i].value;
                this.tabList.push(selectedCommitment[i]);
            }
            this._tabListPanel.datasource = this.validateList();
            this._priority++;
            
       },

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
       },

       addBySearch: function(index){

           var searchVivitreeObject = document.getElementById('plusearchscrollablepanel');
           var product = searchVivitreeObject._datasource.data[index];
           
                product.priority = this._priority;
                product.count = 1;
                this.tabList.push(product);
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
                this.tabList.push(product);
                this._tabListPanel.datasource = this.validateList();
                this._priority++;
           }
       },

       validateList: function(){
 
            /* is element repeated ?
             * 1.find repeated item
             * 2.check priority
             * 3.remove low priority*/
           for(var i = 0; i<this.tabList.length; i++){

               this.removeRepeatedProduct();
             }
           this.alertReplaceProducts();
           this._isSave = false ;
           return this.tabList;
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

       /* If find the repeated products in list. Compare ther priority, then delete low priority.
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

            GeckoJS.FormHelper.unserializeFromObject('setProductForm', this.tabList[index]);
            this.setPrice(index);
            this._modifyProductButton.disabled = false;
            this._deleteProduct.disabled = false;
            this._countTextbox.disabled = false ;
      //      this._priceTextbox.disabled = false ;
         },

        setPrice:function(index){

            var product = this.tabList[index];

            this._priceMenuList.removeAllItems();
           

            if(product.level_enable1 ){
                 this._priceMenuList.appendItem('Price Level1   '+product.price_level1);
            }
            if(product.level_enable2 ){
                 this._priceMenuList.appendItem('Price Level2   '+product.price_level2);
            }
            if(product.level_enable3 ){
                 this._priceMenuList.appendItem('Price Level3   '+product.price_level3);
            }
            if(product.level_enable4 ){
                 this._priceMenuList.appendItem('Price Level4   '+product.price_level4);
            }
            if(product.level_enable5 ){
                 this._priceMenuList.appendItem('Price Level5   '+product.price_level5);
            }
            if(product.level_enable6 ){
                 this._priceMenuList.appendItem('Price Level6   '+product.price_level6);
            }
            if(product.level_enable7 ){
                 this._priceMenuList.appendItem('Price Level7   '+product.price_level7);
            }
            if(product.level_enable8 ){
                 this._priceMenuList.appendItem('Price Level8   '+product.price_level8);
            }
            if(product.level_enable9 ){
                 this._priceMenuList.appendItem('Price Level9   '+product.price_level9);
            }


        },

        modifyCount: function(){             

           // if( !GeckoJS.FormHelper.isFormModified('setProductForm'))
           //     return ;
               
            this.tabList[this._tabListPanel.selectedIndex].count = this._countTextbox.value;
            this.tabList[this._tabListPanel.selectedIndex].price_level1 = this._priceTextbox.value;
            
            GeckoJS.FormHelper.unserializeFromObject('setProductForm', this.tabList[this._tabListPanel.selectedIndex]);

            this.validateList();
            this._tabListPanel.refresh();
           
        },

        removeTabListProduct: function(){
         
             this.tabList.splice( this._tabListPanel.selectedIndex, 1);
             this._tabListPanel.datasource = this.tabList;
             this.validateList();
             this._tabListPanel.refresh();
             this.setCount(this._tabListPanel.selectedIndex);

             if(this.tabList == ""){

                 this._countTextbox.value = 0;
                 this._priceTextbox.value = 0;
                 this.initialList();
             }
        },

        saveList: function(){

            if(this.tabList == ""){

                GREUtils.Dialog.alert(this.topmostWindow, _('Save Tab List'), _('The List is empty'));
                return ;
            }
           if(this._tabListPanel.selectedIndex != -1)
            this.modifyCount();

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=300,height=233';
            var inputObj = {
                             input0:null, require0:true, numberOnly0:false
                        //   input1:null, require1:false
                             };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _(''), features,
                                        _('Save List'), '', _('FileName'), '', inputObj);

             /* 3.if 'ok' button == true */
            if (inputObj.ok && inputObj.input0 ){
                
            var listName = inputObj.input0;
            var isFileNameExist = Array.indexOf(this._fileNameList, listName)

            if( isFileNameExist != -1){

                var action = this.checkSave('replace','This name is exist. Replace the file ?');

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

                     GREUtils.Dialog.alert(this.topmostWindow,'',
                        _( 'New tab list' ) + ' ' + listName + ' ' + _( 'has been generated' ) + '.'
                     );
                         
                    this._menulistElement.selectedIndex = this._fileNameList.length;
                    this._selListIndex = this._fileNameList.length -1;
                }
                else{

                    GREUtils.Dialog.alert(
                        this.topmostWindow,'',
                        _( 'Tab list' ) + ' ' + listName + ' ' + _( 'has been replaced' ) + '.'
                    );
                    isFileNameExist = Array.indexOf(this._fileNameList, listName)
                    this._menulistElement.selectedIndex = isFileNameExist + 1 ;
                    this._selListIndex = isFileNameExist;
                }
                this._deleteListButton.disabled = false ;
            } 
        },

        loadList: function(index){

            if( (this.tabList != "" && this._isSave == false )|| GeckoJS.FormHelper.isFormModified('setProductForm')){
                var action = this.checkSave('save',_('Save list before loading?'));

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
            
            this._deleteListButton.disabled = true;
            this._modifyProductButton.disabled = true;
            this._deleteProduct.disabled = true;
            this._countTextbox.disabled = true;
            this._priceTextbox.disabled = true;

            this._tabListPanel.datasource = this.tabList;
            this._tabListPanel.refresh();

            this.initialPriceCount();
        },

        initialPriceCount: function(){

            GeckoJS.FormHelper.reset('setProductForm');
        },

        printList: function(){
        
            var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                    .getService( Components.interfaces.nsIWindowMediator ).getMostRecentWindow( 'Vivipos:Main' );
            
            var label = mainWindow.GeckoJS.Controller.getInstanceByName( 'Print' );

            try{ label.printLabel(this.tabList);}catch(e){alert(e);}
        },

        load: function(){
            
            this._countTextbox = document.getElementById('count_textbox');
            this._priceTextbox  = document.getElementById('price_level1_textbox');
            this._priceMenuList = document.getElementById('priceList');
            this._deleteListButton = document.getElementById('delete_list');
            this._modifyProductButton = document.getElementById('modify_product');
            this._deleteProduct= document.getElementById('delete_product');

            this._tabListPanel = document.getElementById('printscrollableTablist');
          
            /* load savedList*/
            this._menulistElement = document.getElementById('tabList');
            this._fileNameList = GeckoJS.BaseObject.unserialize( GeckoJS.Configure.read('vivipos.fec.settings.tabs.fileName'));
            this._menulistElement.appendItem('Initial List');

            if(!this._fileNameList)
               this._fileNameList = [];
       
            for(var i = 0; i < this._fileNameList.length; i++){

                this._menulistElement.appendItem( this._fileNameList[i]);
            }
         
            var today = new Date();
            var yy = today.getYear() + 1900;InventoryCommitmentModel
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = ( new Date( yy, mm, dd, 0, 0, 0 ) ).getTime();
            var end = ( new Date( yy, mm, dd + 1, 0, 0, 0 ) ).getTime();

            document.getElementById( 'start_date' ).value = start;
            document.getElementById( 'end_date' ).value = end;
            
            GeckoJS.FormHelper.reset('setProductForm');
         },

         alertReplaceProducts: function (){

             if(this._replaceProducts.length === 0)
                 return;

             var alert = "";

             for(var i =0 ; i<this._replaceProducts.length;i++){
                         alert = alert + this._replaceProducts[i].name + "\n";
             }
             
             GREUtils.Dialog.alert(this.topmostWindow, _('Replaces products'),
                                      _(alert + "have been replaced"));

             this._replaceProducts = [];
         },

         initialPriority: function(){

             for(var i = 0; i < this.tabList.length ;i++){

                 this.tabList[i].priority = 0 ;
             }
             return this.tabList ;
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
                                               _('Replace'),messege,
                                               flags, _('Yes'), _('No'), '', null, check);
                    return action;
             }
         },

         getBarcodeTypeList: function(){

             var typeString = GeckoJS.Configure.read('vivipos.fec.registry.templates.label-simple-testing-2.barcodetype');
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

        checkBarcodeDialog: function(){
        
            var aURL = 'chrome://viviecr/content/select_tax.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            var inputObj = {
                taxes: this._barcodeTypeList
            };           

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('select_rate'), aFeatures, inputObj);
            if (inputObj.ok) {alert(inputObj.name);}

        },
        
         exit: function() {

             if( (this.tabList != "" && !this._isSave) || GeckoJS.FormHelper.isFormModified('setProductForm')){

                 var action = this.checkSave('save',_('Save list before existing?'));

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
        }
    };

   GeckoJS.Controller.extend(__controller__);

})();
