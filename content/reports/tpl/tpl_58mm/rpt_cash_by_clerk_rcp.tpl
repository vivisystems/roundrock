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
Sales      :${master.Sales|default:0|viviFormatPrices:true}
Excess     :${master.Excess|default:0|viviFormatPrices:true}
Ledger     :${master.Ledger|default:0|viviFormatPrices:true}
------------------------
{for detail in master.ShiftChangeDetail}
{if detail.name.length > 0}${detail.name|left:10}{else}${detail.type|left:10}{/if}
:${detail.amount|default:0|viviFormatPrices:true|right:13}
{/for}
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
