"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Printed Time:","${foot.gen_time}"
"Start:","${head.start_time}"
"End:","${head.end_time}"

"No.","Name","Avg. Price","Qty","Total"
{for item in body}
"${item.product_no}","${item.product_name}","${item.avg_price}","${item.qty}","${item.total}"
{/for}
"","","Summary:","${foot.qty}","${foot.summary}"
