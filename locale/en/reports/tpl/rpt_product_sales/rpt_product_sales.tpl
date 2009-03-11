<div class="paper">
    <img src="chrome://viviecr/content/skin/images/logo.png" />
    <br />

    <p align="left">${head.store.name}</p>
	<p align="left">${head.store.branch}</p>
	<p align="left">${head.store.telephone1}</p>
	<p align="left">Terminal: ${head.store.terminal_no}</p>
	<p align="left">Clerk: ${head.clerk_displayname}</p>
	<p align="right">Printed Time: ${foot.gen_time}</p>
	<p align="right">${head.start_time} - ${head.end_time}</p>

    <table id="body-table">
        <caption>${head.title}</caption>
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
                <td>${item.avg_price}</td>
                <td>${item.qty}</td>
                <td>${item.total}</td>
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3">Summary:</td>
                <td>${foot.qty}</td>
                <td>${foot.summary}</td>
            </tr>
        </tfoot>
    </table>
    <br />
</div>
<br />
