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
${_( '(rpt)Term_No.' )}:
${detail.terminal_no|right:24}
${_( '(rpt)Time' ) + ':'}
${detail.Order.time|unixTimeToString|right:24}
${_( '(rpt)Sequence' ) + ':'}
${detail.sequence|right:24}
${_( '(rpt)Guests' ) + ':'}
${detail.no_of_customers|right:24}
${_( '(rpt)Items' ) + ':'}
${detail.items_count|right:24}
${_( '(rpt)Total' ) + ':'}
${detail.item_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${detail.tax_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${detail.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${detail.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${detail.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${detail.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'}
${detail.total|default:0|viviFormatPrices:true|right:24}
{for items in detail.OrderItem}
------------------------
${_( '(rpt)Product No.' )}
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
