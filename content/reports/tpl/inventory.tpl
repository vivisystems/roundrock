<html:div class="paper" style="overflow:auto;">
<html:img src="chrome://viviecr/content/skin/images/logo.png" /><html:br />
Date:<html:br />
{i18n startdate}:${head.start_date}<html:br />
{i18n enddate}:${head.end_date}<html:br />

{for category in body}
        <html:table id="body-table">
            <html:caption>${category.no} - ${category.name}</html:caption>
            <html:thead>
                <html:tr>
                    <html:th>No</html:th>
                    <html:th>Name</html:th>
                    <html:th>Stock</html:th>
                    <html:th>Min Stock</html:th>
                </html:tr>
            </html:thead>
            <html:tbody>
{for plu in category.plu}
                <html:tr>
                    <html:td>${plu.no}</html:td>
                    <html:td>${plu.name}</html:td>
                    <html:td>${plu.stock}</html:td>
                    <html:td>${plu.min_stock}</html:td>
                </html:tr>
{/for}
            </html:tbody>
            <html:tfoot>
                <html:tr>
                <html:td colspan="4">{i18n summary}:${foot.summary}</html:td>
                </html:tr>
            </html:tfoot>
        </html:table>
{/for}
</html:div>