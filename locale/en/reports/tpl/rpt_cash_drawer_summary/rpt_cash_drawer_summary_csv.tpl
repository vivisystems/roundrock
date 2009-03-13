"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Printed Time:","${foot.gen_time}"
"Start:","${head.start_time}"
"End:","${head.end_time}"


 "Clerk","Event","Number of Events"
{for item in body}
"${item.clerk_displayname}","${item.event_type}","${item.num_events}"
{/for}
"Summary:","","${foot.foot_data.total_num_events}"
