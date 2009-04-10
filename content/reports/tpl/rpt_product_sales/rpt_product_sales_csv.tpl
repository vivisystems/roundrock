"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","'${head.clerk_displayname}"
"${( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${( 'Start' ) + ':'}","${head.start_time}"
"${( 'End' ) + ':'}","${head.end_time}"


{for category in body}
"'${category.no}","'${category.name}"
"${_( '(rpt)No.' )}","${_( '(rpt)Name' )}","${_( '(rpt)Avg. Price' )}","${_( '(rpt)Qty' )}","${_( '(rpt)Total' )}"
{for item in category.orderItems}
"${item.product_no}","${item.product_name}","${item.avg_price}","${item.qty}","${item.total}"
{/for}
"","","${_( '(rpt)Summary' ) + ':'}","${category.summary.qty|default:0}","${category.summary.total|default:0|viviFormatPrices:true}"
{/for}
