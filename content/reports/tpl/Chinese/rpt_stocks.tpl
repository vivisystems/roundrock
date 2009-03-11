<div class="paper">
<!-- div id="printhead" -->
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />

<p align="left">${head.store.name}</p>
<p align="left">${head.store.branch}</p>
<p align="left">${head.store.telephone1}</p>
<p align="left">機器編號: ${head.store.terminal_no}</p>
<p align="left">店員: ${head.clerk_displayname}</p>
<p align="right">列印時間: ${foot.gen_time}</p>

<p>${head.title}</p>
<!-- /div>
<div id="docbody" -->
{for category in body}
        <table id="body-table">
            <caption>${category.no} - ${category.name}</caption>
            <thead>
                <tr>
                    <th>商品編號</th>
                    <th>商品名稱</th>
                    <th>存貨數量</th>
                    <th>最小庫存限制</th>
                </tr>
            </thead>
            <tbody>
{for plu in category.plu}
                <tr>
                    <td>${plu.no}</td>
                    <td>${plu.name}</td>
                    <td>${plu.stock}</td>
                    <td>${plu.min_stock}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                <td colspan="4"></td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
