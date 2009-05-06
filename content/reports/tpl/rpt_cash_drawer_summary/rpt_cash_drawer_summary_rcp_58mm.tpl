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
${_( '(rpt)Clerk' ) + ':'}
${item.clerk_displayname|right:24}
${_( '(rpt)Event' ) + ':'}
${_( '(rpt)' + item.event_type )|right:24}
${_( '(rpt)Number of Events' ) + ':'}
${item.num_events|right:24}
{/for}
------------------------
${_( '(rpt)Summary' ) + ':'}
${foot.foot_data.total_num_events|right:24}
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
