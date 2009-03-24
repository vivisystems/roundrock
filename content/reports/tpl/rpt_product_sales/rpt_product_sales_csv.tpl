"${head.store.name}"
"${head.store.branch}"
"${_( 'Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( 'Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( 'Clerk' ) + ':'}","'${head.clerk_displayname}"
"${( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${( 'Start' ) + ':'}","${head.start_time}"
"${( 'End' ) + ':'}","${head.end_time}"

"${_( 'No.' )}","${_( 'Name' )}","${_( 'Avg. Price' )}","${_( 'Qty' )}","${_( 'Total' )}"
{for item in body}
"${item.product_no}","${item.product_name}","${item.avg_price}","${item.qty}","${item.total}"
{/for}
"","","${_( 'Summary' ) + ':'}","${foot.qty}","${foot.summary}"
