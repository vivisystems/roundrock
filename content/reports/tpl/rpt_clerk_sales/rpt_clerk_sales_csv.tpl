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
"${queryFormLabel.clerk_type_label}","${queryFormLabel.clerk_type}"
"${queryFormLabel.sortby_label}","${queryFormLabel.sortby}"
"${queryFormLabel.database_label}","${queryFormLabel.database}"

{for clerk in body}
""
${clerk.name}
""
"${_( '(rpt)Terminal' )}","${_( '(rpt)Sale Period' )}","${_( '(rpt)Shift' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Invoice Number' )}","${_( '(rpt)Number of Guests' )}","${_( '(rpt)Number of Items' )}","${_( '(rpt)Gross Sales' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Promotion' )}","${_( '(rpt)Revalue' )}","${_( '(rpt)Total' )}","${_( '(rpt)Payment' )}","${_( '(rpt)Cash' )}","${_( '(rpt)Check' )}","${_( '(rpt)Credit Card' )}","${_( '(rpt)Coupon' )}","${_( '(rpt)Gift Card' )}"
{for order in clerk.orders}
{eval}
  TrimPath.RoundingPrices = order.rounding_prices;
  TrimPath.PrecisionPrices = order.precision_prices;
  TrimPath.RoundingTaxes = order.rounding_taxes;
  TrimPath.PrecisionTaxes = order.precision_taxes;
{/eval}
"'${order.terminal_no}","${order.sale_period|unixTimeToString:'saleperiod'}","${order.shift_number}","${order.time|unixTimeToString}","'${order.sequence}","'${order.invoice_no|default:''}","${order.no_of_customers}","${order.qty_subtotal}","${order.item_subtotal|default:0|viviFormatPrices:true}","${order.tax_subtotal|default:0|viviFormatTaxes:true}","${order.surcharge_subtotal|default:0|viviFormatPrices:true}","${order.discount_subtotal|default:0|viviFormatPrices:true}","${order.promotion_subtotal|default:0|viviFormatPrices:true}","${order.revalue_subtotal|default:0|viviFormatPrices:true}","${order.total|default:0|viviFormatPrices:true}","${order.payment|default:0|viviFormatPrices:true}","${order.cash|default:0|viviFormatPrices:true}","${order.check|default:0|viviFormatPrices:true}","${order.creditcard|default:0|viviFormatPrices:true}","${order.coupon|default:0|viviFormatPrices:true}","${order.giftcard|default:0|viviFormatPrices:true}"
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
"${_( '(rpt)Records Found' ) + ':'}","${clerk.orders.length|default:0|format:0}","","","","${_( '(rpt)Summary' ) + ':'}","${clerk.summary.guests|format:0}","${clerk.summary.items|format:0}","${clerk.summary.item_subtotal|default:0|viviFormatPrices:true}","${clerk.summary.tax_subtotal|default:0|viviFormatTaxes:true}","${clerk.summary.surcharge_subtotal|default:0|viviFormatPrices:true}","${clerk.summary.discount_subtotal|default:0|viviFormatPrices:true}","${clerk.summary.promotion_subtotal|default:0|viviFormatPrices:true}","${clerk.summary.revalue_subtotal|default:0|viviFormatPrices:true}","${clerk.summary.total|default:0|viviFormatPrices:true}","${clerk.summary.payment|default:0|viviFormatPrices:true}","${clerk.summary.cash|default:0|viviFormatPrices:true}","${clerk.summary.check|default:0|viviFormatPrices:true}","${clerk.summary.creditcard|default:0|viviFormatPrices:true}","${clerk.summary.coupon|default:0|viviFormatPrices:true}","${clerk.summary.giftcard|default:0|viviFormatPrices:true}"
{/for}
