"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Printed Time:","${foot.gen_time}"
"Start:","${head.start_time}"
"End:","${head.end_time}"

"Terminal No.","Drawer No.","Clerk","Time","Event"
{for item in body}
"${item.terminal_no}","${item.drawer_no}","${item.clerk_displayname}","${item.created}","${item.event_type}"
{/for}
