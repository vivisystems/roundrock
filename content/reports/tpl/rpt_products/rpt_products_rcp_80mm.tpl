[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}

${head.title|center:42}
{for category in body}
------------------------------------------
${category.no} - ${category.name}
{for plu in category.plu}
------------------------------------------
${_( '(rpt)Product No.' ) + ':'|left:14}${plu.no}
${_( '(rpt)Product' ) + ':'|left:14}${plu.name}
${_( '(rpt)Barcode' ) + ':'|left:14}${plu.barcode}
${_( '(rpt)Tax' ) + ':'|left:14}${plu.rate}
${_( '(rpt)Stock' ) + ':'|left:14}${plu.stock}
${_( '(rpt)Safe Stock' ) + ':'|left:14}${plu.min_stock}
{/for}
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
