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

        /* length: variable
         * valid codes:  ASCII 0~127  */
        isValidCODE128: function (param) {

            for(var j = 0 ; j< param.length ; j++ ){

                     if( !(param[j].charCodeAt(0) >= 0 && param[j].charCodeAt(0) <= 127 ) )// code 128
                            return false;
            }
            return true;
        },

         /* length: variable
         /* valid codes 0~9, A~Z, $ % * + - . / and space  */
         isValid3OF9: function( param ){

            for(var j = 0 ; j< param.length ; j++ ){

                    if( !(
                             (param[j].charCodeAt(0) >= 48 && param[j].charCodeAt(0) <= 57 )|| // 0~9
                             (param[j].charCodeAt(0) >= 65 && param[j].charCodeAt(0) <= 90 )|| // A~Z
                              param[j].charCodeAt(0) == 36                              || // $
                              param[j].charCodeAt(0) == 37                              || // %
                              param[j].charCodeAt(0) == 42                              || // *
                              param[j].charCodeAt(0) == 43                              || // +
                              param[j].charCodeAt(0) == 45                              || // -
                              param[j].charCodeAt(0) == 46                              || // .
                              param[j].charCodeAt(0) == 47                              || // /
                              param[j].charCodeAt(0) == 32                                 // space
                          )
                      ) // find illegal char do
                               { return false;}
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

         /**
         * convert_UPCE_to_UPCA
         *
         * @public
         * @param {String} number
         * @return {String}
         */
        convert_UPCE_to_UPCA: function(param) {

              let d1 = param[0];
              let d2 = param[1];
              let d3 = param[2];
              let d4 = param[3];
              let d5 = param[4];
              let d6 = param[5];

              let mfrnum = '';
              let itemnum = '';

              if( d6 == '0' || d6 == '1' || d6 == '2'){
     
                   mfrnum = d1 + d2 + d6 + '00' ;
                   itemnum = '00'+ d3 + d4 + d5 ;
              }

              if(d6 == '3'){

                  mfrnum = d1 + d2 + d3 + '00' ;
                  itemnum = '000'+ d4 + d5 ;
              }

              if(d6 == '4'){

                  mfrnum = d1 + d2 + d3 + d4 + '0' ;
                  itemnum = '0000' + d5 ;
              }

              if(d6 == '5' || d6 == '6' || d6 == '7'|| d6 == '8' || d6 == '9'){

                  mfrnum = d1 + d2 + d3 + d4 + d5 ;
                  itemnum = '0000' + d6 ;
              }

              let newmsg = '0' + mfrnum + itemnum ;
              return newmsg;
        },

        getUPCCheckDigit: function(number) {
            if ( !this.isNumeric(number) || number.length!=11 ) {
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

