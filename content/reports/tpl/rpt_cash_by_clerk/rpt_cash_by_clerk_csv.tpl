"${head.store.name}"
"${head.store.branch}"
"${_( 'Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( 'Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( 'Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( 'Printed Time' + ':'}","${foot.gen_time}"
"${_( 'Start' + ':' )}","${head.start_time}"
"${_( 'End' ) + ':'}","${head.end_time}"
{for master in body}
""
"${master.terminal_no}","${master.starttime}","${master.endtime}"
"${_( 'Sale Period' )}","${_( 'Shift No.' )}","${_( 'Balance' )}","${_( 'Cash' )}","${_( 'Sales' )}","${_( 'Excess' )}","${_( 'Ledger In' )}","${_( 'Ledger Out' )}"
"${master.sale_period}","${master.shift_number}","${master.balance|default:0|viviFormatPrices:true}","${master.cash|default:0|viviFormatPrices:true}","${master.sales|default:0|viviFormatPrices:true}","${master.excess|default:0|viviFormatPrices:true}","${master.ledger_in|default:0|viviFormatPrices:true}","${master.ledger_out|default:0|viviFormatPrices:true}"
""
"","${_( 'Type' )}","${_( 'Amount' )}","${_( 'Count' )}","","${_( 'Destination' )}","${_( 'Amount' )}","${_( 'Count' )}"
{for detail in master.ShiftChangeDetail}
{if detail.type != 'destination'}
"","${detail.type}{if detail.name.length > 0} ( ${detail.name} ){/if}","${detail.amount|default:0|viviFormatPrices:true}","${detail.count|default:0}"
{/if}
{if detail.type == 'destination'}
"","${detail.name}","${detail.amount|default:0|viviFormatPrices:true}","${detail.count|default:0}"
{/if}
{/for}
{/for}
