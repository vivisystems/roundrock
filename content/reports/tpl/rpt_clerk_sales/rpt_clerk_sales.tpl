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
{for clerk in body}
        <table id="body-table">
            <!--caption>${clerk.name}</caption-->
            <thead>
            	<tr>
            		<td colspan="14" class="subtitle">${clerk.name}</td>
				</tr>
                <tr class="fields">
                    <th style="text-align: left;">${_( '(rpt)Terminal' )}</th>
                    <th style="text-align: left;">${_( clerk.associated_clerk )}</th>
                    <th style="text-align: left;">${_( '(rpt)Time' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Sequence' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Total' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Add-on Tax' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Surcharge' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Discount' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Promotion' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Revalue' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Payment' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Cash' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Check' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Credit Card' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Coupon' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Gift Card' )}</th>
                </tr>
            </thead>
            <tbody>
{for order in clerk.orders}
                <tr id="${order.id}">
                    <td style="text-align: left;">${order.terminal_no}</td>
                    <td style="text-align: left;">
                    {if clerk.associated_clerk == 'Proceeds Clerk'}
                    	${order.proceeds_clerk_displayname}
                    {/if}
                    {if clerk.associated_clerk == 'Service Clerk'}
                    	${order.service_clerk_displayname}
                    {/if}
                    </td>
                    <td style="text-align: left;">${order.time|unixTimeToString}</td>
                    <td style="text-align: left;">${order.sequence}</td>
                    <td style="text-align: right;">${order.item_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.tax_subtotal|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${order.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.discount_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.promotion_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.revalue_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.total|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.cash|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.check|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.creditcard|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.coupon|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.giftcard|default:0|viviFormatPrices:true}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td></td>
                    <td></td>
                    <td colspan="2">${_( '(rpt)Summary' ) }:</td>
                    <td style="text-align: right;">${clerk.summary.item_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.tax_subtotal|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${clerk.summary.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.discount_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.promotion_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.revalue_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.total|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.cash|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.check|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.creditcard|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.coupon|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.giftcard|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
