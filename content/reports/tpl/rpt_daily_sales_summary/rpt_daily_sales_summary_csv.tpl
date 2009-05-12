"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

"${_( '(rpt)Terminal' )}","${_( '(rpt)Time' )}","${_( '(rpt)Guests' )}","${_( '(rpt)Items' )}", "${_( '(rpt)Total' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Promotion' )}","${_( '(rpt)Revalue' )}","${_( '(rpt)Payment' )}","${_( '(rpt)Cash' )}","${_( '(rpt)Check' )}","${_( '(rpt)Credit Card' )}","${_( '(rpt)Coupon' )}","${_( '(rpt)Gift Card' )}"
{for detail in body}
"${detail.terminal_no}","${detail.date}","${detail.no_of_customers}","${detail.items_count}","${detail.item_subtotal|default:0|viviFormatPrices:true}","${detail.tax_subtotal|default:0|viviFormatTaxes:true}","${detail.surcharge_subtotal|default:0|viviFormatPrices:true}","${detail.discount_subtotal|default:0|viviFormatPrices:true}","${detail.promotion_subtotal|default:0|viviFormatPrices:true}","${detail.revalue_subtotal|default:0|viviFormatPrices:true}","${detail.total|default:0|viviFormatPrices:true}","${detail.cash|default:0|viviFormatPrices:true}","${detail.check|default:0|viviFormatPrices:true}","${detail.creditcard|default:0|viviFormatPrices:true}","${detail.coupon|default:0|viviFormatPrices:true}","${detail.giftcard|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Records Found' ) + ': ' + body.length}","${_( '(rpt)Summary' ) + ':'}","${foot.foot_datas.guests}","${foot.foot_datas.items}","${foot.foot_datas.item_subtotal|viviFormatPrices:true}","${foot.foot_datas.tax_subtotal|viviFormatTaxes:true}","${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}","${foot.foot_datas.discount_subtotal|viviFormatPrices:true}","${foot.foot_datas.promotion_subtotal|viviFormatPrices:true}","${foot.foot_datas.revalue_subtotal|viviFormatPrices:true}","${foot.foot_datas.total|viviFormatPrices:true}","${foot.foot_datas.cash|viviFormatPrices:true}","${foot.foot_datas.check|viviFormatPrices:true}","${foot.foot_datas.creditcard|viviFormatPrices:true}","${foot.foot_datas.coupon|viviFormatPrices:true}","${foot.foot_datas.giftcard|viviFormatPrices:true}"
