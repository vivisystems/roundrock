(function() {               // Using a closure to keep global namespace clean.

    var _encoding = 'US-ASCII';

    var _templateModifiers = window._templateModifiers = function($T, encoding) {

        _encoding = encoding;
        
        // return the length of the string in the given encoding
        function strLen(str) {
            var len;
            if (str == null || str == '') {
                len = 0;
            }
            else {
                try {
                    str += '';
                    var lstr = GREUtils.Charset.convertFromUnicode(str, _encoding);
                    len = lstr.length;
                }
                catch(e) {
                    len = str.length;
                }
            }
            return len;
        };

        // carry out substring function on the string at the correct word boundary
        function subStr(str, startIndex, width) {
            var substr = '';
            if (str != null && str.length > 0) {
                try {
                    str += '';

                    var resultArray = [];
                    var charArray = str.split('');
                    var offset = 0;
                    for (var i = 0; i < charArray.length; i++) {
                        var ch = GREUtils.Charset.convertFromUnicode(charArray[i], _encoding);
                        if (offset - (- ch.length) > startIndex) {
                            break;
                        }
                        else {
                            offset += ch.length;
                        }
                    }
                    var len = 0;
                    for (; i < charArray.length; i++) {
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
        };

        $T.parseTemplate_etc.modifierDef['wcenter'] = function(str, width) {
                if (width == null || isNaN(width) || width < 0) return str;
                str += '';

                var len = str.length;

                if (width < len) {
                    str = str.substr(0, width);
                }
                else {
                    var leftPaddingWidth = Math.floor((width - len) / 2);
                    str = GeckoJS.String.padRight(GeckoJS.String.padLeft(str, leftPaddingWidth - (- len) , ' '), width, ' ');
                }
                return str;
            };

        $T.parseTemplate_etc.modifierDef['center'] = function(str, width) {
                if (width == null || isNaN(width) || width < 0) return str;
                str += '';

                width = Math.floor(Math.abs(width));
                var convertedLength = strLen(str);
                var internalLength = str.length;

                if (width < convertedLength) {
                    str = subStr(str, 0, width);

                    // subStr might have left the string shorter than desired width, so we still need to pad
                    str = GeckoJS.String.padRight(str, str.length + width - strLen(str), ' ');
                }
                else {
                    var leftPaddingWidth = Math.floor((width - convertedLength) / 2);
                    var rightPaddingWidth = width - convertedLength - leftPaddingWidth;
                    str = GeckoJS.String.padRight(GeckoJS.String.padLeft(str, leftPaddingWidth - (- internalLength) , ' '),
                                                  leftPaddingWidth - (- internalLength) - (- rightPaddingWidth),
                                                  ' ');
                }
                return str;
            };

        $T.parseTemplate_etc.modifierDef['wleft'] = function(str, width) {
                if (width == null || isNaN(width)) return str;
                str += '';

                width = Math.floor(Math.abs(width));
                var len = str.length;

                if (width < len) {
                    str = str.substr(0, width);
                }
                else {
                    str = GeckoJS.String.padRight(str, width, ' ');
                }
                return str;
            };

        $T.parseTemplate_etc.modifierDef['left'] = function(str, width) {
                if (width == null || isNaN(width)) return str;
                str += '';

                width = Math.floor(Math.abs(width));
                var convertedLength = strLen(str);

                if (width < convertedLength) {
                    str = subStr(str, 0, width);

                    // subStr might have left the string shorter than desired width, so we still need to pad
                    str = GeckoJS.String.padRight(str, str.length + width - strLen(str), ' ');
                }
                else {
                    var rightPaddingWidth = width - convertedLength;
                    var internalLength = str.length;
                    str = GeckoJS.String.padRight(str, internalLength + rightPaddingWidth, ' ');
                }
                return str;
            };

        $T.parseTemplate_etc.modifierDef['wright'] = function(str, width) {
                if (width == null || isNaN(width)) return str;
                str += '';

                width = Math.floor(Math.abs(width));
                var len = str.length;

                if (width < len) {
                    str = str.substr(0, width);
                }
                else {
                    str = GeckoJS.String.padLeft(str, width, ' ');
                }
                return str;
            };

        $T.parseTemplate_etc.modifierDef['right'] = function(str, width) {
                if (width == null || isNaN(width)) return str;
                str += '';

                width = Math.floor(Math.abs(width));
                var convertedLength = strLen(str);

                if (width < convertedLength) {
                    str = subStr(str, 0, width);

                    // subStr might have left the string shorter than desired width, so we still need to pad
                    str = GeckoJS.String.padLeft(str, str.length + width - strLen(str), ' ');
                }
                else {
                    var leftPaddingWidth = width - convertedLength;
                    var internalLength = str.length;
                    str = GeckoJS.String.padLeft(str, internalLength + leftPaddingWidth, ' ');
                }
                return str;
            };

        $T.parseTemplate_etc.modifierDef['wtruncate'] = function(str, width) {
                if (width == null || isNaN(width)) return str;
                str += '';

                width = Math.floor(Math.abs(width));
                var len = str.length;

                if (width < len) {
                    str = str.substr(0, width);
                }
                return str;
            },

        $T.parseTemplate_etc.modifierDef['truncate'] = function(str, width) {
                if (width == null || isNaN(width)) return str;
                str += '';

                width = Math.floor(Math.abs(width));
                var len = strLen(str);

                if (width < len) {
                    str = subStr(str, 0, width);

                    // subStr might have left the string shorter than desired width, so we still need to pad
                    str = GeckoJS.String.padRight(str, str.length + width - strLen(str), ' ');
                }
                return str;
            },

        $T.parseTemplate_etc.modifierDef['wtail'] = function(str, width) {
                if (width == null || isNaN(width)) return str;
                str += '';

                width = Math.floor(Math.abs(width));
                var len = str.length;

                if (width < len) {
                    str = str.substr(len - width, width);
                }
                return str;
            },

        $T.parseTemplate_etc.modifierDef['tail'] = function(str, width) {
                if (width == null || isNaN(width)) return str;
                str += '';

                width = Math.floor(Math.abs(width));
                var len = strLen(str);

                if (width < len) {
                    str = subStr(str, len - width, width);
                }
                return str;
            },

        $T.parseTemplate_etc.modifierDef['substr'] = function(str, index, width) {
                if (width == null || isNaN(width) || index == null || isNaN(index)) return str;
                str += '';

                width = Math.floor(Math.abs(width));
                index = Math.floor(Math.abs(index));
                var substr = subStr(str, index, width);
                return substr;
            }
        };
}) ();
