"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

"${_( '(rpt)Terminal No.' )}","${_( '(rpt)Drawer No.' )}","${_( '(rpt)Clerk' )}","${_( '(rpt)Time' )}","${_( '(rpt)Event' )}"
{for item in body}
"${item.terminal_no}","${item.drawer_no}","${item.clerk_displayname}","${item.created}","${item.event_type}"
{/for}
