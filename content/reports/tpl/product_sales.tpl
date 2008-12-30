
<html:div class="paper">
    <html:img src="chrome://viviecr/content/skin/images/logo.png" />
    <html:br />

    <html:table>
        <html:tr>
            <html:td>
            Start:
            </html:td>
            <html:td>
            ${head.start_date}
            </html:td>
        </html:tr>
        <html:tr>
            <html:td>
            End:
            </html:td>
            <html:td>
            ${head.end_date}
            </html:td>
        </html:tr>
        <!-- html:tr>
            <html:td>
            Department:
            </html:td>
            <html:td>
            ${head.department}
            </html:td>
        </html:tr -->
    </html:table>

    <html:table id="body-table">
        <html:caption>${head.title}</html:caption>
        <html:thead>
            <html:tr>
                <html:th>No</html:th>
                <html:th>Name</html:th>
                <html:th>Qty</html:th>
                <html:th>Total</html:th>
            </html:tr>
        </html:thead>
        <html:tbody>
{for item in body}
            <html:tr>
                <html:td style="text-align: left;">${item.product_no}</html:td>
                <html:td style="text-align: left;">${item.product_name}</html:td>
                <html:td>${item.qty}</html:td>
                <html:td>${item.total}</html:td>
            </html:tr>
{/for}
        </html:tbody>
        <html:tfoot>
            <html:tr>
                <html:td colspan="2">Summary:</html:td>
                <html:td>${foot.qty}</html:td>
                <html:td>${foot.summary}</html:td>
            </html:tr>
        </html:tfoot>
    </html:table>
    <html:br />
    Printed:${printedtime}
</html:div>
<html:br />