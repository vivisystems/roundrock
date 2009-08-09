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
${_( '(rpt)Terminal' ) + ':'}
${item.terminal_no|right:24}
${_( '(rpt)Drawer' ) + ':'}
${item.drawer_no|right:24}
${_( '(rpt)Clerk' ) + ':'}
${item.clerk_displayname|default:''|right:24}
${_( '(rpt)Time' ) + ':'}
${item.created|unixTimeToString|right:24}
${_( '(rpt)Event' ) + ':'}
${_( '(rpt)' + item.event_type )|right:24}
${_( '(rpt)Sequence' ) + ':'}
${item.sequence|default:''|right:24}
${_( '(rpt)Amount' ) + ':'}
${item.amount|default:''|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ':'|left:24}
${foot.rowCount|format:0|right:24}
${_( '(rpt)Records Displayed' ) + ':'|left:24}
${body.length|format:0|right:24}
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
