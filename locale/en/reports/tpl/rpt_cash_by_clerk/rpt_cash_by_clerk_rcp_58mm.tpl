[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

Terminal: ${head.store.terminal_no}
Clerk: ${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for master in body}
========================
Terminal ID:${master.terminal_no}
Start Time :${master.starttime|left:10}
End Time   :${master.endtime|left:10}
Sale Period:${master.sale_period}
Shift No.  :${master.shift_number}
Balance    :${master.balance|default:0|viviFormatPrices:true}
Cash       :${master.cash|default:0|viviFormatPrices:true}
Sales      :${master.sales|default:0|viviFormatPrices:true}
Excess     :${master.excess|default:0|viviFormatPrices:true}
Ledger In  :${master.ledger_in|default:0|viviFormatPrices:true}
Ledger Out :${master.ledger_out|default:0|viviFormatPrices:true}
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
{if detail.name.length > 0}${detail.name|left:10}{else}${detail.type|left:10}{/if}
:${detail.amount|default:0|viviFormatPrices:true|right:13}
Count     :${detail.count|default:0|right:13}
{/if}
{/for}
{if destDetails.length > 0}
------------------------
{for dest in destDetails}
${dest.name|left:10}:${dest.amount|default:0|viviFormatPrices:true|right:13}
Count     :${dest.count|default:0|right:13}
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
