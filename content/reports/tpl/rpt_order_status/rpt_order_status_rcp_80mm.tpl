[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
------------------------------------------
${_( '(rpt)Term_No.' )|left:8}  ${_( '(rpt)Time' )|left:16}  ${_( '(rpt)Sequence' )|left:14}
--------  ----------  --------------------
{for detail in body}
${detail.terminal_no|left:8}  ${detail.transaction_created|unixTimeToString|left:16}  ${detail.sequence|left:14}
${'  ' + _( '(rpt)Service Clerk' ) + ':'|left:16}${detail.service_clerk_displayname}
${'  ' + _( '(rpt)Status' ) + ':'|left:16}${detail.status}
${'  ' + _( '(rpt)Total' ) + ':'|left:16}${detail.item_subtotal|viviFormatPrices:true}
${'  ' + _( '(rpt)Add-on Tax' ) + ':'|left:16}${detail.tax_subtotal|viviFormatPrices:true}
${'  ' + _( '(rpt)Surcharge' ) + ':'|left:16}${detail.surcharge_subtotal|viviFormatPrices:true}
${'  ' + _( '(rpt)Discount' ) + ':'|left:16}${detail.discount_subtotal|viviFormatPrices:true}
${'  ' + _( '(rpt)Payment' ) + ':'|left:16}${detail.total|viviFormatPrices:true}
{/for}
------------------------------------------
${_( '(rpt)Summary' )}
${'  ' + _( '(rpt)Total' ) + ':'|left:16}${foot.foot_datas.item_subtotal|viviFormatPrices:true}
${'  ' + _( '(rpt)Add-on Tax' ) + ':'|left:16}${foot.foot_datas.tax_subtotal|viviFormatPrices:true}
${'  '+ _( '(rpt)Surcharge' ) + ':'|left:16}${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}
${'  ' + _( '(rpt)Discount' ) + ':'|left:16}${foot.foot_datas.discount_subtotal|viviFormatPrices:true}
${'  ' + _( '(rpt)Payment' ) + ':'|left:16}${foot.foot_datas.total|viviFormatPrices:true}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
