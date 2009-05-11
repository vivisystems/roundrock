
[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

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
${'    ' + _( '(rpt)Sale Period' ) + ': '|left:17}${order.sale_period|unixTimeToString:'saleperiod'|right:24}
${'    ' + _( '(rpt)Shift' ) + ': '|left:17}${order.shift_number|right:24}
${'    ' + _( '(rpt)Total' ) + ': '|left:17}${order.item_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Add-on Tax' ) + ': '|left:17}${order.tax_subtotal|default:0|viviFormatTaxes:true|right:24}
${'    ' + _( '(rpt)Surcharge' ) + ': '|left:17}${order.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Discount' ) + ': '|left:17}${order.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Promotion' ) + ': '|left:17}${order.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Revalue' ) + ': '|left:17}${order.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Payment' ) + ': '|left:17}${order.total|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Cash' ) + ': '|left:17}${order.cash|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Check' ) + ': '|left:17}${order.check|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Credit Card' ) + ': '|left:17}${order.creditcard|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Coupon' ) + ': '|left:17}${order.coupon|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Gift Card' ) + ': '|left:17}${order.giftcard|default:0|viviFormatPrices:true|right:24}
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:17}${clerk.orders.length|default:0|format:0|right:24}
[&CR]
------------------------------------------
${_( '(rpt)Summary' )}
${'    ' + _( '(rpt)Total' ) + ': '|left:17}${clerk.summary.item_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Add-on Tax' ) + ': '|left:17}${clerk.summary.tax_subtotal|default:0|viviFormatTaxes:true|right:24}
${'    ' + _( '(rpt)Surcharge' ) + ': '|left:17}${clerk.summary.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Discount' ) + ': '|left:17}${clerk.summary.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Promotion' ) + ': '|left:17}${clerk.summary.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Revalue' ) + ': '|left:17}${clerk.summary.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Payment' ) + ': '|left:17}${clerk.summary.total|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Cash' ) + ': '|left:17}${clerk.summary.cash|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Check' ) + ': '|left:17}${clerk.summary.check|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Credit Card' ) + ': '|left:17}${clerk.summary.creditcard|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Coupon' ) + ': '|left:17}${clerk.summary.coupon|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Gift Card' ) + ': '|left:17}${clerk.summary.giftcard|default:0|viviFormatPrices:true|right:24}
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
