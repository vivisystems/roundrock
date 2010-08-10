"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start Time' ) + ':'}","${head.start_time}"
"${_( '(rpt)End Time' ) + ':'}","${head.end_time}"
"${_('(rpt)Condition') + ' - '}"
"${queryFormLabel.terminal_no_label}","${queryFormLabel.terminal_no}"
"${queryFormLabel.shift_no_label}","${queryFormLabel.shift_no}"
"${queryFormLabel.period_type_label}","${queryFormLabel.period_type}"
"${queryFormLabel.payment_type_label}","${queryFormLabel.payment_type}"
"${queryFormLabel.sortby_label}","${queryFormLabel.sortby}"

{for paymentGroup in body}
'${_('(rpt)' + paymentGroup_index)}
"'${_( '(rpt)Terminal' )}","'${_( '(rpt)Service Clerk' )}","'${_( '(rpt)Sale Period' )}","'${_( '(rpt)Shift' )}","'${_( '(rpt)Time' )}","'${_( '(rpt)Sequence' )}","'${_( '(rpt)Payment Subtype' )}","'${_( '(rpt)Amount' )}","'${_( '(rpt)Face Value' )}","'${_( '(rpt)Groupable Payment Count' )}","'${_( '(rpt)Memo' )}"
{for detail in paymentGroup}
"'${detail.terminal_no}","'${detail.service_clerk_displayname|default:''}","'${detail.sale_period|unixTimeToString:'saleperiod'}","'${detail.shift_number}","'${detail.time|unixTimeToString}","'${detail.sequence}","'${detail.subtype|default:''}","'${detail.amount|default:0|viviFormatPrices:false}","'${detail.facevalue|default:''|viviFormatPrices:true}","'${detail.count|default:''}","'${detail.memo|default:''}"
{/for}

{/for}
