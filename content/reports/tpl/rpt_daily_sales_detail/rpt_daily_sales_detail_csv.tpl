"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

"${_( '(rpt)Term_No.' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Total' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Promotion' )}","${_( '(rpt)Revalue' )}","${_( '(rpt)Payment' )}","${_( '(rpt)Guests' )}","${_( '(rpt)Items' )}"
{for detail in body}
"${detail.terminal_no}","${detail.Order.time|unixTimeToString}","${detail.sequence}","${detail.item_subtotal|default:0|viviFormatPrices:true}","${detail.tax_subtotal|default:0|viviFormatPrices:true}","${detail.surcharge_subtotal|default:0|viviFormatPrices:true}","${detail.discount_subtotal|default:0|viviFormatPrices:true}","${detail.promotion_subtotal|default:0|viviFormatPrices:true}","${detail.revalue_subtotal|default:0|viviFormatPrices:true}","${detail.total|default:0|viviFormatPrices:true}","${detail.no_of_customers}","${detail.items_count}"
"","","","","${_( '(rpt)Product No.' )}","${_( '(rpt)Product Name' )}","${_( '(rpt)Tax Name' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Price' )}","${_( '(rpt)Quantity' )}","${_( '(rpt)Subtotal' )}"
{for items in detail.OrderItem}
"","","","","${items.product_no}","${items.product_name}","${items.tax_name}","${items.current_discount|default:0|viviFormatPrices:true}","${items.current_surcharge|default:0|viviFormatPrices:true}","${items.current_price|default:0|viviFormatPrices:true}","${items.current_qty}","${items.current_subtotal|default:0|viviFormatPrices:true}"
{/for}
{/for}
"${_( '(rpt)Summary' ) + ':'}","","","${foot.foot_datas.item_subtotal|viviFormatPrices:true}","${foot.foot_datas.tax_subtotal|viviFormatPrices:true}","${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}","${foot.foot_datas.discount_subtotal|viviFormatPrices:true}","${foot.foot_datas.promotion_subtotal|viviFormatPrices:true}","${foot.foot_datas.revalue_subtotal|viviFormatPrices:true}","${foot.foot_datas.payment|viviFormatPrices:true}"
