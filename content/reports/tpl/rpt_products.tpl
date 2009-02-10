<div class="paper">
<!-- div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper" -->
{for category in body}
        <table id="body-table">
            <caption>${category.no} - ${category.name}</caption>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Name</th>
                    <th>Stock</th>
                    <th>Min Stock</th>
                </tr>
            </thead>
            <tbody>
{for plu in category.plu}
                <tr>
                    <td style="text-align: left;">${plu.no}</td>
                    <td style="text-align: left;">${plu.name}</td>
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
