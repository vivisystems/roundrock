[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for master in body}
==========================================
${_( '(rpt)Sale Period' )|center:11} ${_( '(rpt)Start Time' )|center:14}  ${_( '(rpt)End Time' )|center:14}
----------- --------------  --------------
${master.sale_period|unixTimeToString:'yyyy-MM-dd'|left:11} ${master.starttime|center:14}  ${master.endtime|center:14}
------------------------------------------
${_( '(rpt)Terminal' ) + ':'|left:12}${master.terminal_no|right:30}
${_( '(rpt)Shift' ) + ':'|left:12}${master.shift_number|right:30}
${_( '(rpt)Balance' ) + ':'|left:12}${master.balance|default:0|viviFormatPrices:true|right:30}
${_( '(rpt)Cash' ) + ':'|left:12}${master.cash|default:0|viviFormatPrices:true|right:30}
${_( '(rpt)Net Sales' ) + ':'|left:12}${master.sales|default:0|viviFormatPrices:true|right:30}
${_( '(rpt)Giftcard Excess' ) + ':'|left:12}${master.excess|default:0|viviFormatPrices:true|right:30}
${_( '(rpt)Deposit' ) + ':'|left:12}${master.deposit|default:0|viviFormatPrices:true|right:30}
${_( '(rpt)Refund' ) + ':'|left:12}${master.refund|default:0|viviFormatPrices:true|right:30}
${_( '(rpt)Credit' ) + ':'|left:12}${master.credit|default:0|viviFormatPrices:true|right:30}
${_( '(rpt)Ledger In' ) + ':'|left:12}${master.ledger_in|default:0|viviFormatPrices:true|right:30}
${_( '(rpt)Ledger Out' ) + ':'|left:12}${master.ledger_out|default:0|viviFormatPrices:true|right:30}
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
{if detail.name.length > 0}${detail.name|left:19}{else}${_('(rpt)' + detail.type)|left:19}{/if}
 ${detail.amount|default:0|viviFormatPrices:true|right:13} ${detail.count|format:0|right:8}
{/if}
{/for}
{if destDetails.length > 0}
------------------------------------------
${_( '(rpt)Destination' )|left:19} ${_( '(rpt)Destination Amount' )|center:13} ${_( '(rpt)Destination Count' )|right:8}
------------------- ------------- --------
{for dest in destDetails}
${dest.name|left:19} ${dest.amount|default:0|viviFormatPrices:true|right:13} ${dest.count|format:0|right:8}
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
