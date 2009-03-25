[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}

${head.title|center:42}
{for detail in body}
------------------------------------------
${_( '(rpt)Term_No.' ) + ':'|left:9}{if head.machine_id}${detail.terminal_no}{/if}
 
${_( '(rpt)Time' ) + ':'|left:9}${detail.Hour}
${_( '(rpt)Total' ) + ':'|left:9}${detail.HourTotal}
${_( '(rpt)Orders' ) + ':'|left:9}${detail.OrderNum}
${_( '(rpt)Guests' ) + ':'|left:9}${detail.Guests}
${_( '(rpt)Items' ) + ':'|left:9}${detail.ItemsCount}
{/for}
------------------------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Total' ) + ':'|left:9}${foot.HourTotal}
${_( '(rpt)Orders' ) + ':'|left:9}${foot.OrderNum}
${_( '(rpt)Guests' ) + ':'|left:9}${foot.Guests}
${_( '(rpt)Items' ) + ':'|left:9}${foot.ItemsCount}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
