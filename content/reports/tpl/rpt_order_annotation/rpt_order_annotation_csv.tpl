"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

{for types in body}
"${types_index}"
"","${_( '(rpt)Terminal' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Annotation Text' )}","${_( '(rpt)Total' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Promotion' )}","${_( '(rpt)Revalue' )}","${_( '(rpt)Payment' )}"
{for orders in types.orders}
"","${orders.terminal_no}","${orders.time|unixTimeToString}","${orders.sequence}","${orders.text}","${orders.item_subtotal|viviFormatPrices:true}","${orders.tax_subtotal|viviFormatTaxes:true}","${orders.surcharge_subtotal|viviFormatPrices:true}","${orders.discount_subtotal|viviFormatPrices:true}","${orders.promotion_subtotal|viviFormatPrices:true}","${orders.revalue_subtotal|viviFormatPrices:true}","${orders.total|viviFormatPrices:true}"
{/for}
"","","","","${_( '(rpt)Summary' ) + ':'}","${types.summary.item_subtotal|viviFormatPrices:true}","${types.summary.tax_subtotal|viviFormatTaxes:true}","${types.summary.surcharge_subtotal|viviFormatPrices:true}","${types.summary.discount_subtotal|viviFormatPrices:true}","${types.summary.promotion_subtotal|viviFormatPrices:true}","${types.summary.revalue_subtotal|viviFormatPrices:true}","${types.summary.total|viviFormatPrices:true}"
{/for}
