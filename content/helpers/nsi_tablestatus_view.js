(function() {

    var NSITableStatusView = window.NSITableStatusView = GeckoJS.NSITreeViewArray.extend({

        name: 'NSITableStatusView' ,

        tableSettings: null,

        init: function(data) {

            this._data = data || [];
            this._region = '' ;
            this._tablesId = [];
            this.TableStatus = null;
            
        },

        setTables: function(tables) {
            if (tables) {
                this._data = tables;
                //this._tablesId = GeckoJS.Array.objectExtract(tables, '{n}.id');
                this.tree.invalidate();
                this.tree.selectedIndex = -1;
                this.tree.selectedItems = [];
            }
        },

        setTableSettings: function(settings) {
            this.tableSettings = settings;
        },


        getTableSettings: function() {
            return this.tableSettings;
        },


        getRegion: function() {
            return this._region;
        },


        setRegion: function(region) {
            this._region = region;
        },
        
        getTableStatus: function(id) {
            
            // check is session setted , this is trick for better performance when panel init.
            let ss = GeckoJS.Session.get('tablesStatusById') || false;
            if (!ss) return null;
            
            return this.TableStatus.getTableStatusById(id) || null;
        },

        refreshUpdatedTablesStatus: function(updatedTablesStatus) {
            //dump(this.dump(updatedTablesStatus));
            // XXX partial refresh ??
            // tree is setted by vivibuttonpanel.
            this.tree.invalidate();
        },

        refreshTablesStatusPeriod: function() {
            
            // tree is setted by vivibuttonpanel.
            // use internal implements for better performance
            
            var buttonCount = this.tree.buttonCount;
            var startOffset = this.tree.startOffset;
            var buttons = this.tree.buttons;

            for(let i=0; i < buttonCount ; i++) {

                let row = startOffset + i;

                if (row >= this.data.length) break;

                this.renderTableStatusPeriod(row, buttons[i]);
            }
        },

        renderButton: function(row, btn) {

            let table = this.data[row];
            if (!table || table.table_no <= 0) return ;

            let tableSettings = this.getTableSettings();

            var table_no = table.table_no || '';
            var table_label = table.table_name || '';

            btn.table_no = table_no;
            btn.table_label = tableSettings.DisplayTableLabel ? table_label : '';

            this.renderTableStatus(row, btn);
            
            return;

        },

        renderTableStatus: function(row, btn) {
            

            let table = this.data[row];
            let tableId = table.id ;

            let tableSettings = this.getTableSettings();
            let statusObj = this.getTableStatus(tableId);
            let status = null;
            let firstOrder = null;
            if (statusObj) {
                status = statusObj.TableStatus;
                if (statusObj.TableOrder){
                    firstOrder = statusObj.TableOrder[0];
                }
            }

            var seats = table.seats || '0';
            var seq = '';
            var check_no = '';
            var checks = 0;
            var guest_num = 0;
            var subtotal = 0;
            var clerk = '';
            var book_time = '';

            var table_status = 0;
            var capacity_status = 0;
            var transaction_created = 0;
            var mark = '';
            var mark_user = '' ;
            var hostby = '';
            
            if (status) {
                checks = status.order_count || 0;
                guest_num = status.sum_customer || 0;
                subtotal = status.sum_total || 0;
                table_status = status.status || 0;
                mark = status.mark || '';
                mark_user = status.mark_user || '';
                hostby = status.hostby || '';

                capacity_status = (guest_num > 0) ? (( guest_num >= seats ) ? 2 : 1) : 0;

                if (firstOrder) {
                    
                    seq = firstOrder.sequence + '' || '';
                    if (seq.length) seq = _("S#") + seq ;

                    check_no = firstOrder.check_no + '' || '';
                    if (check_no.length) check_no = _("C#") + check_no ;
                   
                    clerk = firstOrder.service_clerk || '';

                    transaction_created = firstOrder.transaction_created * 1000 || 0;
                }
            }

            var capacity = guest_num + "/" + seats;
            
            // active ?
            if (!table.active && table_status==0) table_status = 2;

            // status 2 is opdeny, for active and merged table
            if (table_status == 2) {
                    if(!table.active) {
                        seq = _('Not Active');
                        clerk = '';
                    }else if (hostby)  {
                        seq = _('Host Table') + ':' + hostby;
                    }
                    btn.seq_no = seq;
            }else if (table_status == 3) {
                    seq = _('Status') + ':' + mark;
                    btn.seq_no = seq;
                    clerk = mark_user;
            }
            
            btn.checks = (checks > 0) ? "+"+checks : '';
            btn.seq_no = tableSettings.DisplaySeqNo ? seq : '';
            btn.check_no = tableSettings.DisplayCheckNo ? check_no : '';
            btn.booking = tableSettings.DisplayBooking ? book_time : '';
            btn.subtotal = tableSettings.DisplayTotal ? ((subtotal>0) ? (_("T#")+subtotal) : '') : '';
            btn.capacity = tableSettings.DisplayCapacity ? capacity : '';
            // share seq_no for seq & clerk
            // btn.seq_no = tableSettings.DisplayClerk ? clerk : btn.seq_no;
            btn.clerk = tableSettings.DisplayClerk ? clerk : '';

            // update css
            btn.setTableStatus(table_status);
            btn.setCapacityStatus(capacity_status);

            // set attribute for period time
            btn.setAttribute('transaction_created', transaction_created);
            btn.setAttribute('table_status', table_status);

            this.renderTableStatusPeriod(row, btn);

            return;
        },

        /**
         * period must refresh every time
         */
        renderTableStatusPeriod: function(row, btn) {

            var tableSettings = this.getTableSettings();

            var period = '' ;
            var tablePeriodTime = tableSettings.TablePeriodLimit || 0;
            var period_status = 0;
            var period_time = 0;
            var transaction_created = btn.getAttribute('transaction_created') || 0;
            var table_status = btn.getAttribute('table_status') || 0;

            if (table_status == 1) {
                var now = Math.round(new Date().getTime());
                period_time = Math.round((now - transaction_created) + 1);
                period = Date.today().addMilliseconds(period_time).toString("HH:mm");

                if (period_time < tablePeriodTime * 60 * 1000) {
                    period_status = 1;
                }else {
                    period_status = 2;
                }
            }

            btn.period = tableSettings.DisplayPeriod ? period : '';
            
            btn.setPeriodStatus(period_status);
        }

    });

})();
