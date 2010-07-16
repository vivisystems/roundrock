"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"

"${_('(rpt)Condition') + ' - '}"
"${queryFormLabel.sortby_label}","${queryFormLabel.sortby}"

"${_( '(rpt)Department Number' )}","${_( '(rpt)Department Name' )}"
{for category in body}
"'${category.no}","'${category.name}"
{/for}

"${_( '(rpt)Records Found' ) + ': '}","${body.length|format:0}"
