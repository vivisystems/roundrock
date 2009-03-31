[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ':'} ${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for detail in body}
------------------------------------------
${_( '(rpt)Term_No.' )|left:8} ${_( '(rpt)Time' )|left:10} ${_( '(rpt)Sequence' )|left:8} ${_( '(rpt)Guests' )|left:7} ${_( '(rpt)Items' )|left:5}
-------- ---------- -------- ------- -----
${detail.terminal_no|left:8} ${detail.Order.Time|left:10} ${detail.sequence|right:8} ${detail.no_of_customers|right:7} ${detail.items_count|right:5}
------------------------------------------
${_( '(rpt)Total' ) + ':'|left:15}${detail.item_subtotal|default:0|viviFormatPrices:true}
${_( '(rpt)Add-on Tax' ) + ':'|left:15}${detail.tax_subtotal|default:0|viviFormatPrices:true}
${_( '(rpt)Surcharge' ) + ':'|left:15}${detail.surcharge_subtotal|default:0|viviFormatPrices:true}
${_( '(rpt)Discount' ) + ':'|left:15}${detail.discount_subtotal|default:0|viviFormatPrices:true}
${_( '(rpt)Payment' ) + ':'|left:15}${detail.total|default:0|viviFormatPrices:true}
{for items in detail.OrderItem}
------------------------------------------
${'  ' + _( '(rpt)Product No.' ) + ':'|left:15}${items.product_no}
${'  ' + _( '(rpt)Product Name' ) + ':'|left:15}${items.product_name}
${'  ' + _( '(rpt)Price' ) + ':'|left:15}${items.current_price}
${'  ' + _( '(rpt)Quantity' ) + ':'|left:15}${items.current_qty}
${'  ' + _( '(rpt)Total' ) + ':'|left:15}${items.current_subtotal}
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
