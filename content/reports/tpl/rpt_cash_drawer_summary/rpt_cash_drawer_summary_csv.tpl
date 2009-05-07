"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"


 "${_( '(rpt)Clerk' )}","${_( '(rpt)Event' )}","${_( '(rpt)Occurrences' )}"
{for item in body}
"${item.clerk_displayname}","${_( '(rpt)' + item.event_type )}","${item.num_occurrences}"
{/for}
"${_( '(rpt)Records Found' ) + ':'}","${body.length|default:0}"
"${_( '(rpt)Summary' ) + ':'}","","${foot.foot_data.total_num_occurrences}"
