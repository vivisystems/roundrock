"${head.store.name}"
"${head.store.branch}"
"${_( 'Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( 'Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( 'Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${_( 'Start' ) + ':'}","${head.start_time}"
"${_( 'End' ) + ':'}","${head.end_time}"

"${_( 'Term_No.' )}","${_( 'Time' )}","${_( 'Sequence' )}","${_( 'Total' )}","${_( 'Add-on Tax' )}","${_( 'Surcharge' )}","${_( 'Discount' )}","${_( 'Payment' )}","${_( 'Guests' )}","${_( 'Items' )}"
{for detail in body}
"${detail.terminal_no}","${detail.Order.Time}","${detail.sequence}","${detail.item_subtotal|default:0|viviFormatPrices:true}","${detail.tax_subtotal|default:0|viviFormatPrices:true}","${detail.surcharge_subtotal|default:0|viviFormatPrices:true}","${detail.discount_subtotal|default:0|viviFormatPrices:true}","${detail.total|default:0|viviFormatPrices:true}","${detail.no_of_customers}","${detail.items_count}"
{for items in detail.OrderItem}
"","","${items.product_no}","${items.product_name}","${items.current_price}","${items.current_qty}","${items.current_subtotal}"
{/for}
"",""
{/for}
