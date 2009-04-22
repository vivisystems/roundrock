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

{for result in body}
    <table id="body-table">
        <!--caption>${head.title}</caption-->
        <thead>
        	<tr>
            	<td colspan="5" class="subtitle">${result.name} - ${result.code}</td>
            </tr>
            <tr class="fields">
                <th style="text-align: left;">${_( '(rpt)Date' )}</th>
                <th style="text-align: right;">${_( '(rpt)Total' )}</th>
                <th style="text-align: right;">${_( '(rpt)Order Count' )}</th>
                <th style="text-align: right;">${_( '(rpt)Promotion Subtotal' )}</th>
                <th style="text-align: right;">${_( '(rpt)Matched Count' )}</th>
                <th style="text-align: right;">${_( '(rpt)Matched Items Qty.' )}</th>
                <th style="text-align: right;">${_( '(rpt)Matched Items Subtotal' )}</th>
            </tr>
        </thead>
        <tbody>
{for entry in result.entries}
            <tr>
                <td style="text-align: left;">${entry.date}</td>
                <td style="text-align: right;">${entry.total|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${entry.order_count|default:0}</td>
                <td style="text-align: right;">${entry.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${entry.matched_count|default:0}</td>
                <td style="text-align: right;">${entry.matched_items_qty|default:0}</td>
                <td style="text-align: right;">${entry.matched_items_subtotal|default:0|viviFormatPrices:true}</td>
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td>${_( '(rpt)Summary' ) + ':'}</td>
                <td style="text-align: left;">${result.summary.total|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${result.summary.order_count|default:0}</td>
                <td style="text-align: right;">${result.summary.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${result.summary.matched_count|default:0}</td>
                <td style="text-align: right;">${result.summary.matched_items_qty|default:0}</td>
                <td style="text-align: right;">${result.summary.matched_items_subtotal|default:0|viviFormatPrices:true}</td>
            </tr>
        </tfoot>
    </table>
    <br />
{/for}
</div>
<br />
