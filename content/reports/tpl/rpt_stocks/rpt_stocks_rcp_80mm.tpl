[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}

${head.title|center:42}
------------------------------------------
{for category in body}
${category.no|left:14}  ${category.name|left:26}
--------------  --------------------------
{for plu in category.plu}
${plu.no|left:14}      ${plu.name|left:22}
${_( '(rpt)Stock Level' ) + ':'|left:14}${plu.stock|format:0|right:6}  ${_( '(rpt)Low Stock Threshold' ) + ':'|left:14}${plu.min_stock|format:0|right:6}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:16}${category.plu.length|format:0|left: 26}
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
