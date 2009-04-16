[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
------------------------
{for master in body}
[&CR]
${_( '(rpt)Clerk' ) + ': '}${master.username}
------------------------
{for stamp in master.clockStamps}
${_( '(rpt)Job' ) + ':'}
${stamp.job|right:24}
${_( '(rpt)Clock In' ) + ':'}
${stamp.clockin_time|right:24}
${_( '(rpt)Clock Out' ) + ':'}
${stamp.clockout_time|right:24}
${_( '(rpt)Span Time' ) + ':'}
${stamp.SpanTime|right:24}
{/for}
------------------------
${_( '(rpt)Summary' ) + ':'}
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
