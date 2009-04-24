"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

"${_( '(rpt)Terminal No.' )}","${_( '(rpt)Service Clerk' )}","${_( '(rpt)Status' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Total' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Promotion' )}","${_( '(rpt)Revalue' )}","${_( '(rpt)Payment' )}"
{for detail in body}
"${detail.terminal_no}","${detail.service_clerk_displayname}","${detail.status}","${detail.transaction_created|unixTimeToString}","${detail.sequence}","${detail.item_subtotal|viviFormatPrices:true}","${detail.tax_subtotal|viviFormatPrices:true}","${detail.surcharge_subtotal|viviFormatPrices:true}","${detail.discount_subtotal|viviFormatPrices:true}","${detail.promotion_subtotal|viviFormatPrices:true}","${detail.revalue_subtotal|viviFormatPrices:true}","${detail.total|viviFormatPrices:true}"
{/for}
"","","","","${_( '(rpt)Summary' ) + ':'}","${foot.foot_datas.item_subtotal|viviFormatPrices:true}","${foot.foot_datas.tax_subtotal|viviFormatPrices:true}","${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}","${foot.foot_datas.discount_subtotal|viviFormatPrices:true}","${foot.foot_datas.promotion_subtotal|viviFormatPrices:true}","${foot.foot_datas.revalue_subtotal|viviFormatPrices:true}","${foot.foot_datas.total|viviFormatPrices:true}"
