"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' )+ ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_('(rpt)Condition') + ' - '}"
"${queryFormLabel.sortby_label}","${queryFormLabel.sortby}"

"${_( '(rpt)User Name' )}","${_( '(rpt)Display Name' )}","${_( '(rpt)Access Group' )}"
{for user in body}
"'${user.username}","'${user.displayname}","'${user.group}"
{/for}
