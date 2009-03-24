[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( 'Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( 'Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for detail in body}
------------------------------------------
${'    ' + _( 'Termianl No' ) + ':'|left:17}${detail.terminal_no}
${'    ' + _( 'Total' ) + ':'|left:17}${detail.item_subtotal|viviFormatPrices:true}
${'    ' + _( 'Add-on Tax' ) + ':'|left:17}${detail.tax_subtotal|viviFormatPrices:true}
${'    ' + _( 'Surcharge' ) + ':'|left:17}${detail.surcharge_subtotal|viviFormatPrices:true}
${'    ' + _( 'Discount' ) + ':'|left:17}${detail.discount_subtotal|viviFormatPrices:true}
${'    ' + _( 'Payment' ) + ':'|left:17}${detail.total|viviFormatPrices:true}
${'    ' + _( 'Cash' ) + ':'|left:17}${detail.cash|default:0|viviFormatPrices:true}
${'    ' + _( 'Check' ) + ':'|left:17}${detail.check|viviFormatPrices:true}
${'    ' + _( 'Credit Card' ) + ':'|left:17}${detail.creditcard|default:0|viviFormatPrices:true}
${'    ' + _( 'Coupon' ) + ':'}${detail.coupon|default:0|viviFormatPrices:true}
${'    ' + _( 'Gift Card' ) + ':'|left:17}${detail.giftcard|viviFormatPrices:true}
{/for}
------------------------------------------
${_( 'Summary' )}
${'    ' + _( 'Total' ) + ':'|left:17}${foot.foot_datas.item_subtotal|viviFormatPrices:true}
${'    ' + _( 'Add-on Tax' ) + ':'|left:17}${foot.foot_datas.tax_subtotal|viviFormatPrices:true}
${'    ' + _( 'Surcharge' ) + ':'|left:17}${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}
${'    ' + _( 'Discount' ) + ':'|left:17}${foot.foot_datas.discount_subtotal|viviFormatPrices:true}
${'    ' + _( 'Payment' ) + ':'|left:17}${foot.foot_datas.total|viviFormatPrices:true}
${'    ' + _( 'Cash' ) + ':'|left:17}${foot.foot_datas.cash|default:0|viviFormatPrices:true}
${'    ' + _( 'Check' ) + ':'|left:17}${foot.foot_datas.check|viviFormatPrices:true}
${'    ' + _( 'Credit Card' ) + ':'|left:17}${foot.foot_datas.creditcard|default:0|viviFormatPrices:true}
${'    ' + _( 'Coupon' ) + ':'|left:17}${foot.foot_datas.coupon|default:0|viviFormatPrices:true}
${'    ' + _( 'Gift Card' ) + ':'|left:17}${foot.foot_datas.giftcard|viviFormatPrices:true}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
