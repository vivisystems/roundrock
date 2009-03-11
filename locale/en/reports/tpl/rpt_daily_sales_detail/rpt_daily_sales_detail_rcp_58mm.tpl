[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

Terminal: ${head.store.terminal_no}
Clerk: ${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for detail in body}
------------------------
Term_No.:
${detail.terminal_no|right:24}
Time:
${detail.Order.Time|right:24}
Sequence:
${detail.sequence|right:24}
Guests:
${detail.no_of_customers|right:24}
Items:
${detail.items_count|right:24}
Total:
${detail.item_subtotal|default:0|viviFormatPrices:true|right:24}
Add-on Tax:
${detail.tax_subtotal|default:0|viviFormatPrices:true|right:24}
Surcharge:
${detail.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
Discount:
${detail.discount_subtotal|default:0|viviFormatPrices:true|right:24}
Payment:
${detail.total|default:0|viviFormatPrices:true|right:24}
{for items in detail.OrderItem}
------------------------
Product No.:
${items.product_no|right:24}
Product Name:
${items.product_name|right:24}
Price:
${items.current_price|right:24}
Quantity:
${items.current_qty|right:24}
Total:
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
