"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start Time' + ':' )}","${head.start_time}"
"${_( '(rpt)End Time' ) + ':'}","${head.end_time}"
"${_('(rpt)Condition') + ' - '}"
"${queryFormLabel.terminal_no_label}","${queryFormLabel.terminal_no}"
"${queryFormLabel.shift_no_label}","${queryFormLabel.shift_no}"
{for master in body}
""
"${master.terminal_no}","${master.starttime}","${master.endtime}"
"${_( '(rpt)Sale Period' )}","${_( '(rpt)Shift' )}","${_( '(rpt)Balance' )}","${_( '(rpt)Cash' )}","${_( '(rpt)Declared Cash' )}","${_( '(rpt)Total' )}","${_( '(rpt)Giftcard Excess' )}","${_( '(rpt)Deposit' )}","${_( '(rpt)Refund' )}","${_( '(rpt)Credit' )}","${_( '(rpt)Ledger In' )}","${_( '(rpt)Ledger Out' )}"
"${master.sale_period|unixTimeToString:'yyyy-MM-dd'}","${master.shift_number}","${master.balance|default:0|viviFormatPrices:true}","${master.cash|default:0|viviFormatPrices:true}","${master.reported_cash|default:0|viviFormatPrices:true}","${master.sales|default:0|viviFormatPrices:true}","${master.excess|default:0|viviFormatPrices:true}","${master.deposit|default:0|viviFormatPrices:true}","${master.refund|default:0|viviFormatPrices:true}","${master.credit|default:0|viviFormatPrices:true}","${master.ledger_in|default:0|viviFormatPrices:true}","${master.ledger_out|default:0|viviFormatPrices:true}"
""
"","'${_( '(rpt)Payment Type' )}","'${_( '(rpt)Payment Amount' )}","'${_( '(rpt)Payment Count' )}","'${_( '(rpt)Payment Amount in Original Currency' )}"
{for detail in master.ShiftChangeDetail}
{if detail.type != 'destination'}
{if detail.count < 0}
"","'* ${_('(rpt)' + detail.type)}{if detail.name.length > 0} ( ${detail.name} ){/if}","${detail.amount|default:0|viviFormatPrices:true}","${0 - detail.count|format:0}"
{else}
"","'${_('(rpt)' + detail.type)}{if detail.name.length > 0} ( ${detail.name} ){/if}","${detail.amount|default:0|viviFormatPrices:true}","${detail.count|format:0}",{if detail.type == 'cash' && detail.excess_amount > 0}"${detail.excess_amount}"
{else}""
{/if}
{/if}
{/if}
{/for}
""
"","'${_( '(rpt)Destination' )}","'${_( '(rpt)Destination Amount' )}","'${_( '(rpt)Destination Count' )}"
{for detail in master.ShiftChangeDetail}
{if detail.type == 'destination'}
"","'${detail.name}","${detail.amount|default:0|viviFormatPrices:true}","${detail.count|format:0}"
{/if}
{/for}
{/for}
