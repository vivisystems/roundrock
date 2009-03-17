[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for master in body}
------------------------------------------
Clerk:     ${master.username}
------------------------------------------
{for stamp in master.clockStamps}
Job:       ${stamp.job|left:12}
Clock In:  ${stamp.InTime}
Clock Out: ${stamp.OutTime}
Span Time: ${stamp.SpanTime}
{/for}
------------------------------------------
Summary: ${master.total_spantime|right:33}
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
