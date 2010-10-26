[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shift_no_label}${queryFormLabel.shift_no}
${queryFormLabel.database_label}${queryFormLabel.database}

${head.title|center:42}
{for master in body}
==========================================
${_( '(rpt)Sale Period' )|center:11} ${_( '(rpt)Start Time' )|center:14}  ${_( '(rpt)End Time' )|center:14}
----------- --------------  --------------
${master.sale_period|unixTimeToString:'yyyy-MM-dd'|left:11} ${master.starttime|center:14}  ${master.endtime|center:14}
------------------------------------------
${_( '(rpt)Terminal' ) + ':'|left:30}${master.terminal_no|right:12}
${_( '(rpt)Shift' ) + ':'|left:30}${master.shift_number|right:12}
${_( '(rpt)Balance' ) + ':'|left:30}${master.balance|default:0|viviFormatPrices|right:12}
${_( '(rpt)Cash' ) + ':'|left:30}${master.cash|default:0|viviFormatPrices|right:12}
${_( '(rpt)Declared Cash' ) + ':'|left:30}${master.reported_cash|default:0|viviFormatPrices|right:12}
${_( '(rpt)Total' ) + ':'|left:30}${master.sales|default:0|viviFormatPrices|right:12}
${_( '(rpt)Giftcard Excess' ) + ':'|left:30}${master.excess|default:0|viviFormatPrices|right:12}
${_( '(rpt)Deposit' ) + ':'|left:30}${master.deposit|default:0|viviFormatPrices|right:12}
${_( '(rpt)Refund' ) + ':'|left:30}${master.refund|default:0|viviFormatPrices|right:12}
${_( '(rpt)Credit' ) + ':'|left:30}${master.credit|default:0|viviFormatPrices|right:12}
${_( '(rpt)Ledger In' ) + ':'|left:30}${master.ledger_in|default:0|viviFormatPrices|right:12}
${_( '(rpt)Ledger Out' ) + ':'|left:30}${master.ledger_out|default:0|viviFormatPrices|right:12}
------------------------------------------
${_( '(rpt)Payment Type' )|left:19} ${_( '(rpt)Payment Amount' )|center:13} ${_( '(rpt)Payment Count' )|right:8}
------------------- ------------- --------
{eval}
  destDetails = [];
{/eval}
{for detail in master.ShiftChangeDetail}
{if detail.type == 'destination'}
{eval}
  destDetails.push(detail);
{/eval}
{else}
{if detail.count < 0}
{if detail.name.length > 0}${'* ' + detail.name|left:19}{else}${'* ' + _('(rpt)' + detail.type)|left:19}{/if}
 ${detail.amount|default:0|viviFormatPrices|right:13} ${'X' + (0 - detail.count)|right:8}
{else}
{if detail.name.length > 0}${detail.name|left:19}{else}${_('(rpt)' + detail.type)|left:19}{/if}
 ${detail.amount|default:0|viviFormatPrices|right:13} ${detail.count|format:0|right:8}
{if detail.type == 'cash' && detail.excess_amount > 0}
${'(' + detail.excess_amount + ')'|right:34}
{/if}
{/if}
{/if}
{/for}
{if destDetails.length > 0}
------------------------------------------
${_( '(rpt)Destination' )|left:19} ${_( '(rpt)Destination Amount' )|center:13} ${_( '(rpt)Destination Count' )|right:8}
------------------- ------------- --------
{for dest in destDetails}
${dest.name|left:19} ${dest.amount|default:0|viviFormatPrices|right:13} ${dest.count|format:0|right:8}
{/for}
{/if}
{/for}
==========================================
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
