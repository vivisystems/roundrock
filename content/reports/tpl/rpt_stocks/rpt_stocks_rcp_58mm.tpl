[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}

${head.title|center:24}
{for category in body}
------------------------
${_( '(rpt)Department Number' ) + ':'}
${category.no|right:24}
${_( '(rpt)Department Name' ) + ':'}
${category.name|right:24}
{for plu in category.plu}
------------------------
${_( '(rpt)Product Number' ) + ':'}
${plu.no|right:24}
${_( '(rpt)Product Name' ) + ':'}
${plu.name|right:24}
${_( '(rpt)Stock Level' ) + ':'}
${plu.stock|right:24}
${_( '(rpt)Low Stock Threshold' ) + ':'}
${plu.min_stock|right:24}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ':'|left:16}${category.plu.length|format:0|right:8}
------------------------
{/for}
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
