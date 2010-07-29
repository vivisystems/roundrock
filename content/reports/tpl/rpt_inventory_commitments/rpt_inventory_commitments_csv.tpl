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
"${queryFormLabel.type_label}","${queryFormLabel.type}"
"${queryFormLabel.warehouse_label}","${queryFormLabel.warehouse}"
{for commitment in body}
""
"${_( "(inventory)" + commitment.type )}( ${commitment.clerk} / ${commitment.created|unixTimeToString} )","${commitment.commitment_memo}"
"${_( '(rpt)Product Number' )}","${_( '(rpt)Product Name' )}","${_( '(rpt)Barcode' )}","${_( '(rpt)Warehouse' )}","${_( '(rpt)Quantity' )}"{if commitment.type == "procure"},"${_( '(rpt)Purchase Price' )}","${_( '(rpt)Purchase Subtotal' )}"{/if},"${_( '(rpt)Memo' )}"
{for product in commitment.products}
"${product.product_no}","${product.name}","${product.barcode}","${product.warehouse}","${product.value|format:0}"{if commitment.type == "procure"},"${product.price|default:0|viviFormatPrices:true}","${product.subtotal|default:0|viviFormatPrices:true}"{/if},"${product.memo}"
{/for}
"${_( '(rpt)Records Found' ) + ': '}","${commitment.products.length|format:0}","${_( "(rpt)Summary" ) + ': '}","","${commitment.summary.value|format:0}"{if commitment.type == "procure"},"","${commitment.summary.subtotal|default:0|viviFormatPrices:true}"
{else},""
{/if}

{/for}
