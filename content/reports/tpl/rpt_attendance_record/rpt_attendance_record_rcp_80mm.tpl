[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:10}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.user_label}${queryFormLabel.user}
${queryFormLabel.job_label}${queryFormLabel.job}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:42}
{for master in body}
------------------------------------------
${_( '(rpt)Clerk' ) + ':'|left:11}${master.username|left:31}
------------------------------------------
{for stamp in master.clockStamps}
${_( '(rpt)Job' ) + ':'|left:11}${stamp.job|default:''|left:31}
${_( '(rpt)Clock In' ) + ':'|left:11}${stamp.clockin_time|default:''|left:31}
${_( '(rpt)Clock Out' ) + ':'|left:11}${stamp.clockout_time|default:''|left:31}
${_( '(rpt)Span Time' ) + ':'|left:11}${stamp.SpanTime|left:31}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ':'|left:15}${master.clockStamps.length|format:0|right:27}
------------------------------------------
${_( '(rpt)Summary' ) + ':'|left:11}${master.total_spantime|default:''|right:31}
------------------------------------------
{/for}
[&CR]
[&CR]
${_( '(rpt)Total Work Time' ) + ':'|left:16}${foot.total_spantime|default:''|right:26}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
