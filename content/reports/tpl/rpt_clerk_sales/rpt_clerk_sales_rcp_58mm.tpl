[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( 'Terminal' ) + ': '}${head.store.terminal_no}
${_( 'Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for clerk in body}

${_( 'Clerk' ) + ':'}
${clerk.name|right:24}
{for order in clerk.orders}
------------------------
${_( 'Term_No.' ) + ':'}
${order.terminal_no|right:24}
${clerk.associated_clerk}:
{if clerk.associated_clerk == 'Proceeds Clerk'}${order.proceeds_clerk_displayname|right:24}{/if}{if clerk.associated_clerk == 'Service Clerk'}${order.service_clerk_displayname|right:24}{/if}
[&CR]
${_( 'Time' ) + ':'}
${order.transaction_created|unixTimeToString:'yyyy-M-d'|right:24}
${_( 'Seq.' ) + ':'}
${order.sequence|right:24}
${_( 'Total' ) + ':'}
${order.item_subtotal|viviFormatPrices:true|right:24}
${_( 'Add-on Tax' ) + ':'}
${order.tax_subtotal|viviFormatPrices:true|right:24}
${_( 'Surcharge' ) + ':'}
${order.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( 'Discount' ) + ':'}
${order.discount_subtotal|viviFormatPrices:true|right:24}
${_( 'Payment' ) + ':'}
${order.total|viviFormatPrices:true|right:24}
${_( 'Cash' ) + ':'}
${order.cash|default:0|viviFormatPrices:true|right:24}
${_( 'Check' ) + ':'}
${order.check|viviFormatPrices:true|right:24}
${_( 'Credit Card' ) + ':'}
${order.creditcard|default:0|viviFormatPrices:true|right:24}
${_( 'Coupon' ) + ':'}
${order.coupon|default:0|viviFormatPrices:true|right:24}
${_( 'Gift Card' ) + ':'}
${order.giftcard|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( 'Summary' )}
${_( 'Total' ) + ':'}
${clerk.summary.item_subtotal|viviFormatPrices:true|right:24}
${_( 'Add-on Tax' ) + ':'}
${clerk.summary.tax_subtotal|viviFormatPrices:true|right:24}
${_( 'Surcharge' ) + ':'}
${clerk.summary.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( 'Discount' ) + ':'}
${clerk.summary.discount_subtotal|viviFormatPrices:true|right:24}
${_( 'Payment' ) + ':'}
${clerk.summary.total|viviFormatPrices:true|right:24}
${_( 'Cash' ) + ':'}
${clerk.summary.cash|default:0|viviFormatPrices:true|right:24}
${_( 'Check' ) + ':'}
${clerk.summary.check|viviFormatPrices:true|right:24}
${_( 'Credit Card' ) + ':'}
${clerk.summary.creditcard|default:0|viviFormatPrices:true|right:24}
${_( 'Coupon' ) + ':'}
${clerk.summary.coupon|default:0|viviFormatPrices:true|right:24}
${_( 'Gift Card' ) + ':'}
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
