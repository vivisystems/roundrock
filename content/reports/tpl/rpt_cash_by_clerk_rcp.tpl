[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for master in body}
==========================================
Terminal ID:${master.terminal_no|right:30}
Start Time: ${master.starttime|right:30}
End Time  : ${master.endtime|right:30}
------------------------------------------
{for detail in master.ShiftChangeDetail}
Topic:      ${detail.topic}
Total:      ${detail.amount|default:0|viviFormatPrices:true}
{/for}
------------------------------------------
Clerk:      ${master.clerk}
Total:      ${master.amount|default:0|viviFormatPrices:true}
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
