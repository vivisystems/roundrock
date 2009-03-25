[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}

${head.title|center:42}
------------------------------------------
${_( '(rpt)No.' )|left:14}  ${_( '(rpt)Name' )|left:26}
--------------  --------------------------
{for category in body}
${category.no|left:14}  ${category.name|left:26}
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
