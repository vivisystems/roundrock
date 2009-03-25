[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for detail in body}
------------------------
${_( '(rpt)Term_No.' ) + ':'}
{if head.machine_id}${detail.terminal_no|right:24}{/if}
[&CR]
${_( '(rpt)Time' ) + ':'}
${detail.Hour|right:24}
${_( '(rpt)Total' ) + ':'}
${detail.HourTotal|right:24}
${_( '(rpt)Orders' ) + ':'}
${detail.OrderNum|right:24}
${_( '(rpt)Guests' ) + ':'}
${detail.Guests|right:24}
${_( '(rpt)Items' ) + ':'}
${detail.ItemsCount|right:24}
{/for}
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Total' ) + ':'}
${foot.HourTotal|right:24}
${_( '(rpt)Orders' ) + ':'}
${foot.OrderNum|right:24}
${_( '(rpt)Guests' ) + ':'}
${foot.Guests|right:24}
${_( '(rpt)Items' ) + ':'}
${foot.ItemsCount|right:24}
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
