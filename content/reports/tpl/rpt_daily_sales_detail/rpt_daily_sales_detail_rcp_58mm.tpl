[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( 'Terminal' ) + ': '}${head.store.terminal_no}
${_( 'Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for detail in body}
------------------------
${_( 'Term_No.' )}:
${detail.terminal_no|right:24}
${_( 'Time' ) + ':'}
${detail.Order.Time|right:24}
${_( 'Sequence' ) + ':'}
${detail.sequence|right:24}
${_( 'Guests' ) + ':'}
${detail.no_of_customers|right:24}
${_( 'Items' ) + ':'}
${detail.items_count|right:24}
${_( 'Total' ) + ':'}
${detail.item_subtotal|default:0|viviFormatPrices:true|right:24}
${_( 'Add-on Tax' ) + ':'}
${detail.tax_subtotal|default:0|viviFormatPrices:true|right:24}
${_( 'Surcharge' ) + ':'}
${detail.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${_( 'Discount' ) + ':'}
${detail.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${_( 'Payment' ) + ':'}
${detail.total|default:0|viviFormatPrices:true|right:24}
{for items in detail.OrderItem}
------------------------
${_( 'Product No.' ) + ':'}
${items.product_no|right:24}
${_( 'Product Name' ) + ':'}
${items.product_name|right:24}
${_( 'Price' ) + ':'}
${items.current_price|right:24}
${_( 'Quantity' ) + ':'}
${items.current_qty|right:24}
${_( 'Total' ) + ':'}
${items.current_subtotal|right:24}
{/for}
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
