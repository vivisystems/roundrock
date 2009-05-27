[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
------------------------------------------
${detail.customer_id} - ${detail.name}
------------------------------------------
${_( '(rpt)Terminal' )|left:8}  ${_( '(rpt)Time' )|left:16}  ${_( '(rpt)Sequence' )|left:14}
--------  ----------  --------------------
{for order in detail.orders}
${order.terminal_no|left:8}  ${order.time|unixTimeToString|left:16}  ${order.sequence|left:14}
${'    ' + _( '(rpt)Service Clerk' ) + ': '|left:19}${order.service_clerk_displayname|default:''|right:22}
${'    ' + _( '(rpt)Proceeds Clerk' ) + ': '|left:19}${order.proceeds_clerk_displayname|default:''|right:22}
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
${'    ' + _( '(rpt)Net Sales' ) + ': '|left:19}${order.total|default:0|viviFormatPrices:true|right:22}
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
${_( '(rpt)Records Found' ) + ': '|left:19}${detail.orders.length|default:0|format:0|right:22}
[&CR]
------------------------------------------
${_( '(rpt)Summary' )}
${'    ' + _( '(rpt)Number of Guests' ) + ': '|left:19}${detail.summary.no_of_customers|format:0|right:22}
${'    ' + _( '(rpt)Number of Items' ) + ': '|left:19}${detail.summary.qty_subtotal|format:0|right:22}
${'    ' + _( '(rpt)Gross Sales' ) + ': '|left:19}${detail.summary.item_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Add-on Tax' ) + ': '|left:19}${detail.summary.tax_subtotal|default:0|viviFormatTaxes:true|right:22}
${'    ' + _( '(rpt)Surcharge' ) + ': '|left:19}${detail.summary.surcharge_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Discount' ) + ': '|left:19}${detail.summary.discount_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Promotion' ) + ': '|left:19}${detail.summary.promotion_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Revalue' ) + ': '|left:19}${detail.summary.revalue_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Net Sales' ) + ': '|left:19}${detail.summary.total|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Payment' ) + ': '|left:19}${detail.summary.payment|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Cash' ) + ': '|left:19}${detail.summary.cash|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Check' ) + ': '|left:19}${detail.summary.check|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Credit Card' ) + ': '|left:19}${detail.summary.creditcard|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Coupon' ) + ': '|left:19}${detail.summary.coupon|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Gift Card' ) + ': '|left:19}${detail.summary.giftcard|default:0|viviFormatPrices:true|right:22}
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
