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
${entry.total|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Total' ) + ':'}
${entry.total|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Order Count' ) + ':'}
${entry.order_count|default:0|right:24}
${_( '(rpt)Promotion Subtotal' ) + ':'}
${entry.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Matched Count' ) + ':'}
${entry.matched_count|default:0|right:24}
${_( '(rpt)Matched Items Qty.' ) + ':'}
${entry.matched_items_qty|default:0|right:24}
${_( '(rpt)Matched Items Subtotal' ) + ':'}
${entry.matched_items_subtotal|default:0|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Total' ) + ':'}
${result.summary.total|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Order Count' ) + ':'}
${result.summary.order_count|default:0|right:24}
${_( '(rpt)Promotion Subtotal' ) + ':'}
${result.summary.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Matched Count' ) + ':'}
${result.summary.matched_count|default:0|right:24}
${_( '(rpt)Matched Items Qty.' ) + ':'}
${result.summary.matched_items_qty|default:0|right:24}
${_( '(rpt)Matched Items Subtotal' ) + ':'}
${result.summary.matched_items_subtotal|default:0|viviFormatPrices:true|right:24}
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
