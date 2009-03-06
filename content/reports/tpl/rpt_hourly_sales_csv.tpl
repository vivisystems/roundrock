"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Printed Time:","${foot.gen_time}"
"Start:","${head.start_time}"
"End:","${head.end_time}"

"Term_No.","Time","Total","Orders","Guests","Items"
{for detail in body}
"{if head.machine_id}${detail.terminal_no}{/if}","${detail.Hour}","${detail.HourTotal}","${detail.OrderNum}","${detail.Guests}","${detail.ItemsCount}"
{/for}
"","Summary:","${foot.HourTotal}","${foot.OrderNum}","${foot.Guests}","${foot.ItemsCount}"
