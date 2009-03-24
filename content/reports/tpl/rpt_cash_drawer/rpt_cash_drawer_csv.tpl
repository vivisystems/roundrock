"${head.store.name}"
"${head.store.branch}"
"${_( 'Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( 'Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( 'Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${_( 'Start' ) + ':'}","${head.start_time}"
"${_( 'End' ) + ':'}","${head.end_time}"

"${_( 'Terminal No.' )}","${_( 'Drawer No.' )}","${_( 'Clerk' )}","${_( 'Time' )}","${_( 'Event' )}"
{for item in body}
"${item.terminal_no}","${item.drawer_no}","${item.clerk_displayname}","${item.created}","${item.event_type}"
{/for}
