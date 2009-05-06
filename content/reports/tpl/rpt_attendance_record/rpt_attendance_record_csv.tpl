"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

{for master in body}
"${master.username}","${_( '(rpt)Job' )}","${_( '(rpt)Clock In' )}","${_( '(rpt)Clock Out' )}","${_( '(rpt)Span Time' )}"
{for stamp in master.clockStamps}
"","${stamp.job}","${stamp.clockin_time}","${stamp.clockout_time}","${stamp.SpanTime}"
{/for}
"${_( '(rpt)Records Found' ) + ':'}","${master.clockStamps.length}","","${_( '(rpt)Summary' ) + ':'}","${master.total_spantime}"
"",""
{/for}
