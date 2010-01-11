"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${( 'Start Time' ) + ':'}","${head.start_time}"
"${( 'End Time' ) + ':'}","${head.end_time}"


{for category in body}
"'${category.no}","${category.name}"
"${_( '(rpt)Product Number' )}","${_( '(rpt)Product Name' )}","${_( '(rpt)Average Price' )}","${_( '(rpt)Units Returned' )}","${_( '(rpt)Quantity Returned' )}","${_( '(rpt)Gross Returns' )}","${_( '(rpt)Net Returns' )}"
{for item in category.orderItems}
"'${item.product_no|default:''}","'${item.product_name|default:''}","${item.avg_price}",{if item.units > 0}"${item.units|format:0}"{else}""{/if},"${item.quantity}","${item.gross|default:0|viviFormatPrices:true}","${item.net|default:0|viviFormatPrices:true}","${item.order_sequence}"
{/for}
"${_( '(rpt)Records Found' ) + ': '}","${category.orderItems.length|format:0}","${_( '(rpt)Summary' ) + ':'}","${category.summary.units|default:0}","","${category.summary.gross|default:0|viviFormatPrices:true}","${category.summary.net|viviFormatPrices:true}"
{/for}