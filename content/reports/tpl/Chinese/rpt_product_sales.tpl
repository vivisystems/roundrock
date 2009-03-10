<div class="paper">
    <img src="chrome://viviecr/content/skin/images/logo.png" />
    <br />

    <p align="left">${head.store.name}</p>
	<p align="left">${head.store.branch}</p>
	<p align="left">${head.store.telephone1}</p>
	<p align="left">機器編號: ${head.store.terminal_no}</p>
	<p align="left">櫃員: ${head.clerk_displayname}</p>
	<p align="right">列印時間: ${foot.gen_time}</p>
	<p align="right">${head.start_time} - ${head.end_time}</p>

    <table id="body-table">
        <caption>${head.title}</caption>
        <thead>
            <tr>
                <th style="text-align: left;">商品編號</th>
                <th style="text-align: left;">商品名稱</th>
                <th style="text-align: right;">平均金額</th>
                <th style="text-align: right;">數量</th>
                <th style="text-align: right;">總金額</th>
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
                <td colspan="3">總計:</td>
                <td>${foot.qty}</td>
                <td>${foot.summary}</td>
            </tr>
        </tfoot>
    </table>
    <br />
</div>
<br />
