[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for item in body}
------------------------
${_( '(rpt)No.' ) + ':'}
${item.product_no|right:24}
${_( '(rpt)Name' ) + ':'}
${item.product_name|right:24}
${_( '(rpt)Avg. Price' ) + ':'}
${item.avg_price|right:24}
${_( '(rpt)Qty.' ) + ':'}
${item.qty|right:24}
${_( '(rpt)Total' ) + ':'}
${item.total|right:24}
{/for}
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Qty.' ) + ':'}
${foot.qty|right:24}
${_( '(rpt)Total' ) + ':'}
${foot.summary|right:24}
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
