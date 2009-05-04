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
		<p class="heading_p" align="right">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p>
		<p class="caption">${head.start_time} - ${head.end_time}</p>
	</div>
	
{for types in body}
        <table id="body-table">
            <!--caption>${head.title}</caption-->
            <thead>
            	<tr>
		        	<td colspan="9" class="subtitle">${types_index}</td>
		        </tr>
                <tr class="fields">
                    <th style="text-align: left;">${_( '(rpt)Term_No.' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Time' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Sequence' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Annotation Text' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Total' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Add-on Tax' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Surcharge' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Discount' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Promotion' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Revalue' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Payment' )}</th>
                </tr>
            </thead>
            <tbody>
{for orders in types.orders}
                <tr id="${orders.id}">
                    <td style="text-align: left;">${orders.terminal_no}</td>
                    <td style="text-align: left;">${orders.time|unixTimeToString}</td>
                    <td style="text-align: left;">${orders.sequence}</td>
                    <td style="text-align: left;">${orders.text}</td>
                    <td style="text-align: right;">${orders.item_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${orders.tax_subtotal|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${orders.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${orders.discount_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${orders.promotion_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${orders.revalue_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${orders.total|viviFormatPrices:true}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="4">${_( '(rpt)Summary' ) + ':'}</td>
                    <td style="text-align: right;">${types.summary.item_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${types.summary.tax_subtotal|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${types.summary.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${types.summary.discount_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${types.summary.promotion_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${types.summary.revalue_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${types.summary.total|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
