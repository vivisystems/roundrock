[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}
${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shift_no_label}${queryFormLabel.shift_no}
${queryFormLabel.period_type_label}${queryFormLabel.period_type}
${queryFormLabel.payment_type_label}${queryFormLabel.payment_type}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}
[&CR]
${head.title|center:42}
[&CR]
------------------------------------------
{for paymentGroup in body}
${_('(rpt)' + paymentGroup_index)|left:42}
------------------------------------------
{for detail in paymentGroup}
${_( '(rpt)Terminal' ) + ':'|left:18}${detail.terminal_no|right:24}
${_( '(rpt)Service Clerk' ) + ':'|left:18}${detail.service_clerk_displayname|default:''|right:24}
${_( '(rpt)Sale Period' ) + ':'|left:18}${detail.sale_period|unixTimeToString:'saleperiod'|right:24}
${_( '(rpt)Shift' ) + ':'|left:18}${detail.shift_number|right:24}
${_( '(rpt)Time' ) + ':'|left:18}${detail.time|unixTimeToString|right:24}
${_( '(rpt)Sequence' ) + ':'|left:18}${detail.sequence|right:24}
${_( '(rpt)Payment Subtype' ) + ':'|left:18}${detail.subtype|default:''|right:24}
${_( '(rpt)Amount' ) + ':'|left:18}${detail.amount|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Face Value' ) + ':'|left:18}${detail.facevalue|default:''|viviFormatPrices:true|right:24}
${_( '(rpt)Groupable Payment Count' ) + ':'|left:18}${detail.count|default:''|right:24}
${_( '(rpt)Memo' ) + ':'|left:18}${detail.memo|default:''|right:24}
------------------------------------------
{/for}
${_( '(rpt)Records Displayed' ) + ':'|right: 36}${paymentGroup.length|format:0|right:6}

------------------------------------------
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
