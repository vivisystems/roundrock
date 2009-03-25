"${head.store.name}"
"${head.store.branch}"
"${_( 'Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( 'Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( 'Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${_( 'Start' ) + ':'}","${head.start_time}"
"${_( 'End' ) + ':'}","${head.end_time}"

{for master in body}
"${master.username}","${_( 'Job' )}","${_( 'Clock In' )}","${_( 'Clock Out' )}","${_( 'Span Time' )}"
{for stamp in master.clockStamps}
"","${stamp.job}","${stamp.InTime}","${stamp.OutTime}","${stamp.SpanTime}"
{/for}
"","","","${_( 'Summary' ) + ':'}","${master.total_spantime}"
"",""
{/for}
