(function() {

    /**
     * TableStatus Model
     */
    var __model__ = {

        name: 'TableStatus',

        behaviors: ['Sync'],

        initial: function() {

            this.view = null,

            this.data = {

                id: '',
                items: {},
                table_no: 0,
                table_name: '',
                region: '',
                seats: 0,
                active: false,
                tag: '',
                booking: {},
                status: 0,
                created: '',
                modified: ''
            };

            this.create();


        },

        serialize: function() {
            // @todo 
            return GeckoJS.BaseObject.serialize(this.data);
        },

        unserialize: function(data) {
            // @todo
            this.data = GeckoJS.BaseObject.unserialize(data);
        },

        getCheckNo: function() {
            //
        },

        getTableno: function() {
            //
        }

    };

    var TableStatusModel = window.TableStatusModel = GeckoJS.Model.extend(__model__);

})();
