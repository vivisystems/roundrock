"${head.store.name}"
"${head.store.branch}"
"${_( 'Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( 'Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( 'Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( 'Printed Time' ) + ':'}","${foot.gen_time}"

"${_( 'Dept.No' )}","${_( 'Dept.Name' )}","${_( 'No.' )}","${_( 'Name' )}","${_( 'Stock' )}","${_( 'Min.Stock' )}"
{for category in body}
"'${category.no}","'${category.name}"
{for plu in category.plu}
"","","'${plu.no}","'${plu.name}","${plu.stock}","${plu.min_stock}"
{/for}
{/for}
