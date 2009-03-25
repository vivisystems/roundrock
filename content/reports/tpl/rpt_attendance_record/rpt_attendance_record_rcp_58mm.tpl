[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( 'Terminal' ) + ': '}${head.store.terminal_no}
${_( 'Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
------------------------
{for master in body}
[&CR]
${_( 'Clerk' ) + ': '}${master.username}
------------------------
{for stamp in master.clockStamps}
${_( 'Job' ) + ':'}
${stamp.job|right:24}
${_( 'Clock In' ) + ':'}
${stamp.InTime|right:24}
${_( 'Clock Out' ) + ':'}
${stamp.OutTime|right:24}
${_( 'Span Time' ) + ':'}
${stamp.SpanTime|right:24}
{/for}
------------------------
${_( 'Summary' ) + ':'}
${master.total_spantime|right:24}
------------------------
{/for}
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
