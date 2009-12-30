"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${( 'Start Time' ) + ':'}","${head.start_time}"
"${( 'End Time' ) + ':'}","${head.end_time}"


{for category in body.department}
"'${category.no}","${category.name}"
"${_( '(rpt)Product Number' )}","${_( '(rpt)Product Name' )}","${_( '(rpt)Average Net Price' )}","${_( '(rpt)Quantities Sold' )}","${_( '(rpt)Gross Sales' )}","${_( '(rpt)Net Sales' )}"
{for item in category.orderItems}
"'${item.product_no|default:''}","'${item.product_name|default:''}","${item.avg_price}","${item.qty}","${item.gross|default:0|viviFormatPrices:true}","${item.net|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Records Found' ) + ': '}","${category.orderItems.length|format:0}","${_( '(rpt)Summary' ) + ':'}","${category.summary.qty|default:0}","${category.summary.gross|default:0|viviFormatPrices:true}","${category.summary.net|viviFormatPrices:true}"
{/for}

{for category in body.group}
"${category.name}"
"${_( '(rpt)Product Number' )}","${_( '(rpt)Product Name' )}","${_( '(rpt)Average Net Price' )}","${_( '(rpt)Quantities Sold' )}","${_( '(rpt)Gross Sales' )}","${_( '(rpt)Net Sales' )}"
{for item in category.orderItems}
"'${item.product_no|default:''}","'${item.product_name|default:''}","${item.avg_price}","${item.qty}","${item.gross|default:0|viviFormatPrices:true}","${item.net|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Records Found' ) + ': '}","${category.orderItems.length|format:0}","${_( '(rpt)Summary' ) + ':'}","${category.summary.qty|default:0}","${category.summary.gross|default:0|viviFormatPrices:true}","${category.summary.net|viviFormatPrices:true}"
{/for}
