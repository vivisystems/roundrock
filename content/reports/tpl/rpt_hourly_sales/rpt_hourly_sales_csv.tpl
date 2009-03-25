"${head.store.name}"
"${head.store.branch}"
"${_( 'Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( 'Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( 'Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${_( 'Start' ) + ':'}","${head.start_time}"
"${_( 'End' ) + ':'}","${head.end_time}"

"${_( 'Term_No.' )}","${_( 'Time' )}","${_( 'Total' )}","${_( 'Orders' )}","${_( 'Guests' )}","${_( 'Items' )}"
{for detail in body}
"{if head.machine_id}${detail.terminal_no}{/if}","${detail.Hour}","${detail.HourTotal}","${detail.OrderNum}","${detail.Guests}","${detail.ItemsCount}"
{/for}
"","${_( 'Summary' ) + ':'}","${foot.HourTotal}","${foot.OrderNum}","${foot.Guests}","${foot.ItemsCount}"
