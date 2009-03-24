[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
------------------------------------------
${_( 'Term_No.' )|left:8}  ${_( 'Time' )|left:10}  ${_( 'Seqequence' )|left:20}
--------  ----------  --------------------
{for detail in body}
${detail.terminal_no|left:8}  ${detail.transaction_created|unixTimeToString:'yyyy-M-d'|left:10}  ${detail.sequence|left:20}
${'    ' + _( 'Service' ) + ': '}${detail.service_clerk_displayname|viviFormatPrices:true}
${'    ' + _( 'Proceeds' ) + ': '}${detail.proceeds_clerk_displayname|viviFormatPrices:true}
${'    ' + _( 'Total' ) + ': '}${detail.item_subtotal|viviFormatPrices:true}
${'    ' + _( 'Add-on Tax' ) + ': '}${detail.tax_subtotal|viviFormatPrices:true}
${'    ' + _( 'Surcharge' ) + ': '}${detail.surcharge_subtotal|viviFormatPrices:true}
${'    ' + _( 'Discount' ) + ': '}${detail.discount_subtotal|viviFormatPrices:true}
${'    ' + _( 'Payment' ) + ': '}${detail.total|viviFormatPrices:true}
${'    ' + _( 'Cash' ) + ': '}${detail.cash|default:0|viviFormatPrices:true}
${'    ' + _( 'Check' ) + ': '}${detail.check|viviFormatPrices:true}
${'    ' + _( 'Credit Card' ) + ': '}${detail.creditcard|default:0|viviFormatPrices:true}
${'    ' + _( 'Coupon' ) + ': '}${detail.coupon|default:0|viviFormatPrices:true}
${'    ' + _( 'Gift Card' ) + ': '}${detail.giftcard|viviFormatPrices:true}
{/for}
------------------------------------------
${_( 'Summary' )}
${'    ' + _( 'Total' ) + ': '}${foot.foot_datas.item_subtotal|viviFormatPrices:true}
${'    ' + _( 'Add-on Tax' ) + ': '}${foot.foot_datas.tax_subtotal|viviFormatPrices:true}
${'    ' + _( 'Surcharge' ) + ': '}${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}
${'    ' + _( 'Discount' ) + ': ' }${foot.foot_datas.discount_subtotal|viviFormatPrices:true}
${'    ' + _( 'Payment' ) + ': '}${foot.foot_datas.total|viviFormatPrices:true}
${'    ' + _( 'Cash' ) + ': '}${foot.foot_datas.cash|default:0|viviFormatPrices:true}
${'    ' + _( 'Check' ) + ': '}${foot.foot_datas.check|viviFormatPrices:true}
${'    ' + _( 'Credit Card' ) + ': '}${foot.foot_datas.creditcard|default:0|viviFormatPrices:true}
${'    ' + _( 'Coupon' ) + ': '}${foot.foot_datas.coupon|default:0|viviFormatPrices:true}
${'    ' + _( 'Gift Card' ) + ': '}${foot.foot_datas.giftcard|viviFormatPrices:true}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
