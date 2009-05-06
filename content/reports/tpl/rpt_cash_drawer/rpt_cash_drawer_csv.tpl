"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

"${_( '(rpt)Terminal Number' )}","${_( '(rpt)Drawer Number' )}","${_( '(rpt)Clerk' )}","${_( '(rpt)Time' )}","${_( '(rpt)Event' )}","${_( '(rpt)Order Sequence' )}"
{for item in body}
"${item.terminal_no}","${item.drawer_no}","${item.clerk_displayname}","${item.created|unixTimeToString}","${_( '(rpt)' + item.event_type )}",${item.sequence}
{/for}
"${_( '(rpt)Records Found' ) + ':'}","${body.length}"


