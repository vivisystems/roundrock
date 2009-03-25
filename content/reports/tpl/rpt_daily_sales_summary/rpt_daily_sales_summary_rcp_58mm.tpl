[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( 'Terminal' ) + ': '}${head.store.terminal_no}
${_( 'Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for detail in body}
-----------------------
${_( 'Termianl No' ) + ':'}
${detail.terminal_no|right:24}
${_( 'Total' ) + ':'}
${detail.item_subtotal|viviFormatPrices:true|right:24}
${_( 'Add-on Tax' ) + ':'}
${detail.tax_subtotal|viviFormatPrices:true|right:24}
${_( 'Surcharge' ) + ':'}
${detail.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( 'Discount' ) + ':'}
${detail.discount_subtotal|viviFormatPrices:true|right:24}
${_( 'Payment' ) + ':'}
${detail.total|viviFormatPrices:true|right:24}
${_( 'Cash' ) + ':'}
${detail.cash|default:0|viviFormatPrices:true|right:24}
${_( 'Check' ) + ':'}
${detail.check|viviFormatPrices:true|right:24}
${_( 'Credit Card' ) + ':'}
${detail.creditcard|default:0|viviFormatPrices:true|right:24}
${_( 'Coupon' ) + ':'}
${detail.coupon|default:0|viviFormatPrices:true|right:24}
${_( 'Gift Card' ) + ':'}
${detail.giftcard|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( 'Summary' )}
${_( 'Total' ) + ':'}
${foot.foot_datas.item_subtotal|viviFormatPrices:true|right:24}
${_( 'Add-on Tax' ) + ':'}
${foot.foot_datas.tax_subtotal|viviFormatPrices:true|right:24}
${_( 'Surcharge' ) + ':'}
${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( 'Discount' ) + ':'}
${foot.foot_datas.discount_subtotal|viviFormatPrices:true|right:24}
${_( 'Payment' ) + ':'}
${foot.foot_datas.total|viviFormatPrices:true|right:24}
${_( 'Cash' ) + ':'}
${foot.foot_datas.cash|default:0|viviFormatPrices:true|right:24}
${_( 'Check' ) + ':'}
${foot.foot_datas.check|viviFormatPrices:true|right:24}
${_( 'Credit Card' ) + ':'}
${foot.foot_datas.creditcard|default:0|viviFormatPrices:true|right:24}
${_( 'Coupon' ) + ':'}
${foot.foot_datas.coupon|default:0|viviFormatPrices:true|right:24}
${_( 'Gift Card' ) + ':'}
${foot.foot_datas.giftcard|viviFormatPrices:true|right:24}
------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
