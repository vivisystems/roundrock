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
${queryFormLabel.shift_no_label}${queryFormLabel.shift_no}
${queryFormLabel.period_type_label}${queryFormLabel.period_type}
${queryFormLabel.annotation_type_label}${queryFormLabel.annotation_type}
${queryFormLabel.orderstatus_label}${queryFormLabel.orderstatus}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:24}
{for types in body}
-----------------------
${types_index}
{for order in types.orders}
{eval}
  TrimPath.RoundingPrices = order.rounding_prices;
  TrimPath.PrecisionPrices = order.precision_prices;
  TrimPath.RoundingTaxes = order.rounding_taxes;
  TrimPath.PrecisionTaxes = order.precision_taxes;
{/eval}
-----------------------
${_( '(rpt)Terminal' ) + ':'|left:24}
${order.terminal_no|right:24}
${_( '(rpt)Clerk' ) + ':'|left:24}
${order.service_clerk_displayname|default:''|right:24}
${order.proceeds_clerk_displayname|default:''|right:24}
${_( '(rpt)Sale Period' ) + ':'|left:24}
${order.sale_period|unixTimeToString:'saleperiod'|right:24}
${_( '(rpt)Shift' ) + ':'|left:24}
${order.shift_number|right:24}
${_( '(rpt)Time' ) + ':'}
${order.time|unixTimeToString|right:24}
${_( '(rpt)Sequence' ) + ':'|left:24}
${order.sequence|right:24}
${_( '(rpt)Status' ) + ':'|left:24}
${order.status|right:24}
${_( '(rpt)Quantities Sold' ) + ':'|left:24}
${order.qty_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Gross Sales' ) + ':'|left:24}
${order.item_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Surcharge' ) + ':'|left:24}
${order.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'|left:24}
${order.discount_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'|left:24}
${order.promotion_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'|left:24}
${order.revalue_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'|left:24}
${order.tax_subtotal|viviFormatTaxes:true|right:24}
${_( '(rpt)Total' ) + ':'|left:24}
${order.total|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'|left:24}
${order.payment|viviFormatPrices:true|right:24}
------------------------
  ${order.text|substr:0,22}
  ${order.text|substr:22,22}
  ${order.text|substr:44,22}
------------------------
{/for}
${_( '(rpt)Records Found' ) + ': '|left:18}${types.orders.length|format:0|right:6}
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Quantities Sold' ) + ':'|left:24}
${types.summary.qty_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Gross Sales' ) + ':'|left:24}
${types.summary.item_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Surcharge' ) + ':'|left:24}
${types.summary.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'|left:24}
${types.summary.discount_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'|left:24}
${types.summary.promotion_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'|left:24}
${types.summary.revalue_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'|left:24}
${types.summary.tax_subtotal|viviFormatTaxes:true|right:24}
${_( '(rpt)Total' ) + ':'|left:24}
${types.summary.total|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'|left:24}
${types.summary.payment|viviFormatPrices:true|right:24}
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
