(function(){

    /**
     * Class TableMapController
     */

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {
        name: 'TableMap',
        _tables: [],

        initial: function() {
            
            // this.schedule();
        },

        setTableMap: function() {

            var region = {  region: 'Area1',
                            data: [
                                {label:'1', x:100, y:160, status:1, shape:'table1'},
                                {label:'2', x:200, y: 120, status:2, shape:'table4'},
                                {label:'3', x:150, y: 400, status:3, shape:'table3'},
                                {label:'4', x:130, y:260, status:1, shape:'table7'},
                                {label:'5', x:240, y: 320, status:2, shape:'table2'},
                                {label:'6', x:250, y: 200, status:3, shape:'table5'},
                                {label:'7', x:180, y:360, status:1, shape:'table8'},
                                {label:'8', x:400, y: 320, status:2, shape:'table2'},
                                {label:'9', x:350, y: 480, status:3, shape:'table9'},
                            ],
                            tablenum: 9,
                            background: 'file:///data/images/table_map_images/region_1.png'
            }

            var region2 = { region: 'Area2',
                            data: [
                                {label:'1', x:300, y:460, status:1, shape:'table6'},
                                {label:'2', x:400, y: 420, status:2, shape:'table9'},
                                {label:'3', x:250, y: 100, status:3, shape:'table3'},
                                {label:'4', x:230, y:360, status:1, shape:'table4'},
                                {label:'5', x:440, y: 220, status:2, shape:'table7'},
                                {label:'6', x:450, y: 300, status:3, shape:'table3'},
                                {label:'7', x:480, y:260, status:1, shape:'table8'},
                                {label:'8', x:100, y: 220, status:2, shape:'table2'},
                                {label:'9', x:150, y: 180, status:3, shape:'table5'},
                                {label:'10', x:120, y: 140, status:1, shape:'table1'}
                            ],
                            tablenum: 10,
                            background: 'file:///data/images/table_map_images/region_2.png'
            }

            var region3 = { region: 'Area3',
                            data: [
                                {label:'1', x:100, y:260, status:1, shape:'table4'},
                                {label:'2', x:200, y: 320, status:2, shape:'table8'},
                                {label:'3', x:450, y: 300, status:3, shape:'table3'},
                                {label:'4', x:130, y:460, status:1, shape:'table9'},
                                {label:'5', x:240, y: 120, status:2, shape:'table5'},
                                {label:'6', x:350, y: 340, status:3, shape:'table3'},
                                {label:'7', x:180, y:360, status:1, shape:'table7'},
                                {label:'8', x:200, y: 220, status:2, shape:'table6'},
                                {label:'9', x:350, y: 180, status:3, shape:'table3'},
                                {label:'10', x:120, y: 340, status:1, shape:'table1'}
                            ],
                            tablenum: 10,
                            background: 'file:///data/images/table_map_images/region_3.png'
            }

            var region4 = { region: 'Area4',
                            data: [
                                {label:'1', x:350, y:260, status:1, shape:'table1'},
                                {label:'2', x:300, y: 320, status:2, shape:'table2'},
                                {label:'3', x:450, y: 200, status:3, shape:'table7'},
                                {label:'4', x:230, y:160, status:1, shape:'table9'},
                                {label:'5', x:140, y: 220, status:2, shape:'table2'},
                                {label:'6', x:450, y: 200, status:3, shape:'table3'},
                                {label:'7', x:280, y:260, status:1, shape:'table4'},
                                {label:'8', x:300, y: 220, status:2, shape:'table6'},
                                {label:'9', x:450, y: 180, status:3, shape:'table5'},
                                {label:'10', x:120, y: 440, status:1, shape:'table1'}
                            ],
                            tablenum: 10,
                            background: 'file:///data/images/table_map_images/region_4.png'
            }

            var view1 = { region: 'View1',
                            data: [

                            ],
                            tablenum: 0,
                            background: 'file:///data/images/table_map_images/view_1.png'
            }

            var view2 = { region: 'View2',
                            data: [

                            ],
                            tablenum: 0,
                            background: 'file:///data/images/table_map_images/view_2.png'
            }

            var view3 = { region: 'View3',
                            data: [

                            ],
                            tablenum: 0,
                            background: 'file:///data/images/table_map_images/view_3.png'
            }

            this._tables.push(region);
            this._tables.push(region2);
            this._tables.push(region3);
            this._tables.push(region4);
            this._tables.push(view1);
            this._tables.push(view2);
            this._tables.push(view3);

            var tmap = document.getElementById('tmap');
            tmap.datasource = this._tables[0].data;

        },

        selectRegion: function(index) {
            //
            this.log('selectRegion...' + index);
            var tmap = document.getElementById('tmap');
            tmap.datasource = this._tables[index].data;
            var bgimage = this._tables[index].background;

            tmap.backgroundImage = bgimage;
            
            this.log(this.dump(this._tables));
        },

        load: function() {
            //
            // alert('load...');
            this.setTableMap();
            this.selectRegion(0);
            var region = document.getElementById('regionScrollablepanel');

            var regionView =  new GeckoJS.NSITreeViewArray(this._tables);
                region.datasource = regionView;
        }

    };
    
    AppController.extend(__controller__);

})();
