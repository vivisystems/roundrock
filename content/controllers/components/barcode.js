(function() {

    var __component__ = {

        name: 'Barcode',

        value_0: "0".charCodeAt(0),
        value_9: "9".charCodeAt(0),
        value_hypen: "-".charCodeAt(0),
        value_sp: " ".charCodeAt(0),

        isNumeric: function (param) {
            var value_0 = this.value_0;
            var value_9 = this.value_9;

            for( var i=0; i<param.length; i++)
            {
                var value = param.charCodeAt(i);
                if ( value < value_0 || value > value_9)
                    return false;
            }
            return  true;
        },

        isValidISBN: function (param) {
            
            var value_0 = this.value_0;
            var value_9 = this.value_9;
            var value_hypen = this.value_hypen;
            var value_sp = this.value_sp;


            for( var i=0; i<param.length; i++)
            {
                var value=param.charCodeAt(i);
                if ( value == value_hypen || value==value_sp ) continue;
                if ( value < value_0 || value > value_9 )
                    return false;
            }
            return true;
        },


        /**
         * _getEANCheckDigit
         *
         * @private
         * @param {String} number
         * @return {String}
         */
        _getEANCheckDigit: function(param) {

            if (typeof(param) != 'string') return "";

            var value_0 = this.value_0;

            var sum=0;
            var odd_parity=true;
            for(var i=param.length-1; i>=0; i--)
            {
                if ( odd_parity )
                    sum += 3*(param.charCodeAt(i)-value_0);
                else
                    sum += param.charCodeAt(i)-value_0;
                odd_parity = !odd_parity;
            }
            var check_digit = 10 - (sum%10);
            if (check_digit==10) check_digit=0;
            return String.fromCharCode(check_digit+value_0 );
            
        },

        /**
         * _getISBNCheckDigit
         *
         * @private
         * @param {String} number
         * @return {String}
         */
        _getISBNCheckDigit: function(param) {

            if (typeof(param) != 'string') return "";

            var value_0 = this.value_0;
            var value_9 = this.value_9;

            var str="";
            for(var i=0; i<param.length; i++)
            {
                var value=param.charCodeAt(i);
                if ( value >= value_0 && value <=value_9  )
                    str+=String.fromCharCode(value);
            }
            var sum=0;
            for(var i=0; i<str.length; i++)
            {
                var value = str.charCodeAt(i)-value_0;
                sum += value*(10-i);
            }
            var check_digit = 11-sum%11;
            if (check_digit==10 ) return "X";
            else if (check_digit==11) return "0";
            else return String.fromCharCode(check_digit+value_0);

        },

        getUPCCheckDigit: function(number) {
            if ( !this.isNumeric(number) || number.length!=11) {
                return "";
            }
            return this._getEANCheckDigit(number);
        },

        getEANCheckDigit: function(number) {

            return this.getEAN13CheckDigit(number);

        },

        getEAN13CheckDigit: function(number) {

            if ( !this.isNumeric(number) || number.length!=12) {
                return "";
            }

            return this._getEANCheckDigit(number);
            
        },

        getEAN14CheckDigit: function(number) {
            if ( !this.isNumeric(number) || number.length!=13) {
                return "";
            }
            return this._getEANCheckDigit(number);
        },

        getEAN18CheckDigit: function(number) {
            if ( !this.isNumeric(number) || number.length!=17) {
                return "";
            }
            
            return this._getEANCheckDigit(number);

        },

        getISBNCheckDigit: function(number) {
            if ( !this.isNumeric(number) && number.length == 12) {

                return this.getEAN13CheckDigit(number);

            }else if ( this.isValidISBN(number) && number.length == 9) {

                return this._getISBNCheckDigit(number);
                
            }else {
                return "";
            }

        },

        isValidNONPLU13: function (param) {
            
            if ( !this.isNumeric(param) || param.length != 13) {

                return false;

            }

            var identifier = param.substr(0, 2);
            var number = param.substr(0, 12);
            var checksum = param.substr(12, 1);

            if (this.getEAN13CheckDigit(number) == checksum) {

                // NON-PLU13 - (Instore Marking)
                return (["02", "20","21","22","23","24","25","26","27","28","29"].indexOf(identifier) >= 0);

            }

            return false;

        },

        getNONPLU13Identifier: function(param) {

            if ( !this.isNumeric(param) || param.length != 13) {

                return false;

            }

            var identifier = param.substr(0, 2);
            var number = param.substr(0, 12);
            var checksum = param.substr(12, 1);

            if (this.getEAN13CheckDigit(number) == checksum) {

                // NON-PLU13 - (Instore Marking)
                if( ["02", "20","21","22","23","24","25","26","27","28","29"].indexOf(identifier) >= 0) {

                    return identifier;

                }

            }

            return false;

        }

    }

    var BarcodeComponent = window.BarcodeComponent = GeckoJS.Component.extend(__component__);

})();

