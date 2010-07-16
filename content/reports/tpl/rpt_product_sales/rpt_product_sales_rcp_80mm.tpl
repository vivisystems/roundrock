[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shiftno_label}${queryFormLabel.shiftno}
${queryFormLabel.periodtype_label}${queryFormLabel.periodtype}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:42}
{for category in body.department}
------------------------------------------
${category.no} - ${category.name}
{for item in category.orderItems}
------------------------------------------
${_( '(rpt)Product Number' ) + ':'|left:16}${item.product_no|right:26}
${_( '(rpt)Product Name' ) + ':'|left:16}${item.product_name|right:26}
${_( '(rpt)Average Net Price' ) + ':'|left:16}${item.avg_price|viviFormatPrices:true|right:26}
${_( '(rpt)Quantities Sold' ) + ':'|left:16}${item.qty|format:0|right:26}
${_( '(rpt)Gross Sales' ) + ':'|left:16}${item.gross|viviFormatPrices:true|right:26}
${_( '(rpt)Net Sales' ) + ':'|left:16}${item.net|viviFormatPrices:true|right:26}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:16}${category.orderItems.length|format:0|right:26}
------------------------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Quantities Sold' ) + ':'|left:16}${category.summary.qty|format:0|right:26}
${_( '(rpt)Gross Sales' ) + ':'|left:16}${category.summary.gross|viviFormatPrices:true|right:26}
${_( '(rpt)Net Sales' ) + ':'|left:16}${category.summary.net|viviFormatPrices:true|right:26}
{/for}
{for category in body.group}
------------------------------------------
${category.name}
{for item in category.orderItems}
------------------------------------------
${_( '(rpt)Product Number' ) + ':'|left:16}${item.product_no|right:26}
${_( '(rpt)Product Name' ) + ':'|left:16}${item.product_name|right:26}
${_( '(rpt)Average Net Price' ) + ':'|left:16}${item.avg_price|viviFormatPrices:true|right:26}
${_( '(rpt)Quantities Sold' ) + ':'|left:16}${item.qty|format:0|right:26}
${_( '(rpt)Gross Sales' ) + ':'|left:16}${item.gross|viviFormatPrices:true|right:26}
${_( '(rpt)Net Sales' ) + ':'|left:16}${item.net|viviFormatPrices:true|right:26}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:16}${category.orderItems.length|format:0|right:26}
------------------------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Quantities Sold' ) + ':'|left:16}${category.summary.qty|format:0|right:26}
${_( '(rpt)Gross Sales' ) + ':'|left:16}${category.summary.gross|viviFormatPrices:true|right:26}
${_( '(rpt)Net Sales' ) + ':'|left:16}${category.summary.net|viviFormatPrices:true|right:26}
{/for}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
