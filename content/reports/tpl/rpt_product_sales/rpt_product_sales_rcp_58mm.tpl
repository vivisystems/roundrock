[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shiftno_label}${queryFormLabel.shiftno}
${queryFormLabel.periodtype_label}${queryFormLabel.periodtype}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:24}
{for category in body.department}
------------------------
${category.no} - ${category.name}
{for item in category.orderItems}
------------------------
${_( '(rpt)Product Number' ) + ':'|left:24}
${item.product_no|right:24}
${_( '(rpt)Product Name' ) + ':'|left:24}
${item.product_name|right:24}
${_( '(rpt)Average Net Price' ) + ':'|left:24}
${item.avg_price|viviFormatPrices:true|right:24}
${_( '(rpt)Quantities Sold' ) + ':'|left:24}
${item.qty|format:0|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${item.gross|viviFormatPrices:true|right:24}
${_( '(rpt)Net Sales' ) + ':'}
${item.net|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ': '}${category.orderItems.length|format:0}
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Quantities Sold' ) + ':'}
${category.summary.qty|format:0|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${category.summary.gross|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Net Sales' ) + ':'}
${category.summary.net|default:0|viviFormatPrices:true|right:24}
{/for}
{for category in body.group}
------------------------
${category.name}
{for item in category.orderItems}
------------------------
${_( '(rpt)Product Number' ) + ':'|left:24}
${item.product_no|right:24}
${_( '(rpt)Product Name' ) + ':'|left:24}
${item.product_name|right:24}
${_( '(rpt)Average Net Price' ) + ':'|left:24}
${item.avg_price|viviFormatPrices:true|right:24}
${_( '(rpt)Quantities Sold' ) + ':'|left:24}
${item.qty|format:0|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${item.gross|viviFormatPrices:true|right:24}
${_( '(rpt)Net Sales' ) + ':'}
${item.net|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ': '}${category.orderItems.length|format:0}
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Quantities Sold' ) + ':'}
${category.summary.qty|format:0|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${category.summary.gross|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Net Sales' ) + ':'}
${category.summary.net|default:0|viviFormatPrices:true|right:24}
{/for}
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
