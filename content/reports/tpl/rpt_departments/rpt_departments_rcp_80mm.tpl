[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]

${_('(rpt)Condition') + ' - '}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}

${head.title|center:42}
------------------------------------------
${_( '(rpt)Department Number' )|left:18}  ${_( '(rpt)Department Name' )|left:22}
--------------  --------------------------
{for category in body}
${category.no|left:18}  ${category.name|left:22}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '}${body.length|format:0}
[&CR]
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
