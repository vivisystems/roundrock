[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}
[&CR]
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shift_no_label}${queryFormLabel.shift_no}
${queryFormLabel.period_type_label}${queryFormLabel.period_type}
${queryFormLabel.payment_type_label}${queryFormLabel.payment_type}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}
[&CR]
${head.title|center:24}
[&CR]
------------------------
{for paymentGroup in body}
${_('(rpt)' + paymentGroup_index)|left:24}
------------------------
{for detail in paymentGroup}
${_( '(rpt)Terminal' ) + ':'}
${detail.terminal_no|right:24}
${_( '(rpt)Service Clerk' ) + ':'}
${detail.service_clerk_displayname|default:''|right:24}
${_( '(rpt)Sale Period' ) + ':'}
${detail.sale_period|unixTimeToString:'saleperiod'|right:24}
${_( '(rpt)Shift' ) + ':'}
${detail.shift_number|right:24}
${_( '(rpt)Time' ) + ':'}
${detail.time|unixTimeToString|right:24}
${_( '(rpt)Sequence' ) + ':'}
${detail.sequence|right:24}
${_( '(rpt)Payment Subtype' ) + ':'}
${detail.subtype|default:''|right:24}
${_( '(rpt)Amount' ) + ':'}
${detail.amount|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Face Value' ) + ':'}
${detail.facevalue|default:''|viviFormatPrices:true|right:24}
${_( '(rpt)Groupable Payment Count' ) + ':'}
${detail.count|default:''|right:24}
${_( '(rpt)Memo' ) + ':'}
${detail.memo|default:''|right:24}
------------------------
{/for}
${_( '(rpt)Records Displayed' ) + ':'|right: 18}${paymentGroup.length|format:0|right:6}

{/for}
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
