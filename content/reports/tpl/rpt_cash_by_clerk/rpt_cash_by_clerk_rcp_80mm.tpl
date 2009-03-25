[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for master in body}
==========================================
${_( 'Sale Period' )|left:11} ${_( 'Start Time' )|right:14}  ${_( 'End Time' )|left:14}
----------- --------------  --------------
${master.sale_period|left:11} ${master.starttime|right:14}  ${master.endtime|right:14}
------------------------------------------
${_( 'Terminal ID' ) + ':'|left:12}${master.terminal_no|right:30}
${_( 'Shift No.' ) + ':'|left:12}${master.shift_number|right:30}
${_( 'Balance' ) + ':'|left:12}${master.balance|default:0|viviFormatPrices:true|right:30}
${_( 'Cash' ) + ':'|left:12}${master.cash|default:0|viviFormatPrices:true|right:30}
${_( 'Sales' ) + ':'|left:12}${master.sales|default:0|viviFormatPrices:true|right:30}
${_( 'Excess' ) + ':'|left:12}${master.excess|default:0|viviFormatPrices:true|right:30}
${_( 'Ledger In' + ':'|left:12}${master.ledger_in|default:0|viviFormatPrices:true|right:30}
${_( 'Ledger Out' ) + ':'|left:12}${master.ledger_out|default:0|viviFormatPrices:true|right:30}
------------------------------------------
${_( 'Type' )|left:19} ${_( 'Amount' )|center:13} ${_( 'Count' )|right:8}
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
{if detail.name.length > 0}${detail.name|left:19}{else}${detail.type|left:19}{/if}
 ${detail.amount|default:0|viviFormatPrices:true|right:13} ${detail.count|default:0|right:8}
{/if}
{/for}
{if destDetails.length > 0}
------------------------------------------
${_( 'Destination' )|left:19} ${_( 'Amount' )|center:13} ${_( 'Count' )|right:8}
------------------- ------------- --------
{for dest in destDetails}
${dest.name|left:19} ${dest.amount|default:0|viviFormatPrices:true|right:13} ${dest.count|default:0|right:8}
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
