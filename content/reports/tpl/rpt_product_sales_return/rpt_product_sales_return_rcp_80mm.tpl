[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shiftno_label}${queryFormLabel.shiftno}
${queryFormLabel.periodtype_label}${queryFormLabel.periodtype}
${queryFormLabel.returntype_label}${queryFormLabel.returntype}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}
${queryFormLabel.database_label}${queryFormLabel.database}

${head.title|center:42}
{for category in body}
------------------------------------------
${category.no} - ${category.name}
{for item in category.orderItems}
------------------------------------------
${_( '(rpt)Product Number' ) + ':'|left:20}${item.product_no|right:22}
${_( '(rpt)Product Name' ) + ':'|left:20}${item.product_name|right:22}
${_( '(rpt)Average Price' ) + ':'|left:20}${item.avg_price|viviFormatPrices:true|right:22}
{if item.units > 0}
${_( '(rpt)Units Returned' ) + ':'|left:20}${item.units|format:0|right:22}
{/if}
{if item.quantity != ''}
${_( '(rpt)Quantity Returned' ) + ':'|left:20}${item.quantity|right:22}
{/if}
${_( '(rpt)Gross Returns' ) + ':'|left:20}${item.gross|viviFormatPrices:true|right:22}
${_( '(rpt)Net Returns' ) + ':'|left:20}${item.net|viviFormatPrices:true|right:22}
{if item.order_sequence}
${_( '(rpt)Order Sequence' ) + ':'|left:20}${item.order_sequence|right:22}
{/if}
{if item.status == 1}
${_( '(rpt)Return Type' ) + ':'|left:20}${_('(rpt)return type item')|right:22}
{elseif item.status == -2}
${_( '(rpt)Return Type' ) + ':'|left:20}${_('(rpt)return type order')|right:22}
{/if}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:20}${category.orderItems.length|format:0|right:22}
------------------------------------------
${_( '(rpt)Summary' )}
{if category.summary.units > 0}
${_( '(rpt)Units Returned' ) + ':'|left:20}${category.summary.units|format:0|right:22}
{/if}
${_( '(rpt)Gross Returns' ) + ':'|left:20}${category.summary.gross|viviFormatPrices:true|right:22}
${_( '(rpt)Net Returns' ) + ':'|left:20}${category.summary.net|viviFormatPrices:true|right:22}
{/for}
------------------------
${_( '(rpt)Total Records Found:' ) + ': '|left:25}${foot.record|format:0|right:17}
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Quantities Sold' ) + ':'|left:16}${foot.total_summary|format:0|right:26}
${_( '(rpt)Gross Sales' ) + ':'|left:16}${foot.total_gross|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Net Sales' ) + ':'|left:16}${foot.total_net|default:0|viviFormatPrices:true|right:26}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
