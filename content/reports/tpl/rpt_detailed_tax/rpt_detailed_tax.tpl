<!---->
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

    <table id="body-table">
        <!--caption>${head.title}</caption-->
        <thead>
            <tr>
                <th style="text-align: left;">${_( '(rpt)Sequence' )}</th>
                <th style="text-align: left;">${_( '(rpt)Time' )}</th>
                <th style="text-align: right;">${_( '(rpt)Total' )}</th>
                <th style="text-align: right;">${_( '(rpt)Discount' )}</th>
                <th style="text-align: right;">${_( '(rpt)Promotion' )}</th>
                <th style="text-align: right;">${_( '(rpt)Surcharge' )}</th>
                <th style="text-align: right;">${_( '(rpt)Add-on Tax' )}</th>
                <th style="text-align: right;">${_( '(rpt)Included Tax' )}</th>
{for tax in taxList}
                <th style="text-align: right;">${tax.no}</th>
{/for}
            </tr>
        </thead>
        <tbody>
{for item in body}
            <tr>
                <td style="text-align: left;">${item.Order.sequence}</td>
                <td style="text-align: left;">${item.Order.time|unixTimeToString}</td>
                <td style="text-align: right;">${item.Order.total|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.discount_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.Order.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.Order.tax_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.Order.included_tax_subtotal|default:0|viviFormatPrices:true}</td>
{for tax in taxList}
                <td style="text-align: right;">${item[ tax.no ]|viviFormatPrices:true}</td>
{/for}
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
				<td colspan="2">${_( '(rpt)Summary' ) + ':'}</td>
				<td style="text-align: right;">${foot.summary.total|default:0|viviFormatPrices:true}</td>
				<td style="text-align: right;">${foot.summary.discount_subtotal|default:0|viviFormatPrices:true}</td>
				<td style="text-align: right;">${foot.summary.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${foot.summary.tax_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${foot.summary.included_tax_subtotal|default:0|viviFormatPrices:true}</td>
{for tax in taxList}
                <td style="text-align: right;">${foot.summary[ tax.no ]|viviFormatPrices:true}</td>
{/for}
            </tr>
        </tfoot>
    </table>
    <br />
</div>
<br />
