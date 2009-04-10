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

{for category in body}
    <table id="body-table">
        <!--caption>${head.title}</caption-->
        <thead>
        	<tr>
            	<td colspan="5" class="subtitle">${category.no} - ${category.name}</td>
            </tr>
            <tr class="fields">
                <th style="text-align: left;">${_( '(rpt)No.' )}</th>
                <th style="text-align: left;">${_( '(rpt)Name' )}</th>
                <th style="text-align: right;">${_( '(rpt)Avg. Price' )}</th>
                <th style="text-align: right;">${_( '(rpt)Qty' )}</th>
                <th style="text-align: right;">${_( '(rpt)Total' )}</th>
            </tr>
        </thead>
        <tbody>
{for item in category.orderItems}
            <tr>
                <td style="text-align: left;">${item.product_no}</td>
                <td style="text-align: left;">${item.product_name}</td>
                <td style="text-align: right;">${item.avg_price|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.qty}</td>
                <td style="text-align: right;">${item.total|default:0|viviFormatPrices:true}</td>
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3">${_( '(rpt)Summary' ) + ':'}</td>
                <td style="text-align: right;">${category.summary.qty|default:0}</td>
                <td style="text-align: right;">${category.summary.total|default:0|viviFormatPrices:true}</td>
            </tr>
        </tfoot>
    </table>
    <br />
{/for}
</div>
<br />
