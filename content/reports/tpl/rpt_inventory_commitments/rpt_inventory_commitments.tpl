<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
	<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
	<p class="heading_store">${head.store.telephone1}</p>

	<div style="float: left;">
		<p class="heading_p">${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}</p>
		<p class="heading_p">${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}</p>
		<p class="caption">${head.title}</p>
	</div>

	<div style="float: right;">
		<p class="heading_p">&nbsp;</p>
		<p class="heading_p" style="text-align: right;">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p>
		<p class="caption" style="text-align: right;">${head.start_time} - ${head.end_time}</p>
	</div>
        <table id="condition-table">
            <tr>
                <td class="condition-title"><span class="caption">${_('(rpt)Condition') + ' - '}</span></td>
                <td align="left" >
                       <span class="caption">${queryFormLabel.type_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.type|escape}</span>
                       <span class="caption">${queryFormLabel.warehouse_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.warehouse|escape}</span>
                </td>
           </tr>
       </table>

{for commitment in body}
    <table id="body-table">
        <thead>
        	<tr>
            	<td colspan="4" class="subtitle">${_( "(inventory)" + commitment.type )}(&nbsp;${commitment.clerk} / ${commitment.created|unixTimeToString}&nbsp;)</td>
            	<td colspan="5" class="subtitle" style="text-align: right !important;">${commitment.commitment_memo}</td>
            </tr>
            <tr class="fields">
                <th style="text-align: center;">${_( '(rpt)Product Number' )}</th>
                <th style="text-align: center;">${_( '(rpt)Product Name' )}</th>
                <th style="text-align: center;">${_( '(rpt)Barcode' )}</th>
                <th style="text-align: center;">${_( '(rpt)Warehouse' )}</th>
                <th style="text-align: center;">${_( '(rpt)Quantity' )}</th>
{if commitment.type == "procure"}
                <th style="text-align: center;">${_( '(rpt)Purchase Price' )}</th>
                <th style="text-align: center;">${_( '(rpt)Purchase Subtotal' )}</th>
{/if}
                <th style="text-align: center;">${_( '(rpt)Memo' )}</th>
            </tr>
        </thead>
        <tbody>
{for product in commitment.products}
            <tr>
                <td style="text-align: left;">${product.product_no}</td>
                <td style="text-align: left;">${product.name}</td>
                <td style="text-align: left;">${product.barcode}</td>
                <td style="text-align: center;">${product.warehouse}</td>
                <td style="text-align: right;">${product.value|format:0}</td>
{if commitment.type == "procure"}
                <td style="text-align: right;">${product.price|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${product.subtotal|default:0|viviFormatPrices:true}</td>
{/if}
                <td style="text-align: left;">${product.memo}</td>
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="2" style="text-align: left;">${_( '(rpt)Records Found' ) + ': '}${commitment.products.length|format:0}</td>
                <td colspan="2" style="text-align: left;">${_( "(rpt)Summary" ) + ': '}</td>
                <td colspan="1" style="text-align: right;">${commitment.summary.value|format:0}</td>
{if commitment.type == "procure"}
                <td colspan="1"></td>
                <td colspan="1" style="text-align: right;">${commitment.summary.subtotal|default:0|viviFormatPrices:true}</td>
{/if}
                <td colspan="1" style="text-align: center;"></td>
            </tr>
        </tfoot>
    </table>
    <br />
{/for}
{if rowLimitExcess}
    <div>
		<p class="caption" style="text-align: center">${_( '(rpt)There are too many reocrds to display.' )}</p>
		<p class="caption" style="text-align: center">${_( '(rpt)To scrutinize the complete record set, please export the .csv file.' )}</p>
	</div>
{/if}
</div>
