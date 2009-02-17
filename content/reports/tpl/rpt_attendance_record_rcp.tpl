[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}
------------------------------------------
{for master in body}
[&CR]
[&DWON]Clerk: ${master.username|center:21}[&DWOFF]
Job          Clock In  Clock Out Span Time
------------ --------- --------- ---------
{for stamp in master.clockStamps}
${stamp.job|left:12} ${stamp.InTime|right:9} ${stamp.OutTime|right:9} ${stamp.SpanTime|right:9}
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