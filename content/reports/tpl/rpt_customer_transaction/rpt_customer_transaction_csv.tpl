"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"
{for detail in body}
""
"${detail.customer_id} - ${detail.name}"
"${_( '(rpt)Terminal' )}","${_( '(rpt)Service Clerk' )}","${_( '(rpt)Proceeds Clerk' )}","${_( '(rpt)Sale Period' )}","${_( '(rpt)Shift' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Invoice Number' )}","${_( '(rpt)Number of Guests' )}","${_( '(rpt)Number of Items' )}","${_( '(rpt)Gross Sales' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Promotion' )}","${_( '(rpt)Revalue' )}","${_( '(rpt)Net Sales' )}","${_( '(rpt)Payment' )}","${_( '(rpt)Cash' )}","${_( '(rpt)Check' )}","${_( '(rpt)Credit Card' )}","${_( '(rpt)Coupon' )}","${_( '(rpt)Gift Card' )}"
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
{for order in detail.orders}
"'${order.terminal_no}","'${order.service_clerk_displayname|default:''}","'${order.proceeds_clerk_displayname|default:''}","${order.sale_period|unixTimeToString:'saleperiod'}","${order.shift_number}","${order.time|unixTimeToString}","'${order.sequence}","'${order.invoice_no|default:''}","${order.no_of_customers}","${order.qty_subtotal}","${order.item_subtotal|default:0|viviFormatPrices:true}","${order.tax_subtotal|default:0|viviFormatTaxes:true}","${order.surcharge_subtotal|default:0|viviFormatPrices:true}","${order.discount_subtotal|default:0|viviFormatPrices:true}","${order.promotion_subtotal|default:0|viviFormatPrices:true}","${order.revalue_subtotal|default:0|viviFormatPrices:true}","${order.total|default:0|viviFormatPrices:true}","${order.payment|default:0|viviFormatPrices:true}","${order.cash|default:0|viviFormatPrices:true}","${order.check|default:0|viviFormatPrices:true}","${order.creditcard|default:0|viviFormatPrices:true}","${order.coupon|default:0|viviFormatPrices:true}","${order.giftcard|default:0|viviFormatPrices:true}"
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
"${_( '(rpt)Records Found' ) + ':'}","${detail.orders.length}","","","","","","${_( '(rpt)Summary' ) + ':'}","${detail.summary.no_of_customers}","${detail.summary.qty_subtotal}","${detail.summary.item_subtotal|default:0|viviFormatPrices:true}","${detail.summary.tax_subtotal|default:0|viviFormatTaxes:true}","${detail.summary.surcharge_subtotal|default:0|viviFormatPrices:true}","${detail.summary.discount_subtotal|default:0|viviFormatPrices:true}","${detail.summary.promotion_subtotal|default:0|viviFormatPrices:true}","${detail.summary.revalue_subtotal|default:0|viviFormatPrices:true}","${detail.summary.total|default:0|viviFormatPrices:true}","${detail.summary.payment|default:0|viviFormatPrices:true}","${detail.summary.cash|default:0|viviFormatPrices:true}","${detail.summary.check|default:0|viviFormatPrices:true}","${detail.summary.creditcard|default:0|viviFormatPrices:true}","${detail.summary.coupon|default:0|viviFormatPrices:true}","${detail.summary.giftcard|default:0|viviFormatPrices:true}"
{/for}
