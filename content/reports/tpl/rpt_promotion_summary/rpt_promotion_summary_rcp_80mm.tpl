[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for result in body}
------------------------------------------
${result.name} - ${result.code}
{for entry in result.entries}
------------------------------------------
${_( '(rpt)Date' ) + ':'}${entry.total|default:0|viviFormatPrices:true}
${_( '(rpt)Total' ) + ':'}${entry.total|default:0|viviFormatPrices:true}
${_( '(rpt)Order Count' ) + ':'}${entry.order_count|default:0}
${_( '(rpt)Promotion Subtotal' ) + ':'}${entry.promotion_subtotal|default:0|viviFormatPrices:true}
${_( '(rpt)Matched Count' ) + ':'}${entry.matched_count|default:0}
${_( '(rpt)Matched Items Qty.' ) + ':'}${entry.matched_items_qty|default:0}
${_( '(rpt)Matched Items Subtotal' ) + ':'}${entry.matched_items_subtotal|default:0|viviFormatPrices:true}
{/for}
------------------------------------------
${_( '(rpt)Total' ) + ':'}${result.summary.total|default:0|viviFormatPrices:true}
${_( '(rpt)Order Count' ) + ':'}${result.summary.order_count|default:0}
${_( '(rpt)Promotion Subtotal' ) + ':'}${result.summary.promotion_subtotal|default:0|viviFormatPrices:true}
${_( '(rpt)Matched Count' ) + ':'}${result.summary.matched_count|default:0}
${_( '(rpt)Matched Items Qty.' ) + ':'}${result.summary.matched_items_qty|default:0}
${_( '(rpt)Matched Items Subtotal' ) + ':'}${result.summary.matched_items_subtotal|default:0|viviFormatPrices:true}
{/for}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
