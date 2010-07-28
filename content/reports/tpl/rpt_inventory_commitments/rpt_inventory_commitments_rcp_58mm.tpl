[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.type_label}${queryFormLabel.type}
${queryFormLabel.warehouse_label}${queryFormLabel.warehouse}

${head.title|center:24}
{for commitment in body}
========================
${_( '(inventory)' + commitment.type )}
${_( '(rpt)Time' ) + ':'|left:24}
${commitment.created|unixTimeToString|right:24}
${_( '(rpt)Clerk' ) + ':'|left:24}
${commitment.clerk|right:24}
{if commitment.commitment_memo.length > 0}
${_( '(rpt)Memo' ) + ':'|left:24}
${commitment.commitment_memo|right:24}
{/if}
{for product in commitment.products}
------------------------
${_( '(rpt)Product Number' ) + ':'|left:24}
${product.product_no|right:24}
${_( '(rpt)Product Name' ) + ':'|left:24}
${product.name|right:24}
${_( '(rpt)Barcode' ) + ':'|left:24}
${product.barcode|right:24}
${_( '(rpt)Warehouse' ) + ':'|left:24}
${product.warehouse|right:24}
${_( '(rpt)Quantity' ) + ':'|left:24}
${product.value|format:0|right:24}
{if commitment.type == "procure"}
${_( '(rpt)Purchase Price' ) + ':'|left:24}
${product.price|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Purchase Subtotal' ) + ':'|left:24}
${product.subtotal|default:0|viviFormatPrices:true|right:24}
{/if}
{if product.memo.length > 0}
${_( '(rpt)Memo' ) + ':'|left:24}
${product.memo|right:24}
{/if}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ': '}${commitment.products.length|format:0}
------------------------
${_( '(rpt)Summary' ) + ':'}
${_( '(rpt)Quantity' )+ ':'|left:24}
${commitment.summary.value|format:0|right:24}
{if commitment.type == "procure"}
${_( '(rpt)Purchase Subtotal' + ':' )|left:24}
${commitment.summary.subtotal|default:0|viviFormatPrices:true|right:24}
{/if}
{/for}
------------------------
{if rowLimitExcess}
${_( '(rpt)Row Limit Excess' )}
------------------------
{/if}
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
