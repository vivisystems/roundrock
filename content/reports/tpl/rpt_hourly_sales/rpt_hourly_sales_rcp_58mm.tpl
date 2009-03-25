[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( 'Terminal' ) + ': '}${head.store.terminal_no}
${_( 'Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for detail in body}
------------------------
${_( 'Term_No.' ) + ':'}
{if head.machine_id}${detail.terminal_no|right:24}{/if}
[&CR]
${_( 'Time' ) + ':'}
${detail.Hour|right:24}
${_( 'Total' ) + ':'}
${detail.HourTotal|right:24}
${_( 'Orders' ) + ':'}
${detail.OrderNum|right:24}
${_( 'Guests' ) + ':'}
${detail.Guests|right:24}
${_( 'Items' ) + ':'}
${detail.ItemsCount|right:24}
{/for}
------------------------
${_( 'Summary' )}
${_( 'Total' ) + ':'}
${foot.HourTotal|right:24}
${_( 'Orders' ) + ':'}
${foot.OrderNum|right:24}
${_( 'Guests' ) + ':'}
${foot.Guests|right:24}
${_( 'Items' ) + ':'}
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
