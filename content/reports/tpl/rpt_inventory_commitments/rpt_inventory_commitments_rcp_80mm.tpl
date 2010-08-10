[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.type_label}${queryFormLabel.type}
${queryFormLabel.warehouse_label}${queryFormLabel.warehouse}

${head.title|center:42}
{for commitment in body}
==========================================
${_( '(inventory)' + commitment.type )}
${_( '(rpt)Time' ) + ':'|left:16}${commitment.created|unixTimeToString|right:26}
${_( '(rpt)Clerk' ) + ':'|left:16}${commitment.clerk|right:26}
{if commitment.commitment_memo.length > 0}
${_( '(rpt)Memo' ) + ':'|left:16}${commitment.commitment_memo|right:26}
{/if}
{for product in commitment.products}
------------------------------------------
${_( '(rpt)Product Number' ) + ':'|left:16}${product.product_no|right:26}
${_( '(rpt)Product Name' ) + ':'|left:16}${product.name|right:26}
${_( '(rpt)Barcode' ) + ':'|left:16}${product.barcode|right:26}
${_( '(rpt)Warehouse' ) + ':'|left:16}${product.warehouse|right:26}
${_( '(rpt)Quantity' ) + ':'|left:16}${product.value|format:0|right:26}
{if commitment.type == "procure"}
${_( '(rpt)Purchase Price' ) + ':'|left:16}${product.price|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Purchase Subtotal' ) + ':'|left:16}${product.subtotal|default:0|viviFormatPrices:true|right:26}
{/if}
{if product.memo.length > 0}
${_( '(rpt)Memo' ) + ':'|left:16}${product.memo|right:26}
{/if}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:16}${commitment.products.length|format:0|right:26}
{if commitment.type == "procure"}
------------------------------------------
${_( '(rpt)Summary' ) + ':'}
${_( '(rpt)Quantity' ) + ':'|left:16}${commitment.summary.value|format:0|right:26}
${_( '(rpt)Purchase Subtotal' ) + ':'|left:16}${commitment.summary.subtotal|default:0|viviFormatPrices:true|right:26}
{/if}
{/for}
------------------------------------------
{if rowLimitExcess}
${_( '(rpt)Row Limit Excess' )}
------------------------------------------
{/if}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
