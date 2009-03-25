[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( 'Terminal' ) + ': '}${head.store.terminal_no}
${_( 'Clerk' ) + ': '}${head.clerk_displayname}

${head.title|center:24}
{for category in body}
------------------------
${_( 'Department No.' ) + ':'}
${category.no|right:24}
${_( 'Department Name' ) + ':'}
${category.name|right:24}
{for plu in category.plu}
------------------------
${_( 'Product No.' ) + ':'}
${plu.no|right:24}
${_( 'Product' ) + ':'}
${plu.name|right:24}
${_( 'Barcode' ) + ':'}
${plu.barcode|right:24}
${_( 'Tax' ) + ':'}
${plu.rate|right:24}
${_( 'Stock' ) + ':'}
${plu.stock|right:24}
${_( 'Safe Stock' ) + ':'}
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
