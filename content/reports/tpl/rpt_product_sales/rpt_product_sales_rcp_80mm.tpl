[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for category in body}
------------------------------------------
${category.no} - ${category.name}
{for item in category.orderItems}
------------------------------------------
${_( '(rpt)No.' ) + ':'}${item.product_no}
${_( '(rpt)Name' ) + ':'}${item.product_name}
${_( '(rpt)Avg. Price' ) + ':'}${item.avg_price}
${_( '(rpt)Qty.' ) + ':'}${item.qty}
${_( '(rpt)Total' ) + ':'}${item.total}
{/for}
------------------------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Qty.' ) + ':'|left:12}${category.summary.qty|default:0|right:30}
${_( '(rpt)Total' ) + ':'|left:12}${category.summary.total|default:0|viviFormatPrices:true|right:30}
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
