"${head.store.name}"
"${head.store.branch}"
"${_( 'Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( 'Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( 'Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${_( 'Start' ) + ':'}","${head.start_time}"
"${_( 'End' ) + ':'}","${head.end_time}"

"${_( 'Terminal No.' )}","${_( 'Service Clerk' )}","${_( 'Status' )}","${_( 'Time' )}","${_( 'Sequence' )}","${_( 'Total' )}","${_( 'Add-on Tax' )}","${_( 'Surcharge' )}","${_( 'Discount' )}","${_( 'Payment' )}"
{for detail in body}
"${detail.terminal_no}","${detail.service_clerk_displayname}","${detail.status}","${detail.transaction_created|unixTimeToString:'yyyy-M-d'}","${detail.sequence}","${detail.item_subtotal|viviFormatPrices:true}","${detail.tax_subtotal|viviFormatPrices:true}","${detail.surcharge_subtotal|viviFormatPrices:true}","${detail.discount_subtotal|viviFormatPrices:true}","${detail.total|viviFormatPrices:true}"
{/for}
"","","","","${_( 'Summary' ) + ':'}","${foot.foot_datas.item_subtotal|viviFormatPrices:true}","${foot.foot_datas.tax_subtotal|viviFormatPrices:true}","${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}","${foot.foot_datas.discount_subtotal|viviFormatPrices:true}","${foot.foot_datas.total|viviFormatPrices:true}"
