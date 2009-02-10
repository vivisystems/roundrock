(function() {               // Using a closure to keep global namespace clean.
    var _templateModifiers = window._templateModifiers = function(_encoding) {

        // return the length of the string in the given encoding
        function strLen(str) {
            var len;
            if (str == null || str == '') {
                len = 0;
            }
            else {
                try {
                    var lstr = GREUtils.Charset.convertFromUnicode(str, _encoding);
                    len = lstr.length;
                }
                catch(e) {
                    len = str.length;
                }
            }
            return len;
        }

        // carry out substring function on the string at the correct word boundary
        function subStr(str, startIndex, width) {
            var substr = '';
            if (str != null && str.length > 0) {
                try {
                    var resultArray = [];
                    var charArray = str.split('');
                    var len = 0;
                    for (var i = startIndex; i < charArray.length; i++) {
                        var ch = GREUtils.Charset.convertFromUnicode(charArray[i], _encoding);

                        if ((len - (- ch.length)) > width) {
                            break;
                        }
                        else {
                            resultArray.push(charArray[i]);
                            len += ch.length;
                        }
                    }
                    substr = resultArray.join('');
                }
                catch(e) {
                    substr = str.substr(startIndex, width);
                }
            }
            return substr;
        }

        var _MODIFIERS = {
            center: function(str, width) {
                if (width == null || isNaN(width) || width < 0) return str;

                width = Math.floor(Math.abs(width));
                var convertedLength = strLen(str);
                var internalLength = str.length;

                if (width < convertedLength) {
                    str = subStr(str, 0, width);
                }
                else {
                    var leftPaddingWidth = Math.floor((width - convertedLength) / 2);
                    var rightPaddingWidth = width - convertedLength - leftPaddingWidth;
                    str = GeckoJS.String.padRight(GeckoJS.String.padLeft(str, leftPaddingWidth - (- internalLength) , ' '),
                                                  leftPaddingWidth - (- internalLength) - (- rightPaddingWidth),
                                                  ' ');
                }
                return str;
            },

            left: function(str, width) {
                if (width == null || isNaN(width)) return str;

                width = Math.floor(Math.abs(width));
                var convertedLength = strLen(str);

                if (width < convertedLength) {
                    str = subStr(str, 0, width);
                }
                else {
                    var rightPaddingWidth = width - convertedLength;
                    var internalLength = str.length;
                    str = GeckoJS.String.padRight(str, internalLength + rightPaddingWidth, ' ');
                }
                return str;
            },

            right: function(str, width) {
                if (width == null || isNaN(width)) return str;

                width = Math.floor(Math.abs(width));
                var convertedLength = strLen(str);

                if (width < convertedLength) {
                    str = subStr(str, 0, width);
                }
                else {
                    var leftPaddingWidth = width - convertedLength;
                    var internalLength = str.length;
                    str = GeckoJS.String.padLeft(str, internalLength + leftPaddingWidth, 'L');
                }
                return str;
            },

            truncate: function(str, width) {
                if (width == null || isNaN(width)) return str;

                width = Math.floor(Math.abs(width));
                var len = strLen(str);

                if (width < len) {
                    str = subStr(str, 0, width);
                }
                return str;
            }
        };
        return _MODIFIERS;
    }
}) ();
