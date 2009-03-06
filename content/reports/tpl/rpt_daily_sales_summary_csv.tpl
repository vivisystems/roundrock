"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Printed Time:","${foot.gen_time}"
"Start:","${head.start_time}"
"End:","${head.end_time}"

"Term_No.","Total","Add-on Tax","Surcharge","Discount","Payment","Cash","Check","Credit Card","Coupon","Gift Card"
{for detail in body}
"${detail.terminal_no}","${detail.item_subtotal|viviFormatPrices:true}","${detail.tax_subtotal|viviFormatPrices:true}","${detail.surcharge_subtotal|viviFormatPrices:true}","${detail.discount_subtotal|viviFormatPrices:true}","${detail.total|viviFormatPrices:true}","${detail.cash|default:0|viviFormatPrices:true}","${detail.check|default:0|viviFormatPrices:true}","${detail.creditcard|default:0|viviFormatPrices:true}","${detail.coupon|default:0|viviFormatPrices:true}","${detail.giftcard|default:0|viviFormatPrices:true}"
{/for}
"Summary:","${foot.foot_datas.item_subtotal|viviFormatPrices:true}","${foot.foot_datas.tax_subtotal|viviFormatPrices:true}","${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}","${foot.foot_datas.discount_subtotal|viviFormatPrices:true}","${foot.foot_datas.total|viviFormatPrices:true}","${foot.foot_datas.cash|viviFormatPrices:true}","${foot.foot_datas.check|viviFormatPrices:true}","${foot.foot_datas.creditcard|viviFormatPrices:true}","${foot.foot_datas.coupon|viviFormatPrices:true}","${foot.foot_datas.giftcard|viviFormatPrices:true}"
