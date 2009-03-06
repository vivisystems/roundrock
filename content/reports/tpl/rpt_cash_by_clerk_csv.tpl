"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Printed Time:","${foot.gen_time}"
"Start:","${head.start_time}"
"End:","${head.end_time}"

{for master in body}
""
"${master.terminal_no}","${master.starttime}","${master.endtime}"
"","Topic","Total"
{for detail in master.ShiftChangeDetail}
"","${detail.topic}","${detail.amount|default:0|viviFormatPrices:true}"
{/for}
"","${master.clerk}","${master.amount|default:0|viviFormatPrices:true}"
{/for}
