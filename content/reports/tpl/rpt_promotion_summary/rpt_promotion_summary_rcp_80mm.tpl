[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shiftno_label}${queryFormLabel.shiftno}
${queryFormLabel.periodtype_label}${queryFormLabel.periodtype}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:42}
{for result in body}
------------------------------------------
${result.name} - ${result.code}
{for entry in result.entries}
------------------------------------------
${_( '(rpt)Date' ) + ':'|left:24}${entry.date|right:18}
${_( '(rpt)Gross Sales' ) + ':'|left:24}${entry.gross|viviFormatPrices:true|right:18}
${_( '(rpt)Order Count' ) + ':'|left:24}${entry.order_count|format:0|right:18}
${_( '(rpt)Promotion Subtotal' ) + ':'|left:24}${entry.promotion_subtotal|viviFormatPrices:true|right:18}
${_( '(rpt)Add-on Tax' ) + ':'|left:24}${entry.tax_subtotal|viviFormatTaxes:true|right:18}
${_( '(rpt)Included Tax' ) + ':'|left:24}${entry.included_tax_subtotal|viviFormatTaxes:true|right:18}
${_( '(rpt)Matched Count' ) + ':'|left:24}${entry.matched_count|default:0|right:18}
${_( '(rpt)Matched Items Quantity' ) + ':'|left:24}${entry.matched_items_qty|format:0|right:18}
${_( '(rpt)Matched Items Subtotal' ) + ':'|left:24}${entry.matched_items_subtotal|viviFormatPrices:true|right:18}
{/for}
------------------------------------------
${_( '(rpt)Gross Sales' ) + ':'|left:24}${result.summary.gross|viviFormatPrices:true|right:18}
${_( '(rpt)Order Count' ) + ':'|left:24}${result.summary.order_count|format:0|right:18}
${_( '(rpt)Promotion Subtotal' ) + ':'|left:24}${result.summary.promotion_subtotal|viviFormatPrices:true|right:18}
${_( '(rpt)Add-on Tax' ) + ':'|left:24}${result.summary.tax_subtotal|viviFormatTaxes:true|right:18}
${_( '(rpt)Included Tax' ) + ':'|left:24}${result.summary.included_tax_subtotal|viviFormatTaxes:true|right:18}
${_( '(rpt)Matched Count' ) + ':'|left:24}${result.summary.matched_count|format:0|right:18}
${_( '(rpt)Matched Items Quantity' ) + ':'|left:24}${result.summary.matched_items_qty|format:0|right:18}
${_( '(rpt)Matched Items Subtotal' ) + ':'|left:24}${result.summary.matched_items_subtotal|viviFormatPrices:true|right:18}
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
