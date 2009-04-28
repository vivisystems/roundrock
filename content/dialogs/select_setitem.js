(function(){

    /**
     * register select_setitem panel
     */
    function startup() {

        var $panel = $('#selectSetItemPanel');
        var $buttonPanel = $('#plusetscrollablepanel');
        var $presetPanel = $('#presetbuttonpanel');
        var $selectionPanel = $('#selectionscrollablepanel');

        var screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
        var screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

        var productsById;
        var barcodesIndexes;
        var groupsById;
        var productIndexesByGroup;
        var productsIndexesByCate;
        var categoriesById;

        var plusetData = [];
        var preset = null;
        var selections = [];
        var opts;
        var hidden = false;
        var mode = 'add';

        $.installPanel($panel[0], {

            css: {
                left: 0,
                top: 0,
                
                width: screenwidth,
                'max-width': screenwidth,

                height: screenheight,
                'max-height': screenheight
            },

            init: function(evt) {
                var plusetViewHelper = new GeckoJS.NSITreeViewArray();
                var buttonClass0 = $buttonPanel[0].getAttribute('buttonClass0');
                var buttonClass1 = $buttonPanel[0].getAttribute('buttonClass1');
                var buttonClass2 = $buttonPanel[0].getAttribute('buttonClass2');

                plusetViewHelper.getCellValue = function(row, col) {
                    this.log('DEBUG', 'in pluset get cell value: ' + row + ',' + GeckoJS.BaseObject.dump(col));

                    var data = plusetData[row];
                    var sResult = '';

                    this.log('DEBUG', 'data type: ' + data.type);

                    if (data.product) {
                        sResult= data.product[col.id];
                    }
                    else if (data.plugroup) {
                        if (col.id == 'name') {
                            sResult = '[' + data.setitem.label + ']';
                        }
                        else {
                            sResult= data.plugroup[col.id];
                        }
                    }

                    this.log('DEBUG', 'value: ' +  sResult);
                    return sResult;
                };

                plusetViewHelper.renderButton = function(row, btn) {

                    this.log('DEBUG', 'in pluset renderButton: ' + row);

                    if (hidden) {
                        btn.removeAttribute('class');
                        return;
                    }

                    var data = plusetData[row];
                    var classStr = '';
                    if (!data.plugroup) {
                        classStr = buttonClass0;
                    }
                    else if (data.product) {
                        classStr = buttonClass1;
                    }
                    else {
                        classStr = buttonClass2;
                    }
                    if (classStr) btn.setAttribute('class', classStr);
                    else btn.removeAttribute('class');
                    this.log('DEBUG', 'in pluset renderButton: [' + classStr + ']');
                };
                
                $buttonPanel[0].datasource = plusetViewHelper ;

                var presetViewHelper = new NSIProductsView('presetbuttonpanel');
                presetViewHelper.getCellValue = function(row, col) {
                    this.log('DEBUG', 'in preset get cell value: ' + row + ',' + GeckoJS.BaseObject.dump(col));

                    var sResult = preset ? preset[col.id] : '';
                    
                    this.log('DEBUG', 'value: ' +  sResult);
                    return sResult;
                };
                $presetPanel[0].datasource = presetViewHelper;

                var selectionViewHelper = new NSIProductsView('selectionscrollablepanel');
                selectionViewHelper.getCellValue = function(row, col) {
                    this.log('DEBUG', 'in selection get cell value: ' + row + ',' + GeckoJS.BaseObject.dump(col));

                    var sResult = '';
                    var productId = selections[row];
                    var product =  productsById[productId];
                    if (product) {
                        sResult = product[col.id];
                    }

                    this.log('DEBUG', 'value: ' +  sResult);
                    return sResult;
                };
                $selectionPanel[0].datasource = selectionViewHelper;
            },

            load: function(evt) {
                productsById = GeckoJS.Session.get('productsById');
                barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
                groupsById = GeckoJS.Session.get('plugroupsById');
                productIndexesByGroup = GeckoJS.Session.get('productsIndexesByLinkGroup');
                categoriesById = GeckoJS.Session.get('categoriesById');
                productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCate');

                $selectionPanel[0].vivibuttonpanel.resizeButtons();
                mode = evt.data.mode;
                var pluset = evt.data.pluset;
                
                // convert pluset into array of products and linkgroups
                plusetData = [];
                pluset.forEach(function(setitem) {

                    var newItem = {setitem: setitem};

                    // preset product legal?
                    if (setitem.product_no != null && setitem.product_no != '') {
                        var productId = barcodesIndexes[setitem.product_no];
                        var product = productsById[productId];

                        if (product) {
                            newItem['product'] = product;
                        }
                    }

                    if (setitem.preset_no != null && setitem.preset_no != '') {
                        var presetId = barcodesIndexes[setitem.preset_no];
                        var preset = productsById[presetId];

                        if (preset) {
                            newItem['preset'] = preset;
                            if (!newItem['product'])
                                newItem['product'] = preset;
                        }
                    }
                    if (setitem.linkgroup_id != null && setitem.linkgroup_id != '') {
                        var selections = [];
                        var plugroup = groupsById[setitem.linkgroup_id];
                        if (typeof plugroup == 'undefined') {
                            var cate = categoriesById[setitem.linkgroup_id];
                            if (cate) {
                                selections = productsIndexesByCate[cate.no];
                                plugroup = cate;
                            }
                        }
                        else {
                            selections = productIndexesByGroup[setitem.linkgroup_id];
                        }
                        if (plugroup) {
                            // filter set items out of selections
                            selections = selections.filter(function(val, index, obj) {
                                                               var setItem = productsById[val].SetItem;
                                                               return (setItem == null) || (setItem.length == 0);
                                                           });
                            newItem['plugroup'] = plugroup;
                            newItem['selections'] = selections;
                        }
                    }
                    plusetData.push(newItem);
                });
                $buttonPanel[0].datasource.data = plusetData ;

                // set hidden false
                hidden = false;

                // set caption
                var captionObj = document.getElementById('pluset-caption');
                if (captionObj) captionObj.label = evt.data.name;

                // determine first set item to select
                opts = $($panel[0]).data('popupPanel.opts');
                
                opts.selectSetItem(evt.data.start);
                opts.validateSetItemForm();
            },

            hide: function (evt) {

                var isOK = typeof evt.data == 'boolean' ? evt.data : false;

                evt.data = {ok: isOK, plusetData: plusetData};

                hidden = true;
                $buttonPanel[0].invalidate();
            },

            // select set item
            selectSetItem: function(index) {
                $buttonPanel[0].selectedIndex = index;
                $buttonPanel[0].selectedItems = [index];
                $buttonPanel[0].invalidate();
                $buttonPanel[0].ensureIndexIsVisible(index);

                opts.clickPluSet($buttonPanel[0]);
            },

            validateSetItemForm: function() {
                var okObj = document.getElementById('setitemDialog-ok');

                for (var i = 0; i < plusetData.length; i++) {
                    if (plusetData[i].product == null || plusetData[i].product == '') {
                        okObj.setAttribute('disabled', true);
                        return;
                    }
                }
                okObj.removeAttribute('disabled');

                if (preset) {
                    $presetPanel[0].removeAttribute('disabled');
                }
                else {
                    $presetPanel[0].setAttribute('disabled', true);
                }

                if (selections.length > 0) {
                    $selectionPanel[0].removeAttribute('disabled');
                }
                else {
                    $selectionPanel[0].setAttribute('disabled', true);
                }
            },

            // PluSet setitem selected
            clickPluSet: function(panel) {
                preset = [];
                selections = [];

                var setitem = plusetData[panel.selectedIndex];
                if (setitem) {
                    // set caption
                    var captionObj = document.getElementById('setitem-caption');
                    if (captionObj) {
                        if (setitem.product) {
                            captionObj.value = setitem.setitem.label + ': ' + setitem.product.name;
                        }
                        else {
                            captionObj.value = setitem.setitem.label;
                        }
                    }

                    // populate preset item
                    if (setitem.preset) {
                        preset = setitem.preset;
                    }
                    
                    // populate selections
                    if (setitem.selections) {
                        selections = setitem.selections;
                    }
                }
                $presetPanel[0].datasource.data = preset;
                $presetPanel[0].refresh();
                
                $selectionPanel[0].datasource.data = selections;
                $selectionPanel[0].refresh();

                // validate form
                opts.validateSetItemForm();
            },

            // Preset item selected
            clickPreset: function() {

                // apply preset to set item
                var row = $buttonPanel[0].selectedIndex;
                if (preset && row > -1) {
                    plusetData[row].product = preset;

                    $buttonPanel[0].invalidateRow(row);
                }

                if (mode == 'add') opts.moveToNext();
            },

            // Selection item selected
            clickSelection: function(panel) {

                // apply selection to set item
                var selectedRow = panel.selectedIndex;
                var plusetRow = $buttonPanel[0].selectedIndex;
                if (selections && selectedRow > -1 && plusetRow > -1) {
                    plusetData[plusetRow].product = productsById[selections[selectedRow]];

                    $buttonPanel[0].invalidateRow(plusetRow);
                }

                if (mode == 'add') opts.moveToNext();
            },

            moveToNext: function() {
                for (var currentIndex = $buttonPanel[0].selectedIndex + 1;
                     currentIndex < plusetData.length;
                     currentIndex ++) {
                     if (plusetData[currentIndex].setitem.linkgroup_id) {
                        opts.selectSetItem(currentIndex);
                        return;
                    }
                }

                // update label
                var captionObj = document.getElementById('setitem-caption');
                if (captionObj) {

                    var setitem = plusetData[$buttonPanel[0].selectedIndex];
                    if (setitem.product) {
                        captionObj.value = setitem.setitem.label + ': ' + setitem.product.name;
                    }
                    else {
                        captionObj.value = setitem.setitem.label;
                    }
                }
                opts.validateSetItemForm();
            }

        });

    }

    window.addEventListener('load', startup, false);

})();
