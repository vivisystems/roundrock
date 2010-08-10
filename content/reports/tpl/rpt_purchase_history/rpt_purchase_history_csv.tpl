"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${( 'Start Time' ) + ':'}","${head.start_time}"
"${( 'End Time' ) + ':'}","${head.end_time}"
"${_('(rpt)Condition') + ' - '}"
"${queryFormLabel.groupby_label}","${queryFormLabel.groupby}"
"${queryFormLabel.warehouse_label}","${queryFormLabel.warehouse}"
{for record in body.records}
{eval}
    numRecord = record.records.length;
{/eval}
""
"${record.title }"
"${body.groupby}","${_( '(rpt)Barcode' )}","${_( '(rpt)Quantity' )}","${_( '(rpt)Purchase Time' )}","${_( '(rpt)Purchase Price' )}","${_( '(rpt)Total' )}"
{for product in record.records}
{if product.average_line == true}{eval}numRecord--;{/eval}{/if}
"${product.fieldForGroupby}","${product.barcode}","${product.quantity|default:0|viviFormatPrices:true}","${product.created|unixTimeToString}","${product.price|default:0|viviFormatPrices:true}","${product.total|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Records Found' ) + ': '}${numRecord|format:0}"
{/for}
