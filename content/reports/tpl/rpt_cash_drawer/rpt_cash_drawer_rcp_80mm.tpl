[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for item in body}
------------------------------------------
${_( '(rpt)Terminal No.' ) + ': '}${item.terminal_no}
${_( '(rpt)Drawer No.' ) + ': '}${item.drawer_no}
${_( '(rpt)Clerk' ) + ': '}${item.clerk_displayname}
${_( '(rpt)Time' ) + ': '}${item.created}
${_( '(rpt)Event' ) + ': '}${item.event_type}
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
