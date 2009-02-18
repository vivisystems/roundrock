"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Start:","${head.start_time}"
"End:","${head.end_time}"

"Term_No.","Time","Sequence","Invoice No","Total","Surcharge","Discount","Cash","Credit Card","Coupon"
{for detail in body}
"${detail.terminal_no}","${detail.transaction_created|unixTimeToString:'yyyy-M-d'}","${detail.sequence}","${detail.invoice_no}","${detail.total|viviFormatPrices:true}","${detail.surcharge_subtotal|viviFormatPrices:true}","${detail.discount_subtotal|viviFormatPrices:true}","${detail.cash|default:0|viviFormatPrices:true}","${detail.creditcard|default:0|viviFormatPrices:true}","${detail.coupon|default:0|viviFormatPrices:true}"
{/for}
"","","","Summary:","${foot.foot_datas.total|viviFormatPrices:true}","${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}","${foot.foot_datas.discount_subtotal|viviFormatPrices:true}","${foot.foot_datas.cash|viviFormatPrices:true}","${foot.foot_datas.creditcard|viviFormatPrices:true}","${foot.foot_datas.coupon|viviFormatPrices:true}"