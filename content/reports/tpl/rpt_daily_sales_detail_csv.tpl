"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Printed Time:","${foot.gen_time}"
"Start:","${head.start_time}"
"End:","${head.end_time}"

"Term_No.","Time","Sequence","Total","Add-on Tax","Surcharge","Discount","Payment","Guests","Items"
{for detail in body}
"${detail.terminal_no}","${detail.Order.Time}","${detail.sequence}","${detail.item_subtotal|default:0|viviFormatPrices:true}","${detail.tax_subtotal|default:0|viviFormatPrices:true}","${detail.surcharge_subtotal|default:0|viviFormatPrices:true}","${detail.discount_subtotal|default:0|viviFormatPrices:true}","${detail.total|default:0|viviFormatPrices:true}","${detail.no_of_customers}","${detail.items_count}"
{for items in detail.OrderItem}
"","","${items.product_no}","${items.product_name}","${items.current_price}","${items.current_qty}","${items.current_subtotal}"
{/for}
"",""
{/for}
