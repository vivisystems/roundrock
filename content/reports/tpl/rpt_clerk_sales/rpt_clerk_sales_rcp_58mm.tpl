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
${queryFormLabel.clerk_type_label}${queryFormLabel.clerk_type}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}
${queryFormLabel.database_label}${queryFormLabel.database}

${head.title|center:24}
{for clerk in body}
[&CR]
[&CR]
${_( '(rpt)Clerk' ) + ':'}
${clerk.name|right:24}
{for order in clerk.orders}
{eval}
  TrimPath.RoundingPrices = order.rounding_prices;
  TrimPath.PrecisionPrices = order.precision_prices;
  TrimPath.RoundingTaxes = order.rounding_taxes;
  TrimPath.PrecisionTaxes = order.precision_taxes;
{/eval}
------------------------
${_( '(rpt)Terminal' ) + ':'}
${order.terminal_no|right:24}
${_( '(rpt)Sale Period') + ':'}
${order.sale_period|unixTimeToString:'saleperiod'|right:24}
${_( '(rpt)Shift') + ':'}
${order.shift_number|right:24}
${_( '(rpt)Time' ) + ':'}
${order.time|unixTimeToString|right:24}
${_( '(rpt)Sequence' ) + ':'}
${order.sequence|right:24}
${_( '(rpt)Invoice Number' ) + ':'}
${order.invoice_no|default:''|right:24}
${_( '(rpt)Number of Guests' ) + ':'}
${order.no_of_customers|format:0|right:24}
${_( '(rpt)Number of Items' ) + ':'}
${order.qty_subtotal|format:0|right:24}
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
${_( '(rpt)Total' ) + ':'}
${order.total|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'}
${order.payment|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Cash' ) + ':'}
${order.cash|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Check' ) + ':'}
${order.check|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Credit Card' ) + ':'}
${order.creditcard|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Coupon' ) + ':'}
${order.coupon|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Gift Card' ) + ':'}
${order.giftcard|default:0|viviFormatPrices:true|right:24}
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
------------------------
${_( '(rpt)Records Found' ) + ':'|left:24}
${foot.rowCount|default:0|format:0|right:24}
${_( '(rpt)Records Displayed' ) + ':'|left:24}
${clerk.orders.length|default:0|format:0|right:24}
------------------------
${_( '(rpt)Summary' )}
------------------------
${_( '(rpt)Number of Guests' ) + ':'}
${clerk.summary.guests|format:0|right:24}
${_( '(rpt)Number of Items' ) + ':'}
${clerk.summary.items|format:0|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${clerk.summary.item_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${clerk.summary.tax_subtotal|default:0|viviFormatTaxes:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${clerk.summary.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${clerk.summary.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${clerk.summary.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${_( '(rpt)Total' ) + ':'}
${clerk.summary.total|default:0|viviFormatPrices:true|right:24}
${clerk.summary.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'}
${clerk.summary.payment|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Cash' ) + ':'}
${clerk.summary.cash|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Check' ) + ':'}
${clerk.summary.check|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Credit Card' ) + ':'}
${clerk.summary.creditcard|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Coupon' ) + ':'}
${clerk.summary.coupon|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Gift Card' ) + ':'}
${clerk.summary.giftcard|default:0|viviFormatPrices:true|right:24}
------------------------
{/for}
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
