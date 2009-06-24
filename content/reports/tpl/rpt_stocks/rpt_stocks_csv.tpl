"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"

"${_( '(rpt)Department Number' )}","${_( '(rpt)Department Name' )}","${_( '(rpt)Product Number' )}","${_( '(rpt)Product Name' )}","${_( '(rpt)Stock Level' )}","${_( '(rpt)Low Stock Threshold' )}"
{for category in body}
"'${category.no}","'${category.name}"
{for plu in category.plu}
"","","'${plu.no}","'${plu.name}","${plu.stock}","${plu.min_stock}"
{/for}
"${_( '(rpt)Records Found' ) + ':'}","${category.plu.length}"
{/for}