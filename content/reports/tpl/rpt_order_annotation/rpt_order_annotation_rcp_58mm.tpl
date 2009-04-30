[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for types in body}
-----------------------
${types_index}
{for orders in types.orders}
-----------------------
${_( '(rpt)Term_No.' ) + ':'}
${orders.terminal_no|right:24}
${_( '(rpt)Time' ) + ':'}
${orders.time|unixTimeToString|right:24}
${_( '(rpt)Sequence' ) + ':'}
${orders.sequence|right:24}
${_( '(rpt)Annotation Text' ) + ':'}
${orders.text|right:24}
${_( '(rpt)Total' ) + ':'}
${orders.item_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${orders.tax_subtotal|viviFormatTaxes:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${orders.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${orders.discount_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${orders.promotion_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${orders.revalue_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'}
${orders.total|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Total' ) + ':'}
${types.summary.item_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${types.summary.tax_subtotal|viviFormatTaxes:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${types.summary.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${types.summary.discount_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${types.summary.promotion_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${types.summary.revalue_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'}
${types.summary.total|viviFormatPrices:true|right:24}
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
