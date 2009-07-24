[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for result in body}
------------------------
${result.name} - ${result.code}
{for entry in result.entries}
------------------------
${_( '(rpt)Date' ) + ':'}
${entry.date|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${entry.gross|viviFormatPrices:true|right:24}
${_( '(rpt)Order Count' ) + ':'}
${entry.order_count|format:0|right:24}
${_( '(rpt)Promotion Subtotal' ) + ':'}
${entry.promotion_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Matched Count' ) + ':'}
${entry.matched_count|format:0|right:24}
${_( '(rpt)Matched Items Quantity' ) + ':'}
${entry.matched_items_qty|format:0|right:24}
${_( '(rpt)Matched Items Subtotal' ) + ':'}
${entry.matched_items_subtotal|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Gross Sales' ) + ':'}
${result.summary.gross|viviFormatPrices:true|right:24}
${_( '(rpt)Order Count' ) + ':'}
${result.summary.order_count|format:0|right:24}
${_( '(rpt)Promotion Subtotal' ) + ':'}
${result.summary.promotion_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Matched Count' ) + ':'}
${result.summary.matched_count|format:0|right:24}
${_( '(rpt)Matched Items Quantity' ) + ':'}
${result.summary.matched_items_qty|format:0|right:24}
${_( '(rpt)Matched Items Subtotal' ) + ':'}
${result.summary.matched_items_subtotal|viviFormatPrices:true|right:24}
{/for}
------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]