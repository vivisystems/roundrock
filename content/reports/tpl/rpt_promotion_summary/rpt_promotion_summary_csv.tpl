"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${( 'Start' ) + ':'}","${head.start_time}"
"${( 'End' ) + ':'}","${head.end_time}"


{for result in body}
"${result.name} - ${result.code}"
"","${_( '(rpt)Date' )}","${_( '(rpt)Gross Sales' )}","${_( '(rpt)Order Count' )}","${_( '(rpt)Promotion Subtotal' )}","${_( '(rpt)Matched Count' )}","${_( '(rpt)Matched Items Quantity' )}","${_( '(rpt)Matched Items Subtotal' )}"
{for entry in result.entries}
"","${entry.date}","${entry.gross|viviFormatPrices:true}","${entry.order_count|format:0}","${entry.promotion_subtotal|viviFormatPrices:true}","${entry.matched_count|format:0}","${entry.matched_items_qty|format:0}","${entry.matched_items_subtotal|viviFormatPrices:true}"
{/for}
"","${_( '(rpt)Summary' ) + ':'}","${result.summary.grossl|viviFormatPrices:true}","${result.summary.order_count|format:0}","${result.summary.promotion_subtotal|viviFormatPrices:true}","${result.summary.matched_count|format:0}","${result.summary.matched_items_qty|format:0}","${result.summary.matched_items_subtotal|viviFormatPrices:true}"
{/for}
