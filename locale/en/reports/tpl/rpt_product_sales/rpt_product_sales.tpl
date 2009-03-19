<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
	<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
	<p class="heading_store">${head.store.telephone1}</p>

	<div style="float: left;">
		<p class="heading_p">Terminal: ${head.store.terminal_no}</p>
		<p class="heading_p">Clerk: ${head.clerk_displayname}</p>
		<p class="caption">${head.title}</p>
	</div>

	<div style="float: right;">
		<p class="heading_p">&nbsp;</p>
		<p class="heading_p" align="right">Printed Time: ${foot.gen_time}</p>
		<p class="caption">${head.start_time} - ${head.end_time}</p>
	</div>
	
    <table id="body-table">
        <!--caption>${head.title}</caption-->
        <thead>
            <tr>
                <th style="text-align: left;">No</th>
                <th style="text-align: left;">Name</th>
                <th style="text-align: right;">Avg. Price</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
{for item in body}
            <tr>
                <td style="text-align: left;">${item.product_no}</td>
                <td style="text-align: left;">${item.product_name}</td>
                <td style="text-align: right;">${item.avg_price}</td>
                <td style="text-align: right;">${item.qty}</td>
                <td style="text-align: right;">${item.total}</td>
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3">Summary:</td>
                <td style="text-align: right;">${foot.qty}</td>
                <td style="text-align: right;">${foot.summary}</td>
            </tr>
        </tfoot>
    </table>
    <br />
</div>
<br />
