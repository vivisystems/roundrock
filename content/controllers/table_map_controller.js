(function(){

    /**
     * Class TableMapController
     */

    GeckoJS.Controller.extend( {
        name: 'TableMap',
        _tables: [],

        initial: function() {
            
            // this.schedule();
        },

        setTableMap: function() {

            var region = {  region: 'Area1',
                            data: [
                                {label:'1', x:100, y:160, status:1, shape:'table1'},
                                {label:'2', x:200, y: 120, status:2, shape:'table2'},
                                {label:'3', x:150, y: 400, status:3, shape:'table3'},
                                {label:'4', x:130, y:260, status:1, shape:'table1'},
                                {label:'5', x:240, y: 320, status:2, shape:'table2'},
                                {label:'6', x:250, y: 200, status:3, shape:'table3'},
                                {label:'7', x:180, y:360, status:1, shape:'table1'},
                                {label:'8', x:400, y: 320, status:2, shape:'table2'},
                                {label:'9', x:350, y: 480, status:3, shape:'table3'},
                            ],
                            tablenum: 9,
                            background: ''
            }

            var region2 = { region: 'Area2',
                            data: [
                                {label:'1', x:300, y:460, status:1, shape:'table1'},
                                {label:'2', x:400, y: 420, status:2, shape:'table2'},
                                {label:'3', x:250, y: 100, status:3, shape:'table3'},
                                {label:'4', x:230, y:360, status:1, shape:'table1'},
                                {label:'5', x:440, y: 220, status:2, shape:'table2'},
                                {label:'6', x:450, y: 300, status:3, shape:'table3'},
                                {label:'7', x:480, y:260, status:1, shape:'table1'},
                                {label:'8', x:100, y: 220, status:2, shape:'table2'},
                                {label:'9', x:150, y: 180, status:3, shape:'table3'},
                                {label:'10', x:120, y: 140, status:1, shape:'table1'}
                            ],
                            tablenum: 10,
                            background: ''
            }

            this._tables.push(region);
            this._tables.push(region2);

            var tmap = document.getElementById('tmap');
            tmap.datasource = this._tables[0].data;

        },

        selectRegion: function(index) {
            //
            this.log('selectRegion...' + index);
            var tmap = document.getElementById('tmap');
            tmap.datasource = this._tables[index].data;
            var bgimage = this._tables[index].background;

            tmap.backgroundimage = bgimage;
            
            this.log(this.dump(this._tables));
        },

        load: function() {
            //
            // alert('load...');
            this.setTableMap();
            var region = document.getElementById('regionScrollablepanel');

            var regionView =  new GeckoJS.NSITreeViewArray(this._tables);
                region.datasource = regionView;
        }

    });

})();
