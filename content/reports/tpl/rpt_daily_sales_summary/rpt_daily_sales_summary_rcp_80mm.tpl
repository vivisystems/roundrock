[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shift_no_label}${queryFormLabel.shift_no}
${queryFormLabel.period_type_label}${queryFormLabel.period_type}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:42}
{for detail in body}
------------------------------------------
${ _( '(rpt)Terminal' ) + ':'|left:17}${detail.terminal_no|right:24}
${ _( '(rpt)Time' ) + ':'|left:17}${detail.date|right:24}
${'    ' + _( '(rpt)Number of Guests' ) + ':'|left:17}${detail.no_of_customers|default:0|format:0|right:24}
${'    ' + _( '(rpt)Number of Items' ) + ':'|left:17}${detail.qty_subtotal|default:0|format:0|right:24}
${'    ' + _( '(rpt)Gross Sales' ) + ':'|left:17}${detail.item_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Add-on Tax' ) + ':'|left:17}${detail.tax_subtotal|default:0|viviFormatTaxes:true|right:24}
${'    ' + _( '(rpt)Surcharge' ) + ':'|left:17}${detail.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Discount' ) + ':'|left:17}${detail.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Promotion' ) + ':'|left:17}${detail.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Revalue' ) + ':'|left:17}${detail.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Total' ) + ':'|left:17}${detail.total|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Payment' ) + ':'|left:17}${detail.payment|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Cash' ) + ':'|left:17}${detail.cash|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Check' ) + ':'|left:17}${detail.check|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Credit Card' ) + ':'|left:17}${detail.creditcard|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Coupon' ) + ':'}${detail.coupon|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Gift Card' ) + ':'|left:17}${detail.giftcard|default:0|viviFormatPrices:true|right:24}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:17}${body.length|default:0|format:0|right:24}
[&CR]
------------------------------------------
${_( '(rpt)Summary' )}
${'    ' + _( '(rpt)Number of Guests' ) + ':'|left:17}${foot.foot_datas.guests|default:0|format:0|right:24}
${'    ' + _( '(rpt)Number of Items' ) + ':'|left:17}${foot.foot_datas.items|default:0|format:0|right:24}
${'    ' + _( '(rpt)Gross Sales' ) + ':'|left:17}${foot.foot_datas.item_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Add-on Tax' ) + ':'|left:17}${foot.foot_datas.tax_subtotal|default:0|viviFormatTaxes:true|right:24}
${'    ' + _( '(rpt)Surcharge' ) + ':'|left:17}${foot.foot_datas.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Discount' ) + ':'|left:17}${foot.foot_datas.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Promotion' ) + ':'|left:17}${foot.foot_datas.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Revalue' ) + ':'|left:17}${foot.foot_datas.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Total' ) + ':'|left:17}${foot.foot_datas.total|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Payment' ) + ':'|left:17}${foot.foot_datas.payment|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Cash' ) + ':'|left:17}${foot.foot_datas.cash|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Check' ) + ':'|left:17}${foot.foot_datas.check|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Credit Card' ) + ':'|left:17}${foot.foot_datas.creditcard|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Coupon' ) + ':'|left:17}${foot.foot_datas.coupon|default:0|viviFormatPrices:true|right:24}
${'    ' + _( '(rpt)Gift Card' ) + ':'|left:17}${foot.foot_datas.giftcard|default:0|viviFormatPrices:true|right:24}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
