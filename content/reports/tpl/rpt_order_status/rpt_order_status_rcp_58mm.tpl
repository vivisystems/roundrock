[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for detail in body}
------------------------
${_( '(rpt)Term_No.' ) + ':'}
${detail.terminal_no|right:24}
${_( '(rpt)Time' ) + ':'}
${detail.transaction_created|unixTimeToString:'yyyy-M-d'|right:24}
${_( '(rpt)rpt_sequence' ) + ':'}
${detail.sequence|right:24}
${_( '(rpt)Service Clerk' ) + ':'}
${detail.service_clerk_displayname|right:24}
${_( '(rpt)Status' ) + ':'}
${detail.status|right:24}
${_( '(rpt)Total' ) + ':'}
${detail.item_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${detail.tax_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${detail.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${detail.discount_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'}
${detail.total|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Total' ) + ':'}
${foot.foot_datas.item_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${foot.foot_datas.tax_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${foot.foot_datas.discount_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'}
${foot.foot_datas.total|viviFormatPrices:true|right:24}
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
