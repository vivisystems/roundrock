<div class="paper" style="overflow:auto;">
<!-- div id="printhead" -->
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
<p>${head.title}</p>
<!-- /div>
<div id="docbody" -->
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