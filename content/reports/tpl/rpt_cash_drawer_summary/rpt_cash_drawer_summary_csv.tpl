"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start Time' ) + ':'}","${head.start_time}"
"${_( '(rpt)End Time' ) + ':'}","${head.end_time}"
"${_('(rpt)Condition') + ' - '}"
"${queryFormLabel.terminal_no_label}","${queryFormLabel.terminal_no}"
"${queryFormLabel.sortby_label}","${queryFormLabel.sortby}"

 "${_( '(rpt)Clerk' )}","${_( '(rpt)Event' )}","${_( '(rpt)Occurrences' )}"
{for item in body}
"'${item.clerk_displayname|default:''}","${_( '(drawer)' + item.event_type )}","${item.num_occurrences|default:0}"
{/for}
"${_( '(rpt)Records Found' ) + ':'}","${body.length|default:0}"
"${_( '(rpt)Summary' ) + ':'}","","${foot.foot_data.total_num_occurrences|default:0}"
