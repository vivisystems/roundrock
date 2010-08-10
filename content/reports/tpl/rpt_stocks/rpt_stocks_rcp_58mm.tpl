[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.department_label}${queryFormLabel.department}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:24}
{for category in body}
------------------------
${_( '(rpt)Department Number' ) + ':'}
${category.no|right:24}
${_( '(rpt)Department Name' ) + ':'}
${category.name|right:24}
{for plu in category.plu}
------------------------
${_( '(rpt)Product Number' ) + ':'}
${plu.no|right:24}
${_( '(rpt)Product Name' ) + ':'}
${plu.name|right:24}
${_( '(rpt)Stock Level' ) + ':'}
${plu.stock|right:24}
${_( '(rpt)Low Watermark' ) + ':'}
${plu.min_stock|right:24}
${_( '(rpt)High Watermark' ) + ':'}
${plu.max_stock|right:24}
${_( '(rpt)Recommended Purchase Quantity' ) + ':'}
${plu.max_stock - plu.stock|right:24}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ':'|left:16}${category.plu.length|format:0|right:8}
------------------------
{/for}
{if rowLimitExcess}
${_( '(rpt)Row Limit Excess' )}
------------------------
{/if}
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
