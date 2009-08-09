[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|default:''|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for item in body}
------------------------------------------
${_( '(rpt)Terminal' ) + ': '}${item.terminal_no}
${_( '(rpt)Drawer' ) + ': '}${item.drawer_no}
${_( '(rpt)Clerk' ) + ': '}${item.clerk_displayname|default:''}
${_( '(rpt)Time' ) + ': '}${item.created|unixTimeToString}
${_( '(rpt)Event' ) + ': '}${_( '(rpt)' + item.event_type )}
${_( '(rpt)Sequence' ) + ': '}${item.sequence|default:''}
${_( '(rpt)Amount' ) + ': '}${item.amount|default:''|viviFormatPrices:true}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:30}${foot.rowCount|format:0|right:12}
${_( '(rpt)Records Displayed' ) + ': '|left:30}${body.length|format:0|right:12}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
