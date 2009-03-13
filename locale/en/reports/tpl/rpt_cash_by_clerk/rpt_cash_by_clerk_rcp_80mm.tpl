[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for master in body}
==========================================
Sale Period   Start Time       End Time
----------- --------------  --------------
${master.sale_period|left:11} ${master.starttime|right:14}  ${master.endtime|right:14}
------------------------------------------
Terminal ID:${master.terminal_no|right:30}
Shift No.  :${master.shift_number|right:30}
Balance    :${master.balance|default:0|viviFormatPrices:true|right:30}
Cash       :${master.cash|default:0|viviFormatPrices:true|right:30}
Sales      :${master.sales|default:0|viviFormatPrices:true|right:30}
Excess     :${master.excess|default:0|viviFormatPrices:true|right:30}
Ledger In  :${master.ledger_in|default:0|viviFormatPrices:true|right:30}
Ledger Out :${master.ledger_out|default:0|viviFormatPrices:true|right:30}
------------------------------------------
Type                   Amount        Count
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
Destination            Amount        Count
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