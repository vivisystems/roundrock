[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( 'Terminal' ) + ':'} ${head.store.terminal_no + ' '|left:11}${_( 'Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for detail in body}
------------------------------------------
${_( 'Term_No.' )|left:8} ${_( 'Time' )|left:10} ${_( 'Sequence' )|left:8} ${_( 'Guests' )|left:7} ${_( 'Items' )|left:5}
-------- ---------- -------- ------- -----
${detail.terminal_no|left:8} ${detail.Order.Time|left:10} ${detail.sequence|right:8} ${detail.no_of_customers|right:7} ${detail.items_count|right:5}
------------------------------------------
${_( 'Total' ) + ':'|left:15}${detail.item_subtotal|default:0|viviFormatPrices:true}
${_( 'Add-on Tax' ) + ':'|left:15}${detail.tax_subtotal|default:0|viviFormatPrices:true}
${_( 'Surcharge' ) + ':'|left:15}${detail.surcharge_subtotal|default:0|viviFormatPrices:true}
${_( 'Discount' ) + ':'|left:15}${detail.discount_subtotal|default:0|viviFormatPrices:true}
${_( 'Payment' ) + ':'|left:15}${detail.total|default:0|viviFormatPrices:true}
{for items in detail.OrderItem}
------------------------------------------
${'  ' + _( 'Product No.' ) + ':'|left:15}${items.product_no}
${'  ' + _( 'Product Name' ) + ':'|left:15}${items.product_name}
${'  ' + _( 'Price' ) + ':'|left:15}${items.current_price}
${'  ' + _( 'Quantity' ) + ':'|left:15}${items.current_qty}
${'  ' + _( 'Total' ) + ':'|left:15}${items.current_subtotal}
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
