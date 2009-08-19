(function(){

    var inputObj = window.arguments[0];
    var tableOrderStatusStr = {0: '***', 1: _('Checksum Error'), 2: _('Lost Status')};

    var CheckListView = window.CheckListView = GeckoJS.NSITreeViewArray.extend({

        renderButton: function(row, btn) {
            // GREUtils.log('renderButton...');
            if (!this.data[row]) return;
            // if (this.data[row].table_no <= 0) return;
            // if (!this.data[row].check_no) return;

            var tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};

            if (this.data[row].order == null) this.data[row].order = {};
            if (this.data[row].table == null) this.data[row].table = {};

            var seq = this.data[row].sequence || '';

            var check_no = this.data[row].check_no || '';
            var checks = this.data[row].checks || '';
            var table_no = this.data[row].table_no || '';

            var table_label = this.data[row].table.table_name || '';
            // var guest_num = this.data[row].order.no_of_customers || '0';
            var guest_num = this.data[row].guests || '0';

            var seats = this.data[row].table.seats || '0';

            var subtotal = this.data[row].total || '0';

            var clerk = this.data[row].clerk || '';
            var now = Math.round(new Date().getTime());
            var holdby = this.data[row].holdby || '';

            // var transaction_created = this.data[row].transaction_created * 1000 || now;
            var transaction_created = this.data[row].created * 1000 || now;
//            var booking_time = Math.round((this.data[row].booking ? this.data[row].booking.booking : 0) || 0) * 1000;
//
//            var book_time = (booking_time > 100) ? _("B#") + (new Date(booking_time)).toString("HH:mm") : '';

            var period_time = Math.round((now - transaction_created) + 1);

            var period = Date.today().addMilliseconds(period_time).toString("HH:mm");

            var capacity = _("G#") + guest_num;

            if (check_no != "") check_no = _("C#") + check_no;
            if (checks != "") checks = "+" + checks;

            if (seq != "") {
                seq = _("S#") + seq;
                subtotal = _("T#") + subtotal;
                if (this.data[row].block_item)
                    btn.setTableStatus(2);
                else
                    btn.setTableStatus(1);

                if (period_time < tableSettings.TablePeriodLimit * 60 * 1000)
                    btn.setPeriodStatus(1);
                else
                    btn.setPeriodStatus(2);
            } else {
                subtotal = '';
                period = '';

                if (holdby)
                    btn.setTableStatus(2);
                else
                    btn.setTableStatus(0);
                btn.setPeriodStatus(0);
                btn.setCapacityStatus(0);


            }

            btn.table_no = table_no;
            btn.checks = checks;
            btn.table_label = tableSettings.DisplayTableLabel ? table_label : '';
            // btn.seq_no = tableSettings.DisplaySeqNo ? seq : '';
            btn.booking = seq;
            btn.check_no = tableSettings.DisplayCheckNo ? check_no : '';
//            btn.booking = tableSettings.DisplayBooking ? book_time : '';
            btn.period = tableSettings.DisplayPeriod ? period : '';
            btn.subtotal = tableSettings.DisplayTotal ? subtotal : '';
            // btn.capacity = tableSettings.DisplayCapacity ? capacity : '';
            btn.capacity = '';
            // share seq_no for seq & clerk
            btn.seq_no = tableSettings.DisplayClerk ? clerk : btn.seq_no;

            // if (holdby) btn.seq_no = _('Status') + ':' + holdby;

            return;
        }

    });

    /**
     * Controller Startup
     */
    function startup() {

        var checks = inputObj.checks;
        var excludedOrderId = inputObj.excludedOrderId;
        var checkListObj = document.getElementById('checkScrollablepanel');

        var checkViews = [];
        checks.forEach(function(checkObj) {

            var checkViewObj = {
                order_id: checkObj.id,
                check_no: checkObj.check_no,
                table_no: checkObj.table_no ? checkObj.table_no : '*',
                sequence: checkObj.sequence,
                guests: checkObj.no_of_customers,
                holdby: '',
                clerk: checkObj.service_clerk_displayname,
                booking: 0,
                lock: false,
                status: 0,
                terminal_no: checkObj.terminal_no,
                total: checkObj.total,
                created: checkObj.transaction_created,
                block_item: false,
                table: {},
                order: {}

            };
            if (excludedOrderId && checkViewObj.order_id == excludedOrderId) {
                checkViewObj.block_item = true;
            }
            checkViews.push(checkViewObj);
        });
        
        var checkList = new CheckListView(checkViews);

        checkListObj.datasource = checkList ;

        checkListObj.addEventListener('command', function(evt) {
            var index = evt.target.value;

            var itemlistObj = document.getElementById('itemlist');
            // var data = window.viewHelper.getCurrentIndexData(index);
            var data = checks[index];

            var displayStr = "";
            if (checkViews[index].block_item) {
                displayStr = "*";
            }

            displayStr += _("SEQ") + ": " + data.sequence + "\n\n";
            var limit = 10, cc= 0;
            data.OrderItem.forEach(function(item){
                if (cc<=limit) {
                    displayStr += item.product_name + ' x ' + item.current_qty + '\n';
                }
            });

            if (cc>limit) displayStr += "   ......   \n" ;

            // displayStr += "\n\nTL: " + data.remain;
            displayStr += "\n\n" + _("TAL") + ": " + data.total;

            itemlistObj.setAttribute('value', displayStr);

        }, true);

        doSetOKCancel(
            function(){

                // inputObj.condiments = document.getElementById('condiments').value;
                inputObj.index = document.getElementById('checkScrollablepanel').value;

                if (checkViews[inputObj.index].block_item) {
                    // @todo OSD
                    NotifyUtils.warn(_('Can not select this order!!'));

                    return false;
                }

                inputObj.order_id = checkViews[inputObj.index].order_id;
                inputObj.ok = true;

                delete window.viewHelper;

                return true;
            },
            function(){
                inputObj.ok = false;
                delete window.viewHelper;
                return true;
            }
            );

    };

    window.addEventListener('load', startup, false);

})();


