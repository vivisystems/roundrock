"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

{for clerk in body}
""
${clerk.name}
""
"${_( '(rpt)Terminal' )}","${_( '(rpt)Sale Period' )}","${_( '(rpt)Shift' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Total' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Promotion' )}","${_( '(rpt)Revalue' )}","${_( '(rpt)Payment' )}","${_( '(rpt)Cash' )}","${_( '(rpt)Check' )}","${_( '(rpt)Credit Card' )}","${_( '(rpt)Coupon' )}","${_( '(rpt)Gift Card' )}"
{for order in clerk.orders}
{eval}
  TrimPath.RoundingPrices = order.rounding_prices;
  TrimPath.PrecisionPrices = order.precision_prices;
  TrimPath.RoundingTaxes = order.rounding_taxes;
  TrimPath.PrecisionTaxes = order.precision_taxes;
{/eval}
"${order.terminal_no}","${order.sale_period|unixTimeToString:'saleperiod'}","${order.shift_number}","${order.time|unixTimeToString}","${order.sequence}","${order.item_subtotal|default:0|viviFormatPrices:true}","${order.tax_subtotal|default:0|viviFormatTaxes:true}","${order.surcharge_subtotal|default:0|viviFormatPrices:true}","${order.discount_subtotal|default:0|viviFormatPrices:true}","${order.promotion_subtotal|default:0|viviFormatPrices:true}","${order.revalue_subtotal|default:0|viviFormatPrices:true}","${order.total|default:0|viviFormatPrices:true}","${order.cash|default:0|viviFormatPrices:true}","${order.check|default:0|viviFormatPrices:true}","${order.creditcard|default:0|viviFormatPrices:true}","${order.coupon|default:0|viviFormatPrices:true}","${order.giftcard|default:0|viviFormatPrices:true}"
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
"${_( '(rpt)Records Found' ) + ':'}","${clerk.orders.length|default:0|format:0}","","","${_( '(rpt)Summary' ) + ':'}","${clerk.summary.item_subtotal|viviFormatPrices:true}","${clerk.summary.tax_subtotal|viviFormatTaxes:true}","${clerk.summary.surcharge_subtotal|viviFormatPrices:true}","${clerk.summary.discount_subtotal|viviFormatPrices:true}","${clerk.summary.promotion_subtotal|viviFormatPrices:true}","${clerk.summary.revalue_subtotal|viviFormatPrices:true}","${clerk.summary.total|viviFormatPrices:true}","${clerk.summary.cash|viviFormatPrices:true}","${clerk.summary.check|viviFormatPrices:true}","${clerk.summary.creditcard|viviFormatPrices:true}","${clerk.summary.coupon|viviFormatPrices:true}","${clerk.summary.giftcard|viviFormatPrices:true}"
{/for}
