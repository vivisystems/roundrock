[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${_('(rpt)Condition') + ' - '}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:24}
{for category in body}
------------------------
${_( '(rpt)Department Number' ) + ':'}
${category.no|right:24}
${_( '(rpt)Department Name' ) + ':'}
${category.name|right:24}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ': '}${body.length|format:0}
[&CR]
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
