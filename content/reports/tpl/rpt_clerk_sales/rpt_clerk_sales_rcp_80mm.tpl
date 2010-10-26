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
${queryFormLabel.clerk_type_label}${queryFormLabel.clerk_type}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}
${queryFormLabel.database_label}${queryFormLabel.database}

${head.title|center:42}
{for clerk in body}
[&CR]
[&CR]
Clerk:${clerk.name|right:36}
------------------------------------------
${_( '(rpt)Terminal' )|left:8}  ${_( '(rpt)Time' )|left:16}  ${_( '(rpt)Sequence' )|left:14}
--------  ----------  --------------------
{for order in clerk.orders}
{eval}
  TrimPath.RoundingPrices = order.rounding_prices;
  TrimPath.PrecisionPrices = order.precision_prices;
  TrimPath.RoundingTaxes = order.rounding_taxes;
  TrimPath.PrecisionTaxes = order.precision_taxes;
{/eval}
${order.terminal_no|left:8}  ${order.time|unixTimeToString|left:16}  ${order.sequence|left:14}
${'    ' + _( '(rpt)Sale Period' ) + ': '|left:19}${order.sale_period|unixTimeToString:'saleperiod'|right:22}
${'    ' + _( '(rpt)Shift' ) + ': '|left:19}${order.shift_number|right:22}
${'    ' + _( '(rpt)Invoice Number' ) + ': '|left:19}${order.invoice_no|default:''|right:22}
${'    ' + _( '(rpt)Number of Guests' ) + ': '|left:19}${order.no_of_customers|format:0|right:22}
${'    ' + _( '(rpt)Number of Items' ) + ': '|left:19}${order.qty_subtotal|format:0|right:22}
${'    ' + _( '(rpt)Gross Sales' ) + ': '|left:19}${order.item_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Add-on Tax' ) + ': '|left:19}${order.tax_subtotal|default:0|viviFormatTaxes:true|right:22}
${'    ' + _( '(rpt)Surcharge' ) + ': '|left:19}${order.surcharge_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Discount' ) + ': '|left:19}${order.discount_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Promotion' ) + ': '|left:19}${order.promotion_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Revalue' ) + ': '|left:19}${order.revalue_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Total' ) + ': '|left:19}${order.total|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Payment' ) + ': '|left:19}${order.payment|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Cash' ) + ': '|left:19}${order.cash|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Check' ) + ': '|left:19}${order.check|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Credit Card' ) + ': '|left:19}${order.creditcard|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Coupon' ) + ': '|left:19}${order.coupon|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Gift Card' ) + ': '|left:19}${order.giftcard|default:0|viviFormatPrices:true|right:22}
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:30}${foot.rowCount|default:0|format:0|right:12}
${_( '(rpt)Records Displayed' ) + ': '|left:30}${clerk.orders.length|default:0|format:0|right:12}
------------------------------------------
${_( '(rpt)Summary' )}
${'    ' + _( '(rpt)Number of Guests' ) + ': '|left:19}${clerk.summary.guests|format:0|right:22}
${'    ' + _( '(rpt)Number of Items' ) + ': '|left:19}${clerk.summary.items|format:0|right:22}
${'    ' + _( '(rpt)Gross Sales' ) + ': '|left:19}${clerk.summary.item_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Add-on Tax' ) + ': '|left:19}${clerk.summary.tax_subtotal|default:0|viviFormatTaxes:true|right:22}
${'    ' + _( '(rpt)Surcharge' ) + ': '|left:19}${clerk.summary.surcharge_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Discount' ) + ': '|left:19}${clerk.summary.discount_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Promotion' ) + ': '|left:19}${clerk.summary.promotion_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Revalue' ) + ': '|left:19}${clerk.summary.revalue_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Total' ) + ': '|left:19}${clerk.summary.total|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Payment' ) + ': '|left:19}${clerk.summary.payment|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Cash' ) + ': '|left:19}${clerk.summary.cash|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Check' ) + ': '|left:19}${clerk.summary.check|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Credit Card' ) + ': '|left:19}${clerk.summary.creditcard|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Coupon' ) + ': '|left:19}${clerk.summary.coupon|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Gift Card' ) + ': '|left:19}${clerk.summary.giftcard|default:0|viviFormatPrices:true|right:22}
------------------------------------------
{/for}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
