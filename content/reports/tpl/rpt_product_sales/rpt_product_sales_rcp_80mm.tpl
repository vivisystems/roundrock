[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no + ' '|left:11}${_( 'Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for item in body}
------------------------------------------
${_( 'No.' ) + ':'}${item.product_no}
${_( 'Name' ) + ':'}${item.product_name}
${_( 'Avg. Price' ) + ':'}${item.avg_price}
${_( 'Qty.' ) + ':'}${item.qty}
${_( 'Total' ) + ':'}${item.total}
{/for}
------------------------------------------
${_( 'Summary' )}
${_( 'Qty.' ) + ':'}${foot.qty}
${_( 'Total' ) + ':'}${foot.summary}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
