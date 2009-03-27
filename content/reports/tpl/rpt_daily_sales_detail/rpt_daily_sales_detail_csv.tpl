"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

"${_( '(rpt)Term_No.' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Total' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Payment' )}","${_( '(rpt)Guests' )}","${_( '(rpt)Items' )}"
{for detail in body}
"${detail.terminal_no}","${detail.Order.Time}","${detail.sequence}","${detail.item_subtotal|default:0|viviFormatPrices:true}","${detail.tax_subtotal|default:0|viviFormatPrices:true}","${detail.surcharge_subtotal|default:0|viviFormatPrices:true}","${detail.discount_subtotal|default:0|viviFormatPrices:true}","${detail.total|default:0|viviFormatPrices:true}","${detail.no_of_customers}","${detail.items_count}"
{for items in detail.OrderItem}
"","","${items.product_no}","${items.product_name}","${items.current_price}","${items.current_qty}","${items.current_subtotal}"
{/for}
"",""
{/for}
