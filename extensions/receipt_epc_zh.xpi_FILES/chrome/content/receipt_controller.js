(function(){

    /**
     * Controller vivifuncpanelecrPrefs
     *
     * This controller is used to manage the preference panel
     * for vivifuncpanelecr
     */

    GeckoJS.Controller.extend( {

      name: 'Receipt_EPC_ZH',
      portlist: null,
      portdata: null,
      portid: null,
      txn: null,
      _printerObj: null,
      _tty: null,
      _selectedIndex: null,


      load: function (background) {
          // get dialog
          var self = this;

          if (!background) {
              var doOK = function () {
                  // save COM port selection
                  self.save();
                  return true;
              }

              // invoke doOK upon exit to save settings
              doSetOKCancel(doOK)
          }

          // read current settings
          var inputObj = GeckoJS.Configure.read('vivipos.fec.settings.receipt_epc_zh');

          // check settings - where necessary, reset to default if not set
          if (!inputObj) inputObj = {};
          if (!('portid' in inputObj)) inputObj.portid = '';
          this.portid = inputObj.portid;

          if ('receiptTemplateEncoded' in inputObj && inputObj.receiptTemplateEncoded.length > 0) {
              try {
                  inputObj.receiptTemplate = decodeURI(inputObj.receiptTemplateEncoded);
              }
              catch (e) {
                  // we assume the template has already been parsed
              }
          }
          var portObjs = GeckoJS.Configure.read('vivipos.fec.registry.comm');
          var ports = [];
          if (portObjs && (portObjs.constructor.name == 'Object')) {
              for (key in portObjs) {
                  ports.push(portObjs[key]);
              }

              // sort list of ports alphabetically by port name
              if (ports) ports.sort(function(a,b) {
                  if (a.name < b.name) return -1;
                  else if (a.name == b.name) return 0;
                  else return 1;
              });

              // store list of ports
          }
          this.portdata = ports;

          if (!background) {
              GeckoJS.FormHelper.unserializeFromObject('receiptForm', inputObj);
              var portlist = this.portlist = document.getElementById('comportscrollablepanel');

              // identify the index of the current port selection, if any
              var selectedIndex = -1;
              for (var i = 0; i < ports.length; i++) {
                  if (ports[i].id == inputObj.portid)
                      selectedIndex = i;
              }

              portlist.datasource = ports;
              if (selectedIndex != -1) {
                  portlist.selectedItems = [selectedIndex];
                  portlist.selectedIndex = selectedIndex;
              }
              this._selectedIndex = selectedIndex;
          }
          
          if (background) {
              // initialize receipt status
              var statusNode = document.getElementById('receipt_status');
              if (statusNode)
                  statusNode.setAttribute('status', inputObj.autoprint ? 'on' : 'off');

              // add observer to listen for change in receipt status
              this.observer = GeckoJS.Observer.newInstance({
                  topics: ['receipt-status-update'],
                  observe: function(aSubject, aTopic, aData) {

                      //GREUtils.log('[OBSERVER]: observing topic <' + aTopic + '> data <' + aData + '>');
                      switch(aTopic) {

                          case 'receipt-status-update':
                              if (statusNode) {
                                  statusNode.setAttribute('status', (aData == 'true') ? 'on' : 'off');
                              }
                              break;
                      }
                  }
              }).register();

              // add shopping cart event listener
              var cart = GeckoJS.Controller.getInstanceByName('Cart');
              if (cart) cart.events.addListener('onSubmit', this.printReceipt, this);
          }
          else {
              // initialize width of sample textbox
              var sampleTextbox = document.getElementById('receiptSample');
              var fontSize = GeckoJS.Configure.read('vivipos.fec.settings.receipt_epc_zh_default.screen.fontsize');
              var margin = GeckoJS.Configure.read('vivipos.fec.settings.receipt_epc_zh_default.screen.margin');
              var pagewidth = GeckoJS.Configure.read('vivipos.fec.settings.receipt_epc_zh_default.pagewidth');

              var pagewidthNode = document.getElementById('pagewidth');
              if (pagewidthNode) pagewidthNode.value = pagewidth;
              if (!isNaN(fontSize) && !isNaN(pagewidth)) {
                  var sampleTextboxWidth = (fontSize * pagewidth - (- margin)) + 'px';
                  sampleTextbox.style.width = sampleTextboxWidth;
                  sampleTextbox.style.maxWidth = sampleTextboxWidth;
                  sampleTextbox.style.minWidth = sampleTextboxWidth;
              }
          }
      },

      save: function () {
          var outputObj = GeckoJS.FormHelper.serializeToObject('receiptForm', false);
          var portlist = this.portlist = document.getElementById('comportscrollablepanel');
          var selectedIndex = portlist.selectedIndex;
          if (selectedIndex != -1)
              outputObj.portid = this.portdata[selectedIndex].id;

          //outputObj.receiptTemplate = GREUtils.Charset.convertFromUnicode(outputObj.receiptTemplate, 'UTF-8');
          outputObj.receiptTemplateEncoded = encodeURI(outputObj.receiptTemplate);

          GeckoJS.Configure.write('vivipos.fec.settings.receipt_epc_zh', outputObj);
          GeckoJS.Observer.notify(null, 'receipt-status-update', outputObj.autoprint);
          return true;
      },

      plus: function (id) {
          var el = document.getElementById(id);
          if (el) {
              var max = el.getAttribute('max');
              var val = el.value;
              if (++val && max && !isNaN(max) && (val > max)) val = max;
              el.value = val;
          }
      },

      minus: function (id) {
          var el = document.getElementById(id);
          if (el) {
              var min = el.getAttribute('min');
              var val = el.value;
              if (--val && min && !isNaN(min) && (val < min)) val = min;
              el.value = val;
          }
      },

      portChanged: function () {
          var outputObj = GeckoJS.FormHelper.serializeToObject('receiptForm', false);
          var portlist = this.portlist = document.getElementById('comportscrollablepanel');
          var selectedIndex = portlist.selectedIndex;

          if (selectedIndex != this._selectedIndex) {
              this._selectedIndex = selectedIndex;

              if (this._printerObj != null) {
                  this._printerObj.closePort(this._tty);
                  this._printerObj = this._tty = null;
              }

              if (this.portdata && (selectedIndex >= 0) && (this.portdata.length > selectedIndex)) {
                  this.portid = this.portdata[selectedIndex].id;
              }
              else {
                  this.portid = null;
              }
          }
      },
      
      getPrinter: function(preview) {

          if(this._printerObj == null) {

              var portdata = this.portdata;
              var portid = this.portid;
              var tty = null;
              var speed = '38400';
              var parity = 'n';
              var databits = '8';
              var stopbits = '1';

              if (preview) {
                  // get settings from screen
                  var options = GeckoJS.FormHelper.serializeToObject('receiptForm', false);
              }
              else {
                  var options = GeckoJS.Configure.read('vivipos.fec.settings.receipt_epc_zh');
              }
              //GREUtils.log('[getPrinter]: loading port settings <' + GeckoJS.BaseObject.dump(options) + '>');
              
              speed = ('baudrate' in options) ? options.baudrate : speed;
              parity = ('parity' in options) ? options.parity : parity;
              databits = ('databits' in options) ? options.databits : databits;
              stopbits = ('stopbits' in options) ? options.stopbits : stopbits;

              var attrs = speed + ',' + parity + ',' + databits + ',' + stopbits + ',h';
              //GREUtils.log('[getPrinter]: looking for device on port <' + this.portid + '> <' + GeckoJS.BaseObject.dump(portdata) + '>');
              if (portid && portdata) {
                  for (var i = 0; i < portdata.length; i++) {
                      if (portdata[i].id == portid) {
                          tty = portdata[i].path;
                          break;
                      }
                  }
              }

              if (tty) {
                  //GREUtils.log('[getPrinter]: opening device at path <' + tty + '> with parameters <' + attrs + '>');
                  this._tty = tty;
                  try {
                      this._printerObj = GREUtils.XPCOM.getService("@firich.com.tw/serial_port_control_unix;1", "nsISerialPortControlUnix");
                      this._printerObj.openPort(tty, attrs);
                  }
                  catch (e) {
                      //GREUtils.log('[getPrinter]: failed to get device');
                      this._printerObj = null;
                      this._tty = null;
                  }
              }
              else {
                  //GREUtils.log('[getPrinter]: device not found');
              }
          }
          return this._printerObj;
      },

      doPrint: function (preview) {
          var printer = this.getPrinter();
          var printed = false;

          if (printer) {
              var text = this.getReceipt(preview, true);

              if (text && text.length > 0) {
                  text = GREUtils.Charset.convertFromUnicode(text, 'big5');
                  printer.writePort(this._tty, text, text.length);

                  // request printer status
                  alert('requesting printer status');
                  var status = '\u0010\u0004\u0001';   // DLE EOT 1
                  printer.writePort(this._tty, status, status.length);

                  // read printer status
                  alert('reading printer status');
                  var buffer;
                  var len = 8;
                  try {
                      printer.readPort(this._tty, buffer, len);
                      alert('printer status <' + buffer + '>');
                  }
                  catch (e) {
                      alert('failed to read printer status');
                  }

                  printed = true;
              }
              //GREUtils.log('[PRINT]: printed');
          }
          return printed;
      },

      printPreview: function () {
          //GREUtils.log('[PRINT]: preview printing');
          this.doPrint(true);
      },

      printReceipt: function (evt) {
          //GREUtils.log('[PRINT]: printing receipt <' + typeof evt + '>');

          // check if auto-printing?
          if (typeof evt == 'object') {
              var autoprint = GeckoJS.Configure.read('vivipos.fec.settings.receipt_epc_zh.autoprint') || false;
              if (!autoprint) return;
          }

          var txn = {};
          var txnObj = GeckoJS.Session.get('current_transaction');
          if (txnObj) txn = txnObj.data;

          // check if txn exists
          if (!txn) return;

          // check if txn has been finalized
          if (!('status' in txn) || (txn.status != 1)) return;

          // check if a receipt has been issued for the transaction
          if (('receipt' in txn) && (txn.receipt == 1)) {
              alert('Receipt already issued');
              return;
          }

          if (this.doPrint(false)) {
              txn.receipt = 1;
          }

      },

      printReceiptCopy: function () {
          //GREUtils.log('[BILLCOPY]: printing receipt');

          var txn = {};
          var txnObj = GeckoJS.Session.get('current_transaction');
          if (txnObj) txn = txnObj.data;

          // check if txn exists
          if (!txn) return;

          // check if txn has been finalized
          if (!('status' in txn) || (txn.status != 1)) return;

          this.doPrint(false);
      },

      getReceipt: function (preview, applyCodes) {
          var txn = {};
          var txnObj = GeckoJS.Session.get('current_transaction');
          if (txnObj) txn = txnObj.data;

          GREUtils.log(GeckoJS.BaseObject.dump(txn));

          txn.user = 'irving';
          txn.name = 'Irving Hsu';
          txn.check_no = '00350';
          txn.table_no = '0011';
          txn.no_of_customers = 4;
          txn.destination = 'dine-in';
          txn.terminal_id = GeckoJS.Configure.read('vivipos.fec.settings.TerminalID');

          this.txn = txn;

          if (preview) {
              var options = GeckoJS.FormHelper.serializeToObject('receiptForm', false);
          }
          else {
              var options = GeckoJS.Configure.read('vivipos.fec.settings.receipt_epc_zh');
              try {
                  options.receiptTemplate = decodeURI(options.receiptTemplate);
              }
              catch (e) {
                  // we assume the template has already been parsed
              }
          }
          options.pagewidth = GeckoJS.Configure.read('vivipos.fec.settings.receipt_epc_zh_default.pagewidth');

          var template = options.receiptTemplate;
          var output = this.templatePass1(template, preview, applyCodes, options.leftmargin);

          var headerLines = (output && output.length > 0) ? this.formatLines(output[0], options) : [];
          var bodyLines = (output && output.length > 1) ? this.formatLines(output[1], options) : [];
          var footerLines = (output && output.length > 2) ? this.formatLines(output[2], options) : [];

          var pages = this.paginate(headerLines, bodyLines, footerLines, options);
          var text = pages.join('');

          if (applyCodes && options.cutpaper) {
              text += '\u001D\u0056\u0001';
          }
          return text;
      },

      paginate: function (header, body, footer, options) {
          var pageSize = parseInt(options.pagesize) || 0;
          var totalPages;
          var pages = [];

          var headerLines = header.length;
          var footerLines = footer.length;
          var bodyLines = body.length;

          GREUtils.log('[PAGE]: pagesize <' + pageSize + '> header <'+ headerLines + '> footer <' + footerLines + '> body <' + bodyLines + '>');
          if (pageSize == 0) pageSize = headerLines + footerLines + bodyLines;

          var headerText = (header.length > 0) ? header.join('\r\n') : '';
          var footerText = (footer.length > 0) ? footer.join('\r\n') : '';

          // leave at least one body line per page
          var bodySize = Math.max(1, pageSize - headerLines - footerLines);
          var totalPages = Math.max(1, Math.ceil(bodyLines/bodySize));

          var page = 0;
          var offset = 0;

          GREUtils.log('[PAGE]: bodySize <' + bodySize + '> totalPage <' + totalPages + '>');
          while (offset == 0 || offset < bodyLines) {
              var pageBody = this.getLines(body, offset, bodySize);
              offset += bodySize;

              var bodyText = (pageBody.length > 0) ? pageBody.join('\r\n') : '';
              
              page++;

              var text = headerText;
              if (bodyText.length > 0) {
                  if (text.length > 0) text += '\r\n';
                  text += bodyText;
              }
              if (footerText.length > 0) {
                  if (text.length > 0) text += '\r\n';
                  text += footerText;
              }
              if (options.linefeed > 0) {
                  for (var i = 0; i < options.linefeed; i++) text += '\r\n';
              }
              else {
                  text += '\r\n';
              }
              pages.push(this.templatePass2(text, page, totalPages));
          }
          //GREUtils.log('[PAGE]: total pages <' + pages.length + '>');
          return pages;
      },

      getLines: function (input, offset, size) {
          var count = 0;
          var output = [];

          for (var i = 0; i < input.length; i++) {
              if (i >= offset) {
                  output.push(input[i]);
                  if (++count == size) return output;
              }
          }
          return output;
      },

      preview: function () {
          var text = this.getReceipt(true, false);
          document.getElementById('receiptSample').value = text;
      },

      formatLines: function (inputLines, options) {
          //GREUtils.log('[FORMAT]: ' + GeckoJS.BaseObject.dump(options));
          var newLines = [];
          var line;

          var lineWidth = parseInt(options.pagewidth) || 42;
          var rightmargin = parseInt(options.rightmargin) || 0;
          var usableWidth = lineWidth - rightmargin;
          //GREUtils.log('[FORMAT]: ' + lineWidth);
          for (var i = 0; i < inputLines.length; i++) {
              line = this.cropLine(this.trimLine(inputLines[i]), usableWidth);
              newLines.push(line);
          }
          return newLines;
      },

      cropLine: function (line, width) {
          //GREUtils.log('[CROP] cropping line to width <' + width + '>');
          var len = 0;
          var charCode;
          var doubleWide = false;
          for (var i = 0; i < line.length; i++) {
              charCode = parseInt(line.charCodeAt(i));

              // if charCode = '0x001B', check if the control code is for single or double wide, then
              // skip the next two chars
              //GREUtils.log('CHAR: <' + charCode + '>');
              if ((charCode == 0x1B) || (charCode == 0x1C)) {
                  if (i < line.length - 2) {
                      var code = parseInt(line.charCodeAt(i + 1));
                      var parm = parseInt(line.charCodeAt(i + 2));
                      //GREUtils.log('CONTROL CODES: <' + code + '> <' + parm + '>');
                      switch (code) {
                          case 0x21:
                          case 0x21:
                              if ((charCode == 0x1B && parm == 0x30) ||
                                  (charCode == 0x1B && parm == 0x20) ||
                                  (charCode == 0x1C && parm == 0x0C) ||
                                  (charCode == 0x1C && parm == 0x04)) {
                                  doubleWide = true;
                                  //GREUtils.log('DOUBLE WIDE is set');
                              }
                              if ((charCode == 0x1B && parm == 0x10) ||
                                  (charCode == 0x1B && parm == 0x00) ||
                                  (charCode == 0x1C && parm == 0x08) ||
                                  (charCode == 0x1C && parm == 0x00)) {
                                  doubleWide = false;
                                  //GREUtils.log('SINGLE WIDE is set');
                              }
                      }
                      i = i - (-2);
                  }
                  else
                      i = line.length - 1;
              }
              else {
                  // add character to line only if within length limit
                  if (charCode > 127) {
                      len += (doubleWide) ? 4 : 2;
                  }
                  else {
                      len += (doubleWide) ? 2 : 1;
                  }
                  if (len > width) break;
              }
          }
          //GREUtils.log('[CROP] Line length: <' + len + '> index <' + i + '>');
          return line.substring(0, i);
      },

      trimLine: function (line) {
          //GREUtils.log('[FORMAT] trimming line [' + line.length + '] <' + line + '> on the right');
          var len = line.length;

          while (len > 0 && line.charAt(len - 1) == ' ') len--;
          
          line = line.substring(0, len);
          //GREUtils.log('[FORMAT] line trimmed [' + line.length + '] <' + line + '>');
          return line;
      },

      templatePass1: function (template, preview, applyCodes, leftmargin) {

          // first, we break template into individual lines and replace <b>,</b> tags with
          // control codes.
          var lines = [];
          var re = new RegExp('^([^\n\r]*)[\n]?', 'my');

          var len = template.length;
          var line = re.exec(template);
          var padding = '';

          if (leftmargin > 0) {
              var left = leftmargin;
              while (left-- > 0) padding += ' ';
          }
          while (line && line.length > 1) {
              var pline = line[1];
              var doubleWide = null;
              var singleWide = null;

              doubleWide = '\u001B\u0021\u0020\u001C\u0021\u0004';
              singleWide = '\u001B\u0021\u0000\u001C\u0021\u0000';

              if (!applyCodes) {
                  doubleWide = singleWide = '';
              }

              // replace <b> and </b> tags with appropriate double-wide on and double-wide off control codes
              var pline = singleWide + padding + pline.replace('<b>', doubleWide, 'g').replace('</b>', singleWide, 'g');

              lines.push(pline);

              if (line[1].length == 0 && line.index == len) break;
              line = re.exec(template);
          }

          var processedLines = [];
          var reTag = /<%([a-zA-Z0-9_#]*[^>]*)>/g;
          var self = this;
          
          lines.forEach(function(line) {
              try {
                  var newline = line.replace(reTag, function(str, p) {return self.substituteTag1(self.txn, str, p);});
                  processedLines.push(newline);
              }
              catch (e) {}
          });


          // finally, we break lines into header, body, and footer sections
          // body is delimited by <body> </body> tag pairs, which should
          // appear in a line by themselves.
          var header = [];
          var footer = [];
          var body = [];

          // start with header
          var bodyFound = false;
          for (var i = 0; i < processedLines.length; i++) {
              line = processedLines[i];
              if (line.match(/<body\s*>/)) {
                  bodyFound = true;
                  i++;
                  break;
              }
              else
                  header.push(line);
          }

          // look for end of body tag </body>
          if (bodyFound) {
              for (; i < processedLines.length; i++) {
                  line = processedLines[i];
                  if (line && line.length > 0 && line.match(/<\/body\s*>/)) {
                      i++;
                      break;
                  }
                  else
                      body.push(line);
              }
          }
          var bodyTemplates = this.getBodyTemplates(body);
          //GREUtils.log(GeckoJS.BaseObject.dump(bodyTemplates));
          var processedBody = this.processBody(bodyTemplates, preview);

          // lastly, collect all remaining lines in footer
          for (; i < processedLines.length; i++) {
              footer.push(processedLines[i]);
          }

          return [header, processedBody, footer];
      },

      templatePass2: function (text, page, totalPages) {

          var reTag = /<%([a-zA-Z0-9_#]*[^>]*)>/g;
          var self = this;
          var newText = text;

          try {
              newText = text.replace(reTag, function(str, p) {return self.substituteTag2(str, p, page, totalPages);});
          }
          catch (e) {}

          return newText;
      },

      processBody: function (templates, preview) {
          var txn = this.txn;
          var itemLines = [];
          var reTag = /<%([a-zA-Z0-9_#]*[^>]*)>/g;
          var self = this;

          if (!txn || !txn.display_sequences || txn.display_sequences.length == 0) return '';

          var cartContents = txn.display_sequences;
          var items = txn.items;
          var payments = txn.trans_payments;
          var trans_discounts = txn.trans_discounts;
          var trans_surcharges = txn.trans_surcharges;
          var item;

          for (var i = 0; i < cartContents.length; i++) {
              var entry = cartContents[i];

              switch (entry.type) {
                  case 'item':
                      // locate corresponding item
                      if (templates.item && templates.item.length > 0) {
                          templates.item.forEach(function(line) {
                              var expandedLine = line.replace(reTag, function(str, p) {
                                  var tagValue = self.substituteItem(items[entry.index], entry, str, p, preview);
                                  GREUtils.log('[TAG] tag <' + p + '> item: <' + tagValue + '>');
                                  return tagValue;
                              });
                              itemLines.push(expandedLine);
                          });
                      }
                      break;

                  case 'memo':
                      if (templates.memo && templates.memo.length > 0) {
                          templates.memo.forEach(function(line) {
                              var expandedLine = line.replace(reTag, function(str, p) {return self.substituteMemo(entry, str, p);});
                              itemLines.push(expandedLine);
                          })
                      }
                      break;

                  case 'condiment':
                      if (templates.condiment && templates.condiment.length > 0) {
                          templates.condiment.forEach(function(line) {
                              var expandedLine = line.replace(reTag, function(str, p) {return self.substituteCondiment(entry, str, p);});
                              itemLines.push(expandedLine);
                          })
                      }
                      break;

                  case 'payment':
                      var subtype = payments[entry.index].name;
                      switch (subtype) {

                          case 'cash':
                              if (templates.cash && templates.cash.length > 0) {
                                  templates.cash.forEach(function(line) {
                                      var expandedLine = line.replace(reTag, function(str, p) {return self.substituteCash(entry, str, p);});
                                      if (/\w/.test(expandedLine)) itemLines.push(expandedLine);
                                  })
                              }
                              break;
                      }
                      break;

                  case 'discount':
                      item = items[entry.index];
                      if (item.discount_type == '%') {
                          if (templates.discount && templates.discount.length > 0) {
                              templates.discount.forEach(function(line) {
                                  var expandedLine = line.replace(reTag, function(str, p) {return self.substituteDiscount(item, entry, str, p);});
                                  itemLines.push(expandedLine);
                              })
                          }
                      }
                      else if (item.discount_type == '$') {
                          if (templates.reduction && templates.reduction.length > 0) {
                              templates.reduction.forEach(function(line) {
                                  var expandedLine = line.replace(reTag, function(str, p) {return self.substituteDiscount(item, entry, str, p);});
                                  itemLines.push(expandedLine);
                              })
                          }
                      }
                      break;

                  case 'surcharge':
                      item = items[entry.index];
                      if (item.surcharge_type == '%') {
                          if (templates.surcharge && templates.surcharge.length > 0) {
                              templates.surcharge.forEach(function(line) {
                                  var expandedLine = line.replace(reTag, function(str, p) {return self.substituteSurcharge(item, entry, str, p);});
                                  itemLines.push(expandedLine);
                              })
                          }
                      }
                      else if (item.surcharge_type == '$') {
                          if (templates.addition && templates.addition.length > 0) {
                              templates.addition.forEach(function(line) {
                                  var expandedLine = line.replace(reTag, function(str, p) {return self.substituteSurcharge(item, entry, str, p);});
                                  itemLines.push(expandedLine);
                              })
                          }
                      }
                      break;

                  case 'subtotal':
                      if (templates.subtotal && templates.subtotal.length > 0) {
                          templates.subtotal.forEach(function(line) {
                              var expandedLine = line.replace(reTag, function(str, p) {return self.substituteSubtotal(entry, str, p);});
                              itemLines.push(expandedLine);
                          })
                      }
                      break;

                  case 'tray':
                      if (templates.tray && templates.tray.length > 0) {
                          templates.tray.forEach(function(line) {
                              var expandedLine = line.replace(reTag, function(str, p) {return self.substituteTray(entry, str, p);});
                              itemLines.push(expandedLine);
                          })
                      }
                      break;

                  case 'trans_surcharge':
                      item = trans_surcharges[entry.index];
                      //GREUtils.log('[trans_surcharge]: <' + GeckoJS.BaseObject.dump(item) + '>');
                      if (item.surcharge_type == '%') {
                          //GREUtils.log('[trans_surcharge %]: <' + GeckoJS.BaseObject.dump(templates.order_surcharge) + '>');
                          if (templates.order_surcharge && templates.order_surcharge.length > 0) {
                              templates.order_surcharge.forEach(function(line) {
                                  var expandedLine = line.replace(reTag, function(str, p) {return self.substituteSurcharge(item, entry, str, p);});
                                  itemLines.push(expandedLine);
                              })
                          }
                      }
                      else if (item.surcharge_type == '$') {
                          //GREUtils.log('[trans_surcharge $]: <' + GeckoJS.BaseObject.dump(templates.order_addition) + '>');
                          if (templates.order_addition && templates.order_addition.length > 0) {
                              templates.order_addition.forEach(function(line) {
                                  var expandedLine = line.replace(reTag, function(str, p) {return self.substituteSurcharge(item, entry, str, p);});
                                  itemLines.push(expandedLine);
                              })
                          }
                      }
                      break;

                  case 'trans_discount':
                      item = trans_discounts[entry.index];
                      //GREUtils.log('[trans_discount]: <' + GeckoJS.BaseObject.dump(item) + '>');
                      if (item.discount_type == '%') {
                          if (templates.order_discount && templates.order_discount.length > 0) {
                              templates.order_discount.forEach(function(line) {
                                  var expandedLine = line.replace(reTag, function(str, p) {return self.substituteDiscount(item, entry, str, p);});
                                  itemLines.push(expandedLine);
                              })
                          }
                      }
                      else if (item.discount_type == '$') {
                          if (templates.order_reduction && templates.order_reduction.length > 0) {
                              templates.order_reduction.forEach(function(line) {
                                  var expandedLine = line.replace(reTag, function(str, p) {return self.substituteDiscount(item, entry, str, p);});
                                  itemLines.push(expandedLine);
                              })
                          }
                      }
                      break;

              }
          }
          GREUtils.log('[BODY]: lines <' + GeckoJS.BaseObject.dump(itemLines) + '>');
          return itemLines;
      },

      // this function extracts from the template body the sub-templates
      getBodyTemplates: function (body) {
          var itemTemplate = [];
          var memoTemplate = [];
          var subtotalTemplate = [];
          var trayTemplate = [];
          var surchargeTemplate = [];
          var discountTemplate = [];
          var condimentTemplate = [];
          var reductionTemplate = [];
          var additionTemplate = [];
          var order_discountTemplate = [];
          var order_reductionTemplate = [];
          var order_surchargeTemplate = [];
          var order_additionTemplate = [];
          var cashTemplate = [];
          var line;
          var type = null;

          for (var i = 0; i < body.length; i++) {
              line = body[i];
              if (!type) {
                  if (line && line.length > 0) {
                      var match = line.match(/<([\w#_]+)\s*>/);
                      if (match && match.length > 1) {
                          switch (match[1]) {
                              case 'item':
                              case 'memo':
                              case 'subtotal':
                              case 'tray':
                              case 'surcharge':
                              case 'discount':
                              case 'addition':
                              case 'reduction':
                              case 'condiment':
                              case 'order_discount':
                              case 'order_reduction':
                              case 'order_surcharge':
                              case 'order_addition':
                              case 'cash':
                              type = match[1];
                              break;
                          }
                      }
                  }
              }
              else {
                  var re = new RegExp('</' + type + '\\s*>');
                  if (re.test(line)) {
                      type = null;
                  }
                  else {
                      switch(type) {
                          case 'item':
                              itemTemplate.push(line);
                              break;

                          case 'memo':
                              memoTemplate.push(line);
                              break;

                          case 'subtotal':
                              subtotalTemplate.push(line);
                              break;

                          case 'tray':
                              trayTemplate.push(line);
                              break;

                          case 'surcharge':
                              surchargeTemplate.push(line);
                              break;

                          case 'discount':
                              discountTemplate.push(line);
                              break;

                          case 'addition':
                              additionTemplate.push(line);
                              break;

                          case 'reduction':
                              reductionTemplate.push(line);
                              break;
                              
                          case 'condiment':
                              condimentTemplate.push(line);
                              break;
                          case 'order_discount':
                              order_discountTemplate.push(line);
                              break;

                          case 'order_reduction':
                              order_reductionTemplate.push(line);
                              break;

                          case 'order_surcharge':
                              order_surchargeTemplate.push(line);
                              break;

                          case 'order_addition':
                              order_additionTemplate.push(line);
                              break;

                          case 'cash':
                              cashTemplate.push(line);
                              break;
                      }
                  }
              }
          }
          
          return {item: itemTemplate,
                  memo: memoTemplate,
                  condiment: condimentTemplate,
                  subtotal: subtotalTemplate,
                  tray: trayTemplate,
                  surcharge: surchargeTemplate,
                  discount: discountTemplate,
                  reduction: reductionTemplate,
                  addition: additionTemplate,
                  order_surcharge: order_surchargeTemplate,
                  order_discount: order_discountTemplate,
                  order_reduction: order_reductionTemplate,
                  order_addition: order_additionTemplate,
                  cash: cashTemplate
                 };
      },
      
      substituteTag1: function (txn, str, rawTag) {
          // extract tag & modifiers (length/justify/format) from tag

          var reMod = /([A-Za-z0-9_#]+):?(-?[0-9]*)([\w]?)\s*([^>]*)/;
          var modifiers = reMod.exec(rawTag);
          var limit = '';
          var justify = 'l';
          var format = '';
          var tag = '';

          if (modifiers && modifiers.length > 1) tag = modifiers[1];
          if (modifiers && modifiers.length > 2) limit = parseInt(modifiers[2]);
          if (modifiers && modifiers.length > 3)  justify = modifiers[3];
          if (modifiers && modifiers.length > 4)  format = modifiers[4];

          if (tag == '') return str;

          var value = '';
          var notTag = false;
          switch(tag) {

              case 'ttl':
                  value = txn.total;
                  break;
                 
              case 'chg':
                  value = txn.change;
                  break;
              
              case '#entry':
                  value = txn.items_count;
                  break;

              case 'date':
              case 'odate':
                  if (tag == 'date') var now = new Date();
                  else var now = txn.created;

                  if (format) {
                      value = now.toLocaleFormat(format);
                  }
                  else {
                      value = now.toLocaleDateString();
                  }
                  break;

              case 'time':
              case 'otime':
                  if (tag == 'time') var now = new Date();
                  else var now = txn.created;

                  value = now.toLocaleTimeString();
                  break;

              case 'justify':
                  value = format;
                  break;

              case 'user':
                  value = txn.user;
                  break;

              case 'name':
                  value = txn.name;
                  break;

              case 'chk#':
                  value = txn.check_no;
                  break;

              case 'tbl#':
                  value = txn.table_no;
                  break;

              case 'seq#':
                  value = txn.seq;
                  break;

              case 'dest':
                  value = txn.destination;
                  break;

              case '#cust':
                  value = txn.no_of_customers;
                  break;

              case 'tid':
                  value = txn.terminal_id;
                  break;

              case 'tax':
                  if (/\w+/.test(format)) {
                  }
                  else {
                      value = txn.tax_subtotal;
                  }
                  break;

              case 'payments':
                  value = txn.payment_subtotal;
                  break;

              case 'discounts':
                  value = txn.discount_subtotal;
                  break;

              case 'surcharges':
                  value = txn.surcharge_subtotal;
                  break;

              case 'billcopy':
                  if (('receipt' in txn) && txn.receipt > 0) {
                      value = format;
                      if (value.length == 0) value = 'BILL COPY';
                  }
                  else
                      throw new Exception();
                  break;
                  
              default:
                  notTag = true;

          }

          // if not a valid tag, return original string
          if (notTag) return str;

          // perform truncation & justification, if necessary
          if (!value) value = '';
          else value = value.toString();
          
          if (!isNaN(limit)) value = this.justifyTag(value, limit, justify);
          return value;
      },

      substituteTag2: function (str, rawTag, page, totalPages) {
          // extract tag & modifiers (length/justify/format) from tag

          var reMod = /([A-Za-z0-9_#]+):?(-?[0-9]*)([\w]?)\s*([^>]*)/;
          var modifiers = reMod.exec(rawTag);
          var limit = '';
          var justify = 'l';
          var format = '';
          var tag = '';

          if (modifiers && modifiers.length > 1) tag = modifiers[1];
          if (modifiers && modifiers.length > 2) limit = parseInt(modifiers[2]);
          if (modifiers && modifiers.length > 3)  justify = modifiers[3];

          if (tag == '') return str;

          var value = '';
          var notTag = false;
          switch(tag) {

              case 'p':
                  value = page;
                  break;

              case 'pp':
                  value = totalPages;
                  break;

              default:
                  notTag = true;

          }

          // if not a valid tag, return original string
          if (notTag) return str;

          // perform truncation & justification, if necessary
          if (!value) value = '';
          else value = value.toString();

          if (!isNaN(limit)) value = this.justifyTag(value, limit, justify);
          return value;
      },

      substituteMemo: function (entry, str, rawTag) {
          var reMod = /([+\-A-Za-z0-9_#]+):?(-?[0-9]*)([\w]?)\s*([^>]*)/;
          var modifiers = reMod.exec(rawTag);
          var limit = '';
          var justify = 'l';
          var tag = '';

          if (modifiers && modifiers.length > 1) tag = modifiers[1];
          if (modifiers && modifiers.length > 2) limit = parseInt(modifiers[2]);
          if (modifiers && modifiers.length > 3)  justify = modifiers[3];

          if (tag == '') return str;

          var value = '';
          var notTag = false;

          switch(tag) {

              case 'memo':
                  value = entry.name;
                  break;

              default:
                  notTag = true;

          }

          // if not a valid tag, return original string
          if (notTag) return str;

          // perform truncation & justification, if necessary
          if (!value) value = '';
          else value = value.toString();

          if (!isNaN(limit)) value = this.justifyTag(value, limit, justify);
          return value;
      },

      substituteCondiment: function (entry, str, rawTag) {
          var reMod = /([+\-A-Za-z0-9_#]+):?(-?[0-9]*)([\w]?)\s*([^>]*)/;
          var modifiers = reMod.exec(rawTag);
          var limit = '';
          var justify = 'l';
          var tag = '';

          if (modifiers && modifiers.length > 1) tag = modifiers[1];
          if (modifiers && modifiers.length > 2) limit = parseInt(modifiers[2]);
          if (modifiers && modifiers.length > 3)  justify = modifiers[3];

          if (tag == '') return str;

          var value = '';
          var notTag = false;

          switch(tag) {

              case 'condiment':
                  value = entry.name;
                  break;

              case 'price':
                  value = entry.current_price;
                  break;
                  
              default:
                  notTag = true;

          }

          // if not a valid tag, return original string
          if (notTag) return str;

          // perform truncation & justification, if necessary
          if (!value) value = '';
          else value = value.toString();

          if (!isNaN(limit)) value = this.justifyTag(value, limit, justify);
          return value;
      },

      substituteCash: function (entry, str, rawTag) {
          var reMod = /([+\-A-Za-z0-9_#]+):?(-?[0-9]*)([\w]?)\s*([^>]*)/;
          var modifiers = reMod.exec(rawTag);
          var limit = '';
          var justify = 'l';
          var tag = '';

          if (modifiers && modifiers.length > 1) tag = modifiers[1];
          if (modifiers && modifiers.length > 2) limit = parseInt(modifiers[2]);
          if (modifiers && modifiers.length > 3)  justify = modifiers[3];

          if (tag == '') return str;

          var value = '';
          var notTag = false;

          switch(tag) {

              case 'amount':
                  value = entry.current_subtotal;
                  break;

              default:
                  notTag = true;

          }

          // if not a valid tag, return original string
          if (notTag) return str;

          // perform truncation & justification, if necessary
          if (!value) value = '';
          else value = value.toString();

          if (!isNaN(limit)) value = this.justifyTag(value, limit, justify);
          return value;
      },

      substituteDiscount: function (item, entry, str, rawTag) {
          var reMod = /([+\-A-Za-z0-9_#]+):?(-?[0-9]*)([\w]?)\s*([^>]*)/;
          var modifiers = reMod.exec(rawTag);
          var limit = '';
          var justify = 'l';
          var tag = '';

          if (modifiers && modifiers.length > 1) tag = modifiers[1];
          if (modifiers && modifiers.length > 2) limit = parseInt(modifiers[2]);
          if (modifiers && modifiers.length > 3)  justify = modifiers[3];

          if (tag == '') return str;

          var value = '';
          var notTag = false;

          switch(tag) {

              case 'amount':
                  value = entry.current_subtotal;
                  break;

              case 'rate':
                  value = item.discount_rate * 100 + '%';
                  break;

              case 'label':
                  value = item.discount_name;
                  break;
                  
              default:
                  notTag = true;

          }

          // if not a valid tag, return original string
          if (notTag) return str;

          // perform truncation & justification, if necessary
          if (!value) value = '';
          else value = value.toString();

          if (!isNaN(limit)) value = this.justifyTag(value, limit, justify);
          return value;
      },

      substituteSurcharge: function (item, entry, str, rawTag) {
          var reMod = /([+\-A-Za-z0-9_#]+):?(-?[0-9]*)([\w]?)\s*([^>]*)/;
          var modifiers = reMod.exec(rawTag);
          var limit = '';
          var justify = 'l';
          var tag = '';

          if (modifiers && modifiers.length > 1) tag = modifiers[1];
          if (modifiers && modifiers.length > 2) limit = parseInt(modifiers[2]);
          if (modifiers && modifiers.length > 3)  justify = modifiers[3];

          if (tag == '') return str;

          var value = '';
          var notTag = false;

          switch(tag) {
              case 'amount':
                  value = entry.current_subtotal;
                  break;

              case 'rate':
                  value = item.surcharge_rate * 100 + '%';
                  break;

              case 'label':
                  value = item.surcharge_name;
                  break;

              default:
                  notTag = true;

          }

          // if not a valid tag, return original string
          if (notTag) return str;

          // perform truncation & justification, if necessary
          if (!value) value = '';
          else value = value.toString();

          if (!isNaN(limit)) value = this.justifyTag(value, limit, justify);
          return value;
      },

      substituteSubtotal: function (entry, str, rawTag) {
          var reMod = /([+\-A-Za-z0-9_#]+):?(-?[0-9]*)([\w]?)\s*([^>]*)/;
          var modifiers = reMod.exec(rawTag);
          var limit = '';
          var justify = 'l';
          var tag = '';

          if (modifiers && modifiers.length > 1) tag = modifiers[1];
          if (modifiers && modifiers.length > 2) limit = parseInt(modifiers[2]);
          if (modifiers && modifiers.length > 3)  justify = modifiers[3];

          if (tag == '') return str;

          var value = '';
          var notTag = false;

          switch(tag) {
              case 'subtotal':
                  value = entry.current_subtotal;
                  break;
                  
              default:
                  notTag = true;

          }

          // if not a valid tag, return original string
          if (notTag) return str;

          // perform truncation & justification, if necessary
          if (!value) value = '';
          else value = value.toString();

          if (!isNaN(limit)) value = this.justifyTag(value, limit, justify);
          return value;
      },

      substituteTray: function (entry, str, rawTag) {
          var reMod = /([+\-A-Za-z0-9_#]+):?(-?[0-9]*)([\w]?)\s*([^>]*)/;
          var modifiers = reMod.exec(rawTag);
          var limit = '';
          var justify = 'l';
          var tag = '';

          if (modifiers && modifiers.length > 1) tag = modifiers[1];
          if (modifiers && modifiers.length > 2) limit = parseInt(modifiers[2]);
          if (modifiers && modifiers.length > 3)  justify = modifiers[3];

          if (tag == '') return str;

          var value = '';
          var notTag = false;

          switch(tag) {
              case 'traytotal':
                  value = entry.current_subtotal;
                  break;

              default:
                  notTag = true;

          }

          // if not a valid tag, return original string
          if (notTag) return str;

          // perform truncation & justification, if necessary
          if (!value) value = '';
          else value = value.toString();

          if (!isNaN(limit)) value = this.justifyTag(value, limit, justify);
          return value;
      },

      substituteItem: function (item, entry, str, rawTag, preview) {
          // extract tag & modifiers (length/justify) from rawTag

          var reMod = /([+\-A-Za-z0-9_#]+):?(-?[0-9]*)([\w]?)\s*([^>]*)/;
          var modifiers = reMod.exec(rawTag);
          var limit = '';
          var justify = 'l';
          var tag = '';

          if (modifiers && modifiers.length > 1) tag = modifiers[1];
          if (modifiers && modifiers.length > 2) limit = parseInt(modifiers[2]);
          if (modifiers && modifiers.length > 3)  justify = modifiers[3];

          if (tag == '') return str;

          var value = '';
          var notTag = false;

          switch(tag) {

              case 'qty':
                  value = entry.current_qty;
                  break;

              case 'plu':
                  value = entry.no;
                  break;

              case 'product':
                  value = entry.name;
                  break;

              case 'unitprice':
                  value = entry.current_price;
                  break;

              case 'price':
                  value = entry.current_subtotal;
                  break;

              case 'taxstatus':
                  value = entry.current_tax;
                  break;

              case 'tax':
                  value = entry.current_tax_subtotal;
                  break;

              case 'flag':
                  if (item.hasDiscount)
                      value = (preview) ? document.getElementById('discountflag').value : GeckoJS.Configure.read('vivipos.fec.settings.receipt_epc_zh.discountflag');
                  else if (item.hasSurcharge)
                      value = (preview) ? document.getElementById('surchargeflag').value :  GeckoJS.Configure.read('vivipos.fec.settings.receipt_epc_zh.surchargeflag');
                  break;

              default:
                  notTag = true;

          }

          // if not a valid tag, return original string
          if (notTag) return str;

          // perform truncation & justification, if necessary
          if (!value) value = '';
          else value = value.toString();

          if (!isNaN(limit)) value = this.justifyTag(value, limit, justify);
          return value;
      },

      justifyTag: function (value, limit, justify) {
          //GREUtils.log('[JUSTIFY] value <' + value + '> limit <' + limit + '> justify <' + justify + '>');

          var doPadding = (limit > 0);
          if (limit < 0) limit = 0 - limit;

          if (justify == 'r') {
              // right justify
              if (value.length < limit) {
                  // pad on the left
                  if (doPadding) while (value.length < limit) value = ' ' + value;
              }
              else if (value.length > limit) {
                  // truncate on left
                  value = value.substring(value.length - limit, value.length);
              }
          }
          else if (justify == 'c') {
              // center justify
              if (value.length < limit) {
                  // pad on both end
                  if (doPadding) while (value.length < limit) value = ' ' + value + ' ';
              }
              var diff = value.length - limit;
              if (diff > 0) {
                  var rightOffset = Math.ceil(diff/2);
                  var leftOffset = diff - rightOffset;
                  value = value.substring(leftOffset, value.length - rightOffset);
              }
          }
          else {
              // left justify
              if (value.length < limit) {
                  // pad on the right
                  if (doPadding) while (value.length < limit) value += ' ';
              }
              else if (value.length > limit) {
                  // truncate on right
                  value = value.substring(0, limit);
              }
          }
          return value;
      }
  });

 // window.addEventListener("load", function (){$do('load', null, 'Receipt_EPC_ZH');}, false);

})()
