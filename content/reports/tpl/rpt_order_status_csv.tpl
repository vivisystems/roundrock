"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Printed Time:","${foot.gen_time}"
"Start:","${head.start_time}"
"End:","${head.end_time}"

"Terminal No.","Service Clerk","Status","Time","Sequence","Invoice No.","Total","Add-on Tax","Surcharge","Discount","Payment"
{for detail in body}
"${detail.terminal_no}","${detail.service_clerk_displayname}","${detail.status}","${detail.transaction_created|unixTimeToString:'yyyy-M-d'}","${detail.sequence}","${detail.invoice_no}","${detail.item_subtotal|viviFormatPrices:true}","${detail.tax_subtotal|viviFormatPrices:true}","${detail.surcharge_subtotal|viviFormatPrices:true}","${detail.discount_subtotal|viviFormatPrices:true}","${detail.total|viviFormatPrices:true}"
{/for}
"","","","","","Summary:","${foot.foot_datas.item_subtotal|viviFormatPrices:true}","${foot.foot_datas.tax_subtotal|viviFormatPrices:true}","${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}","${foot.foot_datas.discount_subtotal|viviFormatPrices:true}","${foot.foot_datas.total|viviFormatPrices:true}"
