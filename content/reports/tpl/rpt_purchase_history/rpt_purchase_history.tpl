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
                       <span class="caption">${queryFormLabel.groupby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.groupby|escape}</span>
                       <span class="caption">${queryFormLabel.warehouse_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.warehouse|escape}</span>
                </td>
           </tr>
       </table>

{for record in body.records}
{eval}
    numRecord = record.records.length;
{/eval}
    <table id="body-table">
        <thead>
        	<tr>
            	<td colspan="6" class="subtitle">${record.title }</td>
            </tr>
            <tr class="fields">
                <th style="text-align: left;">${body.groupby}</th>
                <th style="text-align: center;">${_( '(rpt)Barcode' )}</th>
                <th style="text-align: right;">${_( '(rpt)Quantity' )}</th>
                <th style="text-align: center;">${_( '(rpt)Purchase Time' )}</th>
                <th style="text-align: right;">${_( '(rpt)Purchase Price' )}</th>
                <th style="text-align: right;">${_( '(rpt)Total' )}</th>
            </tr>
        </thead>
        <tbody>
{for product in record.records}
{if product.average_line == true}
            <tr style="background-color: #daf6e9;">
{eval}
    numRecord--;
{/eval}
{else}
            <tr>
{/if}
                <td style="text-align: left;">${product.fieldForGroupby}</td>
                <td style="text-align: center;">${product.barcode}</td>
                <td style="text-align: right;">${product.quantity|default:0|viviFormatPrices:true}</td>
                <td style="text-align: center;">${product.created|unixTimeToString}</td>
                <td style="text-align: right;">${product.price|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${product.total|default:0|viviFormatPrices:true}</td>
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="6" style="text-align: left;">${_( '(rpt)Records Found' ) + ': '}${numRecord|format:0}</td>
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
<br />
