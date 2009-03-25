[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for item in body}
------------------------------------------
${_( '(rpt)Clerk' ) + ':'|left:17}${item.clerk_displayname}
${_( '(rpt)Event' ) + ':'|left:17}${item.event_type}
${_( '(rpt)Number of Events' ) + ':'|left:17}${item.num_events}
{/for}
------------------------------------------
${_( '(rpt)Summary' ) + ':'|left:17}${foot.foot_data.total_num_events}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
