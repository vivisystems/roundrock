[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}

${head.title|center:24}
{for category in body}
------------------------
${_( '(rpt)Department No.' ) + ':'}
${category.no|right:24}
${_( '(rpt)Department Name' ) + ':'}
${category.name|right:24}
{for plu in category.plu}
------------------------
${_( '(rpt)Product No.' ) + ':'}
${plu.no|right:24}
${_( '(rpt)Product' ) + ':'}
${plu.name|right:24}
${_( '(rpt)Barcode' ) + ':'}
${plu.barcode|right:24}
${_( '(rpt)Tax' ) + ':'}
${plu.rate|right:24}
${_( '(rpt)Stock' ) + ':'}
${plu.stock|right:24}
${_( '(rpt)Safe Stock' ) + ':'}
${plu.min_stock|right:24}
{/for}
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
