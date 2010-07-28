[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shift_no_label}${queryFormLabel.shift_no}
${queryFormLabel.period_type_label}${queryFormLabel.period_type}
${queryFormLabel.annotation_type_label}${queryFormLabel.annotation_type}
${queryFormLabel.orderstatus_label}${queryFormLabel.orderstatus}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:24}
{for types in body}
------------------------------------------
${types_index}
{for order in types.orders}
{eval}
  TrimPath.RoundingPrices = order.rounding_prices;
  TrimPath.PrecisionPrices = order.precision_prices;
  TrimPath.RoundingTaxes = order.rounding_taxes;
  TrimPath.PrecisionTaxes = order.precision_taxes;
{/eval}
------------------------------------------
${'  ' + _( '(rpt)Terminal' ) + ':'|left:18}${order.terminal_no|right:24}
${'  ' + _( '(rpt)Clerk' ) + ':'|left:18}${order.service_clerk_displayname|default:''|right:24}
${order.proceeds_clerk_displayname|default:''|right:42}
${'  ' + _( '(rpt)Sale Period' ) + ':'|left:18}${order.sale_period|unixTimeToString:'saleperiod'|right:24}
${'  ' + _( '(rpt)Shift' ) + ':'|left:18}${order.shift_number|right:24}
${'  ' + _( '(rpt)Time' ) + ':'|left:18}${order.time|unixTimeToString|right:24}
${'  ' + _( '(rpt)Sequence' ) + ':'|left:18}${order.sequence|right:24}
${'  ' + _( '(rpt)Status' ) + ':'|left:18}${order.status|right:24}
${'  ' + _( '(rpt)Gross Sales' ) + ':'|left:18}${order.item_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Surcharge' ) + ':'|left:18}${order.surcharge_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Discount' ) + ':'|left:18}${order.discount_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Promotion' ) + ':'|left:18}${order.promotion_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Revalue' ) + ':'|left:18}${order.revalue_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Add-on Tax' ) + ':'|left:18}${order.tax_subtotal|viviFormatTaxes:true|right:24}
${'  ' + _( '(rpt)Total' ) + ':'|left:18}${order.total|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Payment' ) + ':'|left:18}${order.payment|viviFormatPrices:true|right:24}
------------------------------------------
  ${order.text|substr:0,40}
  ${order.text|substr:40,40}
------------------------------------------
{/for}
${_( '(rpt)Records Found' ) + ': '|left:18}${types.orders.length|format:0|right:24}
------------------------------------------
${_( '(rpt)Summary' )}
${'  ' + _( '(rpt)Gross Sales' ) + ':'|left:18}${types.summary.item_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Surcharge' ) + ':'|left:18}${types.summary.surcharge_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Discount' ) + ':'|left:18}${types.summary.discount_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Promotion' ) + ':'|left:18}${types.summary.promotion_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Revalue' ) + ':'|left:18}${types.summary.revalue_subtotal|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Add-on Tax' ) + ':'|left:18}${types.summary.tax_subtotal|viviFormatTaxes:true|right:24}
${'  ' + _( '(rpt)Total' ) + ':'|left:18}${types.summary.total|viviFormatPrices:true|right:24}
${'  ' + _( '(rpt)Payment' ) + ':'|left:18}${types.summary.payment|viviFormatPrices:true|right:24}
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
