"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start Time' ) + ':'}","${head.start_time}"
"${_( '(rpt)End Time' ) + ':'}","${head.end_time}"

"${_( '(rpt)Terminal' )}","${_( '(rpt)Drawer' )}","${_( '(rpt)Clerk' )}","${_( '(rpt)Time' )}","${_( '(rpt)Event' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Payment Type' )}","${_( '(rpt)Amount' )}"
{for item in body}
"'${item.terminal_no}","${item.drawer_no}","'${item.clerk_displayname|default:''}","${item.created|unixTimeToString}","${_( '(rpt)' + item.event_type )}","'${item.sequence}","${item.payment_type}","${item.amount}"
{/for}
"${_( '(rpt)Records Found' ) + ':'}","${body.length|default:0}"


