[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for item in body}
------------------------------------------
${_( '(rpt)Clerk' ) + ':'|left:17}${item.clerk_displayname|default:''}
${_( '(rpt)Event' ) + ':'|left:17}${_( '(rpt)' + item.event_type )}
${_( '(rpt)Occurrences' ) + ':'|left:17}${item.num_occurrences|default:0|format:0}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ':'|left:17}${body.length|format:0|right:25}
------------------------------------------
${_( '(rpt)Summary' ) + ':'|left:17}${foot.foot_data.total_num_occurrences|default:0|format:0|right:25}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
