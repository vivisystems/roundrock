"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' )+ ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"

"${_( '(rpt)User Name' )}","${_( '(rpt)Display Name' )}","${_( '(rpt)Access Group' )}"
{for user in body}
"${user.username}","${user.displayname}","${user.group}"
{/for}
