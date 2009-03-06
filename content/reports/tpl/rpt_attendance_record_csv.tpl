"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Printed Time:","${foot.gen_time}"
"Start:","${head.start_time}"
"End:","${head.end_time}"

{for master in body}
"${master.username}","Job","Clock In","Clock Out","Span Time"
{for stamp in master.clockStamps}
"","${stamp.job}","${stamp.InTime}","${stamp.OutTime}","${stamp.SpanTime}"
{/for}
"","","","Summary:","${master.total_spantime}"
"",""
{/for}
