[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.period_type_label}${queryFormLabel.period_type}
${queryFormLabel.start_hour_label}${queryFormLabel.start_hour}
${queryFormLabel.end_hour_label}${queryFormLabel.end_hour}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:24}
{for detail in body}
------------------------
{if head.terminal_no}
${_( '(rpt)Terminal' ) + ':'}
${detail.terminal_no|right:24}
{/if}
${_( '(rpt)Date' ) + ':'}
${detail.Date|right:24}
${_( '(rpt)Hour' ) + ':'}
${detail.Hour|right:24}
${_( '(rpt)Total' ) + ':'}
${detail.HourTotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Number of Orders' ) + ':'}
${detail.OrderNum|default:0|format:0|right:24}
${_( '(rpt)Number of Guests' ) + ':'}
${detail.Guests|default:0|format:0|right:24}
${_( '(rpt)Number of Items' ) + ':'}
${detail.ItemsCount|default:0|format:0|right:24}
${_( '(rpt)Total/Guest' ) + ':'}
${detail.NetPerGuest|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Total/Order' ) + ':'}
${detail.NetPerOrder|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Gross Sales/Guest' ) + ':'}
${detail.GrossPerGuest|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Gross Sales/Order' ) + ':'}
${detail.GrossPerOrder|default:0|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ': '|left:16}${body.length|default:0|format:0|right:8}
[&CR]
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Total' ) + ':'}
${foot.HourTotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Number of Orders' ) + ':'}
${foot.OrderNum|default:0|format:0|right:24}
${_( '(rpt)Number of Guests' ) + ':'}
${foot.Guests|default:0|format:0|right:24}
${_( '(rpt)Number of Items' ) + ':'}
${foot.ItemsCount|default:0|format:0|right:24}
${_( '(rpt)Total/Guest' ) + ':'}
${foot.NetPerGuest|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Total/Order' ) + ':'}
${foot.NetPerOrder|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Gross Sales/Guest' ) + ':'}
${foot.GrossPerGuest|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Gross Sales/Order' ) + ':'}
${foot.GrossPerOrder|default:0|viviFormatPrices:true|right:24}
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
