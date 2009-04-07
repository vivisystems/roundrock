var inputObj = window.arguments[0];
var titleObj = null;
var org_title = '';
var tableSettings = {};

(function(){    

    // include controllers  and register itself
    var selectFunc = null;


    /**
     * Controller Startup
     */
    function startup() {

        var tables = inputObj.tables;
        // var queuePool = inputObj.queuePool;

        // var itemlistObj = document.getElementById('itemlist');
        var self = this;

        window.viewHelper = new opener.GeckoJS.NSITreeViewArray(tables);
        window.viewHelper.getCurrentIndexData= function(row) {
            // var text = row + ":" + col.check_no;
            // GREUtils.log(GeckoJS.BaseObject.dump(row))
            GREUtils.log(row);

            return this.data[row];

        };

        window.viewHelper.renderButton= function(row, btn) {
            // GREUtils.log('renderButton...');
// GREUtils.log(GeckoJS.BaseObject.dump(this.data[row]));
/*
    'TableWinAsFirstWin': true
    'VirtualTableMap': false
    'RequireCheckNo': true
    'TablePeriodLimit': 60
    'RequireTableNo': true
    'TableRemindTime': 120
    'RequireGuestNum': false
    'TableBookingTimeout': 15
    'DisplayCheckNo': true
    'DisplayTableLabel': true
    'DisplaySeqNo': true
    'DisplayBooking': true
    'DisplayPeriod': true
    'DisplayTotal': true
    'DisplayCapacity': true
    'DisplayClerk': true
*/
            var tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};

            var seq = this.data[row].sequence || '';
            var check_no = this.data[row].check_no || '';
            var checks = this.data[row].checks || '';
            var table_no = this.data[row].table_no || '';
            var table_label = this.data[row].table_name || '';
            var guest_num = this.data[row].no_of_customers || '0';
            var seats = this.data[row].seats || '0';
            var subtotal = this.data[row].total || '0';
            var now = Math.round(new Date().getTime());
            var transaction_created = this.data[row].transaction_created * 1000 || now;

            var booking_time = Math.round((this.data[row].booking ? this.data[row].booking.booking : 0) || 0) * 1000;
            
            var book_time = (booking_time > 100) ? "B#" + (new Date(booking_time)).toString("HH:mm") : '';
            
            var period_time = Math.round((now - transaction_created));
            var period = Date.today().addMilliseconds(period_time).toString("HH:mm");

            var capacity = guest_num + "/" + seats;

            if (check_no != "") check_no = "C#" + check_no;
            if (checks != "") checks = "+" + checks;

            if (seq != "") {
                subtotal = "T#" + subtotal;
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

                btn.setTableStatus(0);
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

            return;
        };

        document.getElementById('tableScrollablepanel').datasource = window.viewHelper ;
        titleObj = document.getElementById('main_title');
        org_title = titleObj.getAttribute('label');

        tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};
// GREUtils.log(GeckoJS.BaseObject.dump(tableSettings));

        doSetOKCancel(
            function(){
                inputObj.index = document.getElementById('tableScrollablepanel').value;
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

function _setPromptLabel(prompt_1, prompt_2, prompt_3) {
    //
    document.getElementById("prompt_1").value = prompt_1;
    document.getElementById("prompt_2").value = prompt_2;
    document.getElementById("prompt_3").value = prompt_3;
}

function _showPromptPanel(panel, sleepTime) {

            var promptPanel = document.getElementById(panel);
            var funcPanel = document.getElementById('func_panel');
            var w = funcPanel.boxObject.width + 32;
            var h = funcPanel.boxObject.height + 48;
            var x = funcPanel.boxObject.screenX - 32;
            var y = funcPanel.boxObject.screenY - 18;
// GREUtils.log("w:" + w + ", h:" + h);
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            promptPanel.sizeTo(w, h);
            // var x = (width - 360) / 2;
            // var y = (height - 240) / 2;
            promptPanel.openPopupAtScreen(x, y);
/*
            // release CPU for progressbar ...
            if (!sleepTime) {
              sleepTime = 1000;
            }
            this.sleep(sleepTime);
*/
            return promptPanel;
}

function _hidePromptPanel(panel) {
    var promptPanel = document.getElementById(panel);
    promptPanel.hidePopup();
}

function readTableConfig() {
    tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || false;
}

function doRecallCheck() {
    _setPromptLabel('*** Recall Check ***', 'Please Select a Table to recall...', 'Press CANCEL button to cancel function');

    var pnl = _showPromptPanel('prompt_panel');
    inputObj.action = 'RecallCheck';
    titleObj.setAttribute('label', org_title + " - " + _("Recall Check"));
}

function doSplitCheck() {
    _setPromptLabel('*** Split Check ***', 'Please Select a Table to split...', 'Press CANCEL button to cancel function');

    var pnl = _showPromptPanel('prompt_panel');
    inputObj.action = 'SplitCheck';
    titleObj.value = org_title + " - " + _("Split Check");
}

function doMergeCheck() {
    _setPromptLabel('*** Merge Check ***', 'Please Select a Table to merge...', 'Press CANCEL button to cancel function');

    var pnl = _showPromptPanel('prompt_panel');
    inputObj.action = 'MergeCheck';
    titleObj.setAttribute('label', org_title + " - " + _("Merge Check"));
}

function doSelectTableNo() {
    _setPromptLabel('*** Select Table ***', 'Please Select a Table...', 'Press CANCEL button to cancel function');

    var pnl = _showPromptPanel('prompt_panel');
    inputObj.action = 'SelectTableNo';
    titleObj.setAttribute('label', org_title + " - " + _("Select Table No"));
}

function doCancelFunc() {
    _hidePromptPanel('prompt_panel');
    if (inputObj.action) {
        inputObj.action = '';
    } else {
        doCancelButton();
    }
}

function doFunc() {
    _hidePromptPanel('prompt_panel');
    // alert('doFunc...' + inputObj.action);
    var v = document.getElementById('tableScrollablepanel').value;
    if (inputObj.action)
        doOKButton();
}
