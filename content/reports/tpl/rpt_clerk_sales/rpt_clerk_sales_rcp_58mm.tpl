[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for clerk in body}

${_( '(rpt)Clerk' ) + ':'}
${clerk.name|right:24}
{for order in clerk.orders}
------------------------
${_( '(rpt)Term_No.' ) + ':'}
${order.terminal_no|right:24}
${_( clerk.associated_clerk )}:
{if clerk.associated_clerk == 'Proceeds Clerk'}${order.proceeds_clerk_displayname|right:24}{/if}{if clerk.associated_clerk == 'Service Clerk'}${order.service_clerk_displayname|right:24}{/if}
[&CR]
${_( '(rpt)Time' ) + ':'}
${order.time|unixTimeToString|right:24}
${_( '(rpt)Seq.' ) + ':'}
${order.sequence|right:24}
${_( '(rpt)Total' ) + ':'}
${order.item_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${order.tax_subtotal|viviFormatTaxes:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${order.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${order.discount_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${order.promotion_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${order.revalue_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'}
${order.total|viviFormatPrices:true|right:24}
${_( '(rpt)Cash' ) + ':'}
${order.cash|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Check' ) + ':'}
${order.check|viviFormatPrices:true|right:24}
${_( '(rpt)Credit Card' ) + ':'}
${order.creditcard|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Coupon' ) + ':'}
${order.coupon|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Gift Card' ) + ':'}
${order.giftcard|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Total' ) + ':'}
${clerk.summary.item_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${clerk.summary.tax_subtotal|viviFormatTaxes:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${clerk.summary.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${clerk.summary.discount_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${clerk.summary.promotion_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${clerk.summary.revalue_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'}
${clerk.summary.total|viviFormatPrices:true|right:24}
${_( '(rpt)Cash' ) + ':'}
${clerk.summary.cash|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Check' ) + ':'}
${clerk.summary.check|viviFormatPrices:true|right:24}
${_( '(rpt)Credit Card' ) + ':'}
${clerk.summary.creditcard|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Coupon' ) + ':'}
${clerk.summary.coupon|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Gift Card' ) + ':'}
${clerk.summary.giftcard|viviFormatPrices:true|right:24}
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
