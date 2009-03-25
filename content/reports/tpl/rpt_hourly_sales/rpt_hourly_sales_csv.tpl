"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

"${_( '(rpt)Term_No.' )}","${_( '(rpt)Time' )}","${_( '(rpt)Total' )}","${_( '(rpt)Orders' )}","${_( '(rpt)Guests' )}","${_( '(rpt)Items' )}"
{for detail in body}
"{if head.machine_id}${detail.terminal_no}{/if}","${detail.Hour}","${detail.HourTotal}","${detail.OrderNum}","${detail.Guests}","${detail.ItemsCount}"
{/for}
"","${_( '(rpt)Summary' ) + ':'}","${foot.HourTotal}","${foot.OrderNum}","${foot.Guests}","${foot.ItemsCount}"
