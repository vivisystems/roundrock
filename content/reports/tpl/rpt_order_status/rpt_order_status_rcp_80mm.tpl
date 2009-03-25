[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( 'Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( 'Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
------------------------------------------
${_( 'Term_No.' )|left:8}  ${_( 'Time' )|left:10}  ${_( 'Sequence' )|left:20}
--------  ----------  --------------------
{for detail in body}
${detail.terminal_no|left:8}  ${detail.transaction_created|unixTimeToString:'yyyy-M-d'|left:10}  ${detail.sequence|left:20}
${'  ' + _( 'Service Clerk' ) + ':'|left:16}${detail.service_clerk_displayname}
${'  ' + _( 'Status' ) + ':'|left:16}${detail.status}
${'  ' + _( 'Total' ) + ':'|left:16}${detail.item_subtotal|viviFormatPrices:true}
${'  ' + _( 'Add-on Tax' ) + ':'|left:16}${detail.tax_subtotal|viviFormatPrices:true}
${'  ' + _( 'Surcharge' ) + ':'|left:16}${detail.surcharge_subtotal|viviFormatPrices:true}
${'  ' + _( 'Discount' ) + ':'|left:16}${detail.discount_subtotal|viviFormatPrices:true}
${'  ' + _( 'Payment' ) + ':'|left:16}${detail.total|viviFormatPrices:true}
{/for}
------------------------------------------
${_( 'Summary' )}
${'  ' + _( 'Total' ) + ':'|left:16}${foot.foot_datas.item_subtotal|viviFormatPrices:true}
${'  ' + _( 'Add-on Tax' ) + ':'|left:16}${foot.foot_datas.tax_subtotal|viviFormatPrices:true}
${'  '+ _( 'Surcharge' ) + ':'|left:16}${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}
${'  ' + _( 'Discount' ) + ':'|left:16}${foot.foot_datas.discount_subtotal|viviFormatPrices:true}
${'  ' + _( 'Payment' ) + ':'|left:16}${foot.foot_datas.total|viviFormatPrices:true}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
