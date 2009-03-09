[&QSON]${head.store.name|center:24}[&QSOFF]
[&DWON]${head.store.branch|center:24}[&DWOFF]
${head.store.telephone1|center:24}
Terminal: ${head.store.terminal_no|center:24}
Clerk: ${head.clerk_displayname|center:24}
${head.start_time} ~
${head.end_time|right:24}

${head.title|center:24}
------------------------
{for master in body}
[&CR]
Clerk:     ${master.username}
------------------------
{for stamp in master.clockStamps}
Job:       ${stamp.job|left:12}
Clock In:  ${stamp.InTime}
Clock Out: ${stamp.OutTime}
Span Time: ${stamp.SpanTime}
{/for}
------------------------
Summary: ${master.total_spantime|right:33}
------------------------
{/for}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
