"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Printed Time:","${foot.gen_time}"
"Start:","${head.start_time}"
"End:","${head.end_time}"

{for clerk in body}
${clerk.name}
"Term_No.","${clerk.associated_clerk}","Time","Sequence","Invoice No","Total","Add-on Tax","Surcharge","Discount","Payment","Cash","Check","Credit Card","Coupon","Gift Card"
{for order in clerk.orders}
"${order.terminal_no}",{if clerk.associated_clerk == 'Proceeds Clerk'}"${order.proceeds_clerk_displayname}",{/if}{if clerk.associated_clerk == 'Service Clerk'}"${order.service_clerk_displayname}",{/if}"${order.transaction_created|unixTimeToString:'yyyy-M-d'}","${order.sequence}","${order.invoice_no}","${order.item_subtotal|viviFormatPrices:true}","${order.tax_subtotal|viviFormatPrices:true}","${order.surcharge_subtotal|viviFormatPrices:true}","${order.discount_subtotal|viviFormatPrices:true}","${order.total|viviFormatPrices:true}","${order.cash|default:0|viviFormatPrices:true}","${order.check|default:0|viviFormatPrices:true}","${order.creditcard|default:0|viviFormatPrices:true}","${order.coupon|default:0|viviFormatPrices:true}","${order.giftcard|default:0|viviFormatPrices:true}"
{/for}
"","","","","Summary:","${clerk.summary.item_subtotal|viviFormatPrices:true}","${clerk.summary.tax_subtotal|viviFormatPrices:true}","${clerk.summary.surcharge_subtotal|viviFormatPrices:true}","${clerk.summary.discount_subtotal|viviFormatPrices:true}","${clerk.summary.total|viviFormatPrices:true}","${clerk.summary.cash|viviFormatPrices:true}","${clerk.summary.check|viviFormatPrices:true}","${clerk.summary.creditcard|viviFormatPrices:true}","${clerk.summary.coupon|viviFormatPrices:true}","${clerk.summary.giftcard|viviFormatPrices:true}"
{/for}
