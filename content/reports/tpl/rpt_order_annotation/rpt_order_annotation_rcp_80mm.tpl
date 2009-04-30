[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:24}
{for types in body}
------------------------------------------
${types_index}
{for orders in types.orders}
------------------------------------------
${'  ' + _( '(rpt)Term_No.' ) + ':'|left:18}${orders.terminal_no|right:24}
${'  ' + _( '(rpt)Time' ) + ':'|left:18}${orders.time|unixTimeToString|right:24}
${'  ' + _( '(rpt)Sequence' ) + ':'|left:18}${orders.sequence|right:24}
${'  ' + _( '(rpt)Annotation Text' ) + ':'|left:18}${orders.text|right:24}
${'  ' + _( '(rpt)Total' ) + ':'|left:18}${orders.item_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Add-on Tax' ) + ':'|left:18}${orders.tax_subtotal|viviFormatTaxes:true|right:24}
${'  ' + _( '(rpt)Surcharge' ) + ':'|left:18}${orders.surcharge_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Discount' ) + ':'|left:18}${orders.discount_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Promotion' ) + ':'|left:18}${orders.promotion_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Revalue' ) + ':'|left:18}${orders.revalue_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Payment' ) + ':'|left:18}${orders.total|viviFormatPrices:true|right:24}
{/for}
------------------------------------------
${_( '(rpt)Summary' )}
${'  ' + _( '(rpt)Total' ) + ':'|left:18}${types.summary.item_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Add-on Tax' ) + ':'|left:18}${types.summary.tax_subtotal|viviFormatTaxes:true|right:24}
${'  ' + _( '(rpt)Surcharge' ) + ':'|left:18}${types.summary.surcharge_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Discount' ) + ':'|left:18}${types.summary.discount_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Promotion' ) + ':'|left:18}${types.summary.promotion_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Revalue' ) + ':'|left:18}${types.summary.revalue_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Payment' ) + ':'|left:18}${types.summary.total|viviFormatPrices:true|right:24}
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
