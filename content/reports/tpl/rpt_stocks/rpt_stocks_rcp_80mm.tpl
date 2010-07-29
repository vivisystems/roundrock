[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.department_label}${queryFormLabel.department}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:42}
------------------------------------------
{for category in body}
${category.no|left:20}  ${category.name|left:20}
------------------------------------------
{for plu in category.plu}
${plu.no|left:20}  ${plu.name|left:20}
${_( '(rpt)Stock Level' ) + ':'|left:14}${plu.stock|format:0|right:6}  ${_( '(rpt)Low Watermark' ) + ':'|left:14}${plu.min_stock|format:0|right:6}
${_( '(rpt)High Watermark' ) + ':'|left:14}${plu.max_stock|format:0|right:6}  ${_( '(rpt)Recommended Purchase Quantity' ) + ':'|left:14}${plu.max_stock - plu.stock|format:0|right:6}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:16}${category.plu.length|format:0|left:26}
------------------------------------------
{/for}
{if rowLimitExcess}
${_( '(rpt)Row Limit Excess' )}
------------------------------------------
{/if}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
