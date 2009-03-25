[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( 'Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( 'Clerk' ) + ': '}${head.clerk_displayname|left:14}

${head.title|center:42}
{for detail in body}
------------------------------------------
${_( 'Term_No.' ) + ':'|left:9}{if head.machine_id}${detail.terminal_no}{/if}
 
${_( 'Time' ) + ':'|left:9}${detail.Hour}
${_( 'Total' ) + ':'|left:9}${detail.HourTotal}
${_( 'Orders' ) + ':'|left:9}${detail.OrderNum}
${_( 'Guests' ) + ':'|left:9}${detail.Guests}
${_( 'Items' ) + ':'|left:9}${detail.ItemsCount}
{/for}
------------------------------------------
${_( 'Summary' )}
${_( 'Total' ) + ':'|left:9}${foot.HourTotal}
${_( 'Orders' ) + ':'|left:9}${foot.OrderNum}
${_( 'Guests' ) + ':'|left:9}${foot.Guests}
${_( 'Items' ) + ':'|left:9}${foot.ItemsCount}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
