[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

Terminal: ${head.store.terminal_no}
Clerk: ${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
------------------------
{for master in body}
[&CR]
Clerk: ${master.username}
------------------------
{for stamp in master.clockStamps}
Job:
${stamp.job|right:24}
Clock In:
${stamp.InTime|right:24}
Clock Out:
${stamp.OutTime|right:24}
Span Time:
${stamp.SpanTime|right:24}
{/for}
------------------------
Summary:
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
