[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|default:''|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:42}
{for item in body}
{eval}
if (item.event_type == 'finalization' || item.event_type == 'payment') {
    payment_type = _('(rpt)' + item.payment_type);
}
else {
    payment_type = item.payment_type;
}
{/eval}
------------------------------------------
${_( '(rpt)Terminal' ) + ':'|left:18}${item.terminal_no|right:24}
${_( '(rpt)Drawer' ) + ':'|left:18}${item.drawer_no|right:24}
${_( '(rpt)Clerk' ) + ':'|left:18}${item.clerk_displayname|default:''|right:24}
${_( '(rpt)Time' ) + ':'|left:18}${item.created|unixTimeToString|right:24}
${_( '(rpt)Event' ) + ':'|left:18}${_( '(drawer)' + item.event_type )|right:24}
${_( '(rpt)Sequence' ) + ':'|left:18}${item.sequence|default:''|right:24}
${_( '(rpt)Payment Type' ) + ':'|left:18}${payment_type|default:''|right:24}
${_( '(rpt)Amount' ) + ':'|left:18}${item.amount|default:''|viviFormatPrices:true|right:24}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:30}${foot.rowCount|format:0|right:12}
${_( '(rpt)Records Displayed' ) + ': '|left:30}${body.length|format:0|right:12}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
