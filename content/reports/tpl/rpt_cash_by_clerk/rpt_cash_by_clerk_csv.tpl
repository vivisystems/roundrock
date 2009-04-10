"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' + ':' )}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"
{for master in body}
""
"${master.terminal_no}","${master.starttime}","${master.endtime}"
"${_( '(rpt)Sale Period' )}","${_( '(rpt)Shift No.' )}","${_( '(rpt)Balance' )}","${_( '(rpt)Cash' )}","${_( '(rpt)Sales' )}","${_( '(rpt)Excess' )}","${_( '(rpt)Ledger In' )}","${_( '(rpt)Ledger Out' )}"
"${master.sale_period}","${master.shift_number}","${master.balance|default:0|viviFormatPrices:true}","${master.cash|default:0|viviFormatPrices:true}","${master.sales|default:0|viviFormatPrices:true}","${master.excess|default:0|viviFormatPrices:true}","${master.ledger_in|default:0|viviFormatPrices:true}","${master.ledger_out|default:0|viviFormatPrices:true}"
""
"","${_( '(rpt)Type' )}","${_( '(rpt)Amount' )}","${_( '(rpt)Count' )}","","${_( '(rpt)Destination' )}","${_( '(rpt)Amount' )}","${_( '(rpt)Count' )}"
{for detail in master.ShiftChangeDetail}
{if detail.type != 'destination'}
"","${detail.type}{if detail.name.length > 0} ( ${detail.name} ){/if}","${detail.amount|default:0|viviFormatPrices:true}","${detail.count|default:0}"
{/if}
{if detail.type == 'destination'}
"","${detail.name}","${detail.amount|default:0|viviFormatPrices:true}","${detail.count|default:0}"
{/if}
{/for}
{/for}
