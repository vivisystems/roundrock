<html:div class="paper">
<html:img src="chrome://viviecr/content/skin/images/logo.png" /><html:br />
Date:<html:br />
{i18n startdate}:${head.start_date}<html:br />
{i18n enddate}:${head.end_date}<html:br />

        <html:table id="body-table">
            <html:caption>${head.title}</html:caption>
            <html:thead>
                <html:tr>
                    <html:th>Type</html:th>
                    <html:th>Amount</html:th>
                    <html:th>Qrigin Amount</html:th>
                    <html:th>Sub Type</html:th>
                </html:tr>
            </html:thead>
            <html:tbody>
{for item in body}
                <html:tr>
                    <html:td>${item.name}</html:td>
                    <html:td>${item.amounts}</html:td>
                    <html:td>${item.origin_amount}</html:td>
                    <html:td>${item.memo1}</html:td>
                </html:tr>
{/for}
            </html:tbody>
            <html:tfoot>
                <html:tr>
                <html:td colspan="4">{i18n summary}:${foot.summary}</html:td>
                </html:tr>
            </html:tfoot>
        </html:table>
</html:div>