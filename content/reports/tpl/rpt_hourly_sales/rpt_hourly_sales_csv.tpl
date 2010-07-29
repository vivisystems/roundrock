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
"${queryFormLabel.period_type_label}","${queryFormLabel.period_type}"
"${queryFormLabel.start_hour_label}","${queryFormLabel.start_hour}"
"${queryFormLabel.end_hour_label}","${queryFormLabel.end_hour}"
"${queryFormLabel.sortby_label}","${queryFormLabel.sortby}"

{if head.terminal_no}"${_( '(rpt)Terminal' )}",{/if}"${_( '(rpt)Date' )}","${_( '(rpt)Hour' )}","${_( '(rpt)Total' )}","${_( '(rpt)Number of Orders' )}","${_( '(rpt)Number of Guests' )}","${_( '(rpt)Number of Items' )}","${_( '(rpt)Total/Guest' )}","${_( '(rpt)Total/Order' )}","${_( '(rpt)Gross Sales/Guest' )}","${_( '(rpt)Gross Sales/Order' )}"
{for detail in body}
{if head.terminal_no}"'${detail.terminal_no}",{/if}"'${detail.Date}","'${detail.Hour}","${detail.HourTotal}","${detail.OrderNum}","${detail.Guests}","${detail.ItemsCount}","${detail.NetPerGuest}","${detail.NetPerOrder}","${detail.GrossPerGuest}","${detail.GrossPerOrder}"
{/for}
"${_( '(rpt)Records Found' ) + ': ' + body.length}",{if head.terminal_no}"",{/if}"${_( '(rpt)Summary' ) + ':'}","${foot.HourTotal}","${foot.OrderNum}","${foot.Guests}","${foot.ItemsCount}","${foot.NetPerGuest}","${foot.NetPerOrder}","${foot.GrossPerGuest}","${foot.GrossPerOrder}"
