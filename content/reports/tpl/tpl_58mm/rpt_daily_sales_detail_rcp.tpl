[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for detail in body}
------------------------------------------
Term_No. Time       Sequence Guests  Items
-------- ---------- -------- ------- -----
${detail.terminal_no|left:8} ${detail.Order.Time|left:10} ${detail.sequence|right:8} ${detail.no_of_customers|right:7} ${detail.items_count|right:5}
------------------------------------------
Total:         ${detail.item_subtotal|default:0|viviFormatPrices:true}
Add-on Tax:    ${detail.tax_subtotal|default:0|viviFormatPrices:true}
Surcharge:     ${detail.surcharge_subtotal|default:0|viviFormatPrices:true}
Discount:      ${detail.discount_subtotal|default:0|viviFormatPrices:true}
Payment:       ${detail.total|default:0|viviFormatPrices:true}
{for items in detail.OrderItem}
------------------------------------------
  Product No.: ${items.product_no}
  Product Name:${items.product_name}
  Price:       ${items.current_price}
  Quantity:    ${items.current_qty}
  Total:       ${items.current_subtotal}
{/for}
{/for}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
