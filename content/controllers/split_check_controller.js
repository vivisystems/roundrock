(function(){

    /**
     * Class SplitCheckController
     */
    GeckoJS.Controller.extend( {

        name: 'SplitCheck',
        _mainitems: null,
        _splitedchecks: [],
        _splititems: [],
        _index: 0,
        
        checkOrd: function() {
            alert('checkOrd');
        },

        splitItems: function() {
            var self = this;

            // this._splititems = [];
            var selectedItems = document.getElementById('maincheckscrollablepanel').vivitree.selectedItems;

            var spliteditems = [];
            var d = 0;
            selectedItems.forEach(function(o){
                spliteditems.push(self._mainitems[o - d]);
                self._mainitems.splice(o - d, 1);
                d++;
            });
            var cnt = this._splititems.push({name: 'Check ' + this._index, items:spliteditems});
            this._index++;

            var panelView = new GeckoJS.NSITreeViewArray(this._mainitems);
            document.getElementById('maincheckscrollablepanel').datasource = panelView;

            var panelView2 = new GeckoJS.NSITreeViewArray(this._splititems[cnt - 1].items);
            document.getElementById('splitedcheckscrollablepanel').datasource = panelView2;

            var panelView3 = new GeckoJS.NSITreeViewArray(this._splititems);
            document.getElementById('splitedscrollablepanel').datasource = panelView3;
            document.getElementById('splitedscrollablepanel').vivitree.selection.select( cnt - 1);


        },

        selectMain: function(index) {
            var numRanges = document.getElementById('maincheckscrollablepanel').vivitree.view.selection.getRangeCount();
            this.log("numRanges:" + numRanges);

            // var selected = document.getElementById('maincheckscrollablepanel').vivitree.view.selection.isSelected(index);
            var selected = !this._mainitems[index].selected;
            this.log("selectMain:" + index + ", selected:" + selected);
            this._mainitems[index].selected = selected;
            
            if (this._mainitems.length > 0) {
                var parentIndex = this._mainitems[index].parent_index;
                if (parentIndex) {
                    var i=0;
                    this._mainitems.forEach(function(o){
                        if ((o.parent_index == parentIndex) || (o.index == parentIndex)) {
                            if (selected) {
                                document.getElementById('maincheckscrollablepanel').vivitree.view.selection.rangedSelect(i,i,true);
                                o.selected = true;
                            } else {
                                document.getElementById('maincheckscrollablepanel').vivitree.view.selection.clearRange(i,i,true);
                                o.selected = false;
                            }
                        } else {
                            if (o.selected) {
                                document.getElementById('maincheckscrollablepanel').vivitree.view.selection.rangedSelect(i,i,true);
                            } else {
                                document.getElementById('maincheckscrollablepanel').vivitree.view.selection.clearRange(i,i,true);
                            }
                        }
                        i++;
                    });
                } else {
                    var i=0;

                    var itemIndex = this._mainitems[index].index;
                    this._mainitems.forEach(function(o){
                        if ((o.parent_index == itemIndex)) {
                            if (selected) {
                                document.getElementById('maincheckscrollablepanel').vivitree.view.selection.rangedSelect(i,i,true);
                                o.selected = true;
                            } else {
                                document.getElementById('maincheckscrollablepanel').vivitree.view.selection.clearRange(i,i,true);
                                o.selected = false;
                            }
                        } else {
                            if (o.selected) {
                                document.getElementById('maincheckscrollablepanel').vivitree.view.selection.rangedSelect(i,i,true);
                            } else {
                                document.getElementById('maincheckscrollablepanel').vivitree.view.selection.clearRange(i,i,true);
                            }
                        }
                        i++;
                    });
                }
                // var panelView2 = new GeckoJS.NSITreeViewArray(this._splititems[index].items);
                // document.getElementById('splitedcheckscrollablepanel').datasource = panelView2;
                // document.getElementById('maincheckscrollablepanel').vivitree.view.selection.rangedSelect(0,0,true);
            }
            
        },

        selectSplited: function(index) {
            //
            /*
            if (this._splititems.length > 0) {
                var panelView2 = new GeckoJS.NSITreeViewArray(this._splititems[index].items);
                document.getElementById('splitedcheckscrollablepanel').datasource = panelView2;
            }
            */
        },

        selectSplitedCheck: function(index) {
            //
            if (this._splititems.length > 0) {
                var panelView2 = new GeckoJS.NSITreeViewArray(this._splititems[index].items);
                document.getElementById('splitedcheckscrollablepanel').datasource = panelView2;
            }
        },

        reverse: function() {
            //
            var self = this;
            var index = document.getElementById('splitedscrollablepanel').selectedIndex;
            var reverseitems = this._splititems[index].items;
            reverseitems.forEach(function(o){
                self._mainitems.push(o);
            });
            this._splititems.splice(index, 1);
            var cnt = this._splititems.length;


            var panelView = new GeckoJS.NSITreeViewArray(this._mainitems);
            document.getElementById('maincheckscrollablepanel').datasource = panelView;

            if (cnt > 0) {
                var panelView2 = new GeckoJS.NSITreeViewArray(this._splititems[0].items);
                document.getElementById('splitedcheckscrollablepanel').datasource = panelView2;

                var panelView3 = new GeckoJS.NSITreeViewArray(this._splititems);
                document.getElementById('splitedscrollablepanel').datasource = panelView3;
                document.getElementById('splitedscrollablepanel').vivitree.selection.select(0);
            } else {
                document.getElementById('splitedcheckscrollablepanel').datasource = [];
                document.getElementById('splitedscrollablepanel').datasource = [];
            }
        },

        conform: function() {
            alert('Conform...');
            var items = this._splititems[0].items;
            var newTransaction = new Transaction();
            items.forEach(function(item){
                var addedItem = newTransaction.appendItem(item);
            });
            newTransaction.submit(2);
            delete newTransaction;

        },

        cancel: function() {
            window.close();
        },

        paythis: function() {
            alert('Pay This Check...');
        },

        load: function() {
            //
            var inputObj = window.arguments[0];

            var checks = inputObj.checks;
            var data = inputObj.data;
            // var queuePool = inputObj.queuePool;

            // var itemlistObj = document.getElementById('itemlist');
            var self = this;
            // var mainitems = GeckoJS.Array.objectExtract(data, 'items');
            this._mainitems = GeckoJS.BaseObject.getValues(data.items);
            this._mainitems.forEach(function(o){
                o.selected = false;
            });

            // var panelView = new GeckoJS.NSITreeViewArray(data.display_sequences);
            var panelView = new GeckoJS.NSITreeViewArray(this._mainitems);
            // this.getListObj().datasource = panelView;
            document.getElementById('maincheckscrollablepanel').datasource = panelView;

            // window.viewHelper = new GeckoJS.NSITreeViewArray(checks);
            //window.viewHelper.getCurrentIndexData= function(row) {
                // var text = row + ":" + col.check_no;
                // GREUtils.log(GeckoJS.BaseObject.dump(row))
            //    GREUtils.log(row);
            //}
            //
            // this.log(this.dump(checks));
            // this.log(this.dump(data));
            // this.log(this.dump(this._mainitems));
        }

    });

})();

