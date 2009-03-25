[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( 'Terminal' ) + ': '}${head.store.terminal_no + ' '|left:10}${_( 'Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for master in body}
------------------------------------------
${_( 'Clerk' ) + ':'|left:11}${master.username|left:31}
------------------------------------------
{for stamp in master.clockStamps}
${_( 'Job' ) + ':'|left:11}${stamp.job|left:31}
${_( 'Clock In' ) + ':'|left:11}${stamp.InTime|left:31}
${_( 'Clock Out' ) + ':'|left:11}${stamp.OutTime|left:31}
${_( 'Span Time' ) + ':'|left:11}${stamp.SpanTime|left:31}
{/for}
------------------------------------------
${_( 'Summary' ) + ':'|left:11}${master.total_spantime|right:31}
------------------------------------------
{/for}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
