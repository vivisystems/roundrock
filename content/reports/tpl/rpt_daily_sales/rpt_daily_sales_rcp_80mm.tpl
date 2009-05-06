[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
------------------------------------------
${_( '(rpt)Terminal' )|left:8}  ${_( '(rpt)Time' )|left:16}  ${_( '(rpt)Sequence' )|left:14}
--------  ----------  --------------------
{for detail in body}
${detail.terminal_no|left:8}  ${detail.time|unixTimeToString|left:16}  ${detail.sequence|left:14}
${'    ' + _( '(rpt)Service' ) + ': '}${detail.service_clerk_displayname|viviFormatPrices:true}
${'    ' + _( '(rpt)Proceeds' ) + ': '}${detail.proceeds_clerk_displayname|viviFormatPrices:true}
${'    ' + _( '(rpt)Total' ) + ': '}${detail.item_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Add-on Tax' ) + ': '}${detail.tax_subtotal|viviFormatTaxes:true}
${'    ' + _( '(rpt)Surcharge' ) + ': '}${detail.surcharge_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Discount' ) + ': '}${detail.discount_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Promotion' ) + ': '}${detail.promotion_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Revalue' ) + ': '}${detail.revalue_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Payment' ) + ': '}${detail.total|viviFormatPrices:true}
${'    ' + _( '(rpt)Cash' ) + ': '}${detail.cash|default:0|viviFormatPrices:true}
${'    ' + _( '(rpt)Check' ) + ': '}${detail.check|viviFormatPrices:true}
${'    ' + _( '(rpt)Credit Card' ) + ': '}${detail.creditcard|default:0|viviFormatPrices:true}
${'    ' + _( '(rpt)Coupon' ) + ': '}${detail.coupon|default:0|viviFormatPrices:true}
${'    ' + _( '(rpt)Gift Card' ) + ': '}${detail.giftcard|viviFormatPrices:true}
{/for}
------------------------------------------
${_( '(rpt)Summary' )}
${'    ' + _( '(rpt)Total' ) + ': '}${foot.foot_datas.item_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Add-on Tax' ) + ': '}${foot.foot_datas.tax_subtotal|viviFormatTaxes:true}
${'    ' + _( '(rpt)Surcharge' ) + ': '}${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Discount' ) + ': ' }${foot.foot_datas.discount_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Promotion' ) + ': ' }${foot.foot_datas.promotion_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Revalue' ) + ': ' }${foot.foot_datas.revalue_subtotal|viviFormatPrices:true}
${'    ' + _( '(rpt)Payment' ) + ': '}${foot.foot_datas.total|viviFormatPrices:true}
${'    ' + _( '(rpt)Cash' ) + ': '}${foot.foot_datas.cash|default:0|viviFormatPrices:true}
${'    ' + _( '(rpt)Check' ) + ': '}${foot.foot_datas.check|viviFormatPrices:true}
${'    ' + _( '(rpt)Credit Card' ) + ': '}${foot.foot_datas.creditcard|default:0|viviFormatPrices:true}
${'    ' + _( '(rpt)Coupon' ) + ': '}${foot.foot_datas.coupon|default:0|viviFormatPrices:true}
${'    ' + _( '(rpt)Gift Card' ) + ': '}${foot.foot_datas.giftcard|viviFormatPrices:true}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
