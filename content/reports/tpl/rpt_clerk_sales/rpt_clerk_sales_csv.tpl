"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

{for clerk in body}
${clerk.name}
"${_( '(rpt)Term_No.' )}","${_( clerk.associated_clerk )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Total' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Payment' )}","${_( '(rpt)Cash' )}","${_( '(rpt)Check' )}","${_( '(rpt)Credit Card' )}","${_( '(rpt)Coupon' )}","${_( '(rpt)Gift Card' )}"
{for order in clerk.orders}
"${order.terminal_no}",{if clerk.associated_clerk == 'Proceeds Clerk'}"${order.proceeds_clerk_displayname}",{/if}{if clerk.associated_clerk == 'Service Clerk'}"${order.service_clerk_displayname}",{/if}"${order.transaction_created|unixTimeToString:'yyyy-M-d'}","${order.sequence}","${order.item_subtotal|viviFormatPrices:true}","${order.tax_subtotal|viviFormatPrices:true}","${order.surcharge_subtotal|viviFormatPrices:true}","${order.discount_subtotal|viviFormatPrices:true}","${order.total|viviFormatPrices:true}","${order.cash|default:0|viviFormatPrices:true}","${order.check|default:0|viviFormatPrices:true}","${order.creditcard|default:0|viviFormatPrices:true}","${order.coupon|default:0|viviFormatPrices:true}","${order.giftcard|default:0|viviFormatPrices:true}"
{/for}
"","","","${_( '(rpt)Summary' ) + ':'}","${clerk.summary.item_subtotal|viviFormatPrices:true}","${clerk.summary.tax_subtotal|viviFormatPrices:true}","${clerk.summary.surcharge_subtotal|viviFormatPrices:true}","${clerk.summary.discount_subtotal|viviFormatPrices:true}","${clerk.summary.total|viviFormatPrices:true}","${clerk.summary.cash|viviFormatPrices:true}","${clerk.summary.check|viviFormatPrices:true}","${clerk.summary.creditcard|viviFormatPrices:true}","${clerk.summary.coupon|viviFormatPrices:true}","${clerk.summary.giftcard|viviFormatPrices:true}"
{/for}
