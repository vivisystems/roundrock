"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${( 'Start' ) + ':'}","${head.start_time}"
"${( 'End' ) + ':'}","${head.end_time}"
{for commitment in body}
""
"${_( "(inventory)" + commitment.type )}( ${commitment.created|unixTimeToString} )","${commitment.commitment_memo}"
"${_( '(rpt)Product Number' )}","${_( '(rpt)Product Name' )}","${_( '(rpt)Barcode' )}","${_( '(rpt)Warehouse' )}","${_( '(rpt)Clerk' )}","${_( '(rpt)Quantity' )}","${_( '(rpt)New Quantity' )}"{if commitment.type == "procure"},"${_( '(rpt)Purchase Price' )}"{/if},"${_( '(rpt)Memo' )}"
{for product in commitment.products}
"${product.product_no}","${product.name}","${product.barcode}","${product.warehouse}","${product.clerk}","${product.quantity|format:0}","${product.new_quantity|format:0}"{if commitment.type == "procure"},"${product.price|default:0|viviFormatPrices:true}"{/if},"${product.memo}"
{/for}
"${_( '(rpt)Records Found' ) + ': '}","${commitment.products.length|format:0}"{if commitment.type == "procure"},"${_( "(rpt)Summary" )}","","","${commitment.summary.quantity|format:0}","${commitment.summary.new_quantity|format:0}","${commitment.summary.price|default:0|viviFormatPrices:true}"
{/if}
{/for}
