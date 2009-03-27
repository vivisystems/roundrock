"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

"${_( '(rpt)Term_No.' )}","${_( '(rpt)Service Clerk' )}","${_( '(rpt)Proceeds Clerk' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Total' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Payment' )}","${_( '(rpt)Cash' )}","${_( '(rpt)Check' )}","${_( '(rpt)Credit Card' )}","${_( '(rpt)Coupon' )}","${_( '(rpt)Gift Card' )}"
{for detail in body}
"${detail.terminal_no}","${detail.service_clerk_displayname}","${detail.proceeds_clerk_displayname}","${detail.transaction_created|unixTimeToString:'yyyy-M-d'}","${detail.Sequence}","${detail.item_subtotal|viviFormatPrices:true}","${detail.tax_subtotal|viviFormatPrices:true}","${detail.surcharge_subtotal|viviFormatPrices:true}","${detail.discount_subtotal|viviFormatPrices:true}","${detail.total|viviFormatPrices:true}","${detail.cash|default:0|viviFormatPrices:true}","${detail.check|default:0|viviFormatPrices:true}","${detail.creditcard|default:0|viviFormatPrices:true}","${detail.coupon|default:0|viviFormatPrices:true}","${detail.giftcard|default:0|viviFormatPrices:true}"
{/for}
"","","","","${_( '(rpt)Summary' ) + ':'}","${foot.foot_datas.item_subtotal|viviFormatPrices:true}","${foot.foot_datas.tax_subtotal|viviFormatPrices:true}","${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}","${foot.foot_datas.discount_subtotal|viviFormatPrices:true}","${foot.foot_datas.total|viviFormatPrices:true}","${foot.foot_datas.cash|viviFormatPrices:true}","${foot.foot_datas.check|viviFormatPrices:true}","${foot.foot_datas.creditcard|viviFormatPrices:true}","${foot.foot_datas.coupon|viviFormatPrices:true}","${foot.foot_datas.giftcard|viviFormatPrices:true}"
