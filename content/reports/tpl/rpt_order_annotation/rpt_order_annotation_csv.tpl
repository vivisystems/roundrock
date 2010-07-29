"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start Time' ) + ':'}","${head.start_time}"
"${_( '(rpt)End Time' ) + ':'}","${head.end_time}"
"${_('(rpt)Condition') + ' - '}"
"${queryFormLabel.terminal_no_label}","${queryFormLabel.terminal_no}"
"${queryFormLabel.shift_no_label}","${queryFormLabel.shift_no}"
"${queryFormLabel.period_type_label}","${queryFormLabel.period_type}"
"${queryFormLabel.annotation_type_label}","${queryFormLabel.annotation_type}"
"${queryFormLabel.orderstatus_label}","${queryFormLabel.orderstatus}"
"${queryFormLabel.sortby_label}","${queryFormLabel.sortby}"

{for types in body}
"${types_index}"
"","${_( '(rpt)Terminal' )}","${_( '(rpt)Clerk' )}","${_( '(rpt)Sale Period' )}","${_( '(rpt)Shift' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Status' )}","${_( '(rpt)Annotation Text' )}","${_( '(rpt)Gross Sales' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Promotion' )}","${_( '(rpt)Revalue' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Total' )}","${_( '(rpt)Payment' )}"
{for order in types.orders}
{eval}
  TrimPath.RoundingPrices = order.rounding_prices;
  TrimPath.PrecisionPrices = order.precision_prices;
  TrimPath.RoundingTaxes = order.rounding_taxes;
  TrimPath.PrecisionTaxes = order.precision_taxes;
{/eval}
"","'${order.terminal_no}","'${order.service_clerk_displayname|default:''}/${order.proceeds_clerk_displayname|default:''}","${order.sale_period|unixTimeToString:'saleperiod'}","${order.shift_number}","${order.time|unixTimeToString}","'${order.sequence}","'${order.status}","'${order.text}","${order.item_subtotal|viviFormatPrices:true}","${order.surcharge_subtotal|viviFormatPrices:true}","${order.discount_subtotal|viviFormatPrices:true}","${order.promotion_subtotal|viviFormatPrices:true}","${order.revalue_subtotal|viviFormatPrices:true}","${order.tax_subtotal|viviFormatTaxes:true}","${order.total|viviFormatPrices:true}","${order.payment|viviFormatPrices:true}"
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
"${_( '(rpt)Records Found' )}: ${types.orders.length|format:0}","","","","","","","${_( '(rpt)Summary' ) + ':'}","${types.summary.item_subtotal|viviFormatPrices:true}","${types.summary.surcharge_subtotal|viviFormatPrices:true}","${types.summary.discount_subtotal|viviFormatPrices:true}","${types.summary.promotion_subtotal|viviFormatPrices:true}","${types.summary.revalue_subtotal|viviFormatPrices:true}","${types.summary.tax_subtotal|viviFormatTaxes:true}","${types.summary.total|viviFormatPrices:true}","${types.summary.payment|viviFormatPrices:true}"
{/for}
