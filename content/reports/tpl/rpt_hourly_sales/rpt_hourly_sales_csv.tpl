"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

{if head.terminal_no}"${_( '(rpt)Terminal' )}",{/if}"${_( '(rpt)Date' )}","${_( '(rpt)Hour' )}","${_( '(rpt)Net Sales' )}","${_( '(rpt)Number of Orders' )}","${_( '(rpt)Number of Guests' )}","${_( '(rpt)Number of Items' )}","${_( '(rpt)Net Sales/Guest' )}","${_( '(rpt)Net Sales/Order' )}"
{for detail in body}
{if head.terminal_no}"'${detail.terminal_no}",{/if}"'${detail.Date}","'${detail.Hour}","${detail.HourTotal}","${detail.OrderNum}","${detail.Guests}","${detail.ItemsCount}","${detail.NetPerGuest}","${detail.NetPerOrder}"
{/for}
"${_( '(rpt)Records Found' ) + ': ' + body.length}",{if head.terminal_no}"",{/if}"${_( '(rpt)Summary' ) + ':'}","${foot.HourTotal}","${foot.OrderNum}","${foot.Guests}","${foot.ItemsCount}","${foot.NetPerGuest}","${foot.NetPerOrder}"
