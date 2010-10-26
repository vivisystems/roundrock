[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.period_type_label}${queryFormLabel.period_type}
${queryFormLabel.start_hour_label}${queryFormLabel.start_hour}
${queryFormLabel.end_hour_label}${queryFormLabel.end_hour}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}
${queryFormLabel.database_label}${queryFormLabel.database}

${head.title|center:42}
{for detail in body}
------------------------------------------
{if head.terminal_no}
${_( '(rpt)Terminal' ) + ':'|left:16}${detail.terminal_no|right:26}
{/if}
${_( '(rpt)Date' ) + ':'|left:16}${detail.Date|right:26}
${_( '(rpt)Hour' ) + ':'|left:16}${detail.Hour|right:26}
${_( '(rpt)Total' ) + ':'|left:16}${detail.HourTotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Number of Orders' ) + ':'|left:16}${detail.OrderNum|default:0|format:0|right:26}
${_( '(rpt)Number of Guests' ) + ':'|left:16}${detail.Guests|default:0|format:0|right:26}
${_( '(rpt)Number of Items' ) + ':'|left:16}${detail.ItemsCount|default:0|format:0|right:26}
${_( '(rpt)Total/Guest' ) + ':'|left:16}${detail.NetPerGuest|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Total/Order' ) + ':'|left:16}${detail.NetPerOrder|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Gross Sales/Guest' ) + ':'|left:16}${detail.GrossPerGuest|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Gross Sales/Order' ) + ':'|left:16}${detail.GrossPerOrder|default:0|viviFormatPrices:true|right:26}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:19}${body.length|default:0|format:0|right:22}
[&CR]
------------------------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Total' ) + ':'|left:16}${foot.HourTotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Number of Orders' ) + ':'|left:16}${foot.OrderNum|default:0|format:0|right:26}
${_( '(rpt)Number of Guests' ) + ':'|left:16}${foot.Guests|default:0|format:0|right:26}
${_( '(rpt)Number of Items' ) + ':'|left:16}${foot.ItemsCount|default:0|format:0|right:26}
${_( '(rpt)Total/Guest' ) + ':'|left:16}${foot.NetPerGuest|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Total/Order' ) + ':'|left:16}${foot.NetPerOrder|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Gross Sales/Guest' ) + ':'|left:16}${foot.GrossPerGuest|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Gross Sales/Order' ) + ':'|left:16}${foot.GrossPerOrder|default:0|viviFormatPrices:true|right:26}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
