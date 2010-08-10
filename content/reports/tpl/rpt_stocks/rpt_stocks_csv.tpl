"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_('(rpt)Condition') + ' - '}"
"${queryFormLabel.department_label}","${queryFormLabel.department}"
"${queryFormLabel.sortby_label}","${queryFormLabel.sortby}"

"${_( '(rpt)Department Number' )}","${_( '(rpt)Department Name' )}","${_( '(rpt)Product Number' )}","${_( '(rpt)Product Name' )}","${_( '(rpt)Stock Level' )}","${_( '(rpt)Low Watermark' )}","${_( '(rpt)High Watermark' )}","${_( '(rpt)Recommended Purchase Quantity' )}"
{for category in body}
"'${category.no}","'${category.name}"
{for plu in category.plu}
"","","'${plu.no}","'${plu.name}","${plu.stock}","${plu.min_stock}","${plu.max_stock}","${plu.max_stock - plu.stock}"
{/for}
"${_( '(rpt)Records Found' ) + ':'}","${category.plu.length}"
{/for}
