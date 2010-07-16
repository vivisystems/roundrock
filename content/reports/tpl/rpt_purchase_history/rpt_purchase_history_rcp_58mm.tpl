[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.groupby_label}${queryFormLabel.groupby}
${queryFormLabel.warehouse_label}${queryFormLabel.warehouse}

${head.title|center:24}
{for record in body.records}
------------------------
{eval}
    numRecord = record.records.length;
{/eval}
${record.title }
{for product in record.records}
------------------------
{if product.average_line == true}{eval}numRecord--;{/eval}
${product.barcode + ':'|left:24}
${product.quantity|default:0|viviFormatPrices:true|right:24}
${product.created + ':'|left:24}
${product.price|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Total' ) + ':'|left:24}
${product.total|default:0|viviFormatPrices:true|right:24}
{else}
{if product.fieldForGroupby.length > 0}
${body.groupby + ':'|left:24}
${product.fieldForGroupby|right:24}
{/if}
${_( '(rpt)Barcode' ) + ':'|left:24}
${product.barcode|right:24}
${_( '(rpt)Quantity' ) + ':'|left:24}
${product.quantity|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Purchase Time' ) + ':'|left:24}
${product.created|unixTimeToString|right:24}
${_( '(rpt)Purchase Price' ) + ':'|left:24}
${product.price|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Total' ) + ':'|left:24}
${product.total|default:0|viviFormatPrices:true|right:24}
{/if}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ': '|left:24}
${numRecord|format:0|right:24}
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
