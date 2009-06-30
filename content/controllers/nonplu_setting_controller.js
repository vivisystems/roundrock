(function(){

    var __controller__ = {

        name: 'NonpluSetting',

        components: ['Barcode'],

        _identifiers: [],
        _identifier: null,
        _listObj: null,
        _panelView: null,
        _selectedIndex: -1,
        _contentType: {'0': _('Price'), '1': _('Quantity'), '2': _('Weight')},

        // initialize and load currency exchange table into Session

        initial: function (evt) {

            // default identifiers for first setting...
            var identmp = [
                {identifier: '02', length_of_field1: 5, length_of_field2: 5, decimal_point_of_field2: 0, use_price_check_digit: false, content_of_field2: 0, active: false},
                {identifier: '20', length_of_field1: 5, length_of_field2: 5, decimal_point_of_field2: 0, use_price_check_digit: false, content_of_field2: 0, active: false},
                {identifier: '21', length_of_field1: 6, length_of_field2: 4, decimal_point_of_field2: 0, use_price_check_digit: false, content_of_field2: 0, active: false},
                {identifier: '22', length_of_field1: 7, length_of_field2: 3, decimal_point_of_field2: 0, use_price_check_digit: false, content_of_field2: 0, active: false},
                {identifier: '23', length_of_field1: 8, length_of_field2: 2, decimal_point_of_field2: 0, use_price_check_digit: false, content_of_field2: 0, active: false},
                {identifier: '24', length_of_field1: 9, length_of_field2: 1, decimal_point_of_field2: 0, use_price_check_digit: false, content_of_field2: 0, active: false},
                {identifier: '25', length_of_field1: 5, length_of_field2: 4, decimal_point_of_field2: 0, use_price_check_digit: false, content_of_field2: 0, active: false},
                {identifier: '26', length_of_field1: 6, length_of_field2: 3, decimal_point_of_field2: 0, use_price_check_digit: false, content_of_field2: 0, active: false},
                {identifier: '27', length_of_field1: 7, length_of_field2: 2, decimal_point_of_field2: 0, use_price_check_digit: false, content_of_field2: 0, active: false},
                {identifier: '28', length_of_field1: 8, length_of_field2: 1, decimal_point_of_field2: 0, use_price_check_digit: false, content_of_field2: 0, active: false},
                {identifier: '29', length_of_field1: 9, length_of_field2: 0, decimal_point_of_field2: 0, use_price_check_digit: false, content_of_field2: 0, active: false},
            ];

            var identifiers = GeckoJS.Session.get('NonPluIdentifiers');

            if (identifiers == null) {
                var datastr = GeckoJS.Configure.read('vivipos.fec.settings.NonPluIdentifiers') || '';
                if (datastr.length > 0)
                    var identifiers = GeckoJS.BaseObject.unserialize(datastr);
                else
                    var identifiers = identmp;
                GeckoJS.Session.set('NonPluIdentifiers', identifiers);
            }

            var identifierIndex = {};
            for (var key in identifiers){
                identifierIndex[identifiers[key].identifier] = key;
            }
            GeckoJS.Session.set('NonPluIdentifierIndex', identifierIndex);

            this._identifiers = identifiers;
            
        },

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('identifierscrollablepanel');
            }
            return this._listObj;
        },

        changeActiveIdentifier: function(value) {
            //
            var identifier = this._identifiers[this._selectedIndex];
            identifier.active = value;
            this.calcData();
        },

        changeField1: function(value) {
            //
            var identifier = this._identifiers[this._selectedIndex];
            identifier.length_of_field1 = value;
            this.calcData();
        },

        changeCheckDigit: function(value) {
            //
            var identifier = this._identifiers[this._selectedIndex];
            identifier.use_price_check_digit = value;
            this.calcData();
        },

        changeContentOfField2: function(value) {
            //
            var identifier = this._identifiers[this._selectedIndex];
            identifier.content_of_field2 = value;
            if (identifier.content_of_field2 > 0) {
                this.changeDecimal(0);
            }
            this.calcData();
        },

        changeDecimal: function(value) {
            //
            var identifier = this._identifiers[this._selectedIndex];
            if (identifier.content_of_field2 == 0) {
                identifier.decimal_point_of_field2 = value;
            } else {
                identifier.decimal_point_of_field2 = 0;
            }
            this.calcData();
        },

        calcData: function(index) {
            //
            // {identifier: '02', length_of_field1: 5, length_of_field2: 5, decimal_point_of_field2: 0, use_price_check_digit: false, content_of_field2: 0}
            var identifier = this._identifiers[this._selectedIndex];


            var checkDigit = identifier.use_price_check_digit ? 1 : 0;
            identifier.length_of_field2 = 10 - identifier.length_of_field1 - checkDigit;

            if (identifier.length_of_field2 == -1) {
                identifier.use_price_check_digit = false;
                identifier.length_of_field2 = 0;
            }

            this.Form.reset('settingsForm');
            this.Form.unserializeFromObject('settingsForm', identifier);

            this.getListObj().invalidate();

            // show example
            this.showExample(identifier);

        },

        showExample: function(identifierObj) {
            //
            var barcode = identifierObj.identifier + "1234567890";
            var crc = this.Barcode.getEAN13CheckDigit(barcode);

            var check_digit = identifierObj.use_price_check_digit ? 1 : 0;
            var cp = check_digit ? barcode.charAt(2 + parseInt(identifierObj.length_of_field1)) : '';

            var pluno = barcode.substr(2, identifierObj.length_of_field1);

            var field2 = barcode.substr(2 + parseInt(identifierObj.length_of_field1) + check_digit, identifierObj.length_of_field2);
            var field2value = field2 / Math.pow(10, identifierObj.decimal_point_of_field2);

            // document.getElementById('exampleCode').value = barcode + crc;
            document.getElementById('exampleCode').setAttribute("label", _("Example Code") + ": " + barcode + crc);

            document.getElementById('examplePluNo').value = pluno;
            document.getElementById('exampleContentType').value = this._contentType[identifierObj.content_of_field2] + ": ";
            document.getElementById('exampleField2').value = field2value;

            document.getElementById('exIden').value = identifierObj.identifier;
            document.getElementById('exPluNo').value = pluno;
            document.getElementById('exCP').value = cp;
            document.getElementById('exField2').value = field2;
            document.getElementById('exCRC').value = crc;

        },

        select: function(index) {

            if (index >= this._identifiers.length) index = this._identifiers.length - 1;
            this._selectedIndex = index;

            if (index >= 0) {
                var identifier = this._identifiers[index];
                this.Form.reset('settingsForm');
                this.Form.unserializeFromObject('settingsForm', identifier);

                this.showExample(identifier);
            }
        },

        setContentTypeMenuItem: function() {

            var contentTypeObj = document.getElementById('contentTypePopup');

            // remove all child...
            while (contentTypeObj.firstChild) {
                contentTypeObj.removeChild(contentTypeObj.firstChild);
            }

            for (var key in this._contentType) {
                var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
                menuitem.setAttribute('value', key);
                menuitem.setAttribute('label', this._contentType[key]);
                contentTypeObj.appendChild(menuitem);
            }
        },

        load: function() {

            var self = this;

            this.initial();

            this.setContentTypeMenuItem();

            var identifiers = GeckoJS.Session.get('NonPluIdentifiers');
            var obj = {};

            this._panelView = new GeckoJS.NSITreeViewArray(identifiers);
            this._panelView.getCellValue = function(row, col) {
                var sResult;
                var key = (typeof col == 'object') ? col.id : col;

                try {
                    if (key == 'active' || key == 'use_price_check_digit') {
                        sResult = this.data[row][key] ? '*' : ' ';
                    } else if (key == 'content_of_field2') {

                        sResult = self._contentType[this.data[row][key]];

                    } else {
                        sResult= this.data[row][key];

                    }
                }
                catch (e) {
                    return "<" + row + "," + key + ">";
                }
                return sResult;
            }

            this.getListObj().datasource = this._panelView;

            this.getListObj().selectedIndex = 0;
            this.getListObj().selection.select(0);
            this._panelView.tree.ensureRowIsVisible(0);
            this.select(0);

        },

        save: function () {

            var datastr = GeckoJS.BaseObject.serialize(this._identifiers);

            GeckoJS.Configure.write('vivipos.fec.settings.NonPluIdentifiers', datastr);

            GeckoJS.Session.set('NonPluIdentifiers', null);
            this.initial();

        },

        undo: function () {

            GeckoJS.Session.set('NonPluIdentifiers', null);
            this.initial();

        }

    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
            main.requestCommand('initial', null, 'NonpluSetting');
        });

    }, false);

})();
