[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( 'Terminal' ) + ': '}${head.store.terminal_no}
${_( 'Clerk' ) + ': '}${head.clerk_displayname}

${head.title|center:24}
{for user in body}
------------------------
${_( 'User Name' ) + ':'}
${user.username|right:24}
${_( 'Display Name' ) + ':'}
${user.displayname|right:24}
${_( 'Access Group' ) + ':'}
${user.group|right:24}
{/for}
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
