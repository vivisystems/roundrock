[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shiftno_label}${queryFormLabel.shiftno}
${queryFormLabel.periodtype_label}${queryFormLabel.periodtype}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}
${queryFormLabel.database_label}${queryFormLabel.database}

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
${_( '(rpt)Add-on Tax' ) + ':'}
${entry.tax_subtotal|viviFormatTaxes:true|right:24}
${_( '(rpt)Included Tax' ) + ':'}
${entry.included_tax_subtotal|viviFormatTaxes:true|right:24}
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
${_( '(rpt)Add-on Tax' ) + ':'}
${result.summary.tax_subtotal|viviFormatTaxes:true|right:24}
${_( '(rpt)Included Tax' ) + ':'}
${result.summary.included_tax_subtotal|viviFormatTaxes:true|right:24}
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
