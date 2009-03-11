"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Printed Time:","${foot.gen_time}"
"Start:","${head.start_time}"
"End:","${head.end_time}"
{for master in body}
""
"${master.terminal_no}","${master.starttime}","${master.endtime}"
"Sale Period","Shift No.","Balance","Cash","Sales","Excess","Ledger In","Ledger Out"
"${master.sale_period}","${master.shift_number}","${master.balance|default:0|viviFormatPrices:true}","${master.cash|default:0|viviFormatPrices:true}","${master.sales|default:0|viviFormatPrices:true}","${master.excess|default:0|viviFormatPrices:true}","${master.ledger_in|default:0|viviFormatPrices:true}","${master.ledger_out|default:0|viviFormatPrices:true}"
""
"","Type","Amount","Count","","Destination","Amount","Count"
{for detail in master.ShiftChangeDetail}
{if detail.type != 'destination'}
"","${detail.type}{if detail.name.length > 0} ( ${detail.name} ){/if}","${detail.amount|default:0|viviFormatPrices:true}","${detail.count|default:0}"
{/if}
{if detail.type == 'destination'}
"","${detail.name}","${detail.amount|default:0|viviFormatPrices:true}","${detail.count|default:0}"
{/if}
{/for}
{/for}
