[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shiftno_label}${queryFormLabel.shiftno}
${queryFormLabel.periodtype_label}${queryFormLabel.periodtype}
${queryFormLabel.returntype_label}${queryFormLabel.returntype}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:24}
{for category in body}
------------------------
${category.no} - ${category.name}
{for item in category.orderItems}
------------------------
${_( '(rpt)Product Number' ) + ':'|left:24}
${item.product_no|right:24}
${_( '(rpt)Product Name' ) + ':'|left:24}
${item.product_name|right:24}
${_( '(rpt)Average Price' ) + ':'|left:24}
${item.avg_price|viviFormatPrices:true|right:24}
{if item.units > 0}
${_( '(rpt)Units Returned' ) + ':'|left:24}
${item.units|format:0|right:24}
{/if}
{if item.quantity != ''}
${_( '(rpt)Quantity Returned' ) + ':'|left:24}
${item.quantity|right:24}
{/if}
${_( '(rpt)Gross Returns' ) + ':'}
${item.gross|viviFormatPrices:true|right:24}
${_( '(rpt)Net Returns' ) + ':'}
${item.net|viviFormatPrices:true|right:24}
{if item.order_sequence}
${_( '(rpt)Sequence' ) + ':'}
${item.order_sequence|right:24}
{/if}
{if item.status == 1}
${_( '(rpt)Return Type' ) + ':'}
${_('(rpt)return type item')|right:24}
{elseif item.status == -2}
${_( '(rpt)Return Type' ) + ':'}
${_('(rpt)return type order')|right:24}
{/if}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ': '}${category.orderItems.length|format:0}
------------------------
${_( '(rpt)Summary' )}
{if item.units > 0}
${_( '(rpt)Units Returned' ) + ':'}
${category.summary.units|format:0|right:24}
{/if}
${_( '(rpt)Gross Returns' ) + ':'}
${category.summary.gross|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Net Returns' ) + ':'}
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
