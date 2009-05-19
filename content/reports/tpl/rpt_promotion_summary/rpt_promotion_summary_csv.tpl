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
"","${_( '(rpt)Date' )}","${_( '(rpt)Total' )}","${_( '(rpt)Order Count' )}","${_( '(rpt)Promotion Subtotal' )}","${_( '(rpt)Matched Count' )}","${_( '(rpt)Matched Items Qty.' )}","${_( '(rpt)Matched Items Subtotal' )}"
{for entry in result.entries}
"","${entry.date}","${entry.total|default:0|viviFormatPrices:true}","${entry.order_count|default:0}","${entry.promotion_subtotal|default:0|viviFormatPrices:true}","${entry.matched_count|default:0}","${entry.matched_items_qty|default:0}","${entry.matched_items_subtotal|default:0|viviFormatPrices:true}"
{/for}
"","${_( '(rpt)Summary' ) + ':'}","${result.summary.total|default:0|viviFormatPrices:true}","${result.summary.order_count|default:0}","${result.summary.promotion_subtotal|default:0|viviFormatPrices:true}","${result.summary.matched_count|default:0}","${result.summary.matched_items_qty|default:0}","${result.summary.matched_items_subtotal|default:0|viviFormatPrices:true}"
{/for}
