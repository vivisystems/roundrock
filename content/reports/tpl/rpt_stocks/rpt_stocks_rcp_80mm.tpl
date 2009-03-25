[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( 'Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( 'Clerk' ) + ': '}${head.clerk_displayname|left:14}

${head.title|center:42}
------------------------------------------
{for category in body}
${category.no|left:14}  ${category.name|left:26}
--------------  --------------------------
{for plu in category.plu}
${plu.no|left:14}      ${plu.name|left:22}
${_( 'Min.Stock' ) + ':'}${plu.min_stock|right:4}      ${_( 'Stock' ) + ':'}${plu.stock|right:10}
{/for}
------------------------------------------
{/for}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
