(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {
        
        name: 'ViewSystemLog',

        _lists: [],

        load: function() {
            
            // load default tag and list log files.
            this.logList();
        },

        logList: function() {


            var preview = document.getElementById('preview_frame');
            preview.contentDocument.body.innerHTML = "<pre> " + '' + "</pre>";

            this.resizeScrollButtons();

            // load default tag and list log files.
            var tabValue = document.getElementById('main-tabbox').value;

            var lists = [];
            
            switch (tabValue) {
                default:
                case 'syslog':
                    var lists1 = GeckoJS.Dir.readDir('/var/log/', {
                        type: 'f',
                        name: /dmesg*|messages*|syslog*/ ,
                        recursive: false
                    });

                    if (lists1 && lists1.length >0) {
                        lists = lists.concat(lists1);
                    }
                    break;

                case 'web':
                    var lists1 = GeckoJS.Dir.readDir('/data/vivipos_webapp/app/tmp/logs/', {
                        type: 'f',
                        //name: /\.log*/ ,
                        recursive: false
                    });
                    if (lists1 && lists1.length >0) {
                        lists = lists.concat(lists1);
                    }

                    var lists2 = GeckoJS.Dir.readDir('/var/log/', {
                        type: 'f',
                        name: /sync_client\.log*/ ,
                        recursive: false
                    });

                    if (lists2 && lists2.length >0) {
                        lists = lists.concat(lists2);
                    }

                    break;

                case 'vivipos':
                    var lists1 = GeckoJS.Dir.readDir('/data/vivipos_sdk/log/', {
                        type: 'f',
                        //name: /\.log*/ ,
                        recursive: false
                    });
                    if (lists1 && lists1.length >0) {
                        lists = lists.concat(lists1);
                    }

                    break;

            }

            lists = this.sortByName(lists);

            var logFilesObj = document.getElementById('logFilesList');

            logFilesObj.removeAllItems();

            var index = 0 ;

            lists.forEach(function(f) {
                var filename = f.leafName;

                logFilesObj.appendItem( filename, index);
                index++;

            });



            this._lists = lists;
        },

        viewLog: function(idx) {

            var file = this._lists[idx];

            if (!file) return;

            var isCompressed = false;
            
            if (file.leafName.match(/\.gz/)) isCompressed = true;

            var content = '';
            
            if (isCompressed) {

                var f = new GeckoJS.File(file);
                f.open("rb");
                var buf = f.read();
                f.close();

                content = GREUtils.Gzip.uncompress(buf);

                delete f;
                delete buf;

            }else {
                
                var f = new GeckoJS.File(file);
                f.open("r");
                content = f.read();
                f.close();

                delete f;
                
            }

            var preview = document.getElementById('preview_frame');
            preview.contentDocument.body.innerHTML = "<pre>" + content + "</pre>";

            this.resizeScrollButtons();
            
        },

        sortByName: function (lists) {
            var listsByName = [];
            var lists2 = [];
            lists.forEach(function(f,i) {
                listsByName.push({name: f.leafName, idx: i});
            });
            var ll = (new GeckoJS.ArrayQuery(listsByName)).orderBy('name');
            ll.forEach(function(f){
               lists2.push(lists[f.idx]);
            });
            return lists2;
        },

        resizeScrollButtons: function() {
                var bw = document.getElementById( 'preview_frame' );
                if ( !bw ) return ;

                var doc =bw.contentDocument.body;
                if ( !doc ) return ;

                if ( doc.scrollWidth > doc.clientWidth ) {
                    $( '#scrollBtnHBox' ).attr( 'hidden', false );
                } else {
                    $( '#scrollBtnHBox' ).attr( 'hidden', true );
                }

                if ( doc.scrollHeight > doc.clientHeight ) {
                    $( '#scrollBtnVBox' ).attr( 'hidden', false );
                } else {
                    $( '#scrollBtnVBox' ).attr( 'hidden', true );
                }
        },

        scroll: function(id) {
            var func = this[id];
            if (func) func.call(this);
        },

        btnScrollTop: function() {
                var bw = document.getElementById( 'preview_frame' );
                if ( !bw ) return ;

                var doc =bw.contentDocument.body;
            doc.scrollTop = 0;
        },

        btnScrollUp: function() {
                var bw = document.getElementById( 'preview_frame' );
                if ( !bw ) return ;

                var doc =bw.contentDocument.body;

            if ( doc.scrollTop <= 0 ) return;

            var scrollRange = 200;
            doc.scrollTop -= scrollRange;

            if ( doc.scrollTop < 0 ) doc.scrollTop = 0;
        },

        btnScrollDown: function() {
                var bw = document.getElementById( 'preview_frame' );
                if ( !bw ) return ;

                var doc =bw.contentDocument.body;

            if ( doc.scrollTop > doc.scrollHeight ) return;

            var scrollRange =  200;
            doc.scrollTop += scrollRange;

            if ( doc.scrollTop > doc.scrollHeight ) doc.scrollTop = doc.scrollHeight - doc.clientHeight;
        },

        btnScrollBottom: function() {
                var bw = document.getElementById( 'preview_frame' );
                if ( !bw ) return ;

                var doc =bw.contentDocument.body;

            doc.scrollTop = doc.scrollHeight - doc.clientHeight;
        },

        btnScrollLeft: function() {

                var bw = document.getElementById( 'preview_frame' );
                if ( !bw ) return ;

                var doc =bw.contentDocument.body;

            if ( doc.scrollLeft <= 0 ) return;

            var scrollRange =  200;
            doc.scrollLeft -= scrollRange;

            if ( doc.scrollLeft < 0 ) doc.scrollLeft = 0;
        },

        btnScrollRight: function() {
                var bw = document.getElementById( 'preview_frame' );
                if ( !bw ) return ;

                var doc =bw.contentDocument.body;

            if (doc.scrollLeft > doc.scrollWidth) return;

            var scrollRange =  200;
            doc.scrollLeft += scrollRange;

            if ( doc.scrollLeft > doc.scrollWidth ) doc.scrollLeft = doc.scrollWidth - doc.clientWidth;
        },

        btnScrollLeftMost: function() {
                var bw = document.getElementById( 'preview_frame' );
                if ( !bw ) return ;

                var doc =bw.contentDocument.body;

            doc.scrollLeft = 0;
        },

        btnScrollRightMost: function() {
                var bw = document.getElementById( 'preview_frame' );
                if ( !bw ) return ;

                var doc =bw.contentDocument.body;

            doc.scrollLeft = doc.scrollWidth - doc.clientWidth;
        }


    };

    AppController.extend(__controller__);

})();
