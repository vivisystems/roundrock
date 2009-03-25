[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( 'Terminal' ) + ': '}${head.store.terminal_no + ' '|left:1}${_( 'Clerk' ) + ': '}${head.clerk_displayname|left:14}

${head.title|center:42}
------------------------------------------
${_( 'User Name' )|left:11} ${_( 'Display Name' )|left:17} ${_( 'Access Group' )|left:12}
----------  ----------------  ------------
{for user in body}
${user.username|left:11} ${user.displayname|left:17} ${user.group|left:12}
{/for}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
