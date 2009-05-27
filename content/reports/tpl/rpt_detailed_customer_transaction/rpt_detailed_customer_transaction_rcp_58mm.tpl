[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for detail in body}
------------------------
${detail.customer_id} - ${detail.name}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
{for order in detail.orders}
------------------------
${_( '(rpt)Terminal' )}:
${order.terminal_no|right:24}
${_( '(rpt)Sale Period' ) + ':'}
${order.sale_period|unixTimeToString:'saleperiod'|right:24}
${_( '(rpt)Shift' ) + ':'}
${order.shift_number|right:24}
${_( '(rpt)Time' ) + ':'}
${order.Order.time|unixTimeToString|right:24}
${_( '(rpt)Sequence' ) + ':'}
${order.sequence|right:24}
${_( '(rpt)Invoice Number' ) + ':'}
${order.invoice_no|default:''|right:24}
${_( '(rpt)Number of Guests' ) + ':'}
${order.no_of_customers|default:''|right:24}
${_( '(rpt)Number of Items' ) + ':'}
${order.qty_subtotal|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${order.item_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${order.tax_subtotal|default:0|viviFormatTaxes:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${order.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${order.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${order.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${order.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Net Sales' ) + ':'}
${order.total|default:0|viviFormatPrices:true|right:24}
{for items in order.OrderItem}
------------------------
${_( '(rpt)Product Number' )}
${items.product_no|right:24}
${_( '(rpt)Product Name' )}
${items.product_name|right:24}
${_( '(rpt)Tax Name' )}
${items.tax_name|right:24}
${_( '(rpt)Discount' )}
${items.current_discount|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Surcharge' )}
${items.current_surcharge|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Price' )}
${items.current_price|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Quantity' )}
${items.current_qty|right:24}
${_( '(rpt)Subtotal' )}
${items.current_subtotal|default:0|viviFormatPrices:true|right:24}
{/for}
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
------------------------
${_( '(rpt)Records Found' ) + ': '|left:16}${detail.orders.length|default:0|format:0|right:8}
[&CR]
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Number of Guests' ) + ':'}
${detail.summary.no_of_customers|default:0|format:0|right:24}
${_( '(rpt)Number of Items' ) + ':'}
${detail.summary.qty_subtotal|default:0|format:0|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${detail.summary.item_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${detail.summary.tax_subtotal|default:0|viviFormatTaxes:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${detail.summary.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${detail.summary.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${detail.summary.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${detail.summary.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Net Sales' ) + ':'}
${detail.summary.total|default:0|viviFormatPrices:true|right:24}
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
