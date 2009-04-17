[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for item in body}
------------------------
${_( '(rpt)Terminal No.' ) + ':'}
${item.terminal_no|right:24}
${_( '(rpt)Drawer No.' ) + ':'}
${item.drawer_no|right:24}
${_( '(rpt)Clerk' ) + ':'}
${item.clerk_displayname|right:24}
${_( '(rpt)Time' ) + ':'}
${item.created|unixTimeToString|right:24}
${_( '(rpt)Event' ) + ':'}
${item.event_type|right:24}
{/for}
------------------------------------------
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
