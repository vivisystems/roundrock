[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for master in body}
========================
${_( '(rpt)Terminal ID' ) + ':'|left:12}${master.terminal_no}
${_( '(rpt)Start Time' ) + ':'|left:12}${master.starttime|left:10}
${_( '(rpt)End Time' ) + ':'|left:12}${master.endtime|left:10}
${_( '(rpt)Sale Period' ) + ':'|left:12}${master.sale_period}
${_( '(rpt)Shift No.' ) + ':'|left:12}${master.shift_number}
${_( '(rpt)Balance' ) + ':'|left:12}${master.balance|default:0|viviFormatPrices:true}
${_( '(rpt)Cash' ) + ':'|left:12}${master.cash|default:0|viviFormatPrices:true}
${_( '(rpt)Sales' ) + ':'|left:12}${master.sales|default:0|viviFormatPrices:true}
${_( '(rpt)Excess' ) + ':'|left:12}${master.excess|default:0|viviFormatPrices:true}
${_( '(rpt)Deposit' ) + ':'|left:12}${master.deposit|default:0|viviFormatPrices:true}
${_( '(rpt)Ledger In' ) + ':'|left:12}${master.ledger_in|default:0|viviFormatPrices:true}
${_( '(rpt)Ledger Out' ) + ':'|left:12}${master.ledger_out|default:0|viviFormatPrices:true}
------------------------
{eval}
  destDetails = [];
{/eval}
{for detail in master.ShiftChangeDetail}
{if detail.type == 'destination'}
{eval}
  destDetails.push(detail);
{/eval}
{else}
{if detail.name.length > 0}${detail.name + ':'|left:11}{else}${detail.type + ':'|left:11}{/if}
${detail.amount|default:0|viviFormatPrices:true|right:13}
${_( '(rpt)Count' ) + ':'|left:12}${detail.count|default:0|right:12}
{/if}
{/for}
{if destDetails.length > 0}
------------------------
{for dest in destDetails}
${dest.name + ':'|left:12}${dest.amount|default:0|viviFormatPrices:true|right:13}
${_( '(rpt)Count' ) + ':'|left:12}${dest.count|default:0|right:12}
{/for}
{/if}
{/for}
========================
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
