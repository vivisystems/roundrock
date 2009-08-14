(function() {

    var NSITableStatusView = window.NSITableStatusView = GeckoJS.NSITreeViewArray.extend({

        renderButton: function(row, btn) {
            // GREUtils.log('renderButton...');
            if (!this.data[row]) return;
            if (this.data[row].table_no <= 0) return;

            var tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};

            var seq = this.data[row].sequence || '';
            var check_no = this.data[row].check_no || '';
            var checks = this.data[row].checks || '';
            var table_no = this.data[row].table_no || '';
            var table_label = this.data[row].Table.table_name || '';
            var seats = this.data[row].Table.seats || '0';
            // var guest_num = this.data[row].order.no_of_customers || '0';
            var guest_num = this.data[row].guests || '0';

            var subtotal = this.data[row].total || '';

            var clerk = this.data[row].clerk || '';
            var now = Math.round(new Date().getTime());
            var holdby = this.data[row].hostby || '';
            var mark_user = this.data[row].mark_user || '';

            // var transaction_created = this.data[row].start_time * 1000 || now;
            // var transaction_created = now;
            var transaction_created = this.data[row].transaction_created * 1000 || now;

            var mark = this.data[row].mark || '';
            var mark_user = this.data[row].mark_user || '';
            var mark_op_deny = this.data[row].mark_op_deny || false;

            // display booking...
            var book_time = '';
            if (this.data[row].TableBooking && this.data[row].TableBooking.length > 0) {
                var remindTime = now - tableSettings.TableRemindTime * 60 *1000;
                var bookTimeOut = tableSettings.TableBookingTimeout * 60 *1000;


                for (var key in this.data[row].TableBooking) {
                    var bookTime = this.data[row].TableBooking[key];
                    // var booking_time = Math.round((this.data[row].booking ? this.data[row].booking : 0) || 0) * 1000;
                    var booking_time = Math.round((bookTime.booking ? bookTime.booking : 0) || 0) * 1000;

                    if (booking_time < remindTime) {
                        booking_time = 0;
                    } else if (now  > booking_time + bookTimeOut) {
                        booking_time = 0;
                    }

                    if (booking_time > 100) {
                        book_time = _("B#") + (new Date(booking_time)).toString("HH:mm");
                        break;
                    }

                }

            }

            var period_time = Math.round((now - transaction_created) + 1);
            var period = Date.today().addMilliseconds(period_time).toString("HH:mm");

            var capacity = guest_num + "/" + seats;

            if (check_no != "") check_no = _("C#") + check_no;
            if (checks != "") checks = "+" + checks;

            if (seq != "") {
                subtotal = _("T#") + subtotal;
                btn.setTableStatus(1);

                if (guest_num <= seats)
                    btn.setCapacityStatus(1);
                else
                    btn.setCapacityStatus(2);

                if (period_time < tableSettings.TablePeriodLimit * 60 * 1000)
                    btn.setPeriodStatus(1);
                else
                    btn.setPeriodStatus(2);
            } else {
                subtotal = '';
                period = '';

                if (holdby)
                    btn.setTableStatus(2);
                else {
                    if (mark) {
                        btn.setTableStatus(3);
                    } else {
                        btn.setTableStatus(0);
                    }
                }


                btn.setPeriodStatus(0);
                btn.setCapacityStatus(0);


            }



            btn.table_no = table_no;
            btn.checks = checks;
            btn.table_label = tableSettings.DisplayTableLabel ? table_label : '';
            btn.seq_no = tableSettings.DisplaySeqNo ? seq : '';
            btn.check_no = tableSettings.DisplayCheckNo ? check_no : '';
            btn.booking = tableSettings.DisplayBooking ? book_time : '';
            btn.period = tableSettings.DisplayPeriod ? period : '';
            btn.subtotal = tableSettings.DisplayTotal ? subtotal : '';
            btn.capacity = tableSettings.DisplayCapacity ? capacity : '';
            // share seq_no for seq & clerk
            // btn.seq_no = tableSettings.DisplayClerk ? clerk : btn.seq_no;
            btn.clerk = tableSettings.DisplayClerk ? clerk : '';

            if (mark && seq == "" ) {
                btn.seq_no = _('Status') + ':' + mark;
                btn.clerk = mark_user;
            }

            if (holdby) btn.seq_no = _('Host Table') + ':' + holdby;

            return;

        }
    });

})();
