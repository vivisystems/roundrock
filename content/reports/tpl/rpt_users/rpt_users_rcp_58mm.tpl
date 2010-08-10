[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:24}
{for user in body}
------------------------
${_( '(rpt)User Name' ) + ':'}
${user.username|right:24}
${_( '(rpt)Display Name' ) + ':'}
${user.displayname|right:24}
${_( '(rpt)Access Group' ) + ':'}
${user.group|right:24}
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
