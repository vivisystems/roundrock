[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.user_label}${queryFormLabel.user}
${queryFormLabel.job_label}${queryFormLabel.job}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:24}
------------------------
{for master in body}
[&CR]
${_( '(rpt)Clerk' ) + ': '}${master.username}
------------------------
{for stamp in master.clockStamps}
${_( '(rpt)Job' ) + ':'}
${stamp.job|default:''|right:24}
${_( '(rpt)Clock In' ) + ':'}
${stamp.clockin_time|default:''|right:24}
${_( '(rpt)Clock Out' ) + ':'}
${stamp.clockout_time|default:''|right:24}
${_( '(rpt)Span Time' ) + ':'}
${stamp.SpanTime|default:''|right:24}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ':'|left:14}${master.clockStamps.length|format:0|right:10}
------------------------
${_( '(rpt)Summary' ) + ':'|left:12}${master.total_spantime|default:''|right:12}
------------------------
{/for}
[&CR]
[&CR]
${_( '(rpt)Total Work Time' ) + ':'|left:24}
${foot.total_spantime|default:''|right:24}
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
