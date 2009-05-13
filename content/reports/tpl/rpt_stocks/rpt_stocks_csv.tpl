"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"

"${_( '(rpt)Dept.No' )}","${_( '(rpt)Dept.Name' )}","${_( '(rpt)No.' )}","${_( '(rpt)Name' )}","${_( '(rpt)Stock' )}","${_( '(rpt)Min.Stock' )}"
{for category in body}
"'${category.no}","${category.name}"
{for plu in category.plu}
"","","${plu.no}","${plu.name}","${plu.stock}","${plu.min_stock}"
{/for}
{/for}
