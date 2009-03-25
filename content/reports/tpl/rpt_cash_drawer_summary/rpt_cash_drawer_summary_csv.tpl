"${head.store.name}"
"${head.store.branch}"
"${_( 'Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( 'Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( 'Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${_( 'Start' ) + ':'}","${head.start_time}"
"${_( 'End' ) + ':'}","${head.end_time}"


 "${_( 'Clerk' )}","${_( 'Event' )}","${_( 'Number of Events' )}"
{for item in body}
"${item.clerk_displayname}","${item.event_type}","${item.num_events}"
{/for}
"${_( 'Summary' ) + ':'}","","${foot.foot_data.total_num_events}"
