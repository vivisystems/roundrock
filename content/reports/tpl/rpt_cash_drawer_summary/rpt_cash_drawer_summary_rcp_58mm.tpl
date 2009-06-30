[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for item in body}
------------------------
${_( '(rpt)Clerk' ) + ':'}
${item.clerk_displayname|default:''|right:24}
${_( '(rpt)Event' ) + ':'}
${_( '(rpt)' + item.event_type )|right:24}
${_( '(rpt)Occurrences' ) + ':'}
${item.num_occurrences|default:0|format:0|right:24}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ':'|left:16}${body.length|format:0|right:8}
------------------------
${_( '(rpt)Summary' ) + ':'}
${foot.foot_data.total_num_occurrences|default:0|format:0|right:24}
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
