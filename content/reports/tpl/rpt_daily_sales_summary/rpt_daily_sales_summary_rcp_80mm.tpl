[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for detail in body}
------------------------------------------
${'    ' + _( '(rpt)Terminal' ) + ':'|left:17}${detail.terminal_no}
${'    ' + _( '(rpt)Time' ) + ':'|left:17}${detail.date}
${'    ' + _( '(rpt)Total' ) + ':'|left:17}${detail.item_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Add-on Tax' ) + ':'|left:17}${detail.tax_subtotal|viviFormatTaxes:true}
${'    ' + _( '(rpt)Surcharge' ) + ':'|left:17}${detail.surcharge_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Discount' ) + ':'|left:17}${detail.discount_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Promotion' ) + ':'|left:17}${detail.promotion_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Revalue' ) + ':'|left:17}${detail.revalue_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Payment' ) + ':'|left:17}${detail.total|viviFormatPrices:true}
${'    ' + _( '(rpt)Cash' ) + ':'|left:17}${detail.cash|default:0|viviFormatPrices:true}
${'    ' + _( '(rpt)Check' ) + ':'|left:17}${detail.check|viviFormatPrices:true}
${'    ' + _( '(rpt)Credit Card' ) + ':'|left:17}${detail.creditcard|default:0|viviFormatPrices:true}
${'    ' + _( '(rpt)Coupon' ) + ':'}${detail.coupon|default:0|viviFormatPrices:true}
${'    ' + _( '(rpt)Gift Card' ) + ':'|left:17}${detail.giftcard|viviFormatPrices:true}
{/for}
------------------------------------------
${_( '(rpt)Summary' )}
${'    ' + _( '(rpt)Total' ) + ':'|left:17}${foot.foot_datas.item_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Add-on Tax' ) + ':'|left:17}${foot.foot_datas.tax_subtotal|viviFormatTaxes:true}
${'    ' + _( '(rpt)Surcharge' ) + ':'|left:17}${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Discount' ) + ':'|left:17}${foot.foot_datas.discount_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Promotion' ) + ':'|left:17}${foot.foot_datas.promotion_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Revalue' ) + ':'|left:17}${foot.foot_datas.revalue_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Payment' ) + ':'|left:17}${foot.foot_datas.total|viviFormatPrices:true}
${'    ' + _( '(rpt)Cash' ) + ':'|left:17}${foot.foot_datas.cash|default:0|viviFormatPrices:true}
${'    ' + _( '(rpt)Check' ) + ':'|left:17}${foot.foot_datas.check|viviFormatPrices:true}
${'    ' + _( '(rpt)Credit Card' ) + ':'|left:17}${foot.foot_datas.creditcard|default:0|viviFormatPrices:true}
${'    ' + _( '(rpt)Coupon' ) + ':'|left:17}${foot.foot_datas.coupon|default:0|viviFormatPrices:true}
${'    ' + _( '(rpt)Gift Card' ) + ':'|left:17}${foot.foot_datas.giftcard|viviFormatPrices:true}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
