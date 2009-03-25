"${head.store.name}"
"${head.store.branch}"
"${_( 'Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( 'Terminal' )+ ':'}","'${head.store.terminal_no}"
"${_( 'Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( 'Printed Time' ) + ':'}","${foot.gen_time}"

"${_( 'User Name' )}","${_( 'Display Name' )}","${_( 'Access Group' )}"
{for user in body}
"${user.username}","${user.displayname}","${user.group}"
{/for}
